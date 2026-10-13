# Golden Crane

Golden Crane is a fictional Asian-fusion restaurant website based in Magdeburg,
Germany, created for the Mark Saville portfolio. It represents no operating
restaurant and provides no reservations, ordering, delivery or contact service.
The bilingual project disclosure appears in the shared footer.

## Stack and pages

Static HTML5, one shared CSS stylesheet, vanilla JavaScript and JSON. No build
step, package manager, backend or vendor JavaScript libraries are required.

- `index.html`: introduction, four menu highlights and a street map.
- `pages/menu-categories.html`: twelve-category overview.
- `pages/single-menus/*.html`: twelve category routes containing 153 dishes.
- `pages/about.html`: concept, culinary influences and design values.
- `pages/awards.html`: minimal bilingual compatibility page linking to About;
  no awards or certification claims remain.

## Menu and localization

`data/menu.json` is the authoritative menu dataset: currency `EUR`, categories
with stable IDs and localized names/introductions, and dish records with stable
IDs, codes, numeric prices, image paths and German/English names/descriptions.
Keep shared prices, IDs, codes and image associations consistent when editing.

`js/menu.js` fetches the dataset once per page load. Language changes update
existing cards and image alternatives without replacing photographs. German
category introductions and overview/highlight cards also appear in HTML as
fallbacks; synchronize them with the dataset when editing. Individual dishes
require JavaScript. Prices use German or English euro formatting.

`data/de.json` and `data/en.json` have matching interface and metadata keys.
German is the default. `js/i18n.js` caches dictionaries, persists the language
preference locally and updates text, attributes, document language and metadata.
Unavailable English translations fall back to German. Retain German HTML
fallbacks and matching placeholders such as `{category}` and `{count}`.

Mark text-only nodes with `data-i18n`; translated attributes use
`data-i18n-aria-label`, `data-i18n-title`, `data-i18n-alt` or
`data-i18n-placeholder`. `data-page` selects metadata. The shared
`GoldenCraneI18n` API exposes `ready`, `language`, `setLanguage`, `t`, `localized`,
`apply` and `setMetadataContext`, and emits `goldencrane:languagechange`.

## Themes and navigation

`css/golden-crane.css` defines the shared cream/forest-green and charcoal/sage
palettes, Playfair Display headings, Plus Jakarta Sans body text and components.
`js/theme.js` runs before stylesheets to apply the selected theme before paint.
It follows the OS until a manual choice is stored. CSS also follows the OS when
JavaScript is disabled. Language and theme storage are optional.

`js/navigation.js` provides mobile disclosure navigation, keyboard activation
and Escape handling. Navigation stays visible without JavaScript. Shared styles
provide visible focus and honor reduced-motion preferences.

## Google Maps

The homepage contains a standard HTML iframe for **Halberstädter Straße,
Magdeburg**, using the verified Google Maps Share → Embed URL. It identifies the
street generally, with no house number or Golden Crane business marker. The map
loads automatically and contacts Google on page load; there is no activation
script, API key or Maps JavaScript SDK in the application. Its accessible title
uses the existing localization system without recreating the iframe. A separate
Google Maps street link remains available. Google controls the embedded map's
own interface language and appearance.

## Images

The local crane logo and SVG favicon are `images/golden-crane.svg` and
`images/golden-crane-favicon.svg`. All 153 dish photographs and twelve category
photographs are retained with their original associations. Menu photos are
mostly 250 × 150px; two are 216 × 150px. Category photos are 200 × 200px and
remain capped at their native width. Native lazy loading and explicit image
sizes reduce unnecessary requests and layout movement.

Home and About temporarily reuse `images/jumbotron_*.jpg`, with 768/992/1200px
sources (16:9) cropped into a 4:3 editorial frame. Replace them in a later approved
image pass with conceptual dining/food imagery around **1600 × 1200px**;
2000 × 1500px is preferable for high-density screens. Review dish/photo matching
and small-image quality before final portfolio presentation. Do not upscale the
existing photos automatically.

Stitch references remain ignored and are not production assets. Legacy vendor
files, Glyphicon fonts, old branding/certification images and redundant code
have been removed after reference checks.

## Run locally and host

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 and stop the server with Ctrl+C. Use HTTP rather than
`file://`, because the site fetches JSON.

Deploy the repository's production files to any static HTTPS host, preserving
`index.html`, `pages/`, `css/`, `js/`, `data/` and `images/` and their relative
paths. Serve JSON as `application/json`, SVG as `image/svg+xml` and HTML/CSS/JS
with their normal MIME types. Support direct nested `.html` URLs without an SPA
rewrite. Exclude Git, editor settings and ignored design references from uploads.
Google Fonts and Google Maps require external network access; typography has
local system fallbacks. No production domain or hosting pipeline is configured
in the repository. No canonical URL, sitemap or LocalBusiness schema is assumed.
A hosting-level permanent Awards-to-About redirect is optional once a host is
chosen; the existing compatibility page already works.
