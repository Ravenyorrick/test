'use strict';

const fs = require('fs');
const path = require('path');

const CSV_HEADERS = [
  'Apollo Person ID',
  'First Name',
  'Last Name',
  'Name',
  'Title',
  'Company',
  'Company Domain',
  'Location',
  'Business Email',
  'Business Email Status',
  'Personal Email',
  'Personal Email Status',
  'LinkedIn URL',
  'Email Source',
  'Enrichment Status',
];

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function leadToCsvRow(lead) {
  return [
    lead.apollo_person_id,
    lead.first_name,
    lead.last_name,
    lead.name,
    lead.title,
    lead.company,
    lead.company_domain,
    lead.location,
    lead.business_email,
    lead.business_email_status,
    lead.personal_email,
    lead.personal_email_status,
    lead.linkedin_url,
    lead.email_source,
    lead.enrichment_status,
  ].map(csvEscape).join(',');
}

/**
 * Export normalized leads to CSV.
 * Never exports API keys.
 *
 * @param {object[]} results
 * @param {string} filePath
 */
function exportToCSV(results, filePath) {
  if (!filePath) throw new Error('exportToCSV requires a file path');
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const lines = [CSV_HEADERS.join(',')];
  for (const lead of results || []) {
    lines.push(leadToCsvRow(lead));
  }

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
  return filePath;
}

/**
 * Export normalized leads to JSON.
 * @param {object[]} results
 * @param {string} filePath
 * @param {object} [options]
 * @param {object} [options.meta]
 */
function exportToJSON(results, filePath, options = {}) {
  if (!filePath) throw new Error('exportToJSON requires a file path');
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const payload = {
    exported_at: new Date().toISOString(),
    count: (results || []).length,
    results: results || [],
  };

  if (options.meta) {
    payload.meta = options.meta;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

module.exports = {
  CSV_HEADERS,
  exportToCSV,
  exportToJSON,
};
