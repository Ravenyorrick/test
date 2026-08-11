# Assets Not Copied / Notes

## Copied successfully

All primary publicly accessible media assets used by page content were downloaded from the Wix static CDN (`static.wixstatic.com`) into `/public/assets/images` and `/public/assets/icons`, including:

- Logo
- Homepage hero
- Service/overview infographics
- Signature Advisory graphics
- Team headshots
- LinkedIn icon
- Favicon (generated from logo)

Large PNG infographics were optimized to JPEG for performance while preserving visual content.

## Not copied / intentionally omitted

| Asset / Feature | Why | Replacement |
|-----------------|-----|-------------|
| Wix runtime JS bundles | Not needed for user-facing UI; heavy | Native React implementation |
| Wix analytics / tracking pixels | No product requirement; privacy | None (can be added later) |
| “Proudly created with Wix.com” footer credit | Hosting platform credit | Removed; copyright retained |
| Original Wix font files (if any proprietary) | Site declared `Arial, Helvetica, sans-serif` for UI | Montserrat + Libre Baskerville via Google Fonts for close professional match (serif italic tagline) |
| Broken favicon source without `~mv2` suffix | 403 from CDN | Favicon generated from logo PNG |

## Legal note

Assets were retrieved from publicly accessible URLs on the existing customer website for migration purposes. Ensure you have rights to republish brand/team imagery on the destination host.
