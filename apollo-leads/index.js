#!/usr/bin/env node
'use strict';

const path = require('path');

// Load saved .env first (created after the first interactive key prompt)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { ApolloExtractor, ApolloApiError } = require('./src');
const { ensureApolloApiKey, ensureValue, promptVisible } = require('./src/credentials');

function printUsage() {
  console.log(`Usage:
  node index.js --url "APOLLO_URL" --emails 25 [options]

  Interactive mode (recommended):
    node index.js

  You will be asked for:
    1) Apollo API key (saved to .env for next time)
    2) Apollo people search URL
    3) How many emails to extract in total

Options:
  --url <url>              Apollo people search URL
  --emails <n>             Total business emails to extract (not pages)
  --limit <n>              Alias for --emails
  --concurrency <n>        Concurrent API requests (default: 2)
  --waterfall-email        Enable waterfall email fallback (requires webhook)
  --personal-email         Reveal personal emails (optional; default off)
  --no-enrich              Search only; skip enrichment
  --force-re-enrich        Ignore cache and re-enrich
  --enrich-missing-email   Re-enrich cached people missing business email
  --output <path>          Export path (.csv or .json)
  --webhook-url <url>      HTTPS webhook URL for waterfall results
  --reset-api-key          Ignore saved key and prompt for a new one
  --max-pages <n>          Advanced: cap internal search pages
  --per-page <n>           Advanced: internal page size (max 100)
  --help                   Show help

Examples:
  node index.js
  node index.js --url "https://app.apollo.io/#/people?..." --emails 10
  node index.js --url "https://app.apollo.io/#/people?..." --emails 50 --output ./exports/leads.csv
`);
}

