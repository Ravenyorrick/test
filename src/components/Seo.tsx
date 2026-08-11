import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description?: string;
  path?: string;
};

const DEFAULT_DESC =
  'Simms Group Consulting, LLC is an agile company comprised of experienced professionals with decades of experience leading large global businesses, negotiating complex multi-million-dollar contracts, and transforming organizations.';

export function Seo({ title, description = DEFAULT_DESC, path = '/' }: SeoProps) {
  useEffect(() => {
    document.title = title;
    const ensureMeta = (selector: string, attr: string, value: string, createAttrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        Object.entries(createAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    ensureMeta('meta[name="description"]', 'content', description, { name: 'description' });
    ensureMeta('meta[property="og:title"]', 'content', title, { property: 'og:title' });
    ensureMeta('meta[property="og:description"]', 'content', description, { property: 'og:description' });
    ensureMeta('meta[property="og:type"]', 'content', 'website', { property: 'og:type' });

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://www.simmsgroupconsulting.com${path}`;
  }, [title, description, path]);

  return null;
}
