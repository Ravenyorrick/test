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

  // Atomic-ish write: temp file then rename
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, filePath);
  return filePath;
}

/**
 * Crash-safe incremental exporter.
 * Writes each business email to disk as soon as it is found.
 */
class IncrementalExporter {
  /**
   * @param {string} filePath
   * @param {object} [options]
   * @param {object} [options.meta]
   * @param {boolean} [options.emailsOnly=true]
   */
  constructor(filePath, options = {}) {
    if (!filePath) throw new Error('IncrementalExporter requires a file path');
    this.filePath = path.resolve(filePath);
    this.meta = options.meta || {};
    this.emailsOnly = options.emailsOnly !== false;
    this.isJson = this.filePath.toLowerCase().endsWith('.json');
    /** @type {Map<string, object>} */
    this.saved = new Map();
    this.initialized = false;
  }

  start() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (this.isJson) {
      this._writeJson();
    } else if (!fs.existsSync(this.filePath) || fs.statSync(this.filePath).size === 0) {
      fs.writeFileSync(this.filePath, `${CSV_HEADERS.join(',')}\n`, 'utf8');
    } else {
      // Resume-friendly: keep existing file and load IDs already saved
      this._loadExistingCsvIds();
    }

    this.initialized = true;
    return this.filePath;
  }

  _loadExistingCsvIds() {
    try {
      const text = fs.readFileSync(this.filePath, 'utf8');
      const lines = text.split(/\r?\n/).filter(Boolean);
      // Skip header; we can't fully parse CSV reliably here, but we track by rewriting
      // from in-memory map on finalize. For append mode, store placeholder keys from col 0.
      for (let i = 1; i < lines.length; i += 1) {
        const first = lines[i].split(',')[0];
        if (first) this.saved.set(first.replace(/^"|"$/g, ''), { apollo_person_id: first });
      }
    } catch {
      // ignore corrupt partial files; continue appending
    }
  }

  /**
   * Save one lead immediately (sync flush).
   * @param {object} lead
   * @returns {{ saved: boolean, path: string, count: number }}
   */
  saveLead(lead) {
    if (!this.initialized) this.start();
    if (!lead) return { saved: false, path: this.filePath, count: this.count() };

    if (this.emailsOnly && !lead.business_email) {
      return { saved: false, path: this.filePath, count: this.count() };
    }

    const key = String(lead.apollo_person_id || lead.business_email || '');
    if (!key) return { saved: false, path: this.filePath, count: this.count() };
    if (this.saved.has(key) && this.saved.get(key)?.business_email) {
      // Already fully saved
      return { saved: false, path: this.filePath, count: this.count() };
    }

    this.saved.set(key, lead);

    if (this.isJson) {
      this._writeJson();
    } else {
      // Append row and fsync for crash safety
      const fd = fs.openSync(this.filePath, 'a');
      try {
        fs.writeSync(fd, `${leadToCsvRow(lead)}\n`, null, 'utf8');
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
    }

    return { saved: true, path: this.filePath, count: this.count() };
  }

  _writeJson() {
    const results = [...this.saved.values()].filter((l) => l && l.business_email);
    exportToJSON(results, this.filePath, {
      meta: {
        ...this.meta,
        incremental: true,
        last_saved_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Rewrite full snapshot from an array (used at completion).
   * @param {object[]} results
   */
  finalize(results, meta = {}) {
    if (!this.initialized) this.start();
    const list = Array.isArray(results) ? results : [...this.saved.values()];
    const filtered = this.emailsOnly
      ? list.filter((l) => l && l.business_email)
      : list;

    for (const lead of filtered) {
      const key = String(lead.apollo_person_id || lead.business_email || '');
      if (key) this.saved.set(key, lead);
    }

    if (this.isJson) {
      exportToJSON(filtered, this.filePath, {
        meta: {
          ...this.meta,
          ...meta,
          incremental: true,
          finalized_at: new Date().toISOString(),
        },
      });
    } else {
      exportToCSV(filtered, this.filePath);
    }

    return this.filePath;
  }

  count() {
    return [...this.saved.values()].filter((l) => l && l.business_email).length;
  }

  path() {
    return this.filePath;
  }
}

module.exports = {
  CSV_HEADERS,
  exportToCSV,
  exportToJSON,
  IncrementalExporter,
  leadToCsvRow,
};
