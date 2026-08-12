import { LINKEDIN_COMPANY } from '../data/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-brand">The Simms Group</p>
        <a
          className="footer-social"
          href={LINKEDIN_COMPANY}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="The Simms Group on LinkedIn"
        >
          <img src="/assets/icons/linkedin.png" alt="" width={28} height={28} />
        </a>
        <p className="footer-copy">©2025 by Simms Group Consulting.</p>
      </div>
    </footer>
  );
}
