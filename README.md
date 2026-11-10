# Crystal Car Clinic: website

A single-page, static site for a premium mobile car detailing business in Perth, WA.
Plain HTML, CSS and JavaScript with no build step and no frameworks, so it loads fast on any device and hosts anywhere.

```
index.html            All page content and SEO metadata
assets/css/styles.css Design tokens (colours, type, spacing, motion) and all styles
assets/js/main.js     Interactions, quote wizard, and the editable PRICES / ZONES / SUBURBS data
assets/img/            favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.png (link previews)
assets/brand/          Logo files (see "Brand files" below)
serve.mjs             Optional local preview server (`node serve.mjs`, then http://localhost:5173)
```

## Brand files (`assets/brand/`)

The logo is the **low-poly crystal drop**: an angular droplet made of six solid facets, lit from the top left (pale lilac and ice at the crown, deepening to violet and blue at the base), beside "Crystal" (Instrument Serif) over "CAR CLINIC" (Manrope SemiBold, wide tracking). The drop runs from the cap height of the "C" to the baseline of "CAR CLINIC", overshooting each by about half a pixel at header size; the gap to the wordmark is about a third of the drop's height. On the site, a wave of light passes down the facets and a highlight runs around the outline on load and on hover.

| File | Use |
|---|---|
| `crystal-car-clinic-logo-on-dark.svg` / `.png` | Full-colour logo for dark backgrounds (website, socials) |
| `crystal-car-clinic-logo-on-light.svg` / `.png` | Full-colour logo for white/light backgrounds (invoices, quotes, documents), using a deeper palette so every facet stays visible on white |
| `crystal-car-clinic-logo-white.svg` / `-black.svg` | One-colour logo for decals, embroidery, stamps and single-colour print: the facets are separated by thin cut-out gaps instead of colour |
| `crystal-car-clinic-mark-colour.svg` / `-colour-on-light.svg` | The drop on its own, full colour, for dark / light backgrounds |
| `crystal-car-clinic-mark-white.svg` / `-ice.svg` / `-black.svg` | The drop on its own, one colour |
| `crystal-car-clinic-profile-1080.png` | Square profile picture for Instagram, Facebook and Google Business Profile |

PNGs are 2400px wide on transparent backgrounds. The lockup SVGs embed the two web fonts so they render correctly in browsers; **for a print shop or sign writer, ask them to convert the text to outlines** (a one-click step in Illustrator or Affinity), or send the PNG.

## Before launch: replace the placeholders

| What | Where |
|---|---|
| Phone `0491 570 156` (an ACMA-reserved fictional number) | Search `0491 570 156` and `+61491570156` in `index.html` |
| Email `hello@crystalcarclinic.com.au` | `index.html` (FAQ, footer, JSON-LD) |
| ABN `00 000 000 000` | Footer in `index.html` |
| Domain `www.crystalcarclinic.com.au` | `<link rel="canonical">` and JSON-LD in `index.html` |
| Stats (2,400+ vehicles, 5.0 rating, 180+ reviews) | Intro and reviews sections in `index.html` |
| Testimonials | Reviews section: replace with real Google reviews (with permission) |
| Instagram / Facebook links | Footer `href="#"` |
| Prices, add-ons, travel zones, suburb list | Top of `assets/js/main.js` **and** the matching numbers in `index.html` |
| Photos | Six curated Unsplash photos (no visible car-brand badges) in `index.html`. Every photo gets the same cool monochrome grade from the `--grade` token in `styles.css`, so your own shots will match automatically when you swap them in. |
| Before/after slider | Currently a simulated "before" made with CSS filters. Use a real before/after pair when available. |

## Receiving quote requests

The form runs in **demo mode** until it's connected to a form service:

1. Create a free form at [formspree.io](https://formspree.io) using your business email.
2. Copy the form ID (e.g. `xyzabcd`).
3. In `index.html`, replace `your-form-id` in `action="https://formspree.io/f/your-form-id"`.

Each submission includes a readable summary line (vehicle, service, extras, suburb/zone, preferred time, estimate) plus the individual fields. A honeypot field filters basic spam.

## Deploying

The site is hosted on **GitHub Pages** from [github.com/daniellbaii/crystal-car-clinic](https://github.com/daniellbaii/crystal-car-clinic) (branch `main`, root folder), at <https://daniellbaii.github.io/crystal-car-clinic/>. Every push to `main` republishes the site within a minute or two. `.nojekyll` tells GitHub Pages to serve the files as-is.

**Connecting crystalcarclinic.com.au later:** add the domain under the repository's *Settings → Pages → Custom domain*, point your DNS at GitHub Pages as that page instructs, then replace `https://daniellbaii.github.io/crystal-car-clinic/` with `https://www.crystalcarclinic.com.au/` in `index.html` (canonical link, social tags and structured data).

It also works unchanged on Netlify, Cloudflare Pages or any static host. No build step is needed.

## Built-in quality

- **Design system:** the violet/blue gradient is reserved for primary buttons and the one hero word; ice-white is the single detail accent; a diamond "facet" shape is the recurring motif (section labels, slider handle, process markers); sections carry editorial numbers (01–08).
- **Performance:** no JS frameworks; hero text and photo paint immediately (nothing is hidden for an entrance animation); responsive `srcset` images served as AVIF/WebP by Unsplash; lazy loading below the fold; one hero photo, shown whole with the car framed to the right of the headline (smaller on phones, beside "Showroom clarity,"); animations use only `transform`/`opacity`.
- **Fonts:** Instrument Serif (regular + italic) and Manrope (variable, 400–700) are self-hosted in `assets/fonts/` (latin subset, 67 KB total, SIL Open Font License), preloaded, with `font-display: swap`. Size-matched fallback fonts mean the layout doesn't shift when they arrive. The site makes no requests to Google.
- **Glint words:** "clarity," (crystal gradient) and the section words "finish", "a reflection" and "shine" (brushed silver) carry a prismatic highlight. On desktop it fades in when the cursor comes within ~220px and eases along the word to follow it; on touch screens each section word sweeps once as it comes into view; "clarity," also sweeps once on load. To add the effect to another word, give its element `class="glint-word glint-silver" data-glint`.
- **Micro-interactions:** the crystal-drop logo's facets glint once on load and on mouse hover or keyboard focus (not on click); package prices and the quote estimate roll digit by digit; the vehicle-size pill stretches like liquid and inverts the label beneath it; on desktop, phone and email links copy to the clipboard with a confirmation; each section label's diamond glints once when the section is well into view, and one nav underline slides between links; the gallery lightbox fades in and out. The header stays fixed at the top while scrolling.
- **Motion (deliberately few moments):** a one-time glint on "clarity" in the hero, animated price changes between vehicle sizes, the ceramic before/after with a one-time drag hint, the process line drawing as you scroll, gentle depth in the gallery photos, and small hover details. There are no scroll-triggered fade-ins and no looping background animations. Everything is disabled under `prefers-reduced-motion`.
- **Phones:** swipeable package cards (opening on the most popular package), a full-height ceramic slider that never blocks vertical scrolling, a zone list instead of the map, a sticky Call / Estimate bar, and swipe between reviews.
- **Accessibility:** skip link, semantic landmarks, visible focus rings, keyboard-operable before/after slider (native range input), focus-trapped mobile menu, native `<dialog>` lightbox, labelled form fields with inline errors announced to screen readers, and a pause button on the moving marquee.
- **Local SEO:** `AutoWash` structured data (with logo), Perth suburbs in content, Open Graph and Twitter tags with a branded 1200×630 link-preview image.
