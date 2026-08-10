'use strict';

const { EventEmitter } = require('events');
const path = require('path');

const { ApolloClient } = require('./apolloClient');
const { parseAndMapApolloUrl } = require('./filterMapper');
const { searchPeople, extractSearchPerson } = require('./peopleSearch');
const { enrichPerson } = require('./peopleEnrichment');
const { bulkEnrichPeopleBatched } = require('./bulkPeopleEnrichment');
const { EnrichmentCache } = require('./cache');
const { RateLimiter } = require('./rateLimiter');
const { WaterfallWebhookHandler } = require('./webhookServer');
const { exportToCSV, exportToJSON } = require('./exporters');
const { normalizeLead } = require('./normalize');

/**
 * Extraction job with pause / resume / stop and progress events.
 */
class ExtractionJob extends EventEmitter {
  /**
   * @param {ExtractionEngine} engine
   * @param {string} url
   * @param {object} options
   */
  constructor(engine, url, options = {}) {
    super();
    this.engine = engine;
    this.url = url;
    this.options = options;
    this.status = 'pending'; // pending|running|paused|stopped|completed|failed
    this._pauseRequested = false;
    this._stopRequested = false;
    this._resumeWaiters = [];
    this.results = [];
    this.errors = [];
    this.stats = this._emptyStats();
    this.mapped = null;
    this._promise = null;
  }

  _emptyStats() {
    return {
      search_requests: 0,
      people_found: 0,
      people_deduped: 0,
      enrichment_requests: 0,
      enrichment_skipped_cache: 0,
      business_emails_found: 0,
      business_emails_not_found: 0,
      personal_emails_found: 0,
      waterfall_requests: 0,
      credits_used: 'not provided by response',
      pages_fetched: 0,
    };
  }

  on(event, listener) {
    super.on(event, listener);
    return this;
  }

  pause() {
    this._pauseRequested = true;
    if (this.status === 'running') this.status = 'paused';
    this.engine.rateLimiter.pause();
    this.emit('paused', { results: this.results, stats: this.stats });
    return this;
  }

  resume() {
    this._pauseRequested = false;
    if (this.status === 'paused') this.status = 'running';
    this.engine.rateLimiter.resume();
    for (const resolve of this._resumeWaiters) resolve();
    this._resumeWaiters = [];
    this.emit('resumed', { results: this.results, stats: this.stats });
    return this;
  }

  stop() {
    this._stopRequested = true;
    this._pauseRequested = false;
    this.status = 'stopped';
    this.engine.rateLimiter.resume(); // unblock waiters so loop can exit
    for (const resolve of this._resumeWaiters) resolve();
    this._resumeWaiters = [];
    this.emit('stopped', { results: this.results, stats: this.stats });
    return this;
  }

  async _waitIfPaused() {
    while (this._pauseRequested && !this._stopRequested) {
      this.status = 'paused';
      await new Promise((resolve) => this._resumeWaiters.push(resolve));
    }
  }

  shouldContinue() {
    return !this._stopRequested;
  }

  then(onFulfilled, onRejected) {
    return this.start().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.start().catch(onRejected);
  }

  finally(onFinally) {
    return this.start().finally(onFinally);
  }

  start() {
    if (this._promise) return this._promise;
    this._promise = this._run();
    return this._promise;
  }

  async _run() {
    this.status = 'running';
    try {
      const outcome = await this.engine._executeJob(this);
      if (this._stopRequested) {
        this.status = 'stopped';
      } else {
        this.status = 'completed';
        this.emit('complete', outcome);
      }
      return outcome;
    } catch (err) {
      this.status = 'failed';
      this.emit('error', err);
      throw err;
    }
  }
}

