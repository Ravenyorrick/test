# apollo-leads

A clean Node.js package for extracting and enriching leads from [Apollo.io](https://www.apollo.io/) using Apollo’s **official API**.

No Electron, React, scraping, cookies, browser automation, or undocumented Apollo browser APIs.

## Workflow

```
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

Primary goal: **business/work email** (`business_email`).  
Personal email is optional and stored separately (`personal_email`).

## Installation

```bash
cd apollo-leads
npm install
```

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```env
APOLLO_API_KEY=your_apollo_api_key
APOLLO_WEBHOOK_URL=https://your.public.https/webhook   # only for waterfall
DEBUG=false
```

Authentication uses Apollo’s documented `x-api-key` header.  
The package throws a clear error if `APOLLO_API_KEY` is missing.  
The API key is never logged.

Create a key: [Create an API Key](https://docs.apollo.io/docs/create-api-key)

## Basic usage

```js
const { ApolloExtractor } = require('./src');

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
job.on('complete', (outcome) => console.log(outcome.stats));

const results = await job;
console.log(results.results);
```

## Apollo URL parsing

Apollo search filters live in the **hash route**, not only the normal query string:

```
https://app.apollo.io/?utm_source=cio#/people?page=1&personTitles[]=ceo&personLocations[]=United%20States
```

The parser:

1. Finds `#/people`
2. Reads the query after `#/people?`
3. Decodes values
4. Preserves repeated `[]` parameters as arrays
5. Maps web names → official API names
6. Separates unsupported/web-only parameters

Example:

```js
const mapped = extractor.parseUrl(url);
// mapped.filters      → sent to People API Search
// mapped.unsupported → NOT sent
```

### Array filters (important)

This URL:

```
personTitles[]=sales%20representative
personTitles[]=chief%20executive%20officer
personTitles[]=project%20manager
```

becomes:

```js
person_titles: [
  'sales representative',
  'chief executive officer',
  'project manager',
]
```

Not a comma-joined string. Apollo returns `422 person_titles requires an array` if serialized incorrectly.

## Supported People API Search filters

Mapped from Apollo’s current [People API Search](https://docs.apollo.io/reference/people-api-search) docs:

| API filter | Notes |
|---|---|
| `person_titles[]` | Array |
| `include_similar_titles` | Boolean |
| `q_keywords` | String |
| `person_locations[]` | Array |
| `person_seniorities[]` | Array |
| `organization_locations[]` | Array |
| `q_organization_domains_list[]` | Array |
| `contact_email_status[]` | Array |
| `organization_ids[]` | Array |
| `organization_num_employees_ranges[]` | Array |
| `revenue_range[min]` / `[max]` | Nested |
| `currently_using_all_of_technology_uids[]` | Array |
| `currently_using_any_of_technology_uids[]` | Array |
| `currently_not_using_any_of_technology_uids[]` | Array |
| `q_organization_job_titles[]` | Array |
| `organization_job_locations[]` | Array |
| `organization_num_jobs_range[min]` / `[max]` | Nested |
| `organization_job_posted_at_range[min]` / `[max]` | Nested |
| `page` / `per_page` | Pagination |

### Unsupported web parameters

Web-only / undocumented values are returned under `unsupported` and are **never** sent to `/api/v1/mixed_people/api_search`.

Examples:

- `sortAscending`
- `sortByField`
- `recommendationConfigId`
- `organizationIndustryTagIds[]` — present in Apollo web URLs, but **not documented** on People API Search, so it is not sent

## People search

```
POST https://api.apollo.io/api/v1/mixed_people/api_search
```

- **0 credits**
- Does **not** return emails or phone numbers
- Returns Apollo person IDs used for enrichment
- Max 100 results/page, display limit 50,000 records

## Enrichment & business email

```
POST https://api.apollo.io/api/v1/people/match
POST https://api.apollo.io/api/v1/people/bulk_match   # up to 10 people
```

Normalized fields:

```js
{
  apollo_person_id: '…',
  first_name: 'John',
  last_name: 'Smith',
  name: 'John Smith',
  title: 'Chief Executive Officer',
  company: 'Example Inc',
  company_domain: 'example.com',
  location: 'United States',
  business_email: 'john@example.com',
  business_email_status: 'verified',
  personal_email: null,
  personal_email_status: null,
  linkedin_url: 'https://linkedin.com/in/example',
  enrichment_status: 'enriched',
  email_source: 'apollo_native', // apollo_native | apollo_waterfall | none
  found_business_email: true,
  found_personal_email: false
}
```

- Business/work email comes from Apollo’s `person.email` (+ `email_status`)
- Personal email requires `revealPersonalEmails: true` (`reveal_personal_emails=true`)
- Defaults: personal email **off**
- `business_email` is never overwritten with a personal email
- Emails are never guessed or constructed

## Waterfall email (optional)

Apollo’s [waterfall enrichment](https://docs.apollo.io/docs/enrich-phone-and-email-using-data-waterfall) is **asynchronous** and requires a valid HTTPS `webhook_url`.

Flow:

1. Normal enrichment first
2. If business email is missing and `waterfallEmail: true`
3. Call enrichment with `run_waterfall_email=true`
4. Receive final email via webhook
5. Store as `business_email` with `email_source: 'apollo_waterfall'`

```js
const extractor = new ApolloExtractor({
  apiKey: process.env.APOLLO_API_KEY,
  waterfallEmail: true,
  webhookUrl: process.env.APOLLO_WEBHOOK_URL,
});
```

Local webhook helper (dev/testing; Apollo still needs a public HTTPS URL, e.g. via tunnel):

```js
const { WaterfallWebhookHandler } = require('./src');
const webhook = new WaterfallWebhookHandler({ port: 8787 });
await webhook.start();
```

Duplicate webhook deliveries are handled with idempotency keys.

## Pagination

```js
await extractor.extractFromUrl(url, {
  maxPages: 10,
  perPage: 100,
});
```

Stops when there are no more results, Apollo indicates the end, `maxPages` is reached, or the job is stopped.

## Caching

Enrichment results are cached by `apollo_person_id` to avoid spending credits twice.

```js
{
  forceReEnrich: false,        // default
  enrichMissingEmail: false,   // set true to retry people with no business email
}
```

## Rate limiting & errors

- Concurrency control (`concurrency: 2` by default)
- `429`: honors `Retry-After` when present, otherwise exponential backoff
- `422`: surfaces Apollo’s validation message (e.g. `person_titles requires an array`) — does not blindly retry
- Also handles 400, 401, 403, 404, 500, 502, 503

## Pause / resume / stop

```js
const job = extractor.extractFromUrl(url);

job.pause();   // finish in-flight request; retain results
job.resume();  // continue
job.stop();    // stop safely; retain completed results

await job;
```

Events: `search`, `person`, `enriching`, `enriched`, `email`, `waterfall`, `error`, `complete`, `paused`, `resumed`, `stopped`

## Export

```js
extractor.exportToCSV(results.results, './exports/leads.csv');
extractor.exportToJSON(results.results, './exports/leads.json');
```

CSV columns:

Apollo Person ID, First Name, Last Name, Name, Title, Company, Company Domain, Location, Business Email, Business Email Status, Personal Email, Personal Email Status, LinkedIn URL, Email Source, Enrichment Status

## CLI

```bash
node index.js \
  --url "https://app.apollo.io/#/people?..." \
  --max-pages 5 \
  --per-page 100 \
  --concurrency 2 \
  --output ./exports/leads.csv
```

Options:

| Flag | Description |
|---|---|
| `--url` | Apollo people search URL |
| `--max-pages` | Max pages |
| `--per-page` | Per page (max 100) |
| `--concurrency` | Concurrent requests |
| `--waterfall-email` | Enable waterfall fallback |
| `--personal-email` | Reveal personal emails |
| `--no-enrich` | Search only |
| `--output` | `.csv` or `.json` path |
| `--webhook-url` | Waterfall webhook URL |

## Credit behavior

| Stage | Credits |
|---|---|
| People API Search | 0 |
| People Enrichment | 1–9 per person without waterfall when credit-consuming data is found (per Apollo docs) |
| Waterfall | Depends on plan, vendors, and returned data |

The package reports:

```js
{
  search_requests,
  people_found,
  enrichment_requests,
  business_emails_found,
  business_emails_not_found,
  personal_emails_found,
  waterfall_requests,
  credits_used // number if Apollo provides it, else "not provided by response"
}
```

Credits are never invented.

## Debug mode

```bash
DEBUG=true node index.js --url "..."
```

Logs timestamp, endpoint, request type, page, HTTP status, and Apollo error messages.  
Never logs `APOLLO_API_KEY`, `x-api-key`, or other credentials.

## Tests

```bash
npm test
```

Live API chain (requires `APOLLO_API_KEY`):

```bash
node scripts/live-api-chain.js
```

## Official docs used

- https://docs.apollo.io/
- https://docs.apollo.io/reference/people-api-search
- https://docs.apollo.io/reference/people-enrichment
- https://docs.apollo.io/reference/bulk-people-enrichment
- https://docs.apollo.io/docs/find-people-using-filters
- https://docs.apollo.io/docs/enrich-phone-and-email-using-data-waterfall

## License

MIT
