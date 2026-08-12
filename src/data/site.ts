export type NavItem = {
  label: string;
  path: string;
};

export const primaryNav: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Signature Advisory', path: '/signature-advisory' },
  { label: 'Overview', path: '/overview-of-services' },
  { label: 'Fractional Leaders', path: '/fractional-leaders' },
  { label: 'Process & Capability Assessments', path: '/process-capability-assessments' },
  { label: 'AI Tools & Implementation', path: '/ai-tools-implementation' },
  { label: 'TSG Coach', path: '/tsg-coach' },
];

export const moreNav: NavItem[] = [
  { label: 'Meet the Team', path: '/our-team' },
  { label: "Mike's Bio", path: '/mike-s-bio' },
  { label: 'Contact Us', path: '/contact-us' },
];

/** Preserved spelling from the live Wix site */
export const SITE_TAGLINE = 'Practicioners Leading Intelligent Transformation';

export const EMAIL_MIKE = 'mike@simmsgroupconsulting.com';
export const EMAIL_COACH = 'coach@simmsgroupconsulting.com';
export const LINKEDIN_COMPANY = 'https://www.linkedin.com/company/the-simms-group/';
export const LINKEDIN_MIKE = 'https://www.linkedin.com/in/michaelsimms01';
export const SIVUNO_URL = 'https://sivuno.com';

export const mailtoMike = (subject?: string) =>
  subject
    ? `mailto:${EMAIL_MIKE}?subject=${encodeURIComponent(subject)}`
    : `mailto:${EMAIL_MIKE}`;

export const mailtoCoach = (subject?: string) =>
  subject
    ? `mailto:${EMAIL_COACH}?subject=${encodeURIComponent(subject)}`
    : `mailto:${EMAIL_COACH}`;
