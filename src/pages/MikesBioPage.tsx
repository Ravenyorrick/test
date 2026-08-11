import { Seo } from '../components/Seo';
import {
  EMAIL_MIKE,
  LINKEDIN_MIKE,
  mailtoMike,
  SIVUNO_URL,
} from '../data/site';

export function MikesBioPage() {
  return (
    <>
      <Seo title="Mike's Bio | Simms Group Consulting" path="/mike-s-bio" />
      <article className="container bio-page">
        <header className="bio-header">
          <h1>MICHAEL SIMMS</h1>
          <p className="bio-meta">
            Chief Procurement Officer • Executive Consultant • AI &amp; Digital Transformation Leader
          </p>
          <div className="bio-links">
            <a href={mailtoMike()}>{EMAIL_MIKE}</a>
            <a href={LINKEDIN_MIKE} target="_blank" rel="noreferrer noopener">
              linkedin.com/in/michaelsimms01
            </a>
            <a href="https://www.simmsgroupconsulting.com">SimmsGroupConsulting.com</a>
            <a href={SIVUNO_URL} target="_blank" rel="noreferrer noopener">
              Sivuno.com
            </a>
          </div>
        </header>

        <section className="bio-section">
          <h2>EXECUTIVE SUMMARY</h2>
          <p>
            Results-driven procurement executive and entrepreneur with 30+ years of leadership in
            Procurement, Operations, and Business Transformation. As Microsoft&apos;s Chief
            Procurement Officer, managed $20B+ in annual addressable spend across 130 countries, led
            250+ professionals, and delivered $8B+ in annual cost savings. Now leading two
            ventures—The Simms Group, a procurement advisory and fractional leadership consultancy,
            and Sivuno, an AI-powered spend intelligence platform. Co-developed the COPC Indirect
            Procurement Standard and Chaired its global governance committee consisting of Fortune
            100 CPOs. Trusted advisor to C-suite executives, private equity firms, and procurement
            technology startups seeking to transform operations, integrate AI, and build
            high-performing teams.
          </p>
        </section>

        <section className="bio-section">
          <h2>CORE COMPETENCIES</h2>
          <ul className="bullet-list">
            <li>Strategic Procurement &amp; Sourcing Leadership</li>
            <li>AI-Driven Business Transformation</li>
            <li>Fractional &amp; Interim Leadership Roles</li>
            <li>S2P Technology Evaluation &amp; Implementation</li>
            <li>Supply Chain Risk Mitigation &amp; Supplier Rationalization</li>
            <li>Capital Raise &amp; Startup Advisory</li>
            <li>Organizational Design &amp; Change Management</li>
            <li>Global Team Leadership</li>
            <li>Contract Negotiation &amp; Vendor Governance</li>
            <li>Executive Coaching &amp; Talent Development</li>
          </ul>
        </section>

        <section className="bio-section">
          <h2>PROFESSIONAL EXPERIENCE</h2>

          <div className="job">
            <h3>Founder &amp; CEO | The Simms Group</h3>
            <p className="meta">Kirkland, WA | March 2020 – Present</p>
            <ul className="bullet-list">
              <li>
                Founded a procurement consulting practice delivering Fortune 100 expertise through
                three transformation pillars: Leadership, Optimization, and Technology. Services
                include fractional &amp; interim CPO leadership, AI tool evaluation, process
                assessment, and executive coaching.
              </li>
              <li>
                Partner with founders, CEOs, and private equity stakeholders to assess, design, and
                implement operational and supply chain strategies that optimize costs, reduce risks,
                and enable scalable growth.
              </li>
              <li>
                Advise procurement technology startups on product strategy, go-to-market positioning,
                and enterprise sales readiness, leveraging practitioner credibility and Fortune 500
                network.
              </li>
              <li>
                Develop standards-based transformation methodology grounded in COPC Indirect
                Procurement Standards, which I co-developed and continue to co-chair through the
                global governance committee.
              </li>
            </ul>
          </div>

          <div className="job">
            <h3>Co-Founder &amp; COO | Sivuno</h3>
            <p className="meta">Remote | 2023 – Present</p>
            <ul className="bullet-list">
              <li>
                Co-founded an AI-first spend intelligence platform that delivers 99%+ spend
                classification accuracy in minutes, solving the foundational data quality challenge
                that undermines procurement transformation.
              </li>
              <li>
                Lead client engagement, product evangelism, and strategic partnerships, positioning
                Sivuno as the data foundation enabling AI-driven procurement across the S2P landscape.
              </li>
              <li>
                Provide practitioner-informed product feedback to engineering team, ensuring the
                platform addresses real-world procurement challenges across spend visibility,
                category management, and supplier analysis.
              </li>
            </ul>
          </div>

          <div className="job">
            <h3>Chief Procurement Officer | Microsoft Corporation</h3>
            <p className="meta">Redmond, WA | September 2013 – August 2020</p>
            <ul className="bullet-list">
              <li>
                Orchestrated Microsoft&apos;s global indirect procurement organization, owning $20B+
                in annual addressable spend across 130 countries and leading 250+ professionals
                managing 60,000 suppliers across all spend categories.
              </li>
              <li>Delivered $8B+ in cost savings and exceeded all performance metrics.</li>
              <li>
                Architected and enforced a new enterprise-wide procurement operating model, driving
                30%+ step-change efficiency gains through consolidation and centralization of
                procurement functions globally.
              </li>
              <li>
                Led the high-stakes integration of Nokia&apos;s indirect procurement operations
                post-acquisition, unlocking an 80% efficiency gain and establishing a single,
                high-performing global platform.
              </li>
              <li>
                Co-created the COPC Indirect Procurement Standard and positioned Microsoft as the
                world&apos;s first organization to achieve COPC Indirect Procurement certification.
              </li>
              <li>
                Set a new bar for procurement and leadership excellence, earning the IAOP Industry
                Best Practice Award and achieving a Leadership Excellence Index of 87% vs. a 68%
                corporate norm.
              </li>
            </ul>
          </div>

          <div className="job">
            <h3>General Manager, Global Outsourcing | Microsoft Corporation</h3>
            <p className="meta">Redmond, WA | August 2006 – September 2013</p>
            <ul className="bullet-list">
              <li>
                Managed outsourcing operations for Microsoft&apos;s global contact centers and
                established the corporate BPO governance model.
              </li>
              <li>
                Directed supplier consolidation efforts, reducing costs by 35% and expanding service
                scope from 9 to 119 sites across 45 countries.
              </li>
              <li>
                Developed and implemented a proprietary Quality Management Framework, achieving COPC
                certification for contact center operations.
              </li>
              <li>
                Instituted governance models for supplier strategy, contract negotiation, and
                performance management across divisions.
              </li>
            </ul>
          </div>

          <div className="job">
            <h3>Director &amp; Senior Operations Manager | Microsoft Corporation</h3>
            <p className="meta">Redmond, WA | January 1995 – August 2006</p>
            <ul className="bullet-list">
              <li>
                Held progressively senior leadership roles including Director of Global Outsourcing
                &amp; Contact Centers and Senior Operations Manager for Global Services.
              </li>
              <li>
                Built foundational expertise in large-scale operations, supplier management, and
                organizational transformation across global markets.
              </li>
            </ul>
          </div>

          <div className="job">
            <h3>Senior Contract Administrator &amp; Proposal Manager | Crane Aerospace (ELDEC)</h3>
            <p className="meta">Seattle, WA | July 1985 – January 1995</p>
            <ul className="bullet-list">
              <li>
                Managed contracts for US military programs and led new-business proposal development
                (technical, management, and pricing volumes) for aerospace programs.
              </li>
              <li>
                Built early career in technical writing and engineering communications, establishing
                the systematic, process-driven approach that would define later leadership roles.
              </li>
            </ul>
          </div>
        </section>

        <section className="bio-section">
          <h2>INDUSTRY LEADERSHIP &amp; BOARD ROLES</h2>
          <ul className="bullet-list">
            <li>
              Founder &amp; Co-Chair, Indirect Procurement Council – Peer network of CPOs and senior
              leaders from Fortune 100 companies (Microsoft, Amazon, Cisco, HPE, Intuit, and others)
            </li>
            <li>
              Co-Chair, COPC Indirect Procurement Standard Steering Committee – Co-developed the
              industry standard for indirect procurement excellence
            </li>
            <li>Executive Advisor, PRAAS (Praas.io) – Print-as-Service Start-Up</li>
            <li>
              Executive Advisor, ABRA (helloAbra.com)– AI-first platform providing enterprises
              real-time insights
            </li>
            <li>Executive Advisor, Craft (Craft.co) – AI-first Supplier Risk Management</li>
            <li>
              Board of Directors, Kirkland Performance Center (kpccenter.org) – Community arts
              leadership and governance
            </li>
          </ul>
        </section>

        <section className="bio-section">
          <h2>EDUCATION &amp; CERTIFICATIONS</h2>
          <ul className="bullet-list">
            <li>
              Bachelor of Science in Engineering – Scientific &amp; Technical Communication —
              University of Washington, Seattle
            </li>
            <li>
              COPC Indirect Procurement Certification – Co-developed standard; led first global
              certification at Microsoft
            </li>
            <li>IAOP Industry Best Practice Award – Procurement Excellence</li>
            <li>PADI Master Scuba Diver – Highest certification level for recreational divers</li>
          </ul>
        </section>
      </article>
    </>
  );
}
