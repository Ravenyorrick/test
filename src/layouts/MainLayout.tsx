import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function MainLayout() {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
