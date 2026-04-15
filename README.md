# PDF Toolkit — Free PDF tools that run in the browser

A complete, AdSense-ready website of PDF utilities. Nothing runs on a server — every tool processes files in the user's browser using open-source libraries. **Hosting costs: $0**.

## What's included

**Pages**
- `index.html` — landing page with a grid of 15 tools
- `about.html`, `privacy.html`, `terms.html`, `contact.html` — required for AdSense

**Working tools** (each in `tools/`)
1. Merge PDF
2. Split PDF (range / one-per-page ZIP)
3. Compress PDF
4. PDF → JPG (ZIP archive)
5. JPG → PDF
6. Rotate PDF
7. Organize PDF (reorder + delete pages visually)
8. PDF → Word (.docx, text extraction)
9. Word → PDF (.docx)
10. PDF → plain text
11. HTML → PDF
12. Add watermark
13. Add page numbers
14. Protect PDF (visible confidential stamp)
15. Unlock PDF (requires password you own)

## Run it locally

Because pages use absolute paths like `/css/style.css`, you need a local server (not `file://`). From the project folder:

```
# Python 3
python -m http.server 8000
```

Then open http://localhost:8000

Or install the VS Code extension "Live Server" and click "Go Live".

## Free hosting (pick one)

All three give free HTTPS, free subdomain, and auto-deploy from GitHub:

### Option A — Cloudflare Pages (recommended, fastest)
1. Push the folder to a free GitHub repo.
2. Go to https://dash.cloudflare.com → Pages → Connect to Git.
3. Framework preset: "None". Build command: leave empty. Output directory: `/`.
4. Deploy. You get `yourproject.pages.dev`.

### Option B — Netlify
1. Push to GitHub.
2. https://app.netlify.com → "Add new site" → "Import from Git".
3. Build command empty, publish directory `.`. Deploy.

### Option C — GitHub Pages
1. Push to GitHub.
2. Repo settings → Pages → Source: deploy from branch `main`, folder `/ (root)`.
3. Your site is live at `username.github.io/repo`.

## Get a free domain (optional but better for AdSense)

AdSense approves sites on free subdomains but it's much easier with a real domain.
- **Totally free:** http://freenom.com (.tk, .ml, .ga, .cf) — no credit card.
- **Cheap real domain:** Namecheap / Porkbun — $1–$10/year for .com.

Add your domain in Cloudflare Pages / Netlify / GitHub Pages under "Custom Domains".

## Enable Google AdSense (the money part)

1. **Wait until your site has real traffic** (AdSense rejects blank/new sites). Tips:
   - Share tools on Reddit (r/pdf, r/productivity), Facebook groups, Twitter.
   - Write 3–5 short blog posts in a `blog/` folder (e.g. "How to merge PDFs without Adobe"). Good for SEO.
   - Submit the site to Google Search Console so it gets indexed.

2. Sign up at https://adsense.google.com with the live URL.

3. When approved, Google gives you a script like:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>
   ```
   Paste it in the `<head>` of **every** HTML file (the line is already there in `index.html`, just commented out — uncomment and replace the publisher ID).

4. In `js/app.js`, find `renderAdSlot(...)` and replace the placeholder span with your real AdSense unit, for example:
   ```html
   <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-1234567890"
        data-ad-slot="YOUR-SLOT-ID"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```
   The `<div data-ad></div>` placeholders already sprinkled through every tool page will become live ad units automatically.

## How you'll actually make money

- **CPC/CPM rates** range from ~$0.10 to $5+ per 1000 impressions depending on country and niche.
- PDF tools traffic is mostly US/EU/India office workers — decent ad rates.
- Early: $1–$5/day with a few hundred users. Scaled with SEO: $50–$500+/day.

## Grow traffic (important — no traffic = no money)

1. **SEO**: each tool page already has a unique `<title>` and `<meta description>`. Add them to Google Search Console, submit `sitemap.xml`.
2. **Blog posts**: "How to merge PDFs on Chromebook", "Best free alternative to iLovePDF", etc. These rank.
3. **Backlinks**: post answers on Reddit and Quora linking to specific tools.
4. **Speed**: site is already fast (static + CDN libs). Run https://pagespeed.web.dev to verify.

## Customize

- Change brand name: edit `PDF<span>Toolkit</span>` in `js/app.js` and `<title>` tags.
- Change colors: edit the `:root` variables at top of `css/style.css`.
- Add a tool: duplicate `tools/merge-pdf.html`, add an entry to the `TOOLS` array in `js/app.js`.

## Libraries used (all MIT / Apache)

- [pdf-lib](https://pdf-lib.js.org/) — create/modify PDFs
- [pdf.js](https://mozilla.github.io/pdf.js/) — render/parse PDFs
- [JSZip](https://stuk.github.io/jszip/) — build ZIPs in the browser
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) — read .docx
- [docx](https://docx.js.org/) — write .docx
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) — render HTML to PDF

All loaded from unpkg CDN — no `npm install` needed.
