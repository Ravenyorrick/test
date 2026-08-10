#!/usr/bin/env node
'use strict';

require('dotenv').config();

const path = require('path');
const { ApolloExtractor, ApolloApiError } = require('./src');

function printUsage() {
  console.log(`Usage:
  node index.js --url "APOLLO_URL" [options]

Options:
  --url <url>              Apollo people search URL (required)
  --max-pages <n>          Max search pages (default: 10)
  --per-page <n>           Results per page, max 100 (default: 100)
  --concurrency <n>        Concurrent API requests (default: 2)
  --waterfall-email        Enable waterfall email fallback (requires webhook)
  --personal-email         Reveal personal emails (optional; default off)
  --no-enrich              Search only; skip enrichment
  --force-re-enrich        Ignore cache and re-enrich
  --enrich-missing-email   Re-enrich cached people missing business email
  --output <path>          Export path (.csv or .json)
  --webhook-url <url>      HTTPS webhook URL for waterfall results
  --help                   Show help
`);
}

function parseArgs(argv) {
  const args = {
    url: null,
    maxPages: 10,
    perPage: 100,
    concurrency: 2,
    waterfallEmail: false,
    personalEmail: false,
    enrich: true,
    forceReEnrich: false,
    enrichMissingEmail: false,
    output: null,
    webhookUrl: process.env.APOLLO_WEBHOOK_URL || null,
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.url) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  if (!process.env.APOLLO_API_KEY) {
    console.error('APOLLO_API_KEY is missing. Copy .env.example to .env and set your key.');
    process.exit(1);
  }

  const extractor = new ApolloExtractor({
    apiKey: process.env.APOLLO_API_KEY,
    maxPages: args.maxPages,
    perPage: args.perPage,
    concurrency: args.concurrency,
    enrich: args.enrich,
    waterfallEmail: args.waterfallEmail,
    revealPersonalEmails: args.personalEmail,
    webhookUrl: args.webhookUrl,
    forceReEnrich: args.forceReEnrich,
    enrichMissingEmail: args.enrichMissingEmail,
    cache: true,
    debug: process.env.DEBUG === 'true',
  });

  console.log('Apollo API: Connected');
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
    maxPages: args.maxPages,
    perPage: args.perPage,
  });

  job.on('search', (info) => {
    console.log(`Page ${info.page}`);
    console.log(`People found: ${info.people_count}`);
    if (info.total_entries != null) {
      console.log(`Total matching (Apollo): ${info.total_entries}`);
    }
    console.log('');
  });

  job.on('enriching', (info) => {
    console.log(`Enriching... (${info.count} people)`);
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
    if (args.personalEmail) {
      console.log(`Personal emails found: ${outcome.stats.personal_emails_found}`);
    }
    if (args.waterfallEmail) {
      console.log(`Waterfall requests: ${outcome.stats.waterfall_requests}`);
    }
    console.log(`Enrichment requests: ${outcome.stats.enrichment_requests}`);
    console.log(`Cache skips: ${outcome.stats.enrichment_skipped_cache}`);
    console.log(`Credits used: ${outcome.stats.credits_used}`);
  }

  if (args.output) {
    const outPath = path.resolve(args.output);
    if (outPath.toLowerCase().endsWith('.json')) {
      extractor.exportToJSON(outcome.results, outPath, {
        meta: {
          stats: outcome.stats,
          filters: outcome.filters,
          unsupported: outcome.unsupported,
        },
      });
    } else {
      extractor.exportToCSV(outcome.results, outPath);
    }
    console.log(`Exported: ${outPath}`);
  }

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
