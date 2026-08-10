# apollo-leads

A clean **Node.js package** for extracting and enriching leads from [Apollo.io](https://www.apollo.io/) using Apollo’s **official API**.

No Electron, React, scraping, cookies, browser automation, or undocumented browser APIs.

Primary goal: retrieve each person’s **business/work email**.

---

## Quick start (download ZIP)

1. Unzip the project
2. Open a terminal in the `apollo-leads` folder
3. Install dependencies:

```bash
npm install
```

4. Start an extraction (you will be prompted for your API key the first time):

```bash
node index.js --url "https://app.apollo.io/#/people?..." --max-pages 1 --per-page 10
```

Or run with no flags and answer the prompts:

```bash
node index.js
```

On first run you will see:

```text
Apollo API key required.
Create one at: https://docs.apollo.io/docs/create-api-key
It will be saved locally to .env for next time (never committed).

Enter APOLLO_API_KEY:
```

Your key is saved to a local `.env` file so later runs reuse it automatically.

To change the saved key later:

```bash
npm run setup
# or
node index.js --reset-api-key --url "..."
```

---

## What it does

```text
Apollo Search URL
  → Parse #/people hash filters
  → Map web filters → official API filters
  → People API Search (0 credits, no emails)
  → Capture Apollo person IDs
  → People Enrichment / Bulk People Enrichment
  → Retrieve BUSINESS/WORK email
  → Optional waterfall email fallback (async webhook)
  → Normalize + cache
  → Export CSV / JSON
```

---

## Installation

```bash
cd apollo-leads
npm install
```

Requires **Node.js 18+**.

---

## API key setup

### Option A — interactive prompt (recommended)

Just start extracting. If no key is saved yet, the CLI prompts you and writes `.env`.

```bash
node index.js --url "APOLLO_URL"
```

### Option B — save key ahead of time

```bash
npm run setup
```

### Option C — edit `.env` yourself

```bash
cp .env.example .env
```

Then set:

```env
APOLLO_API_KEY=your_apollo_api_key
```

Optional:

```env
APOLLO_WEBHOOK_URL=https://your.public.https/webhook
DEBUG=false
```

Important:

- `.env` is gitignored and should never be committed
- The API key is never printed in logs
- Auth uses Apollo’s documented `x-api-key` header

Create a key: [Create an API Key](https://docs.apollo.io/docs/create-api-key)

---

## CLI usage

```bash
node index.js \
  --url "https://app.apollo.io/#/people?..." \
  --max-pages 5 \
  --per-page 100 \
  --concurrency 2 \
  --output ./exports/leads.csv
```

| Flag | Description |
|---|---|
| `--url` | Apollo people search URL (prompted if omitted) |
| `--max-pages` | Max pages to fetch |
| `--per-page` | Results per page (max 100) |
| `--concurrency` | Concurrent API requests |
| `--waterfall-email` | Enable waterfall email fallback |
| `--personal-email` | Reveal personal emails (optional) |
| `--no-enrich` | Search only |
| `--output` | `.csv` or `.json` export path |
| `--webhook-url` | Waterfall webhook URL |
| `--reset-api-key` | Prompt for a new key and overwrite `.env` |

If `--output` is omitted, a timestamped CSV is written under `exports/`.

---

## Library usage

```js
const { ApolloExtractor, ensureApolloApiKey } = require('./src');

// Optional: prompt + save key when missing
await ensureApolloApiKey();

const extractor = new ApolloExtractor({
  apiKey: process.env.APOLLO_API_KEY,
  maxPages: 10,
  perPage: 100,
  concurrency: 2,
  enrich: true,
  waterfallEmail: false,
  revealPersonalEmails: false,
  cache: true,
});

const job = extractor.extractFromUrl(APOLLO_URL);

job.on('search', (info) => console.log('page', info.page, info.people_count));
job.on('email', (lead) => console.log(lead.business_email));

const results = await job;
console.log(results.results);

extractor.exportToCSV(results.results, './exports/leads.csv');
extractor.exportToJSON(results.results, './exports/leads.json');
```

---

## Apollo URL parsing

Apollo filters live in the **hash route**:

```text
https://app.apollo.io/?utm_source=cio#/people?page=1&personTitles[]=ceo&personLocations[]=United%20States
```

The parser:

1. Finds `#/people`
2. Reads the query after `#/people?`
3. Decodes values
4. Keeps repeated `[]` values as **arrays**
5. Maps web names → official API names
6. Separates unsupported / web-only parameters

Example:

```js
personTitles[]=sales representative
personTitles[]=chief executive officer
```

becomes:

```js
person_titles: [
  'sales representative',
  'chief executive officer'
]
```

This avoids Apollo’s `422 person_titles requires an array` error.

Unsupported web params (not sent to the API) include:

- `sortAscending`
- `sortByField`
- `recommendationConfigId`
- `organizationIndustryTagIds[]` (not documented on People API Search)

---

## Search + enrichment

### People API Search

`POST https://api.apollo.io/api/v1/mixed_people/api_search`

- 0 credits
- No emails returned
- Returns Apollo person IDs

### People Enrichment

`POST https://api.apollo.io/api/v1/people/match`  
`POST https://api.apollo.io/api/v1/people/bulk_match` (up to 10 people)

Business/work email is stored as:

```js
business_email
business_email_status
```

Personal email is optional (`revealPersonalEmails: true`) and stored separately:

```js
personal_email
personal_email_status
```

Emails are never guessed.

---

## Waterfall email (optional)

Apollo waterfall enrichment is asynchronous and needs a public HTTPS webhook.

```js
const extractor = new ApolloExtractor({
  apiKey: process.env.APOLLO_API_KEY,
  waterfallEmail: true,
  webhookUrl: process.env.APOLLO_WEBHOOK_URL,
});
```

Flow:

1. Normal enrichment first
2. If business email is missing and waterfall is enabled
3. Request `run_waterfall_email=true`
4. Receive result via webhook
5. Save as `business_email` with `email_source: "apollo_waterfall"`

---

## Caching / rate limits / controls

- Cache by Apollo person ID to avoid spending credits twice
- `forceReEnrich: true` to intentionally re-enrich
- `enrichMissingEmail: true` to retry people missing business email
- Concurrency control + `429` retry with `Retry-After` / backoff
- `422` errors show Apollo’s real validation message
- Job controls: `pause()`, `resume()`, `stop()`

---

## Export fields (CSV)

Apollo Person ID, First Name, Last Name, Name, Title, Company, Company Domain, Location, Business Email, Business Email Status, Personal Email, Personal Email Status, LinkedIn URL, Email Source, Enrichment Status

---

## Credit behavior

| Stage | Credits |
|---|---|
| People API Search | 0 |
| People Enrichment | 1–9 per person without waterfall when credit-consuming data is found (Apollo docs) |
| Waterfall | Depends on plan / vendors / returned data |

If Apollo does not return an exact credit count, the package reports:

```text
credits_used: "not provided by response"
```

---

## Debug

```bash
DEBUG=true node index.js --url "..."
```

Never logs the API key or `x-api-key` header.

---

## Tests

```bash
npm test
npm run live-test   # requires a saved APOLLO_API_KEY
```

---

## Project layout

```text
apollo-leads/
├── src/                 # library modules
├── tests/               # unit tests
├── examples/basic.js    # minimal example
├── exports/             # CSV/JSON output folder
├── scripts/             # setup + live API test helpers
├── index.js             # CLI entrypoint
├── package.json
├── .env.example
└── README.md
```

---

## Official Apollo docs used

- https://docs.apollo.io/
- https://docs.apollo.io/reference/people-api-search
- https://docs.apollo.io/reference/people-enrichment
- https://docs.apollo.io/reference/bulk-people-enrichment
- https://docs.apollo.io/docs/find-people-using-filters
- https://docs.apollo.io/docs/enrich-phone-and-email-using-data-waterfall

---

## License

MIT
