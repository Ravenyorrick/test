'use strict';

const { ApolloClient, ApolloApiError } = require('./apolloClient');
const { parseApolloUrl, parseQueryString, extractPeopleHash } = require('./apolloUrlParser');
const {
  mapWebFiltersToApi,
  parseAndMapApolloUrl,
  normalizeFiltersForRequest,
  WEB_TO_API,
  KNOWN_UNSUPPORTED,
} = require('./filterMapper');
const { searchPeople, searchPeoplePaginated, extractSearchPerson } = require('./peopleSearch');
const { enrichPerson, buildEnrichmentDetails } = require('./peopleEnrichment');
const {
  bulkEnrichPeople,
  bulkEnrichPeopleBatched,
  MAX_BULK_SIZE,
} = require('./bulkPeopleEnrichment');
const { EnrichmentCache } = require('./cache');
const { RateLimiter } = require('./rateLimiter');
const { exportToCSV, exportToJSON } = require('./exporters');
const { normalizeLead } = require('./normalize');
const { WaterfallWebhookHandler } = require('./webhookServer');
const { ApolloExtractor, ExtractionEngine, ExtractionJob } = require('./extractionEngine');

module.exports = {
  // Primary API
  ApolloExtractor,
  ExtractionEngine,
  ExtractionJob,

  // Client
  ApolloClient,
  ApolloApiError,

  // URL / filters
  parseApolloUrl,
  parseQueryString,
  extractPeopleHash,
  mapWebFiltersToApi,
  parseAndMapApolloUrl,
  normalizeFiltersForRequest,
  WEB_TO_API,
  KNOWN_UNSUPPORTED,

  // Search / enrichment
  searchPeople,
  searchPeoplePaginated,
  extractSearchPerson,
  enrichPerson,
  buildEnrichmentDetails,
  bulkEnrichPeople,
  bulkEnrichPeopleBatched,
  MAX_BULK_SIZE,

  // Utilities
  EnrichmentCache,
  RateLimiter,
  exportToCSV,
  exportToJSON,
  normalizeLead,
  WaterfallWebhookHandler,
};
