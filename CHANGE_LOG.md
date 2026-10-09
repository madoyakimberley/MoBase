# MoBase - Development Changelog

## [Unreleased] - 2026-10-09

### Lead Discovery Engine & Performance Optimization

- **Database Cache Lookup**: Implemented fast MySQL pre-search cache check in `GET /api/dev/leads/search` returning cached qualified leads in under 50ms[cite: 8].
- **Puppeteer Network Interception**: Added asset blocking for images, stylesheets, fonts, and media during Google Maps scraping, reducing DOM extraction latency by ~70%[cite: 8].
- **Parallel Database Operations**: Replaced sequential async loops with `Promise.all` for batch lead processing and safe null fallback phone masking[cite: 8].
- **Strict Website & Free Subdomain Detection**: Enhanced filter engine in `search/route.ts` to inspect `href` links, `data-item-id="authority"`, and explicitly purge free builder domains (`.wixsite.com`, `.wordpress.com`, etc.) to guarantee 100% pure no-website leads[cite: 8].

### Modular UI & Discovery Console Refactoring

- **Co-located Workspace Architecture**: Refactored `/portal/workspace/find-jobs` into modularized, localized components[cite: 5]:
  - `components/types.ts`: Shared lead and chat message interfaces.
  - `components/LeadCard.tsx`: Itemized lead card UI with masked contact details and action triggers[cite: 7].
  - `components/QrModal.tsx`: WhatsApp account linking modal with `QrSkeleton` state.
  - `components/ChatDrawer.tsx`: Masked developer proxy chat drawer with `ChatHistorySkeleton`[cite: 6].
- **Zero-Spinner Skeleton Loaders**: Removed all loading spinners across search grids, QR generation, and chat streams in favor of structural animated skeletons.
- **Lazy Card Streaming**: Added batch rendering (3 cards per view) with a "Load More" stream trigger.
- **WhatsApp Read Receipts**: Integrated read status indicators matching Japandi design tokens:
  - `PENDING` (Single Grey Tick)
  - `SENT` / `DELIVERED` (Double Grey Tick)
  - `READ` (Double Gold Tick using `var(--accent-gold)`)[cite: 4, 6]

### Stability & Build System Fixes

- **Turbopack Configuration**: Updated `next.config.ts` with top-level `turbopack.root` and `serverExternalPackages` (`whatsapp-web.js`, `puppeteer`, `mysql2`) to resolve Rust compiler panics.
- **Safe JSON Parsing**: Replaced raw `req.json()` and `res.json()` with safe `req.text()` guards to eliminate `SyntaxError: Unexpected end of JSON input` during client polling.
- **Type Safety**: Resolved Lucide SVG `title` prop type mismatch in `ReadReceipt` helper by wrapping icons in native `<span>` containers.
