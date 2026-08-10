'use strict';

const { normalizeLead } = require('./normalize');

const ENRICH_PATH = '/people/match';

/**
 * Build enrichment identifiers for one person.
 * Prefer Apollo person ID; also pass supporting identifiers when available.
 * @param {object} person
 */
function buildEnrichmentDetails(person) {
  const details = {};

  const id = person.apollo_person_id || person.id || person.person_id;
  if (id) details.id = id;

  if (person.first_name) details.first_name = person.first_name;
  if (person.last_name && !String(person.last_name).includes('*')) {
    details.last_name = person.last_name;
  }
  if (person.name) details.name = person.name;

  const orgName = person.company || person.organization_name || person.organization?.name;
  if (orgName) details.organization_name = orgName;

  const domain =
    person.company_domain ||
    person.domain ||
    person.organization?.primary_domain ||
    person.organization?.domain;
  if (domain) details.domain = domain;

  if (person.linkedin_url) details.linkedin_url = person.linkedin_url;
  if (person.email || person.business_email) {
    details.email = person.email || person.business_email;
  }

  return details;
}

/**
 * Enrich one person via Apollo People Enrichment.
 *
 * Official endpoint: POST https://api.apollo.io/api/v1/people/match
 *
 * Business/work email is returned as `person.email` with `person.email_status`.
 * Personal emails require reveal_personal_emails=true (default false).
 *
 * Waterfall email (run_waterfall_email=true) is asynchronous and requires webhook_url.
 *
 * @param {import('./apolloClient').ApolloClient} client
 * @param {object} person
 * @param {object} [options]
 * @param {boolean} [options.revealPersonalEmails=false]
 * @param {boolean} [options.runWaterfallEmail=false]
 * @param {string} [options.webhookUrl]
 * @param {boolean} [options.includeRaw=false]
 */
async function enrichPerson(client, person, options = {}) {
  const details = buildEnrichmentDetails(person);
  if (!Object.keys(details).length) {
    throw new Error('Cannot enrich person: no identifying information provided');
  }

  // Email reveal only: Apollo's People Match is the unlock endpoint.
  // Prefer person id alone when available — avoid extra matching fields that
  // do not reduce credit cost but can confuse "enrich vs reveal" intent.
  const query = options.emailRevealOnly && details.id
    ? {
        id: details.id,
        reveal_personal_emails: Boolean(options.revealPersonalEmails),
        reveal_phone_number: false,
      }
    : {
        ...details,
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

  const response = await client.post(ENRICH_PATH, { query });
  const data = response.data || {};
  const enrichedPerson = data.person || null;

  const waterfall = data.waterfall || null;
  const requestId = data.request_id || null;

  let emailSource = 'none';
  let enrichmentStatus = 'enriched';

  if (!enrichedPerson || (!enrichedPerson.id && !enrichedPerson.email)) {
    enrichmentStatus = 'no_match';
  }

  const lead = normalizeLead({
    searchPerson: person,
    enrichedPerson: enrichedPerson || {},
    emailSource: enrichedPerson?.email ? 'apollo_native' : 'none',
    enrichmentStatus,
    includeRaw: options.includeRaw,
    raw: options.includeRaw ? data : undefined,
    waterfallRequestId: requestId,
  });

  if (lead.found_business_email) {
    emailSource = 'apollo_native';
    lead.email_source = emailSource;
  } else if (options.runWaterfallEmail && waterfall?.status === 'accepted') {
    lead.enrichment_status = 'waterfall_pending';
    lead.email_source = 'none';
  }

  return {
    lead,
    person: enrichedPerson,
    waterfall,
    request_id: requestId,
    raw: data,
    credits_used: data.credits_consumed ?? data.credits_used ?? 'not provided by response',
  };
}

module.exports = {
  ENRICH_PATH,
  enrichPerson,
  buildEnrichmentDetails,
};
