'use strict';

const { parseApolloUrl } = require('./apolloUrlParser');

/**
 * Official People API Search filters (Apollo docs, July 2026):
 * https://docs.apollo.io/reference/people-api-search
 *
 * Only parameters documented on that endpoint are sent to the API.
 * Web-only / undocumented parameters are returned under `unsupported`.
 */

/** @type {Record<string, { apiKey: string, type: 'array'|'string'|'boolean'|'integer'|'nested', nested?: string }>} */
const WEB_TO_API = {
  // Titles / keywords
  personTitles: { apiKey: 'person_titles', type: 'array' },
  person_titles: { apiKey: 'person_titles', type: 'array' },
  includeSimilarTitles: { apiKey: 'include_similar_titles', type: 'boolean' },
  include_similar_titles: { apiKey: 'include_similar_titles', type: 'boolean' },
  qKeywords: { apiKey: 'q_keywords', type: 'string' },
  q_keywords: { apiKey: 'q_keywords', type: 'string' },

  // Person filters
  personLocations: { apiKey: 'person_locations', type: 'array' },
  person_locations: { apiKey: 'person_locations', type: 'array' },
  personSeniorities: { apiKey: 'person_seniorities', type: 'array' },
  person_seniorities: { apiKey: 'person_seniorities', type: 'array' },
  contactEmailStatus: { apiKey: 'contact_email_status', type: 'array' },
  contact_email_status: { apiKey: 'contact_email_status', type: 'array' },

  // Organization filters
  organizationLocations: { apiKey: 'organization_locations', type: 'array' },
  organization_locations: { apiKey: 'organization_locations', type: 'array' },
  qOrganizationDomainsList: { apiKey: 'q_organization_domains_list', type: 'array' },
  q_organization_domains_list: { apiKey: 'q_organization_domains_list', type: 'array' },
  organizationIds: { apiKey: 'organization_ids', type: 'array' },
  organization_ids: { apiKey: 'organization_ids', type: 'array' },
  organizationNumEmployeesRanges: { apiKey: 'organization_num_employees_ranges', type: 'array' },
  organization_num_employees_ranges: { apiKey: 'organization_num_employees_ranges', type: 'array' },

  // Industry tag IDs from Apollo web URLs.
  // Official OpenAPI page omits this field, but Apollo's own CLI maps
  // organizationIndustryTagIds -> organization_industry_tag_ids and the
  // live People API Search endpoint accepts it (verified).
  organizationIndustryTagIds: { apiKey: 'organization_industry_tag_ids', type: 'array' },
  organization_industry_tag_ids: { apiKey: 'organization_industry_tag_ids', type: 'array' },

  // Revenue range
  'revenueRange[min]': { apiKey: 'revenue_range', type: 'nested', nested: 'min' },
  'revenueRange[max]': { apiKey: 'revenue_range', type: 'nested', nested: 'max' },
  'revenue_range[min]': { apiKey: 'revenue_range', type: 'nested', nested: 'min' },
  'revenue_range[max]': { apiKey: 'revenue_range', type: 'nested', nested: 'max' },

  // Technologies
  currentlyUsingAllOfTechnologyUids: { apiKey: 'currently_using_all_of_technology_uids', type: 'array' },
  currently_using_all_of_technology_uids: { apiKey: 'currently_using_all_of_technology_uids', type: 'array' },
  currentlyUsingAnyOfTechnologyUids: { apiKey: 'currently_using_any_of_technology_uids', type: 'array' },
  currently_using_any_of_technology_uids: { apiKey: 'currently_using_any_of_technology_uids', type: 'array' },
  currentlyNotUsingAnyOfTechnologyUids: { apiKey: 'currently_not_using_any_of_technology_uids', type: 'array' },
  currently_not_using_any_of_technology_uids: { apiKey: 'currently_not_using_any_of_technology_uids', type: 'array' },

  // Job posting filters
  qOrganizationJobTitles: { apiKey: 'q_organization_job_titles', type: 'array' },
  q_organization_job_titles: { apiKey: 'q_organization_job_titles', type: 'array' },
  organizationJobLocations: { apiKey: 'organization_job_locations', type: 'array' },
  organization_job_locations: { apiKey: 'organization_job_locations', type: 'array' },
  'organizationNumJobsRange[min]': { apiKey: 'organization_num_jobs_range', type: 'nested', nested: 'min' },
  'organizationNumJobsRange[max]': { apiKey: 'organization_num_jobs_range', type: 'nested', nested: 'max' },
  'organization_num_jobs_range[min]': { apiKey: 'organization_num_jobs_range', type: 'nested', nested: 'min' },
  'organization_num_jobs_range[max]': { apiKey: 'organization_num_jobs_range', type: 'nested', nested: 'max' },
  'organizationJobPostedAtRange[min]': { apiKey: 'organization_job_posted_at_range', type: 'nested', nested: 'min' },
  'organizationJobPostedAtRange[max]': { apiKey: 'organization_job_posted_at_range', type: 'nested', nested: 'max' },
  'organization_job_posted_at_range[min]': { apiKey: 'organization_job_posted_at_range', type: 'nested', nested: 'min' },
  'organization_job_posted_at_range[max]': { apiKey: 'organization_job_posted_at_range', type: 'nested', nested: 'max' },

  // Pagination
  page: { apiKey: 'page', type: 'integer' },
  perPage: { apiKey: 'per_page', type: 'integer' },
  per_page: { apiKey: 'per_page', type: 'integer' },
};

