import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

const cards = [
  {
    title: 'Fractional Leaders',
    path: '/fractional-leaders',
    image: '/assets/images/overview-fractional.jpg',
  },
  {
    title: 'Process & Capability Assessments',
    path: '/process-capability-assessments',
    image: '/assets/images/overview-process.jpg',
  },
  {
    title: 'AI Tools & Implementation',
    path: '/ai-tools-implementation',
    image: '/assets/images/overview-ai.jpg',
  },
  {
    title: 'TSG Coach',
    path: '/tsg-coach',
    image: '/assets/images/overview-coach.jpg',
  },
];

export function OverviewPage() {
  return (
    <>
      <Seo title="Overview | Simms Group Consulting" path="/overview-of-services" />
      <section className="overview-intro container">
        <h1>
          The Simms Group (TSG) was &quot;Built by Practitioners, for Practitioners&quot;
        </h1>
        <p className="page-subtitle" style={{ marginInline: 'auto' }}>
          We&apos;ve sat in your seat—leading procurement organizations at Fortune 100 scale,
          managing billions in spend, and driving transformation from the inside. We bring that
          practitioner perspective to every engagement. Enterprise Scale. Start-Up Speed.
        </p>
        <p>
          <strong>Four integrated services. Real-world expertise. Measurable results:</strong>
        </p>
      </section>
      <section className="container-wide overview-grid" aria-label="Services">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="service-card" aria-label={card.title}>
            <img src={card.image} alt={card.title} loading="lazy" />
          </Link>
        ))}
      </section>
    </>
  );
}
