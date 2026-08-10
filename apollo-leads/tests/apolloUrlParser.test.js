'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseApolloUrl } = require('../src/apolloUrlParser');

const EXAMPLE_URL =
  'https://app.apollo.io/?utm_campaign=Transactional%3A+Password+Reset&utm_content=Transactional%3A+Password+Reset&utm_medium=email&utm_source=cio#/people?page=1&personLocations[]=United%20States&organizationIndustryTagIds[]=5567ce2673696453d95c0000&sortAscending=false&sortByField=%5Bnone%5D&recommendationConfigId=6a0d0a155813970001be6201&personTitles[]=sales%20representative&personTitles[]=chief%20executive%20officer&personTitles[]=project%20manager';

describe('parseApolloUrl', () => {
  it('parses filters from the #/people hash route, not only the page query', () => {
    const parsed = parseApolloUrl(EXAMPLE_URL);

    assert.deepEqual(parsed.personTitles, [
      'sales representative',
      'chief executive officer',
      'project manager',
    ]);
    assert.deepEqual(parsed.personLocations, ['United States']);
    assert.deepEqual(parsed.organizationIndustryTagIds, ['5567ce2673696453d95c0000']);
    assert.equal(parsed.page, 1);
  });

  it('preserves repeated [] parameters as arrays', () => {
    const parsed = parseApolloUrl(
      'https://app.apollo.io/#/people?personTitles[]=a&personTitles[]=b&personTitles[]=c'
    );
    assert.deepEqual(parsed.personTitles, ['a', 'b', 'c']);
  });

  it('decodes URL-encoded values', () => {
    const parsed = parseApolloUrl(
      'https://app.apollo.io/#/people?personLocations[]=United%20States&personTitles[]=chief%20executive%20officer'
    );
    assert.deepEqual(parsed.personLocations, ['United States']);
    assert.deepEqual(parsed.personTitles, ['chief executive officer']);
  });

  it('captures web-only sort/recommendation params in raw', () => {
    const parsed = parseApolloUrl(EXAMPLE_URL);
    assert.equal(parsed.raw.sortAscending, 'false');
    assert.equal(parsed.raw.sortByField, '[none]');
    assert.equal(parsed.raw.recommendationConfigId, '6a0d0a155813970001be6201');
  });

  it('throws when #/people hash is missing', () => {
    assert.throws(
      () => parseApolloUrl('https://app.apollo.io/?page=1&personTitles[]=ceo'),
      /hash route|people/
    );
  });
});
