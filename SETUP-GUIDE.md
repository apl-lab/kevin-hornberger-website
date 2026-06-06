# Going Live with Git + a Simple News Editor — Setup Guide

This guide takes the site from "drag-and-drop test" to a real, self-updating website where Kevin can publish News posts from a simple login page — no code, no folder-dragging.

**You only do the account/approval steps. Everything technical (the builder, templates, the editor, all 38 posts) is already done and tested.**

Here's the shape of it:

> Your site files live on **GitHub** (free online storage with history) → **Netlify** watches GitHub and automatically rebuilds and publishes the site whenever anything changes → **Decap CMS** gives Kevin a `/admin` login to write posts, which save back to GitHub and appear on the site a minute later.

---

## What's already built (no action needed)

- A "builder" (Eleventy) that turns simple text posts into styled News pages matching the site.
- A **News section**: an index at `/news/` plus a page for each post, linked from every menu.
- All **38 existing posts** converted to editable text, with all images and videos preserved.
- The **editor** (`/admin`) Kevin will log into.
- Build settings (`netlify.toml`) so Netlify knows how to publish.

---

## Step 1 — Create a free GitHub account

1. Go to **github.com** and click **Sign up**.
2. Use the campaign email and pick a username (e.g. `friends-of-hornberger`).
3. Choose the **Free** plan. (You'll set your own password — I can't do that part for you.)

> Tell me when this is done and I can walk you through the rest live in your browser.

## Step 2 — Put the website on GitHub

Easiest non-technical way is the **GitHub Desktop** app:

1. Download from **desktop.github.com**, install, and sign in with your new account.
2. Choose **Add → Add Existing Repository**, and select this folder
   (`Kevin Hornberger Website DEPLOY`).
3. When prompted, let it **create the repository**, then click **Publish repository**
   (keep it **Private** if you prefer).

The `.gitignore` I added means the bulky build files are skipped automatically — only the real source gets uploaded.

## Step 3 — Connect Netlify to GitHub

1. In Netlify, choose **Add new site → Import an existing project → GitHub**.
2. Authorize Netlify and pick the repository you just published.
3. Netlify reads `netlify.toml` automatically, so the build settings should fill in:
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
4. Click **Deploy**. In ~1 minute you'll have the full site — News section included — on a Netlify URL.

> From here on, any change on GitHub auto-publishes. The old drag-and-drop test site can be deleted.

## Step 4 — Turn on the signup form (Mailchimp)

The volunteer signup form uses a function that needs three secret keys. In your Netlify site:

1. Go to **Site configuration → Environment variables**.
2. Add these three (values come from your Mailchimp account):
   - `MAILCHIMP_API_KEY`
   - `MAILCHIMP_SERVER` (e.g. `us20`)
   - `MAILCHIMP_LIST_ID`
3. Trigger a redeploy. The form will then subscribe people for real.

## Step 5 — Turn on the News editor (`/admin`)

1. In `admin/config.yml`, replace `OWNER/REPO` with your actual GitHub account and
   repository name (e.g. `friends-of-hornberger/kevin-hornberger-website`), then save/commit.
2. The editor needs permission to log in with GitHub. This involves registering a quick
   "OAuth" connection between GitHub and Netlify — the exact screens change often, so
   **this is the one step I'd recommend we do together live**; I'll drive your browser and
   it takes about five minutes.
3. Once connected, Kevin visits **yoursite.com/admin**, clicks **Login with GitHub**, and
   he's in.

## Step 6 — Point the real domain (when you're ready)

When you want kevinhornberger.org to show the new site, you'll add it as a custom domain in
Netlify and update the domain's DNS. You mentioned you'll handle DNS — happy to prepare the
exact records when it's time.

---

## How Kevin publishes a post (day-to-day)

1. Go to **yoursite.com/admin** and log in.
2. Click **News & Updates → New News Post**.
3. Fill in **Title**, **Date**, pick **Categories** (News and/or Updates), a short **URL slug**,
   and write the **Body** (with formatting and image uploads built in).
4. Click **Publish**. A minute later it's live on the News page — newest first, automatically.

That's it. No files, no code, no dragging.
