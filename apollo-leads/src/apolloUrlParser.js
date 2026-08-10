'use strict';

/**
 * Parse an Apollo app search URL.
 *
 * Apollo stores search filters in the hash route, e.g.:
 * https://app.apollo.io/?utm_source=cio#/people?page=1&personTitles[]=ceo
 *
 * Important: do NOT parse only the normal URL query string.
 */

function decodeValue(value) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value.replace(/\+/g, ' ');
  }
}

/**
 * Parse a query string that may contain repeated keys and [] array notation.
 * @param {string} queryString
 * @returns {Record<string, string | string[]>}
 */
function parseQueryString(queryString) {
  const params = {};
  const raw = queryString.replace(/^\?/, '');
  if (!raw) return params;

  for (const part of raw.split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawValue = eq === -1 ? '' : part.slice(eq + 1);
    const key = decodeValue(rawKey);
    const value = decodeValue(rawValue);

    // Normalize trailing [] for grouping, but keep base name
    const isArrayKey = key.endsWith('[]');
    const baseKey = isArrayKey ? key.slice(0, -2) : key;

    // Nested object keys like revenueRange[min] stay as-is for the mapper
    if (isArrayKey || Object.prototype.hasOwnProperty.call(params, baseKey)) {
      const existing = params[baseKey];
      if (existing === undefined) {
        params[baseKey] = [value];
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        params[baseKey] = [existing, value];
      }
    } else {
      params[baseKey] = value;
    }
  }

  return params;
}

/**
 * Extract the #/people?... hash query from an Apollo URL.
 * @param {string} url
 * @returns {{ hashPath: string|null, hashQuery: string, pageQuery: Record<string, string|string[]> }}
 */
function extractPeopleHash(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Apollo URL must be a non-empty string');
  }

  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    // Fallback only for already-extracted people query fragments / local paths,
    // not for full https://app.apollo.io/?... URLs missing the hash route.
    const isFullHttpUrl = /^https?:\/\//i.test(url);
    const looksLikePeopleQuery =
      !isFullHttpUrl &&
      (url.startsWith('/people') ||
        url.startsWith('people?') ||
        ((url.includes('personTitles') || url.includes('personLocations')) &&
          !url.includes('://')));

    if (looksLikePeopleQuery) {
      const qIndex = url.indexOf('?');
      return {
        hashPath: '/people',
        hashQuery: qIndex === -1 ? '' : url.slice(qIndex + 1),
        pageQuery: {},
      };
    }
    throw new Error(
      'Apollo URL is missing the #/people hash route. Expected a URL like https://app.apollo.io/#/people?...'
    );
  }

  const beforeHash = url.slice(0, hashIndex);
  const hash = url.slice(hashIndex + 1); // remove #

  // Support "#/people?..." and "#people?..."
  const normalizedHash = hash.startsWith('/') ? hash : `/${hash}`;
  const peopleMatch = normalizedHash.match(/^\/people(?:\?(.*))?$/i);
  if (!peopleMatch) {
    // Some Apollo URLs may have nested fragments; try to find /people?
    const nested = normalizedHash.match(/\/people\?(.*)$/i) || normalizedHash.match(/\/people$/i);
    if (!nested) {
      throw new Error(
        `Apollo URL hash does not contain a /people route. Found hash: ${hash.slice(0, 120)}`
      );
    }
    return {
      hashPath: '/people',
      hashQuery: nested[1] || '',
      pageQuery: parseQueryString(beforeHash.includes('?') ? beforeHash.slice(beforeHash.indexOf('?') + 1) : ''),
    };
  }

  return {
    hashPath: '/people',
    hashQuery: peopleMatch[1] || '',
    pageQuery: parseQueryString(beforeHash.includes('?') ? beforeHash.slice(beforeHash.indexOf('?') + 1) : ''),
  };
}

/**
 * Parse an Apollo people search URL into raw web parameters.
 *
 * @param {string} url
 * @returns {{
 *   raw: Record<string, string|string[]>,
 *   personTitles: string[],
 *   personLocations: string[],
 *   organizationIndustryTagIds: string[],
 *   page: number|null,
 *   hashPath: string,
 *   pageQuery: Record<string, string|string[]>
 * }}
 */
function parseApolloUrl(url) {
  const { hashPath, hashQuery, pageQuery } = extractPeopleHash(url);
  const raw = parseQueryString(hashQuery);

  const asArray = (key) => {
    const value = raw[key];
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  };

  const pageRaw = raw.page;
  const page = pageRaw === undefined || pageRaw === ''
    ? null
    : Number(Array.isArray(pageRaw) ? pageRaw[0] : pageRaw);

  return {
    raw,
    personTitles: asArray('personTitles'),
    personLocations: asArray('personLocations'),
    organizationIndustryTagIds: asArray('organizationIndustryTagIds'),
    page: Number.isFinite(page) ? page : null,
    hashPath,
    pageQuery,
  };
}

module.exports = {
  parseApolloUrl,
  parseQueryString,
  extractPeopleHash,
  decodeValue,
};
