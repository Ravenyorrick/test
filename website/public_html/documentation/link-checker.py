#!/usr/bin/env python3
"""Simple internal link / asset checker for local or remote base URL."""
from __future__ import annotations
import argparse, re, sys, urllib.request, urllib.parse
from urllib.error import HTTPError

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://127.0.0.1:8080')
    ap.add_argument('--start', default='/')
    args = ap.parse_args()
    base = args.base.rstrip('/')
    seen=set(); q=[args.start]; broken=[]; ok=0
    while q:
        path=q.pop(0)
        if path in seen: continue
        seen.add(path)
        url = base + path if path.startswith('/') else path
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                body=r.read().decode('utf-8','ignore'); status=r.status
        except HTTPError as e:
            broken.append((path,e.code)); continue
        except Exception as e:
            broken.append((path,str(e))); continue
        ok += 1
        if 'Fatal error' in body:
            broken.append((path,'PHP fatal')); continue
        for h in re.findall(r'(?:href|src)=["\']([^"\'#]+)["\']', body, re.I):
            if h.startswith(('mailto:','tel:','javascript:','data:')): continue
            if h.startswith('http') and base not in h: continue
            p = urllib.parse.urlparse(h if h.startswith('http') else urllib.parse.urljoin(url,h)).path
            if not p: continue
            if p not in seen:
                q.append(p)
    print(f'Checked {ok} OK resources; {len(broken)} broken')
    for b in broken:
        print(' BROKEN', b)
    return 1 if broken else 0

if __name__ == '__main__':
    sys.exit(main())
