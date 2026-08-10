#!/usr/bin/env node
'use strict';

/**
 * Live acceptance chain against Apollo's official API.
 *
 * Requires APOLLO_API_KEY.
 * Uses a tiny page size to minimize credit use during enrichment.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const {
  ApolloClient,
  parseAndMapApolloUrl,
  searchPeople,
  enrichPerson,
  bulkEnrichPeople,
  normalizeLead,
  exportToJSON,
  exportToCSV,
  ApolloApiError,
} = require('../src');

const EXAMPLE_URL =
  'https://app.apollo.io/?utm_campaign=Transactional%3A+Password+Reset&utm_content=Transactional%3A+Password+Reset&utm_medium=email&utm_source=cio#/people?page=1&personLocations[]=United%20States&organizationIndustryTagIds[]=5567ce2673696453d95c0000&sortAscending=false&sortByField=%5Bnone%5D&recommendationConfigId=6a0d0a155813970001be6201&personTitles[]=sales%20representative&personTitles[]=chief%20executive%20officer&personTitles[]=project%20manager';

function step(n, title) {
  console.log(`\n=== TEST ${n}: ${title} ===`);
}

async function main() {
  step(1, 'Verify APOLLO_API_KEY');
  if (!process.env.APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY is missing');
  }
  console.log('APOLLO_API_KEY: present (value not printed)');

  const client = new ApolloClient({
    apiKey: process.env.APOLLO_API_KEY,
    debug: process.env.DEBUG === 'true',
  });

  step(2, 'Parse the exact Apollo URL');
  const mapped = parseAndMapApolloUrl(EXAMPLE_URL);
  console.log('Titles:', mapped.filters.person_titles);
  console.log('Locations:', mapped.filters.person_locations);
  console.log('Industry (unsupported):', mapped.unsupported.organizationIndustryTagIds);
  console.log('Page:', mapped.filters.page);
  console.log('Unsupported keys:', Object.keys(mapped.unsupported));

  step(3, 'Print normalized filters');
  console.log(JSON.stringify(mapped.filters, null, 2));

  if (!Array.isArray(mapped.filters.person_titles)) {
    throw new Error('person_titles must be an array');
  }
  if (mapped.filters.organizationIndustryTagIds) {
    throw new Error('industry web filter must not be in API filters');
  }

  step(4, 'People API Search');
  const search = await searchPeople(client, mapped.filters, { page: 1, perPage: 3 });
  console.log('HTTP people returned:', search.people.length);
  console.log('total_entries:', search.total_entries);

  if (!search.people.length) {
    throw new Error('Search returned no people — cannot continue enrichment tests');
  }

  step(5, 'Take one returned person');
  const person = search.people[0];
  console.log('Apollo person id:', person.id);
  console.log('first_name:', person.first_name);
  console.log('title:', person.title);
  console.log('organization:', person.organization?.name);

  step(6, 'People Enrichment (people/match)');
  const enrichment = await enrichPerson(
    client,
    {
      apollo_person_id: person.id,
      first_name: person.first_name,
      title: person.title,
      company: person.organization?.name,
    },
    { revealPersonalEmails: false, runWaterfallEmail: false, includeRaw: true }
  );

  step(7, 'Inspect business/work email fields');
  console.log('person.email:', enrichment.person?.email ?? null);
  console.log('person.email_status:', enrichment.person?.email_status ?? null);
  console.log('credits_used:', enrichment.credits_used);

  step(8, 'Store as business_email');
  const lead = enrichment.lead;
  console.log('business_email:', lead.business_email);
  console.log('business_email_status:', lead.business_email_status);
  console.log('personal_email:', lead.personal_email);
  console.log('email_source:', lead.email_source);

  if (lead.business_email && lead.personal_email && lead.business_email === lead.personal_email) {
    throw new Error('business_email must not equal personal_email');
  }

  step(9, 'Optional waterfall (skipped unless WATERFALL_TEST=true and webhook set)');
  if (process.env.WATERFALL_TEST === 'true' && process.env.APOLLO_WEBHOOK_URL) {
    const waterfall = await enrichPerson(
      client,
      { apollo_person_id: person.id, first_name: person.first_name },
      {
        runWaterfallEmail: true,
        webhookUrl: process.env.APOLLO_WEBHOOK_URL,
      }
    );
    console.log('waterfall status:', waterfall.waterfall);
    console.log('request_id:', waterfall.request_id);
    console.log('NOTE: final email arrives asynchronously at the webhook URL');
  } else {
    console.log('Skipped (set WATERFALL_TEST=true and APOLLO_WEBHOOK_URL to exercise).');
  }

  step(10, 'Bulk enrichment smoke + export');
  const bulk = await bulkEnrichPeople(
    client,
    search.people.slice(0, Math.min(2, search.people.length)).map((p) => ({
      apollo_person_id: p.id,
      first_name: p.first_name,
      company: p.organization?.name,
    })),
    { revealPersonalEmails: false }
  );

  const leads = bulk.results.map((r) => r.lead);
  if (!leads.find((l) => l.apollo_person_id === lead.apollo_person_id)) {
    leads.unshift(lead);
  }

  const outDir = path.join(__dirname, '..', 'exports');
  const jsonPath = path.join(outDir, 'live-chain.json');
  const csvPath = path.join(outDir, 'live-chain.csv');
  exportToJSON(leads, jsonPath, {
    meta: {
      filters: mapped.filters,
      unsupported: mapped.unsupported,
      search_total_entries: search.total_entries,
    },
  });
  exportToCSV(leads, csvPath);
  console.log('Exported', jsonPath);
  console.log('Exported', csvPath);

  console.log('\nLIVE API CHAIN: OK');
}

main().catch((err) => {
  if (err instanceof ApolloApiError) {
    console.error(err.message);
  } else {
    console.error(err.stack || err.message || err);
  }
  process.exit(1);
});
