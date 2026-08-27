# Access Codes — Design Spec

**Date:** 2026-08-27
**Status:** Approved in chat (Nitin, 15:27 IST)

## Problem

The assessment is sold manually (offline — UPI, cash, institute deals). Today anyone
who visits the site can take the test free. We need a gate: a student entering their
details must also enter a **security code** that was issued to them at purchase.
Each code works exactly once. The admin (Nitin) generates codes on demand from a
dashboard and delivers them personally (WhatsApp / email / phone).

Explicitly out of scope for v1 (future phases):
- Online payment (Razorpay etc.) — a webhook will later call the same `issueCode()`.
- Automatic email delivery of codes — a `sendEmail()` will slot in beside `issueCode()`.

## Decisions (made in brainstorming)

1. Purchase is manual-only today; design leaves a seam for a payment webhook.
2. No auto-email in v1 — dashboard shows the code, admin shares it manually.
3. **Open codes**: not bound to a buyer email. First person to redeem consumes it.
   Optional free-text `label` per code for the admin's own tracking.
4. Approach: Supabase table + Next.js API routes with service-role key (one repo,
   one deploy, atomic one-time semantics).

## Architecture

### Database — `access_codes` (Supabase, SQL migration run in SQL editor)

| column               | type        | notes                                   |
| -------------------- | ----------- | --------------------------------------- |
| `id`                 | uuid PK     | `gen_random_uuid()`                     |
| `code`               | text unique | stored normalized (no dash, uppercase)  |
| `label`              | text null   | admin's note, e.g. "Riya, paid 26 Aug"  |
| `status`             | text        | `active` \| `used` \| `revoked`         |
| `created_at`         | timestamptz | default now()                           |
| `used_at`            | timestamptz | null until redeemed                     |
| `used_by_student_id` | uuid null   | FK → students(id)                       |

RLS **enabled with no policies** → the browser anon key has zero access. Only the
server-side service-role client reads/writes this table.

### Code format

8 characters from the unambiguous alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
(no 0/O/1/I), displayed and emailed as `XXXX-XXXX`. Generated with
`crypto.randomBytes`, rejection-sampled so the distribution is uniform.
Input is normalized before lookup: uppercase, strip dashes/spaces.

### Server modules — `lib/server/`

- `supabase-admin.ts` — Supabase client built from `SUPABASE_SERVICE_ROLE_KEY`.
  Server-only (`import "server-only"`).
- `access-codes.ts` — `generateCode()` (pure), `normalizeCode()` (pure),
  `issueCode(label?)`, `listCodes()`, `revokeCode(id)`,
  `redeemCode(code, studentDetails)`.
- `admin-session.ts` — HMAC-signed session token (pure sign/verify over
  `ADMIN_SESSION_SECRET`), ~12h expiry, carried in an httpOnly cookie.

**Redemption is atomic**: a single
`UPDATE access_codes SET status='used', used_at=now(), used_by_student_id=… WHERE code=… AND status='active'`
(via one conditional update through the service client). Two racing redemptions of
the same code: exactly one wins.

`redeemCode` also **inserts the student row server-side** (name, email, phone,
discipline, course, education_level) and stamps `used_by_student_id`. The landing
page stops writing to Supabase from the browser.

### API routes — `app/api/`

| route                     | method | auth         | behavior                                                          |
| ------------------------- | ------ | ------------ | ----------------------------------------------------------------- |
| `/api/redeem`             | POST   | public       | `{code, name, email, phone, discipline, course, educationLevel}` → validates details, atomically consumes code, inserts student, returns `{studentId}`. Errors: `invalid_code`, `code_used`, `code_revoked`, `missing_fields`. |
| `/api/admin/login`        | POST   | password     | `{password}` vs `ADMIN_PASSWORD` → sets signed httpOnly cookie.   |
| `/api/admin/codes`        | GET    | admin cookie | list all codes, newest first.                                     |
| `/api/admin/codes`        | POST   | admin cookie | `{label?}` → issues and returns a fresh code.                     |
| `/api/admin/codes/revoke` | POST   | admin cookie | `{id}` → active → revoked.                                        |

Failed redeems return specific reasons; the route sleeps briefly on failure as a
cheap brute-force damper (codes are unguessable anyway).

### Landing page — `app/page.tsx`

- New required field **Security code** in the registration form.
- Submit calls `POST /api/redeem` (replaces the direct Supabase insert).
- Inline error copy: "That code isn't recognized — check for typos." /
  "This code has already been used." / "This code was cancelled."
- Success path unchanged: `setProfile(...)` → `/assessment`. The zustand store
  persists, so a refresh mid-test never re-asks for the code.

### Admin dashboard — `app/admin/page.tsx`

- No cookie → password login form. Wrong password → inline error.
- Dashboard: "Generate code" button + optional label input; the fresh code is shown
  large with a copy button; table of all codes (code, label, status badge, created,
  used-at) with Revoke on active rows. Styled with the existing UI kit.

### Environment variables (server-only, never NEXT_PUBLIC_)

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

These join the pending credential-rotation work from the v2 merge.

## Error handling

- Redeem endpoint validates required fields before touching the code, so a typo in
  the form never burns a code.
- Student insert failure after code consumption: the code update and the insert run
  in one server function; if the insert fails the code is flipped back to `active`
  (compensating update) and the client sees a retryable error.
- Admin routes return 401 on missing/expired cookie; the dashboard falls back to
  the login form.

## Testing

- Vitest (repo style, pure logic): code charset/format/uniqueness of `generateCode`,
  `normalizeCode` round-trips, admin-session sign/verify/expiry/tamper,
  redeem state-transition logic against a stubbed data layer.
- Manual E2E checklist: generate → redeem → same code again fails → revoke →
  revoked code fails → admin logout/expiry.

## Deliverables

1. SQL migration file (`supabase/migrations/`).
2. Server modules, API routes, landing-page gate, admin dashboard.
3. Tests green, typecheck clean.
4. `docs/access-codes-how-it-works.md` — plain-language operator's guide.
