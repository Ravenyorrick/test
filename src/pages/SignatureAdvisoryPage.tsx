import { Seo } from '../components/Seo';
import {
  EMAIL_MIKE,
  LINKEDIN_MIKE,
  mailtoMike,
} from '../data/site';

export function SignatureAdvisoryPage() {
  return (
    <>
      <Seo title="Signature Advisory | Simms Group Consulting" path="/signature-advisory" />
      <div className="container service-page-hero">
        <h1 className="page-title">Signature Advisory — Michael Simms</h1>
        <p className="page-subtitle">
          Personally Led Executive Procurement Advisory For CEOs Entering the Fortune 100 Environment
        </p>
      </div>

      <div className="container">
        <img
          className="signature-hero-img"
          src="/assets/images/signature-hero.jpg"
          alt="Signature Advisory overview"
          loading="lazy"
        />

        <div className="prose" style={{ maxWidth: '52rem', marginBottom: '2rem' }}>
          <p>
            Each engagement carries Michael&apos;s personal signature — reflecting direct
            involvement, selective affiliation, and executive accountability.
          </p>
          <p>
            Michael advises a strictly limited number of CEOs leading growth-stage AI companies
            entering Fortune 100 ecosystems. He built and led Microsoft Procurement, founded The
            Simms Group, and co-founded AI procurement ventures that give him unmatched practitioner
            perspective.
          </p>
          <p>
            Engagements are structured as private executive retainers that embed enterprise
            procurement strategy and leadership directly into your company&apos;s trajectory.
          </p>
          <p>
            TSG Signature Advisory operates through three levels of private executive partnership,
            reflecting increasing depth of integration and strategic value.
          </p>
        </div>

        <h2 className="section-heading">Signature Engagement Tiers</h2>
        <div className="tier-grid">
          <article className="tier-card">
            <div className="tier-label">Tier I</div>
            <h3>Strategic Affiliation</h3>
            <p>
              <strong>Enterprise Credibility Signaling</strong>
            </p>
            <p>Engagement Scope:</p>
            <ul className="bullet-list">
              <li>Formal advisory affiliation grounded in personal vetting and conviction</li>
              <li>
                Authorized, governance-calibrated use of TSG branding and Michael&apos;s endorsement
              </li>
              <li>Peer-level credibility in procurement conversations</li>
              <li>Enterprise-facing positioning structured for CPO scrutiny</li>
              <li>
                Co-creation of practitioner-grounded thought leadership and executive visibility
                initiatives
              </li>
              <li>Quarterly review of enterprise exposure and defensibility posture</li>
            </ul>
          </article>

          <article className="tier-card">
            <div className="tier-label">Tier II</div>
            <h3>Enterprise Procurement Partnership</h3>
            <p>
              <strong>Procurement Strategy &amp; Enterprise Readiness</strong>
            </p>
            <p>Includes and builds upon Tier I.</p>
            <p>Engagement Focus:</p>
            <ul className="bullet-list">
              <li>
                Direct engagement with CEO and leadership team to embed procurement domain expertise
                into company strategy
              </li>
              <li>Practitioner-driven product and roadmap counsel</li>
              <li>Competitive positioning grounded in Fortune 100 operational experience</li>
              <li>Pricing architecture aligned with procurement buyer expectations</li>
              <li>Integration into product, marketing, and strategic planning forums</li>
              <li>CFO/CPO-level risk modeling and objection engineering</li>
              <li>Ecosystem and alliance strategy</li>
              <li>Participation in procurement events alongside leadership</li>
              <li>
                Co-creation of procurement-informed thought leadership and executive visibility
                initiatives
              </li>
              <li>Structured shaping of enterprise pipeline posture</li>
            </ul>
          </article>

          <article className="tier-card">
            <div className="tier-label">Tier III</div>
            <h3>Embedded Executive Partnership</h3>
            <p>
              <strong>Embedded Enterprise Procurement Strategy &amp; Leadership</strong>
            </p>
            <p>Includes and builds upon Tiers I and II.</p>
            <ul className="bullet-list">
              <li>Executive-level participation in critical customer engagements</li>
              <li>CPO-level engagement in procurement-facing discussions</li>
              <li>Embedded procurement domain counsel to your CPO and leadership team</li>
              <li>Strategic negotiation architecture and executive sequencing</li>
              <li>Executive buy-in acceleration across complex buying committees</li>
              <li>
                Introduction to complementary AI procurement solutions and ecosystem players
              </li>
            </ul>
          </article>
        </div>

        <img
          className="infographic"
          src="/assets/images/signature-tiers.jpg"
          alt="Signature Advisory engagement tiers"
          loading="lazy"
          style={{ maxWidth: 720, marginInline: 'auto' }}
        />

        <div className="prose" style={{ maxWidth: '52rem' }}>
          <h2 className="section-heading">Ready to Engage?</h2>
          <h3>Mutual Evaluation (Complimentary)</h3>
          <p>
            Engagement begins with a structured mutual evaluation to confirm strategic fit, enterprise
            ambition, and institutional readiness.
          </p>
        </div>

        <div className="steps">
          <article className="step-card">
            <h3>STEP I — Executive Consultation (30 Minutes)</h3>
            <ul className="bullet-list">
              <li>Enterprise targets and ambition</li>
              <li>Current go-to-market posture</li>
              <li>Procurement exposure</li>
              <li>Strategic alignment assessment</li>
            </ul>
          </article>
          <article className="step-card">
            <h3>STEP II — Strategic Deep Dive (60 Minutes)</h3>
            <ul className="bullet-list">
              <li>Product defensibility</li>
              <li>Stakeholder architecture</li>
              <li>Procurement readiness</li>
              <li>Active enterprise pursuits</li>
            </ul>
          </article>
        </div>

        <div className="prose" style={{ maxWidth: '52rem', marginBottom: '3rem' }}>
          <p>Following mutual alignment, retainer partnership is formalized.</p>
          <p>
            Monthly invoicing • Optional equity participation • Custom structuring available
          </p>
          <p>Michael is also available for board of directors appointments on a select basis.</p>

          <div className="two-col" style={{ marginTop: '2rem', alignItems: 'center' }}>
            <img
              src="/assets/images/mike-portrait.jpg"
              alt="Michael Simms"
              style={{ width: '100%', maxWidth: 280, borderRadius: 4 }}
              loading="lazy"
            />
            <div>
              <h2 className="section-heading" style={{ marginTop: 0 }}>
                Michael Simms
              </h2>
              <p>
                Founder &amp; CEO, The Simms Group
                <br />
                Former Chief Procurement Officer, Microsoft
              </p>
              <p>
                <a href={mailtoMike()}>{EMAIL_MIKE}</a>
                <br />
                <a href="https://www.simmsgroupconsulting.com">www.simmsgroupconsulting.com</a>
                <br />
                <a href={LINKEDIN_MIKE} target="_blank" rel="noreferrer noopener">
                  linkedin.com/in/michaelsimms01
                </a>
              </p>
              <div className="cta-row">
                <a className="btn" href={mailtoMike('Signature Advisory')}>
                  Contact Michael
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
