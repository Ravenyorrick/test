'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Simple Apollo person enrichment cache.
 * Primary key: apollo_person_id
 */
class EnrichmentCache {
  /**
   * @param {object} [options]
   * @param {boolean} [options.enabled=true]
   * @param {string} [options.filePath]
   */
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.filePath = options.filePath || null;
    /** @type {Map<string, object>} */
    this.store = new Map();

    if (this.enabled && this.filePath) {
      this.load();
    }
  }

  load() {
    if (!this.filePath || !fs.existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (raw && typeof raw === 'object') {
        for (const [key, value] of Object.entries(raw)) {
          this.store.set(key, value);
        }
      }
    } catch {
      // Corrupt cache file — start fresh rather than crash
      this.store.clear();
    }
  }

  persist() {
    if (!this.enabled || !this.filePath) return;
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(this.store.entries());
    fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2));
  }

  get(apolloPersonId) {
    if (!this.enabled || !apolloPersonId) return null;
    return this.store.get(String(apolloPersonId)) || null;
  }

  has(apolloPersonId) {
    if (!this.enabled || !apolloPersonId) return false;
    return this.store.has(String(apolloPersonId));
  }

  /**
   * Decide whether enrichment should be skipped for a cached person.
   * @param {string} apolloPersonId
   * @param {object} [options]
   * @param {boolean} [options.forceReEnrich=false]
   * @param {boolean} [options.enrichMissingEmail=false]
   */
  shouldSkipEnrichment(apolloPersonId, options = {}) {
    if (!this.enabled) return false;
    if (options.forceReEnrich) return false;

    const cached = this.get(apolloPersonId);
    if (!cached) return false;

    if (cached.business_email) return true;

    // Previously enriched but missing business email
    if (cached.enrichment_status && cached.enrichment_status !== 'searched') {
      return !options.enrichMissingEmail;
    }

    return false;
  }

  /**
   * @param {object} lead
   */
  set(lead) {
    if (!this.enabled || !lead?.apollo_person_id) return;

    const record = {
      apollo_person_id: lead.apollo_person_id,
      first_name: lead.first_name ?? null,
      last_name: lead.last_name ?? null,
      title: lead.title ?? null,
      company: lead.company ?? null,
      company_domain: lead.company_domain ?? null,
      linkedin_url: lead.linkedin_url ?? null,
      business_email: lead.business_email ?? null,
      business_email_status: lead.business_email_status ?? null,
      personal_email: lead.personal_email ?? null,
      personal_email_status: lead.personal_email_status ?? null,
      enrichment_status: lead.enrichment_status ?? null,
      email_source: lead.email_source ?? null,
      enriched_at: new Date().toISOString(),
    };

    this.store.set(String(lead.apollo_person_id), record);
    this.persist();
  }

  applyCached(lead) {
    const cached = this.get(lead.apollo_person_id);
    if (!cached) return lead;
    return {
      ...lead,
      ...cached,
      found_business_email: Boolean(cached.business_email),
      found_personal_email: Boolean(cached.personal_email),
      enrichment_status: cached.enrichment_status || 'cached',
    };
  }

  clear() {
    this.store.clear();
    if (this.filePath && fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }

  size() {
    return this.store.size;
  }
}

module.exports = {
  EnrichmentCache,
};
