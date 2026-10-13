# Golden Crane

A fictional Asian-fusion restaurant concept based in Magdeburg, Germany, created
as a web development demonstration. It has no real premises, contact service,
reservations, ordering or delivery. The name **Golden Crane** stays the same in
German and English.

The site uses static HTML, shared CSS and vanilla JavaScript. German is the
default language; DE/EN and light/dark controls persist preferences locally.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Stop the server with Ctrl+C. No installation or build
step is required. Use HTTP rather than `file://`, because browsers restrict JSON
requests from files opened directly.

## Pages and migration status

- `index.html`: split hero, concept introduction, four existing menu highlights,
  general Magdeburg location link and fictional-project notice.
- `pages/about.html`: fictional concept, culinary influences, design values,
  crane motif and a menu link.
- `pages/menu-categories.html`: twelve categories with a 1/2/4-column overview.
- `pages/single-menus/*.html`: twelve category routes with 153 dishes altogether.
- `pages/awards.html`: minimal bilingual compatibility page linking to About.
  No awards or certification claims remain. No hosting redirect configuration
  exists in this repository; a permanent hosting-level redirect may replace the
  compatibility page later.

All production pages use `css/golden-crane.css` and native scripts. None loads
Bootstrap, jQuery, lazysizes or the old stylesheet. Their unused files remain for
Phase 6 cleanup, together with old logo/certification assets; they are not part
of the current page content.

## Editing menu content

`data/menu.json` contains `currency: "EUR"` and twelve category objects with
stable `id`, localized `name` and `introduction`, and an `items` array. Each dish
has a stable `id`, original `code`, numeric euro `price`, original `image` path,
and `name`/`description` objects containing `de` and `en` strings.

Edit text inside those localized objects; keep IDs, codes, image mappings and
prices shared. Numeric `14.9` and `14.90` mean the same amount. The renderer shows
`14,90 €` in German and `€14.90` in English. Names, descriptions and prices are
illustrative, not verified commercial or dietary information.

`js/menu.js` fetches the dataset once per page load. Category sections use
`data-category` and `data-menu-layout="cards"`. The overview uses
`data-menu-overview`; Home uses `data-menu-highlights` for Sushi, Noodles, Beef and
Specials. Language changes update text and image alternatives without replacing
photographs. Overview/highlight HTML includes German fallback cards: synchronize
those names, introductions and counts with the dataset when editing categories.

## Translation and theme conventions

`data/de.json` and `data/en.json` contain matching interface keys. Preserve
placeholders such as `{category}` and `{count}` in both languages. Put German
fallback text and accessibility labels directly in HTML.

`js/i18n.js` exposes `window.GoldenCraneI18n` with `ready`, `language`,
`setLanguage(language)`, `t(key, parameters, fallback)`, `localized(value)`,
`apply()` and `setMetadataContext(context)`. It caches dictionaries and emits
`goldencrane:languagechange`. Mark text-only elements with `data-i18n`; mark
attributes with `data-i18n-aria-label`, `data-i18n-title`, `data-i18n-alt` or
`data-i18n-placeholder`. Keep icons outside translated text elements.
`data-page` selects title and metadata translations.

Load `js/theme.js` synchronously in the head before stylesheets. It follows the
OS until a manual preference is stored and sets `data-theme` before painting.
CSS also follows the OS without JavaScript. `js/navigation.js` supplies mobile
disclosure navigation, Escape handling and visible keyboard focus. Without
JavaScript navigation remains visible and general page content stays German;
individual menu items require JavaScript.

## Branding and images

The shared decorative crane symbol is `images/golden-crane.svg`; the browser
icon is `images/golden-crane-favicon.svg`. Both are local, hand-authored vectors.
The brand link already has a translated accessible name, so the decorative
symbol does not add a duplicate spoken label.

Existing photographs have been preserved. Home and About temporarily reuse the
restaurant-interior photograph with 768/992/1200px sources. Captions explicitly
identify it as atmosphere inspiration, not actual Golden Crane premises.
Category photographs remain capped at 200 × 200 CSS pixels. Menu photographs
retain their original dataset associations; dish/photo matching still needs
review, and small sources may appear soft on high-density displays.

For a later approved image pass:

- Home hero: a contemporary Asian-fusion food or dining scene, approximately
  1600 × 1200px, with room for a 4:3 crop; 2000 × 1500px is preferable for sharper
  high-density presentation.
- About editorial image: a calm modern dining interior or tabletop detail,
  approximately 1600 × 1200px, presented explicitly as conceptual imagery.
- Review the original category and dish photos for quality and content fit.

No Stitch screenshots or Google-hosted reference photographs are used in
production. Stitch reference files remain unchanged and excluded from Git.

## Phase 6

Review and remove unused legacy vendor files, fonts, old logos/certification
images, the obsolete stylesheet and empty/unused scripts after checking all
references. Consider a hosting-level Awards-to-About redirect. Complete final
cross-browser, accessibility, image and deployment checks. No backend or build
pipeline is needed.