function parseArgs(argv) {
  const args = {
    url: null,
    emails: null,
    maxPages: null,
    perPage: null,
    concurrency: 2,
    waterfallEmail: false,
    personalEmail: false,
    enrich: true,
    forceReEnrich: false,
    enrichMissingEmail: false,
    output: null,
    webhookUrl: process.env.APOLLO_WEBHOOK_URL || null,
    resetApiKey: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--url':
        args.url = next;
        i += 1;
        break;
      case '--emails':
      case '--limit':
      case '--count':
        args.emails = Number(next);
        i += 1;
        break;
      case '--max-pages':
        args.maxPages = Number(next);
        i += 1;
        break;
      case '--per-page':
        args.perPage = Number(next);
        i += 1;
        break;
      case '--concurrency':
        args.concurrency = Number(next);
        i += 1;
        break;
      case '--waterfall-email':
        args.waterfallEmail = true;
        break;
      case '--personal-email':
        args.personalEmail = true;
        break;
      case '--no-enrich':
        args.enrich = false;
        break;
      case '--force-re-enrich':
        args.forceReEnrich = true;
        break;
      case '--enrich-missing-email':
        args.enrichMissingEmail = true;
        break;
      case '--output':
        args.output = next;
        i += 1;
        break;
      case '--webhook-url':
        args.webhookUrl = next;
        i += 1;
        break;
      case '--reset-api-key':
        args.resetApiKey = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown argument: ${arg}`);
        }
    }
  }

  return args;
}

function summarizeFilters(mapped) {
  const f = mapped.filters || {};
  const lines = [];

  if (f.person_titles?.length) lines.push(`Titles: ${f.person_titles.length}`);
  if (f.person_locations?.length) lines.push(`Locations: ${f.person_locations.length}`);
  if (f.person_seniorities?.length) lines.push(`Seniorities: ${f.person_seniorities.length}`);
  if (f.organization_locations?.length) {
    lines.push(`Organization locations: ${f.organization_locations.length}`);
  }
  if (f.organization_ids?.length) lines.push(`Organization IDs: ${f.organization_ids.length}`);
  if (f.q_keywords) lines.push('Keywords: yes');
  if (mapped.summary?.industry_tag_ids?.length) {
    lines.push(`Industry (web-only, unsupported by API): ${mapped.summary.industry_tag_ids.length}`);
  }

  return lines;
}

function defaultOutputPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(__dirname, 'exports', `leads-${stamp}.csv`);
}

async function promptEmailCount(current) {
  if (Number.isFinite(current) && current > 0) return current;

  if (!process.stdin.isTTY) {
    throw new Error('Pass --emails <n> (total business emails to extract).');
  }

  while (true) {
    const answer = await promptVisible(
      'How many emails do you want to extract in total?\n> '
    );
    const n = Number(String(answer || '').trim());
    if (Number.isFinite(n) && n > 0 && Number.isInteger(n)) {
      return n;
    }
    console.log('Please enter a whole number greater than 0 (example: 10).');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  if (args.resetApiKey) {
    delete process.env.APOLLO_API_KEY;
  }

  // 1) Prompt + save API key when missing
  await ensureApolloApiKey({
    prompt: true,
    save: true,
  });

  // 2) Prompt for URL when not passed
  if (!args.url) {
    args.url = await ensureValue(
      'url',
      null,
      'Enter Apollo people search URL:\n> '
    );
  }

  if (!args.url) {
    printUsage();
    process.exit(1);
  }

  // 3) Prompt for TOTAL emails (not pages)
  args.emails = await promptEmailCount(args.emails);

  if (!args.output) {
    args.output = defaultOutputPath();
  }

  const extractorOptions = {
    apiKey: process.env.APOLLO_API_KEY,
    emailLimit: args.emails,
    concurrency: args.concurrency,
    enrich: args.enrich,
    waterfallEmail: args.waterfallEmail,
    revealPersonalEmails: args.personalEmail,
    webhookUrl: args.webhookUrl,
    forceReEnrich: args.forceReEnrich,
    enrichMissingEmail: args.enrichMissingEmail,
    cache: true,
    debug: process.env.DEBUG === 'true',
  };

  if (args.maxPages != null) extractorOptions.maxPages = args.maxPages;
  if (args.perPage != null) extractorOptions.perPage = args.perPage;

  const extractor = new ApolloExtractor(extractorOptions);

  console.log('Apollo API: Connected');
  console.log(`Email target: ${args.emails}`);
  console.log('');

  const mapped = extractor.parseUrl(args.url);
  console.log('Detected filters:');
  const summaryLines = summarizeFilters(mapped);
  if (summaryLines.length) {
    for (const line of summaryLines) console.log(`  ${line}`);
  } else {
    console.log('  (none mapped)');
  }
  console.log('');

  const unsupportedCount = Object.keys(mapped.unsupported || {}).length;
  console.log(`Unsupported web parameters: ${unsupportedCount}`);
  if (unsupportedCount) {
    for (const [key, value] of Object.entries(mapped.unsupported)) {
      const display = Array.isArray(value) ? value.join(', ') : value;
      console.log(`  - ${key}: ${display}`);
    }
  }
  console.log('');

  const job = extractor.extractFromUrl(args.url, {
    emailLimit: args.emails,
    maxPages: args.maxPages ?? undefined,
    perPage: args.perPage ?? undefined,
  });

  job.on('search', (info) => {
    const progress = info.email_limit
      ? ` | emails so far: ${info.business_emails_found || 0}/${info.email_limit}`
      : '';
    console.log(`Searching... found ${info.people_count} people${progress}`);
  });

  job.on('enriching', (info) => {
    const progress = info.email_limit
      ? ` (${info.business_emails_found || 0}/${info.email_limit} emails so far)`
      : '';
    console.log(`Enriching ${info.count} people...${progress}`);
  });

  job.on('email', (lead) => {
    const n = job.stats.business_emails_found;
    const total = args.emails;
    console.log(`[${n}/${total}] ${lead.name || lead.first_name} <${lead.business_email}>`);
  });

  job.on('error', (err) => {
    if (err instanceof ApolloApiError) {
      console.error(err.message);
    } else {
      console.error(`Error: ${err.message}`);
    }
  });

  const outcome = await job;

  console.log('');
  if (args.enrich) {
    console.log(`Business emails found: ${outcome.stats.business_emails_found}`);
    console.log(`Business emails not found: ${outcome.stats.business_emails_not_found}`);
    console.log(`Email target: ${args.emails}`);
    if (outcome.reached_email_limit) {
      console.log('Reached requested email total.');
    } else if (outcome.stats.business_emails_found < args.emails) {
      console.log(
        `Stopped early with ${outcome.stats.business_emails_found}/${args.emails} emails (no more matching people or enrichment returned fewer emails).`
      );
    }
    if (args.personalEmail) {
      console.log(`Personal emails found: ${outcome.stats.personal_emails_found}`);
    }
    if (args.waterfallEmail) {
      console.log(`Waterfall requests: ${outcome.stats.waterfall_requests}`);
    }
    console.log(`People scanned: ${outcome.stats.people_found}`);
    console.log(`Enrichment requests: ${outcome.stats.enrichment_requests}`);
    console.log(`Cache skips: ${outcome.stats.enrichment_skipped_cache}`);
    console.log(`Credits used: ${outcome.stats.credits_used}`);
  }

  const outPath = path.resolve(args.output);
  if (outPath.toLowerCase().endsWith('.json')) {
    extractor.exportToJSON(outcome.results, outPath, {
      meta: {
        stats: outcome.stats,
        filters: outcome.filters,
        unsupported: outcome.unsupported,
        email_limit: args.emails,
      },
    });
  } else {
    extractor.exportToCSV(outcome.results, outPath);
  }
  console.log(`Exported: ${outPath}`);
  console.log(`Exported rows: ${outcome.results.length}`);

  console.log('');
  console.log('Completed.');
}

main().catch((err) => {
  if (err instanceof ApolloApiError) {
    console.error(err.message);
  } else {
    console.error(err.message || err);
  }
  process.exit(1);
});
