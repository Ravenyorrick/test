# Functionality Audit

## Interactive elements

| Element | Original behavior | Destination | New page? | Submits data? | Modal? | External? | Replacement |
|---------|-------------------|-------------|-----------|---------------|--------|-----------|-------------|
| Logo | Navigate home | `/` | Yes | No | No | No | `<Link to="/">` |
| Nav: Home | Navigate | `/` | Yes | No | No | No | React Router Link |
| Nav: Signature Advisory | Navigate | `/signature-advisory` | Yes | No | No | No | Link |
| Nav: Overview | Navigate | `/overview-of-services` | Yes | No | No | No | Link |
| Nav: Fractional Leaders | Navigate | `/fractional-leaders` | Yes | No | No | No | Link |
| Nav: Process & Capability Assessments | Navigate | `/process-capability-assessments` | Yes | No | No | No | Link |
| Nav: AI Tools & Implementation | Navigate | `/ai-tools-implementation` | Yes | No | No | No | Link |
| Nav: TSG Coach | Navigate | `/tsg-coach` | Yes | No | No | No | Link |
| Nav: More | Opens dropdown | — | No | No | Dropdown | No | CSS/JS dropdown |
| More → Meet the Team | Navigate | `/our-team` | Yes | No | No | No | Link |
| More → Mike's Bio | Navigate | `/mike-s-bio` | Yes | No | No | No | Link |
| More → Contact Us | Navigate | `/contact-us` | Yes | No | No | No | Link |
| Mobile hamburger | Opens full menu | — | No | No | Overlay menu | No | Accessible button + panel |
| Learn More (service pages) | Opens mail client | `mailto:mike@simmsgroupconsulting.com` | No | No | No | Mail | `<a href="mailto:…">` |
| CONTACT US button | Opens mail | `mailto:mike@simmsgroupconsulting.com?subject=Contact%20Us` | No | No | No | Mail | mailto anchor styled as button |
| TSG COACH button | Opens mail | `mailto:coach@simmsgroupconsulting.com?subject=TSG%20COACH` | No | No | No | Mail | mailto anchor styled as button |
| Footer LinkedIn | Opens company page | `https://www.linkedin.com/company/the-simms-group/` | No | No | No | Yes | external `<a target="_blank">` |
| Team LinkedIn icons | Open member profiles | various `/in/…` | No | No | No | Yes | external links |
| Mike bio email/LinkedIn/Sivuno | External/mail | mailto / LinkedIn / sivuno.com | No | No | No | Yes | anchors |
| Overview service cards | Visual cards; services also via nav | service routes | Yes | No | No | No | Clickable cards → routes |

## Forms

**None found.** Original site uses mailto CTAs, not Wix Forms.

Optional configurable contact endpoint is provided via env vars for future use (see `.env.example`) but is not required for parity.

## Wix-specific features

| Feature | Present? | Decision |
|---------|----------|----------|
| Wix Forms | No | N/A |
| Wix Bookings | No | N/A |
| Wix Members | No | N/A |
| Wix CMS/dynamic pages | Static pages only | Recreate as React routes (A) |
| Wix lightboxes/popups | None observed | N/A |
| Wix analytics/runtime | Yes | Safely removed — no user-facing purpose (D) |
| Wix media CDN | Yes | Assets downloaded to `/public/assets` (A) |
| “Proudly created with Wix.com” | Footer credit | Removed in replacement (branding of host platform) |

## Animations / hover

- Nav link hover: underline / opacity
- Dropdown fade/appear on More hover/focus
- Button hover: slightly lighter blue background
- Mobile menu slide/fade
- Page content fade-in on load (subtle)