class ExtractionEngine {
  /**
   * @param {object} options
   * @param {string} [options.apiKey]
   * @param {number} [options.maxPages=10]
   * @param {number} [options.perPage=100]
   * @param {number} [options.concurrency=2]
   * @param {boolean} [options.enrich=true]
   * @param {boolean} [options.waterfallEmail=false]
   * @param {boolean} [options.revealPersonalEmails=false]
   * @param {boolean} [options.cache=true]
   * @param {string} [options.cachePath]
   * @param {boolean} [options.forceReEnrich=false]
   * @param {boolean} [options.enrichMissingEmail=false]
   * @param {boolean} [options.useBulk=true]
   * @param {boolean} [options.includeRaw=false]
   * @param {string} [options.webhookUrl]
   * @param {boolean} [options.startLocalWebhook=false]
   * @param {number} [options.webhookPort]
   * @param {number} [options.waterfallTimeoutMs]
   * @param {boolean} [options.debug]
   */
  constructor(options = {}) {
    this.options = {
      maxPages: 10,
      perPage: 100,
      concurrency: 2,
      enrich: true,
      waterfallEmail: false,
      revealPersonalEmails: false,
      cache: true,
      forceReEnrich: false,
      enrichMissingEmail: false,
      useBulk: true,
      includeRaw: false,
      waterfallTimeoutMs: 180000,
      ...options,
    };

    this.client = new ApolloClient({
      apiKey: this.options.apiKey,
      debug: this.options.debug,
    });

    this.rateLimiter = new RateLimiter({ concurrency: this.options.concurrency });

    this.cache = new EnrichmentCache({
      enabled: this.options.cache !== false,
      filePath:
        this.options.cachePath ||
        path.join(process.cwd(), '.cache', 'apollo-enrichment.json'),
    });

    this.webhookHandler = null;
    if (this.options.waterfallEmail && this.options.startLocalWebhook) {
      this.webhookHandler = new WaterfallWebhookHandler({
        port: this.options.webhookPort || 8787,
      });
    }
  }

  /**
   * Create (and optionally auto-start) an extraction job from an Apollo URL.
   * @param {string} url
   * @param {object} [options]
   * @returns {ExtractionJob}
   */
  extractFromUrl(url, options = {}) {
    const job = new ExtractionJob(this, url, options);
    // Auto-start so `await extractor.extractFromUrl(url)` works
    queueMicrotask(() => {
      job.start().catch(() => {
        // Errors are emitted on the job; swallow unhandled rejection from microtask
      });
    });
    return job;
  }

  /**
   * Parse URL filters without calling the API.
   * @param {string} url
   */
  parseUrl(url) {
    return parseAndMapApolloUrl(url);
  }

  async _ensureWebhook() {
    if (!this.options.waterfallEmail) return null;

    let webhookUrl = this.options.webhookUrl || process.env.APOLLO_WEBHOOK_URL || null;

    if (!webhookUrl && this.webhookHandler) {
      const addr = await this.webhookHandler.start();
      webhookUrl = addr.url;
    }

    if (!webhookUrl) {
      throw new Error(
        'waterfallEmail=true requires webhookUrl or APOLLO_WEBHOOK_URL (Apollo waterfall email is asynchronous and needs a valid HTTPS webhook).'
      );
    }

    return webhookUrl;
  }

