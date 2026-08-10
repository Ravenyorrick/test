'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const { ApolloExtractor } = require('../src');

const APOLLO_URL =
  process.env.APOLLO_URL ||
  'https://app.apollo.io/?utm_campaign=Transactional%3A+Password+Reset&utm_content=Transactional%3A+Password+Reset&utm_medium=email&utm_source=cio#/people?page=1&personLocations[]=United%20States&organizationIndustryTagIds[]=5567ce2673696453d95c0000&sortAscending=false&sortByField=%5Bnone%5D&recommendationConfigId=6a0d0a155813970001be6201&personTitles[]=sales%20representative&personTitles[]=chief%20executive%20officer&personTitles[]=project%20manager';

async function main() {
  if (!process.env.APOLLO_API_KEY) {
    console.error('Set APOLLO_API_KEY in .env before running this example.');
    process.exit(1);
  }

  const extractor = new ApolloExtractor({
    apiKey: process.env.APOLLO_API_KEY,
    maxPages: 1,
    perPage: 5,
    concurrency: 2,
    enrich: true,
    waterfallEmail: false,
    revealPersonalEmails: false,
    cache: true,
  });

  console.log('Parsing Apollo URL...');
  const mapped = extractor.parseUrl(APOLLO_URL);
  console.log('Filters:', JSON.stringify(mapped.filters, null, 2));
  console.log('Unsupported:', JSON.stringify(mapped.unsupported, null, 2));

  console.log('\nExtracting (1 page, 5 people)...');
  const job = extractor.extractFromUrl(APOLLO_URL, { maxPages: 1, perPage: 5 });

  job.on('search', (info) => console.log(`Search page ${info.page}: ${info.people_count} people`));
  job.on('email', (lead) =>
    console.log(`Business email: ${lead.name} -> ${lead.business_email}`)
  );

  const outcome = await job;

  const outJson = path.join(__dirname, '..', 'exports', 'example-leads.json');
  const outCsv = path.join(__dirname, '..', 'exports', 'example-leads.csv');
  extractor.exportToJSON(outcome.results, outJson, { meta: { stats: outcome.stats } });
  extractor.exportToCSV(outcome.results, outCsv);

  console.log('\nStats:', outcome.stats);
  console.log(`Wrote ${outJson}`);
  console.log(`Wrote ${outCsv}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
