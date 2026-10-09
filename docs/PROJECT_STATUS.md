# MoBase - Project Overview & Status

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)[cite: 10]
- **Database**: MySQL / PlanetScale[cite: 10]
- **ORM**: Drizzle ORM[cite: 10]
- **Cache & Rate Limiting**: Upstash Redis[cite: 10]
- **Auth**: Custom Cookie/Redis Session-based Auth with Bcrypt password hashing[cite: 10]
- **Outreach Engine**: `whatsapp-web.js`, `qrcode-terminal`, `mysql2`, `dotenv`

---

## Database Schema Summary

| Table               | Primary Key | Key Fields / Constraints                                      | Description                                                   |
| :------------------ | :---------- | :------------------------------------------------------------ | :------------------------------------------------------------ |
| **`users`**         | `id` (UUID) | `email` (Unique), `username` (Unique), `passwordHash`, `role` | Base user accounts (SUPER_ADMIN, DEVELOPER, CLIENT)[cite: 10] |
| **`developers`**    | `id` (UUID) | `userId` (FK -> users), `workspaceSlug` (Unique)              | Developer workspace profiles[cite: 10]                        |
| **`clients`**       | `id` (UUID) | `developerId` (FK -> developers), `userId` (FK -> users)      | Client accounts linked to workspaces[cite: 10]                |
| **`projects`**      | `id` (UUID) | `searchCode` (Unique), `clientId` (FK), `developerId` (FK)    | Workspace project tracking[cite: 10]                          |
| **`milestones`**    | `id` (UUID) | `projectId` (FK), `status`, `sortOrder`                       | Individual project milestones[cite: 10]                       |
| **`leads`**         | `id` (UUID) | `name`, `phone`, `maskedPhone`, `status`                      | Business leads scraped from Google Maps                       |
| **`messages`**      | `id` (UUID) | `leadId` (FK -> leads), `senderType`, `messageText`, `status` | Outbound & Inbound proxy WhatsApp communications              |
| **`system_status`** | `id`        | `qrCode`, `isConnected`, `updatedAt`                          | Live WhatsApp web session QR state & connection status        |

---

## Current Status

> ✅ **SYSTEM STATUS: LEAD DISCOVERY & PROXY OUTREACH OPERATIONAL**
>
> - **Lead Scraper & Cache**: Fully optimized with MySQL pre-caching (<50ms response) and asset-blocked Puppeteer scraping[cite: 8].
> - **Wix/Subdomain Filter**: Strict filtering actively purges `.wixsite.com` and builder subdomains[cite: 8].
> - **Modular Console**: UI separated into co-located components with skeleton loaders, lazy streaming, and WhatsApp read receipts (single/double grey and gold ticks)[cite: 5, 6].
> - **Stability**: Turbopack compiler panics and JSON parsing errors resolved.

---

## Next Steps / Todo

- [x] **Lead Discovery & Proxy Chat Optimization**:
  - [x] Fast MySQL cache check & Puppeteer network asset blocking[cite: 8].
  - [x] Modularized UI components (`LeadCard`, `ChatDrawer`, `QrModal`)[cite: 5].
  - [x] Pure zero-website filtering (purging Wix/Wordpress subdomains)[cite: 8].
  - [x] Lazy card rendering & WhatsApp read receipts[cite: 6].
  - [x] Safe JSON text parsing in polling handlers.
- [ ] **Client Workspace Portal & Chat Wall (NEXT PHASE)**:
  - [ ] Build `/portal/workspace/clients` page layout.
  - [ ] Implement central Client Chat Wall interface.
  - [ ] Connect client list and conversation streams to MySQL `messages` & `clients` tables.
  - [ ] Implement client onboarding / project management controls.
