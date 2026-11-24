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
8. **Hero image**: the line drawing of a booth is a stand-in; swap it for a real photo of an Everspace booth when there's a good one.
9. **SEO**: in `<head>`, add `telephone` and street address to the JSON-LD block (match the Google Business Profile exactly) and replace `og:image` with a 1200×630 booth photo.

## What changed vs. the current site
- Sticky header with nav, phone, and a "Get a free quote" button; mobile call/quote bar.
- Specific H1 headline and subheading instead of "Welcome to Everspace Exhibits".
- "How it works" in four steps, then the eight services with tighter copy.
- Booth sizes with to-scale floor plans, who each size suits, and quote buttons that pre-fill the form.
- Portfolio, testimonials, and About sections (placeholders for now).
- Quote request form plus clickable, copyable email.
- Meta description, Open Graph tags, LocalBusiness structured data, © 2026.
- Light and dark mode, keyboard focus styles, reduced-motion support.
