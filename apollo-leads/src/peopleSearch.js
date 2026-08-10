'use strict';

const { normalizeFiltersForRequest } = require('./filterMapper');

const SEARCH_PATH = '/mixed_people/api_search';
const MAX_PER_PAGE = 100;
const MAX_DISPLAY_RECORDS = 50000;

/**
 * Search people via Apollo's official People API Search.
 * Credit usage: 0. Does not return email addresses or phone numbers.
 *
 * @param {import('./apolloClient').ApolloClient} client
 * @param {object} filters
 * @param {object} [options]
 * @param {number} [options.page]
 * @param {number} [options.perPage]
 */
async function searchPeople(client, filters, options = {}) {
  const page = options.page ?? filters.page ?? 1;
  const perPage = Math.min(MAX_PER_PAGE, options.perPage ?? filters.per_page ?? 100);

  const body = normalizeFiltersForRequest({
    ...filters,
    page,
    per_page: perPage,
  });

  // Remove undefined
  for (const key of Object.keys(body)) {
    if (body[key] === undefined) delete body[key];
  }

  const response = await client.post(SEARCH_PATH, { body });
  const data = response.data || {};
  const people = Array.isArray(data.people)
    ? data.people
    : Array.isArray(data.contacts)
      ? data.contacts
      : [];

  return {
    people,
    total_entries: data.total_entries ?? people.length,
    page,
    per_page: perPage,
    raw: data,
  };
}

/**
 * Paginate through People API Search results safely.
 *
 * @param {import('./apolloClient').ApolloClient} client
 * @param {object} filters
 * @param {object} options
 * @param {number} [options.maxPages]
 * @param {number} [options.perPage]
 * @param {number} [options.startPage]
 * @param {() => boolean} [options.shouldContinue]
 * @param {(info: object) => void|Promise<void>} [options.onPage]
 */
async function searchPeoplePaginated(client, filters, options = {}) {
  const maxPages = options.maxPages ?? 10;
  const perPage = Math.min(MAX_PER_PAGE, options.perPage ?? 100);
  let page = options.startPage ?? filters.page ?? 1;
  const allPeople = [];
  let totalEntries = null;
  let pagesFetched = 0;

  while (pagesFetched < maxPages) {
    if (options.shouldContinue && !options.shouldContinue()) {
      break;
    }

    const result = await searchPeople(client, filters, { page, perPage });
    totalEntries = result.total_entries;
    pagesFetched += 1;

    if (options.onPage) {
      await options.onPage({
        page,
        per_page: perPage,
        people: result.people,
        total_entries: totalEntries,
        pages_fetched: pagesFetched,
      });
    }

    if (!result.people.length) {
      break;
    }

    allPeople.push(...result.people);

    // Stop when we have all available results or hit Apollo display limit
    const fetchedSoFar = (page - 1) * perPage + result.people.length;
    if (fetchedSoFar >= Math.min(totalEntries ?? Infinity, MAX_DISPLAY_RECORDS)) {
      break;
    }

    if (result.people.length < perPage) {
      break;
    }

    page += 1;
  }

  return {
    people: allPeople,
    total_entries: totalEntries,
    pages_fetched: pagesFetched,
    last_page: page,
  };
}

/**
 * Normalize a search person into identifying fields for enrichment.
 * @param {object} person
 */
function extractSearchPerson(person) {
  if (!person || typeof person !== 'object') return null;

  const org = person.organization || person.account || {};
  return {
    apollo_person_id: person.id || person.person_id || null,
    first_name: person.first_name || null,
    last_name: person.last_name || null,
    last_name_obfuscated: person.last_name_obfuscated || null,
    name: person.name || null,
    title: person.title || null,
    company: org.name || person.organization_name || null,
    company_domain: org.primary_domain || org.domain || person.domain || null,
    organization_id: org.id || person.organization_id || null,
    linkedin_url: person.linkedin_url || null,
    has_email: person.has_email ?? null,
    email_status: person.email_status || person.contact_email_status || null,
    location: [person.city, person.state, person.country].filter(Boolean).join(', ') || null,
    raw_search: person,
  };
}

module.exports = {
  SEARCH_PATH,
  MAX_PER_PAGE,
  MAX_DISPLAY_RECORDS,
  searchPeople,
  searchPeoplePaginated,
  extractSearchPerson,
};
