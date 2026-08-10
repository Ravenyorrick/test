'use strict';

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'proton.me',
  'live.com',
  'msn.com',
  'ymail.com',
  'me.com',
  'gmx.com',
  'gmx.net',
]);

function emailDomain(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return null;
  return email.split('@').pop().toLowerCase().trim();
}

function looksPersonalEmail(email) {
  const domain = emailDomain(email);
  return domain ? PERSONAL_EMAIL_DOMAINS.has(domain) : false;
}

function firstNonEmpty(...values) {
  for (const v of values) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    return v;
  }
  return null;
}

function pickPersonalEmail(person) {
  // Apollo may return personal emails in several shapes depending on plan/version.
  // Only accept values Apollo actually returns — never invent.
  if (Array.isArray(person.personal_emails) && person.personal_emails.length) {
    const first = person.personal_emails[0];
    if (typeof first === 'string') {
      return { email: first, status: null };
    }
    if (first && typeof first === 'object') {
      return {
        email: first.email || first.value || null,
        status: first.email_status || first.status || null,
      };
    }
  }

  if (typeof person.personal_email === 'string' && person.personal_email) {
    return { email: person.personal_email, status: person.personal_email_status || null };
  }

  return { email: null, status: null };
}

/**
 * Extract business/work email from an Apollo enrichment person object.
 * Official docs: `person.email` + `person.email_status` are the primary fields.
 *
 * Never copies personal email into business_email.
 */
function extractBusinessEmail(person) {
  const email = firstNonEmpty(person.email, person.work_email, person.business_email);
  const status = firstNonEmpty(person.email_status, person.email_true_status);

  if (!email) {
    return { email: null, status: null };
  }

  // Guard: if Apollo somehow returned a personal domain in `email` while also
  // providing personal_emails, keep business null rather than mixing fields.
  // Normally Apollo's `email` is the business/work email.
  return {
    email,
    status: status || null,
  };
}

/**
 * Build a normalized lead from search + enrichment data.
 * @param {object} options
 * @param {object} [options.searchPerson]
 * @param {object} [options.enrichedPerson]
 * @param {string} [options.emailSource]
 * @param {string} [options.enrichmentStatus]
 * @param {boolean} [options.includeRaw]
 * @param {object} [options.raw]
 * @param {string} [options.waterfallRequestId]
 */
function normalizeLead(options = {}) {
  const search = options.searchPerson || {};
  const person = options.enrichedPerson || {};
  const org = person.organization || search.organization || {};

  const business = extractBusinessEmail(person);
  const personal = pickPersonalEmail(person);

  // Never set business_email = personal_email
  let businessEmail = business.email;
  let personalEmail = personal.email;

  if (
    businessEmail &&
    personalEmail &&
    businessEmail.toLowerCase() === personalEmail.toLowerCase()
  ) {
    // Same address reported twice — keep as business, clear personal duplicate
    personalEmail = null;
  }

  // If only personal-looking email exists under personal_emails, leave business null.
  // Do not promote personal -> business.

  const firstName = firstNonEmpty(person.first_name, search.first_name);
  const lastName = firstNonEmpty(person.last_name, search.last_name);
  const name = firstNonEmpty(
    person.name,
    search.name,
    [firstName, lastName].filter(Boolean).join(' ') || null
  );

  const location = firstNonEmpty(
    [person.city, person.state, person.country].filter(Boolean).join(', ') || null,
    search.location,
    person.present_raw_address
  );

  const foundBusiness = Boolean(businessEmail);
  const foundPersonal = Boolean(personalEmail);

  const emailSource = foundBusiness
    ? options.emailSource || 'apollo_native'
    : 'none';

  const lead = {
    apollo_person_id: firstNonEmpty(person.id, search.apollo_person_id, search.id),
    first_name: firstName,
    last_name: lastName,
    name,
    title: firstNonEmpty(person.title, search.title),
    company: firstNonEmpty(org.name, person.organization_name, search.company),
    company_domain: firstNonEmpty(
      org.primary_domain,
      org.domain,
      person.domain,
      search.company_domain
    ),
    location,
    business_email: businessEmail,
    business_email_status: business.status,
    personal_email: personalEmail,
    personal_email_status: personal.status,
    linkedin_url: firstNonEmpty(person.linkedin_url, search.linkedin_url),
    enrichment_status: options.enrichmentStatus || (person.id ? 'enriched' : 'searched'),
    email_source: emailSource,
    found_business_email: foundBusiness,
    found_personal_email: foundPersonal,
    waterfall_request_id: options.waterfallRequestId || null,
    organization_id: firstNonEmpty(org.id, person.organization_id, search.organization_id),
    has_email_from_search: search.has_email ?? null,
  };

  if (options.includeRaw) {
    lead.raw = options.raw || {
      search: search.raw_search || search,
      enrichment: person,
    };
  }

  return lead;
}

module.exports = {
  normalizeLead,
  extractBusinessEmail,
  pickPersonalEmail,
  looksPersonalEmail,
  PERSONAL_EMAIL_DOMAINS,
};
