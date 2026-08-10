'use strict';

const { buildEnrichmentDetails } = require('./peopleEnrichment');
const { normalizeLead } = require('./normalize');

const BULK_ENRICH_PATH = '/people/bulk_match';
const MAX_BULK_SIZE = 10; // Apollo documents up to 10 people per bulk request

/**
 * Split an array into chunks of at most `size`.
 * @template T
 * @param {T[]} items
 * @param {number} size
 */
function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/**
 * Enrich up to 10 people via Apollo Bulk People Enrichment.
 *
 * Official endpoint: POST https://api.apollo.io/api/v1/people/bulk_match
 *
 * @param {import('./apolloClient').ApolloClient} client
 * @param {object[]} people
 * @param {object} [options]
 */
async function bulkEnrichPeople(client, people, options = {}) {
  if (!Array.isArray(people) || people.length === 0) {
    return {
      results: [],
      waterfall: null,
      request_id: null,
      credits_used: 'not provided by response',
      raw: null,
    };
  }

  if (people.length > MAX_BULK_SIZE) {
    throw new Error(
      `bulkEnrichPeople accepts at most ${MAX_BULK_SIZE} people per request (Apollo documented maximum). Received ${people.length}.`
    );
  }

  const details = people.map((p) => buildEnrichmentDetails(p));

  const query = {
    reveal_personal_emails: Boolean(options.revealPersonalEmails),
    reveal_phone_number: false,
  };

  if (options.runWaterfallEmail) {
    if (!options.webhookUrl) {
      throw new Error(
        'waterfallEmail requires a valid HTTPS webhookUrl (Apollo run_waterfall_email is asynchronous).'
      );
    }
    query.run_waterfall_email = true;
    query.run_waterfall_phone = false;
    query.webhook_url = options.webhookUrl;
  }

  const response = await client.post(BULK_ENRICH_PATH, {
    query,
    body: { details },
  });

  const data = response.data || {};
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const waterfall = data.waterfall || null;
  const requestId = data.request_id || null;

  const results = people.map((searchPerson, index) => {
    const enrichedPerson = matches[index] || null;
    let enrichmentStatus = 'enriched';
    if (!enrichedPerson) enrichmentStatus = 'no_match';

    const lead = normalizeLead({
      searchPerson: searchPerson,
      enrichedPerson: enrichedPerson || {},
      emailSource: enrichedPerson?.email ? 'apollo_native' : 'none',
      enrichmentStatus,
      includeRaw: options.includeRaw,
      raw: options.includeRaw
        ? { search: searchPerson, enrichment: enrichedPerson, bulk: data }
        : undefined,
      waterfallRequestId: requestId,
    });

    if (
      !lead.found_business_email &&
      options.runWaterfallEmail &&
      (waterfall?.status === 'accepted' || waterfall?.status === 'partial_accepted')
    ) {
      lead.enrichment_status = 'waterfall_pending';
    }

    return {
      lead,
      person: enrichedPerson,
      searchPerson,
    };
  });

  return {
    results,
    waterfall,
    request_id: requestId,
    credits_used:
      data.credits_consumed ?? data.credits_used ?? 'not provided by response',
    raw: data,
    total_requested_enrichments: data.total_requested_enrichments,
    unique_enriched_records: data.unique_enriched_records,
    missing_records: data.missing_records,
  };
}

/**
 * Enrich many people in batches of 10.
 *
 * @param {import('./apolloClient').ApolloClient} client
 * @param {object[]} people
 * @param {object} [options]
 * @param {import('./rateLimiter').RateLimiter} [options.rateLimiter]
 * @param {(batchInfo: object) => void|Promise<void>} [options.onBatch]
 * @param {() => boolean} [options.shouldContinue]
 */
async function bulkEnrichPeopleBatched(client, people, options = {}) {
  const batches = chunk(people, MAX_BULK_SIZE);
  const allResults = [];
  let enrichmentRequests = 0;
  const creditsSamples = [];

  for (let i = 0; i < batches.length; i += 1) {
    if (options.shouldContinue && !options.shouldContinue()) break;

    const run = async () => bulkEnrichPeople(client, batches[i], options);
    const batchResult = options.rateLimiter
      ? await options.rateLimiter.schedule(run)
      : await run();

    enrichmentRequests += 1;
    creditsSamples.push(batchResult.credits_used);
    allResults.push(...batchResult.results);

    if (options.onBatch) {
      await options.onBatch({
        batch_index: i,
        batch_size: batches[i].length,
        results: batchResult.results,
        waterfall: batchResult.waterfall,
        request_id: batchResult.request_id,
      });
    }
  }

  const numericCredits = creditsSamples.filter((c) => typeof c === 'number');
  const creditsUsed =
    numericCredits.length > 0
      ? numericCredits.reduce((a, b) => a + b, 0)
      : 'not provided by response';

  return {
    results: allResults,
    enrichment_requests: enrichmentRequests,
    credits_used: creditsUsed,
  };
}

module.exports = {
  BULK_ENRICH_PATH,
  MAX_BULK_SIZE,
  chunk,
  bulkEnrichPeople,
  bulkEnrichPeopleBatched,
};