  async _executeJob(job) {
    const opts = { ...this.options, ...job.options };
    const mapped = parseAndMapApolloUrl(job.url);
    job.mapped = mapped;

    job.emit('filters', mapped);

    const webhookUrl = opts.waterfallEmail ? await this._ensureWebhook() : null;
    if (this.webhookHandler && opts.waterfallEmail) {
      this.webhookHandler.on('email', (record) => {
        this._applyWaterfallEmail(job, record);
      });
    }

    const seenIds = new Set();
    const peopleToEnrich = [];
    let page = mapped.filters.page || 1;
    const maxPages = opts.maxPages ?? 10;
    const perPage = Math.min(100, opts.perPage ?? 100);

    // Remove pagination from reusable filters object
    const filters = { ...mapped.filters };
    delete filters.page;
    delete filters.per_page;

    let pagesFetched = 0;
    let totalEntries = null;

    while (pagesFetched < maxPages) {
      await job._waitIfPaused();
      if (!job.shouldContinue()) break;

      const searchResult = await this.rateLimiter.schedule(() =>
        searchPeople(this.client, filters, { page, perPage })
      );

      job.stats.search_requests += 1;
      pagesFetched += 1;
      job.stats.pages_fetched = pagesFetched;
      totalEntries = searchResult.total_entries;

      job.emit('search', {
        page,
        per_page: perPage,
        people_count: searchResult.people.length,
        total_entries: totalEntries,
      });

      if (!searchResult.people.length) break;

      for (const rawPerson of searchResult.people) {
        await job._waitIfPaused();
        if (!job.shouldContinue()) break;

        const extracted = extractSearchPerson(rawPerson);
        if (!extracted?.apollo_person_id) continue;

        if (seenIds.has(extracted.apollo_person_id)) {
          job.stats.people_deduped += 1;
          continue;
        }
        seenIds.add(extracted.apollo_person_id);
        job.stats.people_found += 1;

        job.emit('person', extracted);

        if (!opts.enrich) {
          const lead = normalizeLead({
            searchPerson: extracted,
            enrichmentStatus: 'searched',
            emailSource: 'none',
            includeRaw: opts.includeRaw,
          });
          job.results.push(lead);
          continue;
        }

        if (
          this.cache.shouldSkipEnrichment(extracted.apollo_person_id, {
            forceReEnrich: opts.forceReEnrich,
            enrichMissingEmail: opts.enrichMissingEmail,
          })
        ) {
          job.stats.enrichment_skipped_cache += 1;
          const cachedLead = this.cache.applyCached(
            normalizeLead({
              searchPerson: extracted,
              enrichmentStatus: 'cached',
              includeRaw: opts.includeRaw,
            })
          );
          this._recordLead(job, cachedLead);
          continue;
        }

        peopleToEnrich.push(extracted);
      }

      if (!job.shouldContinue()) break;
      if (searchResult.people.length < perPage) break;

      const fetchedSoFar = (page - 1) * perPage + searchResult.people.length;
      if (fetchedSoFar >= Math.min(totalEntries ?? Infinity, 50000)) break;

      page += 1;
    }

    // Enrichment stage
    if (opts.enrich && peopleToEnrich.length && job.shouldContinue()) {
      job.emit('enriching', { count: peopleToEnrich.length });

      if (opts.useBulk) {
        await this._enrichBulk(job, peopleToEnrich, opts, webhookUrl);
      } else {
        await this._enrichSingle(job, peopleToEnrich, opts, webhookUrl);
      }
    }

    // Optionally wait for waterfall webhook results for pending leads
    if (
      opts.waterfallEmail &&
      this.webhookHandler &&
      job.results.some((r) => r.enrichment_status === 'waterfall_pending')
    ) {
      await this._waitForPendingWaterfalls(job, opts.waterfallTimeoutMs);
    }

    this._finalizeCredits(job);

    return {
      results: job.results,
      stats: job.stats,
      filters: mapped.filters,
      unsupported: mapped.unsupported,
      unsupportedDetails: mapped.unsupportedDetails,
      summary: mapped.summary,
      stopped: !job.shouldContinue() && job.status === 'stopped',
    };
  }

