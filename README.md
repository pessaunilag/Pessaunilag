# PESSA UNILAG website

The official website of the Physical and Earth Sciences Students' Association, University of Lagos, with a built-in editor for the executives.

- Public site: every page is rendered on the server from the content in the database.
- Editor (`/admin`): sign in and edit everything: news, events, spotlight, executives, departments, gallery, resources, sponsorship tiers, site settings. No code.
- Inbox: every website form (nominations, suggestions, alumni sign-ups, contact, sponsorship enquiries) is stored and emailed to the PESSA inbox.
- Departmental news: each department page shows PESSA stories tagged with that department plus the latest posts fetched automatically from the department's own association website, every day.

Runs on free tiers only: Vercel (hosting), Supabase (database + photo storage), Resend (email).

---

## 1. One-time setup (about 30 minutes)

You need: the PESSA GitHub account, Vercel, Supabase and Resend accounts (all created with pessaunilag@gmail.com).

### 1.1 Put the code on GitHub
Create a repository called `pessa-unilag` on the PESSA GitHub account and upload this folder (or push it with git). Do not upload the `node_modules`, `.next` or `.env` folders/files.

### 1.2 Supabase (database and photos)
1. Create a new project (free plan). Pick a region close to Nigeria, for example **West EU (Ireland)**. Save the database password you choose.
2. **Database connection string**: Project Settings > Database > Connection string > choose **Transaction** pooler (port 6543), copy the URI, replace `[YOUR-PASSWORD]`. This is `DATABASE_URL`.
3. **Photo storage**: Storage > New bucket > name `media`, tick **Public bucket**, create.
4. **S3 access keys**: Project Settings > Storage > "S3 Connection" > note the **Endpoint** (`S3_ENDPOINT`) and **Region** (`S3_REGION`), then "New access key" > copy the **Access key ID** and **Secret access key** (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`).
5. `S3_PUBLIC_URL` is `https://<project-ref>.supabase.co/storage/v1/object/public/media` (the project ref is the first part of your Supabase project URL).

### 1.3 Resend (email notifications)
1. Create an API key: API Keys > Create > copy it (`RESEND_API_KEY`).
2. Without a custom domain, Resend only delivers to the email address the Resend account was created with. That is why the Resend account must be created with **pessaunilag@gmail.com**. Sender stays `onboarding@resend.dev`.
   (If PESSA later gets its own domain, verify it in Resend and change `RESEND_FROM_EMAIL`.)

### 1.4 Vercel (hosting)
1. Add New > Project > import the `pessa-unilag` repository from GitHub.
2. Framework: Next.js (auto-detected). Build command and output: leave the defaults (`pnpm build`).
3. **Environment variables**: add every variable from `.env.example` with the real values:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler URI (step 1.2) |
| `PAYLOAD_SECRET` | any long random text, for example 40 random letters and numbers |
| `SITE_URL` | `https://pessaunilag.vercel.app` (your Vercel address) |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET` (= `media`), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | from step 1.2 |
| `RESEND_API_KEY` | from step 1.3 |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` |
| `RESEND_FROM_NAME` | `PESSA UNILAG website` |
| `NOTIFY_EMAIL` | `pessaunilag@gmail.com` |
| `CRON_SECRET` | another long random text |

4. Deploy. The first build creates all the database tables automatically (migrations run as part of the build).
5. Project Settings > General > change the project name to `pessaunilag` so the address becomes `https://pessaunilag.vercel.app`, and set `SITE_URL` to match (then redeploy).

### 1.5 First sign-in and content import
1. Open `https://pessaunilag.vercel.app/admin`. Create the first account (this is the President's admin account).
2. On the dashboard click **"Import the current site content (one time)"**. This brings in every story, event, executive, department, photo, tier and setting from the previous site. It takes about a minute.
3. Open the website. Done.

### 1.6 Add the other executives
Admin > Team (website editors) > Create new. Role **Editor** can edit all content; **Admin** can also manage the team. They sign in at `/admin`.

---

## 2. Everyday use

- **Edit anything**: sign in at `/admin`, pick the section on the left, edit, click **Save** (or **Publish** for news, events, spotlight, articles, opportunities, merchandise and newsletters). It is live immediately.
- **Edit from the website**: while signed in, open the public site. Every item shows an edit button that opens it in the admin; every photo shows "Change photo".
- **Drafts**: news, events, spotlights, articles, announcements, newsletters, opportunities and merchandise can be saved as drafts and published later. The site only shows published items.
- **Photos**: upload once in "Photos & files" or directly on the item. Photos are resized automatically. Any photo used on an item is added to the Gallery on its own (untick "Also show this photo in the Gallery" on the photo to hide it).
- **Order of executives, departments, reps, partners, tiers, FAQs**: drag the rows in the list.
- **Inbox**: Admin > Inbox. Mark items Seen or Done, add internal notes. A copy of every submission is emailed to the PESSA inbox. Alumni sign-ups also create a draft under Alumni: check it and click Publish to show it on the site.
- **Announcement bar** (top of every page): Site settings > Announcement bar. Leave empty to hide it.
- **Department pages**: tag any story, event, announcement or gallery photo with a department and it appears on that department's page automatically.
- **Departmental association news**: Departments > open a department > add the "Association website". Every day at 06:00 (Lagos) the site fetches their latest posts and shows them on that department page with a link back to their site. "Fetch departmental news now" on the dashboard runs it immediately. Posts can be hidden under "Posts from departmental sites".

---

## 3. Limits of the free tiers (so nothing surprises you)

- **Supabase** pauses a free project after 7 days without activity. The daily fetch job keeps it active. If it ever pauses, open the Supabase dashboard and click Restore.
- **Vercel Hobby** runs scheduled jobs once a day and allows 60 seconds per request. The daily fetch is built to stay within that.
- **Resend** free: 100 emails a day, 3,000 a month, delivered only to the account's own address until a domain is verified.
- **Vercel Hobby** is for non-commercial use; a students' association website is fine.
- Visitors may see a change up to 30 seconds late (edge cache). Signed-in editors always see the live data.

---

## 4. For developers

```bash
pnpm install
cp .env.example .env          # fill in at least DATABASE_URL and PAYLOAD_SECRET (a local Postgres works)
pnpm migrate                  # create the tables
pnpm dev                      # http://localhost:3000 (site) and /admin
```

- `src/site/legacy/` is the public-site renderer (plain JavaScript + CSS). It runs on the server for every request and again in the browser for navigation and animation. `scripts/build-site.mjs` bundles it (runs automatically before `dev` and `build`).
- `src/collections/` and `src/globals/Settings.ts` define what editors can edit. After changing fields: `pnpm migrate:create <name>` to add a migration, then commit it.
- `src/site/state.ts` turns database records into the JSON the renderer uses. `src/lib/fetchExternal.ts` is the departmental-news fetcher. `src/lib/seed.ts` is the one-time import.
- Public pages are cached with the tag `pessa-site` and expired on every save.
