# MoBase - Project Overview & Status

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: MySQL / PlanetScale
- **ORM**: Drizzle ORM
- **Cache & Rate Limiting**: Upstash Redis
- **Auth**: Custom Cookie/Redis Session-based Auth with Bcrypt password hashing

---

## Database Schema Summary

| Table            | Primary Key | Key Fields / Constraints                                      | Description                                                       |
| :--------------- | :---------- | :------------------------------------------------------------ | :---------------------------------------------------------------- |
| **`users`**      | `id` (UUID) | `email` (Unique), `username` (Unique), `passwordHash`, `role` | Base user accounts (SUPER_ADMIN, DEVELOPER, CLIENT)[cite: 17, 18] |
| **`developers`** | `id` (UUID) | `userId` (FK -> users), `workspaceSlug` (Unique)              | Developer workspace profiles[cite: 17]                            |
| **`clients`**    | `id` (UUID) | `developerId` (FK -> developers), `userId` (FK -> users)      | Client accounts linked to workspaces[cite: 17, 18]                |
| **`projects`**   | `id` (UUID) | `searchCode` (Unique), `clientId` (FK), `developerId` (FK)    | Workspace project tracking[cite: 17]                              |
| **`milestones`** | `id` (UUID) | `projectId` (FK), `status`, `sortOrder`                       | Individual project milestones[cite: 17]                           |

---

## Authentication Flow

1. **Input**: User submits `identifier` (Email or Username), `password`, optional `searchCode`, and `rememberWorkstation`[cite: 18, 19].
2. **Rate Limiting**: IP-based rate limiting via Redis (10 attempts / minute)[cite: 19].
3. **Lookup**: Query `users` table matching `email` OR `username`[cite: 19].
4. **Validation**: Validate password hash via `bcrypt.compare`[cite: 19].
5. **Session Issue**:
   - Session stored in Redis key `session:<token>`[cite: 19].
   - Token set in HTTP-only `mobase_session` cookie[cite: 19].
   - Duration: 30 days if remembered (2,592,000 seconds), 1 day if standard (86,400 seconds)[cite: 19].

---

## Next Steps / Todo

- [ ] Implement middleware to protect `/admin/*` and `/portal/workspace/*` routes.
- [ ] Build workspace dashboard layout for developers.
- [ ] Build client project tracking portal view.
- [ ] Implement client onboarding / invitation flow.
