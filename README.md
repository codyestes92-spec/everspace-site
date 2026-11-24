# Everspace Exhibits homepage redesign (draft v1)

A drop-in, single-page homepage: `index.html`, `styles.css`, `script.js`. No build step, no framework. It expects the existing `images/` folder from the current site (logo).

## Before going live
Everything that was a guess or needs real info is marked with `class="ph"` (dashed orange in the preview). Search the HTML for `ph` and replace each one, then the highlight disappears on its own.

1. **Phone number**: replace `(407) ___-____` (3 places) and every `tel:+10000000000` link.
2. **Quote form**: connect it to a form service (Formspree, Netlify Forms, Basin, or the site builder's form block). Simplest: add `data-endpoint="https://formspree.io/f/XXXX"` to `<form id="quote-form">`. Until then, the form only shows a "not connected" notice and sends nothing.
3. **Response time**: confirm "We reply within one business day" or change it.
4. **Booth sizes**: confirm what each package includes and fill in "Rentals from $___" (or delete the price line).
5. **Our work**: replace the six photo placeholders with real booth photos (compressed, WebP or JPG under ~300 KB) and real captions.
6. **Testimonials**: only real quotes from real clients, with permission.
7. **About**: owner or team photo, the "what makes us different" sentences, years in business, booths built.
8. **Hero video**: the hero shows a looping animation of a booth being built. To use real footage instead, add `media/hero.mp4` (a 10 to 20 second build timelapse, muted, 1280px wide, under about 5 MB) and `media/hero.jpg`, then follow the comment inside `<figure class="stage">` in index.html.
9. **SEO**: in `<head>`, add `telephone` and street address to the JSON-LD block (match the Google Business Profile exactly) The link-preview image (`brand/og-image.png`) points at everspaceexhibits.com, so it shows once the site is live on that domain.

## What changed vs. the current site
- Sticky header with nav, phone, and a "Get a free quote" button; mobile call/quote bar.
- Specific H1 headline and subheading instead of "Welcome to Everspace Exhibits".
- "How it works" in four steps, then the eight services with tighter copy.
- Booth sizes with to-scale floor plans, who each size suits, and quote buttons that pre-fill the form.
- Portfolio, testimonials, and About sections (placeholders for now).
- Quote request form plus clickable, copyable email.
- Meta description, Open Graph tags, LocalBusiness structured data, © 2026.
- Light and dark mode, keyboard focus styles, reduced-motion support.

## Brand files (`brand/`)
- `logo-dark.svg` for light backgrounds, `logo-light.svg` for dark backgrounds, `mark.svg` for the E mark alone.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` for browser tabs and phone home screens.
- `og-image.png` (1200×630) is the preview shown when the link is shared.
- Colors: navy #0f2533, orange #e8611a. Fonts: Archivo ExtraBold (name), JetBrains Mono (EXHIBITS).
