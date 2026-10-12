# Changelog

All notable changes to the MoBase platform will be documented in this file.

## [Unreleased] - Vesper Session Identity & Multi-Turn Conversational Co-Pilot

### Added

- **Secure Session Resolution Route (`/api/vesper/chat`)**:
  - Created dedicated API endpoint querying logged-in developer credentials (`fullName`, `username`) directly from database `users` schema.
  - Automatically formats user names to eliminate fake placeholder defaults (e.g., "Alex") across all chat modules.
- **Dynamic System Time & Timezone Injection**:
  - Injected real-time client time calculation (Developer Local Time, East Africa Time / Kenya, UTC, and New York Time) into WebLLM conversation context streams.
  - Added instant pattern intercepts for time queries to eliminate model hallucination.

### Changed

- **Vesper Voice & Persona System (`vesperPrompts.ts`)**:
  - Replaced rigid clinical and Wall Street templates with a natural, conversational senior developer co-pilot persona.
  - Enforced strict identity rules preventing Vesper from confusing its name with the user's name.
  - Retained Tier Gate price masking (`TIER_ALPHA_01`) for pre-outreach client protection.
- **Multi-Turn Chat Stream (`useVesperWebLLM.ts`)**:
  - Implemented `askVesperStream` to pass full conversation history (`user` / `assistant` roles) through WebGPU inference for fluid, context-aware dialogue.

### Fixed & Hardened

- **TiDB Connection Resilience**:
  - Configured `mysql2/promise` connection pooling in `src/db/index.ts` with `enableKeepAlive: true` and `idleTimeout`[cite: 25].
- **Engine Auto-Initialization**:
  - Fixed `Vesper AI Engine is not initialized` error by automatically triggering local GPU engine initialization on message dispatch when uninitialized.

## [Previous] - Split-Stack WhatsApp Infrastructure & Dynamic Client Workspace

### Added

- **Cloud Keep-Alive & Outbox Infrastructure**:
  - Embedded HTTP `/health` endpoint inside `server/whatsapp-worker.ts` for 5-minute external keep-alive pings[cite: 25].
  - Integrated Browserless.io WebSocket cloud Chrome execution (`wss://chrome.browserless.io`)[cite: 25].
- **Dynamic Client Management Workspace**:
  - Built database-driven Client Directory (`src/app/clients/page.tsx`) with dynamic metric calculations[cite: 25].
  - Integrated real-time outbox chat streaming in `ChatWall.tsx` writing directly to TiDB `messages`[cite: 25].
