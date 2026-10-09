# Changelog

All notable changes to the MoBase platform will be documented in this file.

## [Unreleased] - Hardening, PWA Setup & Offline Resilience

### Added

- **PWA & Offline Asset Caching**:
  - Integrated `@ducanh2912/next-pwa` in `next.config.ts` with Workbox `skipWaiting` and aggressive frontend navigation caching.
  - Created web application manifest `public/manifest.json` configured for standalone execution.
  - Configured root `layout.tsx` metadata with PWA status bar styles and web manifest links.
- **Offline Network Detection & Session Fallbacks**:
  - Implemented real-time network status indicators (`ONLINE` / `OFFLINE`) and top banner warnings in `src/app/portal/workspace/layout.tsx`.
  - Added session persistence via `localStorage` (`mobase_dev_user`) to maintain developer access during offline intervals.
- **Offline Lead Discovery & Proxy Chat Caching**:
  - Added `localStorage` caching for Google Maps search queries and lead datasets (`mobase_cached_leads`).
  - Implemented an optimistic offline message queue (`mobase_pending_chat_queue`) in `ChatDrawer.tsx` that automatically flushes queued outbound messages when internet connectivity is restored.

### Changed

- **WhatsApp Worker Boot & Status Endpoint Hardening**:
  - Secured `GET /api/dev/whatsapp/status` with `DEVELOPER` and `SUPER_ADMIN` role checks.
  - Hardened `POST /api/dev/whatsapp/start` with origin verification (`validateOrigin`), single-instance process lock files (`.whatsapp-worker.lock`), and unreferenced background process spawning using `child_process.spawn`.

### Security

- Standardized RBAC checks and origin sanitization across all worker boot triggers and proxy communication routes.
- Masked client contact information and personal phone numbers across the Chat Drawer and lead cards.
