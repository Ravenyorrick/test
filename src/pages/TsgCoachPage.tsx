import { LearnMoreButton } from '../components/LearnMoreButton';
import { Seo } from '../components/Seo';

export function TsgCoachPage() {
  return (
    <>
      <Seo title="TSG Coach | Simms Group Consulting" path="/tsg-coach" />
      <div className="container service-page-hero">
        <h1 className="page-title">TSG Coach</h1>
        <p className="page-subtitle">Executive Coaching from Fortune 100 Experience</p>
      </div>
      <div className="container service-layout">
        <div className="prose">
          <h2 className="section-heading">The Challenge</h2>
          <p>
            Most coaching programs deliver generic frameworks from career coaches who&apos;ve never
            held the roles their clients occupy. They offer theory without context, methodologies
            without battle scars, and advice that sounds good in a workshop but breaks down in a
            boardroom. Leaders invest significant time and budget only to receive guidance that
            doesn&apos;t translate to their specific challenges—leaving them to figure out the hard
            parts alone.
          </p>

          <h2 className="section-heading">Why TSG Is Different</h2>
          <p>
            While coaching has become mainstream, most coaches come from training, HR, or consulting
            backgrounds—not operational leadership. TSG Coach brings something rare: advisors who have
            actually held the seats their clients occupy. Our Trusted Advisors have served as CPOs,
            VPs, transformation leaders, and executives at Fortune 100 companies. They&apos;ve managed
            billion-dollar budgets, built global teams, and navigated the exact challenges you&apos;re
            facing.
          </p>

          <h2 className="section-heading">Practitioner Expertise That Matters</h2>
          <ul className="bullet-list">
            <li>
              We&apos;ve held your role—we know the pressures of executive leadership, the stakeholder
              dynamics, and the decisions that keep you up at night
            </li>
            <li>
              We understand your context—the CFO pushing for results, the board expecting
              transformation, the team needing development, the politics requiring navigation
            </li>
            <li>
              We&apos;ve navigated your challenges—organizational change, M&amp;A integration,
              technology transformation, team building, succession planning, and crisis management
            </li>
            <li>
              We offer our network—access to founders, executives, and industry experts across our
              extended relationships who can provide additional perspective and connections
            </li>
          </ul>

          <h2 className="section-heading">Our Approach</h2>
          <p>
            TSG Coach delivers a layered approach to leadership development, building from a strong
            coaching foundation to an expansive professional network:
          </p>
          <ul className="bullet-list">
            <li>
              <strong>It starts with 1:1 coaching.</strong> Every engagement begins with personalized
              coaching from one of our expertly trained and professionally certified coaches. Our
              coaches come from a variety of backgrounds, with specialties in Executive Coaching,
              Mentoring, Life Coaching, and other related disciplines.
            </li>
            <li>
              <strong>Then we add Trusted Advisor access.</strong> Building on your coaching
              foundation, we connect you with our Trusted Advisors—seasoned executives who have held
              senior leadership roles at Fortune 100 companies. These practitioners provide strategic
              perspective, candid feedback, and domain-specific guidance.
            </li>
            <li>
              <strong>Finally, we open our network.</strong> As your needs evolve, we introduce you to
              professionals across the TSG network—founders, executives, and industry experts who can
              provide specialized perspective, facilitate connections, and support your continued
              growth.
            </li>
          </ul>

          <h2 className="section-heading">Engagement Models</h2>
          <ul className="bullet-list">
            <li>
              <strong>1:1 Executive Coaching</strong> — Personalized guidance from a Trusted Advisor
              matched to your role, challenges, and aspirations
            </li>
            <li>
              <strong>Trusted Advisor Access</strong> — On-demand access to seasoned executives across
              multiple disciplines—like having a personal board of advisors
            </li>
            <li>
              <strong>Network Connections</strong> — Facilitated introductions to founders,
              executives, and industry experts who can provide specialized perspective
            </li>
            <li>
              <strong>Team &amp; Group Sessions</strong> — Facilitated workshops, leadership
              development programs, and strategy sessions for teams and cohorts
            </li>
            <li>
              <strong>Keynote Speaking &amp; Events</strong> — Inspiring presentations from executives
              who&apos;ve driven transformation at Fortune 100 scale
            </li>
          </ul>

          <blockquote className="quote-block">
            The best advice doesn&apos;t come from someone who read about leadership—it comes from
            someone who&apos;s lived it. TSG Coach connects you with practitioners who have sat in
            your seat.
          </blockquote>

          <div className="cta-row">
            <LearnMoreButton />
          </div>
        </div>
        <aside>
          <img
            className="infographic"
            src="/assets/images/service-coach.jpg"
            alt="TSG Coach engagement model infographic"
            loading="lazy"
          />
        </aside>
      </div>
    </>
  );
}
