import { Seo } from '../components/Seo';

export function HomePage() {
  return (
    <>
      <Seo
        title="Simms Group Consulting, LLC | Procurement & Contracting"
        path="/"
      />
      <section className="home-hero" aria-label="Homepage hero">
        <div className="home-hero-frame">
          <img
            src="/assets/images/hero-home.jpg"
            alt="The Simms Group wall logo"
            width={980}
            height={980}
          />
        </div>
      </section>
    </>
  );
}
