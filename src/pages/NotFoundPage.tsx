import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found | Simms Group Consulting" path="/404" />
      <section className="not-found">
        <h1>404</h1>
        <p>The page you are looking for could not be found.</p>
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link className="btn" to="/">
            Return Home
          </Link>
          <Link className="btn" to="/contact-us">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
