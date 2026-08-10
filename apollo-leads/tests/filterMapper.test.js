'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  mapWebFiltersToApi,
  parseAndMapApolloUrl,
  normalizeFiltersForRequest,
} = require('../src/filterMapper');

const EXAMPLE_URL =
  'https://app.apollo.io/?utm_campaign=Transactional%3A+Password+Reset&utm_content=Transactional%3A+Password+Reset&utm_medium=email&utm_source=cio#/people?page=1&personLocations[]=United%20States&organizationIndustryTagIds[]=5567ce2673696453d95c0000&sortAscending=false&sortByField=%5Bnone%5D&recommendationConfigId=6a0d0a155813970001be6201&personTitles[]=sales%20representative&personTitles[]=chief%20executive%20officer&personTitles[]=project%20manager';

describe('filterMapper', () => {
  it('maps personTitles[] to person_titles as an array (not a joined string)', () => {
    const mapped = parseAndMapApolloUrl(EXAMPLE_URL);

    assert.deepEqual(mapped.filters.person_titles, [
      'sales representative',
      'chief executive officer',
      'project manager',
    ]);
    assert.equal(Array.isArray(mapped.filters.person_titles), true);
    assert.notEqual(
      mapped.filters.person_titles,
      'sales representative,chief executive officer,project manager'
    );
  });

  it('maps personLocations[] to person_locations array', () => {
    const mapped = parseAndMapApolloUrl(EXAMPLE_URL);
    assert.deepEqual(mapped.filters.person_locations, ['United States']);
  });

  it('does not send unsupported web parameters to the API filters', () => {
    const mapped = parseAndMapApolloUrl(EXAMPLE_URL);

    assert.equal(mapped.filters.sortAscending, undefined);
    assert.equal(mapped.filters.sortByField, undefined);
    assert.equal(mapped.filters.recommendationConfigId, undefined);
    assert.equal(mapped.filters.organizationIndustryTagIds, undefined);
    assert.equal(mapped.filters.organization_industry_tag_ids, undefined);

    assert.equal(mapped.unsupported.sortAscending, 'false');
    assert.equal(mapped.unsupported.sortByField, '[none]');
    assert.equal(
      mapped.unsupported.recommendationConfigId,
      '6a0d0a155813970001be6201'
    );
    assert.deepEqual(mapped.unsupported.organizationIndustryTagIds, [
      '5567ce2673696453d95c0000',
    ]);
  });

  it('maps nested revenue range parameters', () => {
    const mapped = mapWebFiltersToApi({
      'revenueRange[min]': '500000',
      'revenueRange[max]': '1500000',
    });
    assert.deepEqual(mapped.filters.revenue_range, { min: 500000, max: 1500000 });
  });

  it('maps documented seniorities and organization domains', () => {
    const mapped = mapWebFiltersToApi({
      personSeniorities: ['director', 'vp'],
      qOrganizationDomainsList: ['apollo.io', 'microsoft.com'],
      includeSimilarTitles: 'false',
    });
    assert.deepEqual(mapped.filters.person_seniorities, ['director', 'vp']);
    assert.deepEqual(mapped.filters.q_organization_domains_list, [
      'apollo.io',
      'microsoft.com',
    ]);
    assert.equal(mapped.filters.include_similar_titles, false);
  });

  it('normalizeFiltersForRequest keeps array filters as arrays', () => {
    const normalized = normalizeFiltersForRequest({
      person_titles: 'ceo',
      person_locations: ['United States'],
    });
    assert.deepEqual(normalized.person_titles, ['ceo']);
    assert.deepEqual(normalized.person_locations, ['United States']);
  });
});
