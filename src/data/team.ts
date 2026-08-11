export type TeamMember = {
  name: string;
  role?: string;
  photo: string;
  linkedin: string;
  bullets: string[];
  isFounder?: boolean;
};

export const teamMembers: TeamMember[] = [
  {
    name: 'Mike Simms',
    role: 'Founder & CEO',
    isFounder: true,
    photo: '/assets/images/team-mike.jpg',
    linkedin: 'https://www.linkedin.com/in/michaelsimms01',
    bullets: [
      'Chief Procurement Officer, Microsoft',
      'Founder, The Simms Group',
      'Co-Founder & COO, Sivuno',
      'Executive Advisor, Praas',
      'Global Business Management, Crane/ELDEC',
      'Founder & Co-Chair, Indirect Procurement Council',
      'Board of Directors, Kirkland Performance Center',
      'Fractional CxO, Strategic Advisor, Board Member',
      'Keynote Speaker',
    ],
  },
  {
    name: 'David Bleier',
    photo: '/assets/images/team-david.jpg',
    linkedin: 'https://www.linkedin.com/in/david-bleier-9702aa32',
    bullets: [
      'General Counsel/Head of Compliance - PRAAS',
      'General Counsel/Head of APAC, Cybersecurity Consultancy contracting to UK Ministry of Defense & Security - Port Nicholson Chambers',
      'Solicitor - DLA Piper',
    ],
  },
  {
    name: 'Misty R Pacheco-Brown',
    photo: '/assets/images/team-misty.jpg',
    linkedin: 'http://www.linkedin.com/in/mistyrpacheco',
    bullets: [
      'Accountant/Business Manager - The Simms Group',
      'Accountant/Administrator - Project Rebirth Ministries Mexico',
      'Accountant/Administrator - Plain Gospel Mission',
      'Bookkeeping Expert - Intuit',
      'Accountant/Bookkeeper - Green Tax & Business Advisors, LLC',
      'Accountant/Bookkeeper Lead - Clear Profit 365, Inc',
    ],
  },
  {
    name: 'Stuart Cohen',
    photo: '/assets/images/team-stuart.jpg',
    linkedin: 'https://www.linkedin.com/in/stuart-cohen-141b263',
    bullets: [
      'Director of Worldwide Marketing - IBM',
      'Linux Foundation - CEO',
      'General Manager CISO Coalition - Gartner/CEB',
      'Collaborative Software Initiative - CEO',
      'President NodeWare Vulnerability Management Software - IGI',
      'National Sales Executive North America - PRAAS',
    ],
  },
  {
    name: 'Phil Goatley',
    photo: '/assets/images/team-phil.jpg',
    linkedin: 'https://www.linkedin.com/in/phil-goatley-14b702',
    bullets: [
      'Founder, Transworld Business Advisors – Tucson',
      'Founder - Creating Legacy Enterprises Inc',
      'Global Customer Service & Support Leader - Microsoft',
      'Certified John Maxwell Coach',
      'Circle of Excellence, Cloud Leadership - Microsoft',
      'Small Business Owner/Operator - US & New Zealand',
      'Masters Certification – IT Infrastructure Library (ITIL)',
      'Masters degree in Information Systems Management – Massey University',
    ],
  },
  {
    name: 'Jeff Lyon',
    photo: '/assets/images/team-jeff.jpg',
    linkedin: 'https://www.linkedin.com/in/jllyon',
    bullets: [
      'Author of The Exceptional Middle Manager',
      'Management Mentor',
      'Global Operations, Customer Support, Customer & Partner Experience Leadership Roles - Microsoft',
      'Customer Service & Support Leader - Attachmate',
      'Assistant Vice-President - Bank of America',
      'Vice-President, Retail Operations - Pacific Bank',
      'Board of Directors, Kirkland Performance Center',
    ],
  },
  {
    name: 'Greg Sewell',
    photo: '/assets/images/team-greg.jpg',
    linkedin: 'http://www.linkedin.com/in/greg-sewell-66a180ba',
    bullets: [
      'Global Operations, Customer Support & Procurement Leadership - Microsoft',
      'International Business Management - Crane Aerospace',
      'Decades of Experience & Proven Results in Contracting, Negotiation, RFX',
    ],
  },
  {
    name: 'Michael Sladen-York',
    photo: '/assets/images/team-michael-sy.jpg',
    linkedin: 'https://www.linkedin.com/in/mike-sladen-york-46a4168',
    bullets: [
      'Head of Global Indirect Procurement - Stryker',
      'International Strategic Sourcing, Global Finance - Stryker',
      'Finance & Strategic Sourcing - Whirlpool',
      'Chief Operating Officer - PRAAS',
    ],
  },
  {
    name: 'Bryce Smith',
    photo: '/assets/images/team-bryce.jpg',
    linkedin: 'https://www.linkedin.com/in/bryce-smith-8b6624',
    bullets: [
      'Chief Procurement Officer and Vice President - International Gaming Technology',
      'Sr Director Strategic Sourcing, Application Development & Test',
      'Category Director, Xbox PCBA',
      'Commodity Manager - Microsoft',
      'Thermal Solution Commodity Manager, Memory Senior Buyer - Intel',
      'Senior Buyer Mechanical & Electronics - Quinton Instruments',
    ],
  },
  {
    name: 'Larry Wood',
    photo: '/assets/images/team-larry.jpg',
    linkedin: 'https://www.linkedin.com/in/larry-wood-he-him-6b39823',
    bullets: [
      'Head of Strategic Sourcing - Intuit',
      'Procurement and Sourcing - County of San Diego',
      'Purchasing Management - Proctor & Gamble',
      'Officer, Civil Engineer Corps - United States Navy',
    ],
  },
  {
    name: 'Mark Wootton',
    photo: '/assets/images/team-mark.jpg',
    linkedin: 'https://www.linkedin.com/in/mark-wootton-001',
    bullets: [
      'Leader for Worldwide Contact Center Outsourcing - Microsoft Global Outsourcing',
      'Leader for Worldwide Microsoft Supplier Program, Global Strategic Supplier Management Program & Microsoft Services Engagement - Microsoft Global Procurement',
      'Various Leadership Roles in Customer Success Account Management & Services Support - Microsoft UK',
    ],
  },
  {
    name: 'Lori Simms',
    photo: '/assets/images/team-lori.jpg',
    linkedin: 'https://www.linkedin.com/in/lori-simms-05a62721',
    bullets: [
      'Owner-Operator, Lori Simms Coaching',
      'Life & Career Coaching Professional',
      'Certified Life Coach',
      'Fitness Coach & Professional',
      'BS - Exercise Science',
      "Master's Degree in Education",
      'Teacher/Instructor - Biology, Anatomy, Physiology, Medical Communication',
    ],
  },
  {
    name: 'Patrick Decker',
    photo: '/assets/images/team-patrick.jpg',
    linkedin: 'https://www.linkedin.com/in/patrick-decker-52b7203',
    bullets: [
      'Owner & Founder, West Bridge Consulting',
      'Microsoft Procurement Executive',
      'Domain Expertise includes: Technical Services, Software & Cloud Services, Consulting Services, Strategic Enterprise Partnerships, +.',
      'Public Sector Experience, including City Council Member, Planning Commissioner, Tax Advisory Chair, & County Charter Commissioner.',
      'University of Washington - Chinese Language & Literature; Chinese Political Science',
    ],
  },
  {
    name: 'Ed Montague',
    photo: '/assets/images/team-ed.jpg',
    linkedin: 'https://www.linkedin.com/in/edwardmontague',
    bullets: [
      'Founding Chief Operating Officer — New Zealand Green Investment Finance (NZGIF)',
      'Principal Advisor — New Zealand Treasury',
      'Deputy Lead — Social Investment Agency (SIA)',
      'Director — PwC New Zealand',
      'Equity Analyst and Operations Manager— IBIS Global Media Hedge Fund (London)',
      'Strategy & Corporate Development — O₂ plc (UK)',
    ],
  },
];
