# Access codes — how it works

This is the operator's guide to the security-code system that gates the
assessment. If you generate codes, hand them to buyers, or ever need to
cancel one, this doc is for you.

## What this is

Nobody can start the assessment without a one-time security code. You
generate codes from a private admin page, send one to each buyer (over
WhatsApp, email, wherever you already talk to them), and the code lets them
through the landing page exactly once. Once it's used, it's burned — nobody
can reuse it, including the same buyer.

A code looks like `XR4K-92QP`: eight characters, shown with a dash in the
middle for readability. The alphabet skips `0`/`O` and `1`/`I` on purpose, so
a code never gets misread when someone reads it aloud. Students can type it
in any case and with or without the dash — the system normalizes it before
checking.

## One-time setup

Do this once, before the first code ever needs to go out.

**1. Run the database migration.** Open the Supabase SQL editor for the
project and run `supabase/migrations/2026-08-27-access-codes.sql`. This is
the same manual workflow already used for other schema changes on this
project — there's no automated migration runner. It creates the
`access_codes` table and locks it down with row-level security and no
policies, so only the server (using the service-role key below) can ever
touch it — not the browser, not the anon key.

**2. Set three environment variables**, locally in `.env.local` and again in
the hosting provider's environment settings for production:

```bash
# --- Access codes (server-only; never expose with NEXT_PUBLIC_) ---
# Supabase → Project Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=
# Password for /admin (pick a long one)
ADMIN_PASSWORD=
# Random secret for signing admin session cookies, e.g.: openssl rand -hex 32
ADMIN_SESSION_SECRET=
```

- `SUPABASE_SERVICE_ROLE_KEY` comes from Supabase → Project Settings → API.
  It's the key that bypasses row-level security, which is exactly why the
  table has none — treat this key like a password to the whole database.
- `ADMIN_PASSWORD` is what you type to log into `/admin`. Make it long; it's
  the only thing standing between the internet and your code generator.
- `ADMIN_SESSION_SECRET` signs the admin login cookie so it can't be forged.
  Generate one with `openssl rand -hex 32` (or any long random string) and
  never reuse it elsewhere.

A full template with these (plus the existing Supabase public keys) lives in
`.env.example` at the repo root — copy it to `.env.local` and fill in the
blanks.

None of these three are ever sent to the browser. If any is missing, the
admin login and the redeem endpoint fail closed with a server error rather
than silently letting requests through.

## The daily flow

This is what you'll actually do, day to day:

1. **Open `/admin`** and log in with `ADMIN_PASSWORD`. The session lasts 12
   hours, so you won't need to log in again mid-day.
2. **Generate a code.** Optionally type a label first — something that'll
   remind you who it's for later, like `Riya, paid 26 Aug UPI`. Click
   Generate.
3. **Copy the code.** It appears in a green box as `XXXX-XXXX` with a copy
   button next to it.
4. **Send it to the buyer** however you normally reach them.
5. **The student enters it** on the landing page, in the required SECURITY
   CODE field, alongside their name and other details. Submitting the form
   redeems the code and drops them straight into the assessment — there's no
   separate "activate" step.
6. **The table updates.** Refresh (or just glance at the row) and the code
   flips from `active` to `used`, with a timestamp showing when.

Every code you've ever generated stays listed in the table below the
generator, most recent activity visible at a glance.

## What the statuses mean

| Status | Meaning |
|---|---|
| **active** | Generated, not yet used. Still redeemable. |
| **used** | A student has already entered it and started the assessment. Can't be reused. |
| **revoked** | You cancelled it before anyone used it. Permanently dead — cannot be un-revoked. |

## Cancelling a code

Sent someone a code by mistake, or a buyer backed out after paying by a
method you want to void? Find the row in the table (it must still be
`active`) and click the cancel icon. It flips to `revoked` immediately and
can never be redeemed — there's no undo, so if you revoke by mistake, just
generate a fresh code instead.

## What students see if something goes wrong

The system is designed so the student always gets a clear, honest reason —
never a blank error:

- **Typo or made-up code** — "That code isn't recognized — check for typos."
- **Code already used** — "This code has already been used."
- **Code was revoked** — "This code was cancelled. Contact Secure Steps."
- **Anything else** (network hiccup, database problem, unexpected server
  failure) — "Something went wrong — please try again."

That last case is also the safety net for infrastructure failures. If the
code is validly claimed but something goes wrong saving the student's
details, the system automatically hands the code back so it's `active`
again — the buyer never loses a code to a server hiccup. They just try
again.

## First-time verification (do this before sending real codes)

Once the migration has been run and the three env vars are set in
`.env.local`, walk through this checklist end to end before trusting the
system with a real buyer:

1. Run `npm run dev`, open `/admin` — you should land on a login form. Enter
   the wrong password — expect "Wrong password."
2. Log in with the real password — you should land on the dashboard.
   Generate a code with the label "e2e test" — it should appear as
   `XXXX-XXXX`, the copy button should work, and the table row should read
   `active`.
3. Go to the landing page, fill in the student details plus that code, and
   submit — it should drop you into `/assessment`, and back on the
   dashboard the row should now read `used` with a timestamp.
4. Try the same code again on the landing page, from a fresh browser or
   incognito window — expect "This code has already been used."
5. Generate a second code, revoke it from the dashboard, then try it on the
   landing page — expect "This code was cancelled."
6. Try a made-up code — expect "That code isn't recognized."

This checklist has not been run yet as of this write-up — it needs Supabase
credentials and the migration applied, neither of which was available while
writing this doc. Run it once before the first real code goes out.

## What's next (not built yet)

Two extensions are anticipated but intentionally out of scope for now:

- **Online payment.** A payment webhook route could call the same
  `issueCode()` function (in `lib/server/access-codes.ts`) that the admin
  dashboard uses today, so a successful payment mints a code automatically
  instead of you doing it by hand.
- **Auto-email delivery.** A `sendEmail()` helper could sit next to
  `issueCode()` and email the code straight to the buyer instead of you
  copying and sending it manually.

Neither exists today — codes are generated and delivered by hand, which is
the current (and, for now, intended) workflow.
