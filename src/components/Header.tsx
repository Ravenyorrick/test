import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { moreNav, primaryNav, SITE_TAGLINE } from '../data/site';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const menuId = useId();

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand-block" aria-label="The Simms Group home">
          <img
            className="brand-logo"
            src="/assets/images/logo.png"
            alt="The Simms Group"
            width={108}
            height={108}
          />
          <p className="brand-tagline">{SITE_TAGLINE}</p>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
        </button>

        <nav className="nav-desktop" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          ))}
          <div className={`nav-more${moreOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="nav-more-btn"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((v) => !v)}
            >
              More
            </button>
            <div className="nav-dropdown" role="menu">
              {moreNav.map((item) => (
                <NavLink key={item.path} to={item.path} role="menuitem">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <nav
          id={menuId}
          className={`nav-mobile${mobileOpen ? ' open' : ''}`}
          aria-label="Mobile"
        >
          {[...primaryNav, ...moreNav].map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
