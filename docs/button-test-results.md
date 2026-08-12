# Button Test Results

| BUTTON | PAGE | EXPECTED ACTION | ACTUAL ACTION | STATUS |
|--------|------|-----------------|---------------|--------|
| Logo | All | Navigate to `/` | Navigates to `/` | PASS |
| Home | Header | Navigate to `/` | Navigates to `/` | PASS |
| Signature Advisory | Header | Navigate to `/signature-advisory` | Navigates correctly | PASS |
| Overview | Header | Navigate to `/overview-of-services` | Navigates correctly | PASS |
| Fractional Leaders | Header | Navigate to `/fractional-leaders` | Navigates correctly | PASS |
| Process & Capability Assessments | Header | Navigate to `/process-capability-assessments` | Navigates correctly | PASS |
| AI Tools & Implementation | Header | Navigate to `/ai-tools-implementation` | Navigates correctly | PASS |
| TSG Coach | Header | Navigate to `/tsg-coach` | Navigates correctly | PASS |
| More | Header | Open dropdown | Opens Meet the Team / Mike's Bio / Contact Us | PASS |
| Meet the Team | More menu | Navigate to `/our-team` | Navigates correctly | PASS |
| Mike's Bio | More menu | Navigate to `/mike-s-bio` | Navigates correctly | PASS |
| Contact Us | More menu | Navigate to `/contact-us` | Navigates correctly | PASS |
| Mobile hamburger | Header (≤1023px) | Toggle mobile nav | Toggles full link list | PASS |
| Overview service cards | Overview | Navigate to matching service route | Card links to service pages | PASS |
| Learn More | Fractional Leaders | mailto:mike@simmsgroupconsulting.com | mailto link | PASS |
| Learn More | Process Assessments | mailto:mike@simmsgroupconsulting.com | mailto link | PASS |
| Learn More | AI Tools | mailto:mike@simmsgroupconsulting.com | mailto link | PASS |
| Learn More | TSG Coach | mailto:mike@simmsgroupconsulting.com | mailto link | PASS |
| CONTACT US | Contact Us | mailto:mike@…?subject=Contact%20Us | mailto with subject | PASS |
| TSG COACH | Contact Us | mailto:coach@…?subject=TSG%20COACH | mailto with subject | PASS |
| Contact Michael | Signature Advisory | mailto:mike@… | mailto link | PASS |
| Footer LinkedIn | All | Open company LinkedIn | https://www.linkedin.com/company/the-simms-group/ | PASS |
| Team LinkedIn icons | Our Team | Open member LinkedIn profiles | External profile URLs | PASS |
| Bio email / LinkedIn / Sivuno | Mike's Bio | mailto / LinkedIn / sivuno.com | Correct destinations | PASS |
| Return Home | 404 | Navigate to `/` | Navigates correctly | PASS |

Verification method: code review of href/to attributes + automated route smoke tests (`npm run test:site`) + build success.
