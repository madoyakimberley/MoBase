# MoBase - Development Changelog

## [Unreleased] - 2026-10-08

### Authentication & Session Management

- **Flexible Identifier Login**: Updated POST `/api/auth/login` to support authentication via **Email or Username** using Drizzle `or()` condition querying[cite: 19].
- **Session Duration ("Remember Workstation")**: Wired up the `rememberWorkstation` flag[cite: 18, 19]:
  - **Checked**: 30-day session TTL (`2,592,000` seconds) in Redis and HTTP-only cookie.
  - **Unchecked**: Standard 1-day session TTL (`86,400` seconds).
- **Login UI Update**: Updated `app/portal/login/page.tsx` step 1 input to accept email/username handles with password toggle and project search code support[cite: 18].

### Database & Schema Fixes

- **Drizzle Relations Fix**: Resolved relationship reference in `clientsRelations` (`db/schema/index.ts`) where `clients.developerId` incorrectly pointed to `clients.id` instead of `developers.id`[cite: 17, 18].
- **Database Seeding Fix**: Updated `scripts/seed.ts` to include the non-nullable `username` field in user insertion payload to resolve MySQL default value constraint error (`ER_NO_DEFAULT_FOR_FIELD`).
