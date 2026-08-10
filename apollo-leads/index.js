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
  --allow-no-email-flag    Also enrich people Apollo did not flag with has_email
                           (can waste 1 credit on demographics with no email)
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
    allowNoEmailFlag: false,
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
      case '--allow-no-email-flag':
        args.allowNoEmailFlag = true;
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
  if (f.organization_industry_tag_ids?.length || mapped.summary?.industry_tag_ids?.length) {
    const ids = f.organization_industry_tag_ids || mapped.summary.industry_tag_ids || [];
    lines.push(`Industry tag IDs: ${ids.length} (${ids.join(', ')})`);
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
  const outPath = path.resolve(args.output);

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
    // Default credit-safe: only enrich people Apollo flags with has_email
    onlyHasEmail: args.allowNoEmailFlag ? false : true,
    cache: true,
    debug: process.env.DEBUG === 'true',
    // Save each business email to disk immediately (crash-safe)
    autosavePath: outPath,
  };

  if (args.maxPages != null) extractorOptions.maxPages = args.maxPages;
  if (args.perPage != null) extractorOptions.perPage = args.perPage;

  const extractor = new ApolloExtractor(extractorOptions);

  console.log('Apollo API: Connected');
  console.log(`Email target: ${args.emails}`);
  console.log(`Autosave file: ${outPath}`);
  console.log('(Each email is saved immediately so a crash does not lose progress.)');
  console.log('Credits: search=0; enrich ≈1 credit per person for business email (no phone/waterfall).');
  console.log('         Only enriches people Apollo flags with has_email (skips the rest for free).');
  console.log('         One enrich at a time; stops as soon as your email total is reached.');
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
    autosavePath: outPath,
  });

  let personSeq = 0;

  function personLabel(person) {
    const name =
      person.name ||
      [person.first_name, person.last_name].filter(Boolean).join(' ') ||
      person.first_name ||
      'Unknown';
    const title = person.title || 'Unknown title';
    const company = person.company || person.organization?.name || 'Unknown company';
    return `${name} — ${title} @ ${company}`;
  }

  function progressLine() {
    const found = job.stats.business_emails_found || 0;
    const target = args.emails;
    const scanned = job.stats.people_found || 0;
    const pct = target ? Math.min(100, Math.round((found / target) * 100)) : 0;
    const filled = Math.round(pct / 5);
    const bar = `${'█'.repeat(filled)}${'░'.repeat(20 - filled)}`;
    return `[${bar}] ${found}/${target} emails  |  scanned ${scanned}`;
  }

  console.log('────────────────────────────────────────');
  console.log('Live extraction');
  console.log('────────────────────────────────────────');
  console.log(progressLine());
  console.log('');

  job.on('search', (info) => {
    console.log(`🔎 Search batch: ${info.people_count} people found`);
    console.log(progressLine());
    console.log('');
  });

  job.on('person', (person) => {
    personSeq += 1;
    const emailHint = person.has_email === true ? 'has_email' : 'no email flag';
    console.log(`👤 #${personSeq} Found: ${personLabel(person)} (${emailHint})`);
  });

  job.on('skipped', (info) => {
    if (info.reason === 'no_email_flag') {
      console.log(`   ↷ Skip enrich (no has_email — would risk 1 credit with no email)`);
    }
  });

  job.on('enriching', (info) => {
    console.log('');
    console.log(`⚡ Enriching 1 person for business email (≈1 credit)...`);
    console.log(progressLine());
  });

  job.on('enriched', (lead) => {
    if (lead.found_business_email) return; // email event prints success
    const label = personLabel(lead);
    if (lead.enrichment_status === 'cached') {
      console.log(`   ↺ Cached (no business email yet): ${label}`);
    } else if (lead.enrichment_status === 'waterfall_pending' || lead.enrichment_status === 'awaiting_waterfall') {
      console.log(`   … Waterfall pending: ${label}`);
    } else {
      console.log(`   ✗ No business email: ${label}`);
    }
  });

  job.on('email', (lead) => {
    const n = job.stats.business_emails_found;
    const total = args.emails;
    console.log(`   ✓ [${n}/${total}] ${personLabel(lead)}`);
    console.log(`      ${lead.business_email}${lead.business_email_status ? ` (${lead.business_email_status})` : ''}`);
    console.log(progressLine());
  });

  job.on('autosave', (info) => {
    if (info.event === 'started') {
      console.log(`💾 Saving progress to: ${info.path}`);
      console.log('');
    } else if (info.event === 'saved') {
      console.log(`   💾 Saved to file (${info.count} email${info.count === 1 ? '' : 's'} on disk)`);
    } else if (info.event === 'finalized') {
      console.log(`💾 Final file ready: ${info.path} (${info.count} emails)`);
    }
  });

  job.on('error', (err) => {
    if (err instanceof ApolloApiError) {
      console.error(`   ! ${err.message}`);
    } else {
      console.error(`   ! Error: ${err.message}`);
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
    console.log(`Skipped (no has_email): ${outcome.stats.enrichment_skipped_no_email_flag || 0}`);
    console.log(`Cache skips: ${outcome.stats.enrichment_skipped_cache}`);
    console.log(`Credits used: ${outcome.stats.credits_used}`);
    if (
      outcome.stats.enrichment_requests > 0 &&
      outcome.stats.business_emails_found > 0
    ) {
      console.log(
        `Approx credits/email: ${(
          outcome.stats.enrichment_requests / outcome.stats.business_emails_found
        ).toFixed(2)} (target ≈ 1.0)`
      );
    }
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