/**
 * Known web-only / internal Apollo UI parameters that must NOT be sent
 * to POST /api/v1/mixed_people/api_search.
 *
 * organizationIndustryTagIds: present in Apollo web URLs, but NOT documented
 * on the People API Search endpoint (checked against official docs July 2026).
 */
const KNOWN_UNSUPPORTED = {
  sortAscending: 'Apollo web UI sort flag; not a documented People API Search parameter.',
  sortByField: 'Apollo web UI sort field; not a documented People API Search parameter.',
  recommendationConfigId: 'Apollo web UI recommendation config; not a documented People API Search parameter.',
  utm_campaign: 'Marketing tracking parameter; not a People API Search filter.',
  utm_content: 'Marketing tracking parameter; not a People API Search filter.',
  utm_medium: 'Marketing tracking parameter; not a People API Search filter.',
  utm_source: 'Marketing tracking parameter; not a People API Search filter.',
};

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const v = String(value).toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return Boolean(value);
}

function toInteger(value) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) ? n : undefined;
}

function ensureArray(value) {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.map(String);
  // Critical: never join into a comma-separated string for Apollo arrays
  return [String(value)];
}

/**
 * Map raw Apollo web URL parameters to official API filters.
 * @param {Record<string, string|string[]>} rawWebParams
 * @returns {{ filters: object, unsupported: object, unsupportedDetails: object }}
 */
function mapWebFiltersToApi(rawWebParams) {
  const filters = {};
  const unsupported = {};
  const unsupportedDetails = {};

  for (const [webKey, rawValue] of Object.entries(rawWebParams || {})) {
    if (KNOWN_UNSUPPORTED[webKey]) {
      unsupported[webKey] = rawValue;
      unsupportedDetails[webKey] = KNOWN_UNSUPPORTED[webKey];
      continue;
    }

    const mapping = WEB_TO_API[webKey];
    if (!mapping) {
      unsupported[webKey] = rawValue;
      unsupportedDetails[webKey] =
        'No documented People API Search equivalent. Not sent to the API.';
      continue;
    }

    if (mapping.type === 'array') {
      const arr = ensureArray(rawValue);
      if (arr.length) filters[mapping.apiKey] = arr;
    } else if (mapping.type === 'boolean') {
      filters[mapping.apiKey] = toBoolean(Array.isArray(rawValue) ? rawValue[0] : rawValue);
    } else if (mapping.type === 'integer') {
      const n = toInteger(rawValue);
      if (n !== undefined) filters[mapping.apiKey] = n;
    } else if (mapping.type === 'nested') {
      if (!filters[mapping.apiKey] || typeof filters[mapping.apiKey] !== 'object') {
        filters[mapping.apiKey] = {};
      }
      const nestedValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
      // revenue / job count ranges are integers; date ranges stay strings
      if (mapping.apiKey.includes('posted_at')) {
        filters[mapping.apiKey][mapping.nested] = String(nestedValue);
      } else {
        const asNum = Number(nestedValue);
        filters[mapping.apiKey][mapping.nested] = Number.isFinite(asNum)
          ? asNum
          : String(nestedValue);
      }
    } else {
      filters[mapping.apiKey] = String(Array.isArray(rawValue) ? rawValue[0] : rawValue);
    }
  }

  return { filters, unsupported, unsupportedDetails };
}

/**
 * Parse an Apollo URL and map filters for the official People API Search.
 * @param {string} url
 */
function parseAndMapApolloUrl(url) {
  const parsed = parseApolloUrl(url);
  const mapped = mapWebFiltersToApi(parsed.raw);

  return {
    ...mapped,
    parsed,
    summary: {
      person_titles: mapped.filters.person_titles || [],
      person_locations: mapped.filters.person_locations || [],
      industry_tag_ids:
        mapped.filters.organization_industry_tag_ids ||
        parsed.organizationIndustryTagIds ||
        [],
      page: mapped.filters.page ?? parsed.page,
      unsupported_count: Object.keys(mapped.unsupported).length,
    },
  };
}

/**
 * Flatten nested filter objects into Apollo query-style keys when needed.
 * For JSON body requests we keep nested objects.
 * @param {object} filters
 */
function normalizeFiltersForRequest(filters) {
  // Ensure every array filter is actually an array (prevents 422:
  // "person_titles requires an array")
  const out = { ...filters };
  const arrayKeys = [
    'person_titles',
    'person_locations',
    'person_seniorities',
    'organization_locations',
    'q_organization_domains_list',
    'contact_email_status',
    'organization_ids',
    'organization_num_employees_ranges',
    'organization_industry_tag_ids',
    'currently_using_all_of_technology_uids',
    'currently_using_any_of_technology_uids',
    'currently_not_using_any_of_technology_uids',
    'q_organization_job_titles',
    'organization_job_locations',
  ];

  for (const key of arrayKeys) {
    if (out[key] !== undefined) {
      out[key] = ensureArray(out[key]);
    }
  }

  return out;
}

module.exports = {
  WEB_TO_API,
  KNOWN_UNSUPPORTED,
  mapWebFiltersToApi,
  parseAndMapApolloUrl,
  normalizeFiltersForRequest,
  ensureArray,
};
