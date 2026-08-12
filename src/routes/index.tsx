import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AiToolsPage } from '../pages/AiToolsPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { FractionalLeadersPage } from '../pages/FractionalLeadersPage';
import { HomePage } from '../pages/HomePage';
import { MikesBioPage } from '../pages/MikesBioPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OurTeamPage } from '../pages/OurTeamPage';
import { OverviewPage } from '../pages/OverviewPage';
import { ProcessAssessmentsPage } from '../pages/ProcessAssessmentsPage';
import { SignatureAdvisoryPage } from '../pages/SignatureAdvisoryPage';
import { TsgCoachPage } from '../pages/TsgCoachPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'signature-advisory', element: <SignatureAdvisoryPage /> },
      { path: 'overview-of-services', element: <OverviewPage /> },
      { path: 'fractional-leaders', element: <FractionalLeadersPage /> },
      { path: 'process-capability-assessments', element: <ProcessAssessmentsPage /> },
      { path: 'ai-tools-implementation', element: <AiToolsPage /> },
      { path: 'tsg-coach', element: <TsgCoachPage /> },
      { path: 'our-team', element: <OurTeamPage /> },
      { path: 'mike-s-bio', element: <MikesBioPage /> },
      { path: 'contact-us', element: <ContactUsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