  async _enrichBulk(job, people, opts, webhookUrl) {
    // Stage 1: native enrichment (no waterfall) — business/work email first
    const missingBusiness = [];

    await bulkEnrichPeopleBatched(this.client, people, {
      revealPersonalEmails: opts.revealPersonalEmails,
      runWaterfallEmail: false,
      includeRaw: opts.includeRaw,
      rateLimiter: this.rateLimiter,
      shouldContinue: () => job.shouldContinue(),
      onBatch: async ({ results: batchResults }) => {
        job.stats.enrichment_requests += 1;

        for (const item of batchResults) {
          await job._waitIfPaused();
          if (!job.shouldContinue()) break;

          if (item.lead.found_business_email) {
            this.cache.set(item.lead);
            this._recordLead(job, item.lead);
            job.emit('enriched', item.lead);
            job.emit('email', item.lead);
          } else if (opts.waterfallEmail) {
            missingBusiness.push(item.searchPerson || item.lead);
            // Keep a placeholder; waterfall stage will update
            item.lead.enrichment_status = 'awaiting_waterfall';
            this._recordLead(job, item.lead);
          } else {
            this.cache.set(item.lead);
            this._recordLead(job, item.lead);
            job.emit('enriched', item.lead);
          }
        }
      },
    });

    // Stage 2: optional waterfall fallback for people without business email
    if (opts.waterfallEmail && missingBusiness.length && job.shouldContinue()) {
      await bulkEnrichPeopleBatched(this.client, missingBusiness, {
        revealPersonalEmails: false,
        runWaterfallEmail: true,
        webhookUrl,
        includeRaw: opts.includeRaw,
        rateLimiter: this.rateLimiter,
        shouldContinue: () => job.shouldContinue(),
        onBatch: async ({ results: batchResults, waterfall, request_id }) => {
          job.stats.enrichment_requests += 1;

          if (
            request_id &&
            (waterfall?.status === 'accepted' || waterfall?.status === 'partial_accepted')
          ) {
            job.stats.waterfall_requests += 1;
            if (this.webhookHandler) {
              this.webhookHandler.trackRequest(request_id, {
                person_ids: batchResults.map((r) => r.lead.apollo_person_id),
              });
            }
          }

          for (const item of batchResults) {
            await job._waitIfPaused();
            if (!job.shouldContinue()) break;

            // Prefer any email returned synchronously; otherwise mark pending
            if (!item.lead.found_business_email &&
                (waterfall?.status === 'accepted' || waterfall?.status === 'partial_accepted')) {
              item.lead.enrichment_status = 'waterfall_pending';
              item.lead.waterfall_request_id = request_id;
            }

            this.cache.set(item.lead);
            this._recordLead(job, item.lead);
            job.emit('enriched', item.lead);
            if (item.lead.found_business_email) {
              job.emit('email', item.lead);
            }
          }
        },
      });
    }
  }

  async _enrichSingle(job, people, opts, webhookUrl) {
    for (const person of people) {
      await job._waitIfPaused();
      if (!job.shouldContinue()) break;

      try {
        // Stage 1: native enrichment for business/work email
        const result = await this.rateLimiter.schedule(() =>
          enrichPerson(this.client, person, {
            revealPersonalEmails: opts.revealPersonalEmails,
            runWaterfallEmail: false,
            includeRaw: opts.includeRaw,
          })
        );

        job.stats.enrichment_requests += 1;

        if (typeof result.credits_used === 'number') {
          if (typeof job.stats.credits_used !== 'number') job.stats.credits_used = 0;
          job.stats.credits_used += result.credits_used;
        }

        // Stage 2: waterfall fallback only when business email is missing
        if (opts.waterfallEmail && !result.lead.found_business_email) {
          const waterfallResult = await this.rateLimiter.schedule(() =>
            enrichPerson(this.client, person, {
              revealPersonalEmails: false,
              runWaterfallEmail: true,
              webhookUrl,
              includeRaw: opts.includeRaw,
            })
          );

          job.stats.enrichment_requests += 1;
          job.stats.waterfall_requests += 1;

          if (waterfallResult.request_id && this.webhookHandler) {
            this.webhookHandler.trackRequest(waterfallResult.request_id, {
              person_ids: [person.apollo_person_id],
            });
          }

          if (waterfallResult.lead.found_business_email) {
            result.lead = waterfallResult.lead;
          } else if (waterfallResult.waterfall?.status === 'accepted') {
            result.lead.enrichment_status = 'waterfall_pending';
            result.lead.waterfall_request_id = waterfallResult.request_id;
          } else if (waterfallResult.waterfall?.message) {
            result.lead.enrichment_status = 'enriched';
            result.lead.waterfall_error = waterfallResult.waterfall.message;
          }
        }

        this.cache.set(result.lead);
        this._recordLead(job, result.lead);
        job.emit('enriched', result.lead);
        if (result.lead.found_business_email) {
          job.emit('email', result.lead);
        }
      } catch (err) {
        job.errors.push({
          apollo_person_id: person.apollo_person_id,
          error: err.message,
          status: err.status,
        });
        job.emit('error', err);

        const failedLead = normalizeLead({
          searchPerson: person,
          enrichmentStatus: 'error',
          emailSource: 'none',
          includeRaw: opts.includeRaw,
        });
        this._recordLead(job, failedLead);
      }
    }
  }

