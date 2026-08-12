import { Seo } from '../components/Seo';
import { teamMembers } from '../data/team';

export function OurTeamPage() {
  const founder = teamMembers.find((m) => m.isFounder)!;
  const partners = teamMembers.filter((m) => !m.isFounder);

  return (
    <>
      <Seo title="Our Team | Simms Group Consulting" path="/our-team" />
      <div className="container">
        <section className="team-founder">
          <div>
            <p className="muted" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              Founder &amp; CEO
            </p>
            <h1 className="page-title">{founder.name}</h1>
            <ul className="bullet-list">
              {founder.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <a
              className="linkedin-link"
              href={founder.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${founder.name} on LinkedIn`}
            >
              <img src="/assets/icons/linkedin.png" alt="" />
              LinkedIn
            </a>
          </div>
          <img src={founder.photo} alt={founder.name} loading="eager" />
        </section>

        <h2 className="section-heading">TSG Partners — Proven Leaders with Deep Domain Experience</h2>

        <section className="team-grid" aria-label="TSG Partners">
          {partners.map((member) => (
            <article key={member.name} className="team-card">
              <img src={member.photo} alt={member.name} loading="lazy" />
              <div>
                <h3>{member.name}</h3>
                <ul>
                  {member.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <a
                  className="linkedin-link"
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <img src="/assets/icons/linkedin.png" alt="" />
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
