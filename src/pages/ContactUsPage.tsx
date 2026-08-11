import { Seo } from '../components/Seo';
import {
  EMAIL_COACH,
  EMAIL_MIKE,
  mailtoCoach,
  mailtoMike,
} from '../data/site';

export function ContactUsPage() {
  return (
    <>
      <Seo title="Contact Us | Simms Group Consulting, LLC" path="/contact-us" />
      <section className="container contact-panel">
        <h1 className="page-title">Contact Us</h1>

        <div className="contact-block">
          <h2>Mike Simms</h2>
          <p>
            <a className="email" href={mailtoMike()}>
              {EMAIL_MIKE}
            </a>
          </p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <a className="btn" href={mailtoMike('Contact Us')}>
              CONTACT US
            </a>
          </div>
        </div>

        <div className="contact-block">
          <h2>Are you Interested in Coaching?</h2>
          <p>
            <a className="email" href={mailtoCoach()}>
              {EMAIL_COACH}
            </a>
          </p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <a className="btn" href={mailtoCoach('TSG COACH')}>
              TSG COACH
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