  _countsAsMissingBusiness(lead) {
    if (!lead || lead.found_business_email) return false;
    return !['searched', 'waterfall_pending', 'awaiting_waterfall'].includes(lead.enrichment_status);
  }

  _recordLead(job, lead) {
    // Replace existing result for same person if present (e.g. waterfall update)
    const idx = job.results.findIndex(
      (r) => r.apollo_person_id && r.apollo_person_id === lead.apollo_person_id
    );
    if (idx >= 0) {
      const previous = job.results[idx];
      if (previous.found_business_email) job.stats.business_emails_found -= 1;
      else if (this._countsAsMissingBusiness(previous)) job.stats.business_emails_not_found -= 1;
      if (previous.found_personal_email) job.stats.personal_emails_found -= 1;
      job.results[idx] = lead;
    } else {
      job.results.push(lead);
    }

    if (lead.found_business_email) job.stats.business_emails_found += 1;
    else if (this._countsAsMissingBusiness(lead)) {
      job.stats.business_emails_not_found += 1;
    }

    if (lead.found_personal_email) job.stats.personal_emails_found += 1;
  }

  _applyWaterfallEmail(job, record) {
    if (!record?.apollo_person_id || !record.business_email) return;

    const lead = job.results.find((r) => r.apollo_person_id === record.apollo_person_id);
    if (!lead) return;

    // Do not overwrite an existing native business email with waterfall
    if (lead.business_email && lead.email_source === 'apollo_native') {
      return;
    }

    const hadBusiness = lead.found_business_email;
    lead.business_email = record.business_email;
    lead.business_email_status = record.business_email_status;
    lead.email_source = 'apollo_waterfall';
    lead.found_business_email = true;
    lead.enrichment_status = 'enriched';
    lead.waterfall_request_id = record.request_id || lead.waterfall_request_id;

    if (!hadBusiness) {
      job.stats.business_emails_found += 1;
      if (job.stats.business_emails_not_found > 0) {
        job.stats.business_emails_not_found -= 1;
      }
    }

    this.cache.set(lead);
    job.emit('email', lead);
    job.emit('waterfall', { lead, record });
  }

  async _waitForPendingWaterfalls(job, timeoutMs) {
    const pending = job.results.filter((r) => r.enrichment_status === 'waterfall_pending');
    if (!pending.length || !this.webhookHandler) return;

    const requestIds = [
      ...new Set(pending.map((p) => p.waterfall_request_id).filter(Boolean)),
    ];

    await Promise.allSettled(
      requestIds.map((id) => this.webhookHandler.waitForRequest(id, timeoutMs))
    );
  }

  _finalizeCredits(job) {
    if (typeof job.stats.credits_used !== 'number') {
      job.stats.credits_used = 'not provided by response';
    }
  }
}

/**
 * Public package facade.
 */
class ApolloExtractor {
  /**
   * @param {object} [options]
   */
  constructor(options = {}) {
    this.engine = new ExtractionEngine(options);
    this.options = this.engine.options;
  }

  /**
   * @param {string} url
   * @param {object} [options]
   * @returns {ExtractionJob}
   */
  extractFromUrl(url, options = {}) {
    return this.engine.extractFromUrl(url, options);
  }

  parseUrl(url) {
    return this.engine.parseUrl(url);
  }

  exportToCSV(results, filePath) {
    return exportToCSV(results, filePath);
  }

  exportToJSON(results, filePath, options) {
    return exportToJSON(results, filePath, options);
  }

  get cache() {
    return this.engine.cache;
  }

  get client() {
    return this.engine.client;
  }

  get webhookHandler() {
    return this.engine.webhookHandler;
  }
}

module.exports = {
  ApolloExtractor,
  ExtractionEngine,
  ExtractionJob,
};
