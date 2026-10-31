# Golden Crane — Development Handbook

Implementation reference for the completed fictional restaurant portfolio site. For operating procedures, see the [Operations Runbook](operations-runbook.md); the [README](../README.md) remains the public overview.

## Scope and evidence

Golden Crane is a static HTML/CSS/JavaScript website with German/English content, 153 dishes in 12 categories, theme selection and a Magdeburg location view. It has no backend, booking, ordering, authentication or database. The restaurant and menu are demonstration content.

This handbook describes current source. It does not reconstruct the original implementation history or infer historical motivations. Owner-reported evidence at retrospective finalization includes successful Cloudflare Pages deployment, mobile Lighthouse Performance 93, earlier Accessibility 100 / Best Practices 100 / SEO 92, and accepted browser functionality and appearance. These reports are separate from the structural verification script and are not new measurements.

## Structure and page conventions

| Path | Responsibility |
| --- | --- |
| `index.html` | Homepage, category highlights and Maps location section |
| `pages/menu-categories.html` | All category cards, with German HTML fallbacks |
| `pages/single-menus/*.html` | Twelve category shells; dishes are rendered from JSON |
| `pages/about.html`, `pages/awards.html` | Concept page and retained compatibility page linking to About |
| `css/golden-crane.css` | Shared tokens, themes, layout and component styles |
| `js/` | Theme, localization, navigation and menu scripts |
| `data/` | Menu dataset and shared translation dictionaries |
| `images/` | Dish/category photographs, responsive interior images, crane and favicon SVGs |
| `tests/verify.mjs` | Offline structural verification using Node built-ins |

Pages use German initial markup, `lang="de"`, a `data-page` metadata identifier and shared classes. Full pages repeat header/footer markup: there is no template compilation. When changing shared navigation, update every affected page. The Awards page is a deliberately smaller compatibility page, not an automatic redirect; retain its historical route.

`theme.js` runs synchronously in the head. Localization and navigation scripts are deferred; menu-enabled pages also defer `menu.js` after localization. Keep that ordering. HTML provides navigation, headings and status text before JSON is available; category dish cards require JavaScript.

## Menu architecture and data flow

[data/menu.json](../data/menu.json) is the source of truth for dishes:

| Field | Contract |
| --- | --- |
| `currency` | `EUR` |
| `categories` | Nonempty array of category objects |
| Category `id` | Unique identifier matching its page filename and `data-category` |
| Category `name`, `introduction` | Objects containing nonempty `de` and `en` strings |
| Category `items` | Nonempty array of dishes |
| Dish `id`, `code` | Nonempty strings; each unique across the dataset |
| Dish `name`, `description` | Nonempty `de` and `en` strings |
| Dish `price` | Positive numeric euro amount |
| Dish `image` | Repository-root-relative local image path |

Category photographs follow `images/menu-category-tiles/menu-<category-id>.jpg`; they are referenced in HTML rather than stored in the JSON. Dish IDs need not use exactly the category ID spelling: `fried_rice` contains IDs such as `fried-rice-01`.

`js/menu.js` selects the category, overview or highlights container, waits for localization readiness and fetches the dataset once per page. It validates the relevant data before rendering. Category dishes are assembled in a document fragment with text assigned through `textContent`; prices use `Intl.NumberFormat` with EUR and the selected language. Image dimensions, eager loading for the first two dishes and lazy loading thereafter support stable layouts. Loading/error messages and `aria-busy` communicate state.

Overview and homepage cards remain authored HTML. The renderer updates their names, introductions, counts and image alternatives. Category fallback counts/headings and summary totals therefore need to stay synchronized with JSON. Language changes update existing dish text, prices and alternatives without refetching the menu or recreating images.

## Localization, themes and navigation

`js/i18n.js` exposes `window.GoldenCraneI18n`. It caches dictionary-fetch promises for the current page, reads dot-separated keys and substitutes named placeholders such as `{count}`. `data-i18n` updates text; attribute variants update accessible labels, titles, alternatives and placeholders. Metadata uses `data-page`; category metadata waits for the category name from menu data.

Lookup falls back from the active dictionary to German, then to supplied/original HTML text. Menu-localized values also fall back to German. A failed English dictionary request selects German. Failed requests resolve to an empty cached dictionary, so retrying a transient failure requires a reload. A revision counter prevents an older language request from replacing a newer choice. `golden-crane-language` in local storage persists selection when storage is available; caching does not persist across page loads.

`js/theme.js` applies `data-theme` before first paint to honor `golden-crane-theme`. Without a saved selection, it follows `prefers-color-scheme` and subsequent system changes. Manual selection persists and takes precedence; storage failures are tolerated. CSS also supplies a system-theme fallback without JavaScript. Both themes color the crane through `--gc-gold` and the same external SVG mask.

`js/navigation.js` coordinates visibility and `aria-expanded` at the 960px navigation breakpoint. It closes the mobile menu on link activation or Escape, restores focus on Escape and handles focus when switching from desktop to mobile. Shared CSS supplies visible focus, skip links, responsive grids and reduced-motion support. Pressed states identify selected language/theme controls. These implementation choices still need browser acceptance; structural checks do not prove accessibility.

## Paths, external resources and trade-offs

HTML links use relative paths appropriate to each nesting depth. CSS URLs resolve relative to the stylesheet. Menu and localization scripts derive the site root with `new URL('../', document.currentScript.src)`, then resolve JSON and dish image paths from it. This avoids dependence on the local directory or GitHub repository name. Preserve these conventions when adding a page; do not resolve JSON relative to a nested document.

The homepage preloads `images/golden-crane.svg` with high priority and anonymous CORS matching the mask fetch. The design remains CSS-driven. The Maps iframe is lazy-loaded and has a separate street link; preserve its verified Halberstädter Straße URL. Google Fonts supplies Playfair Display 500/600 and Plus Jakarta Sans 400/600 with `display=swap` and local fallback fonts.

The current architecture keeps static deployment and native browser APIs, with no package installation or build step. Its trade-offs are repeated HTML, synchronized fallback content and JavaScript-dependent dish rendering. Client-side language selection keeps one URL per page; it does not provide separate indexable language routes. External fonts/maps remain provider-dependent. These are current consequences, not reconstructed historical decisions.

## Recorded issues and verification

No significant application incidents are established by the available finalization evidence.

Use a local HTTP server and run `node tests/verify.mjs`; prerequisites and commands are in the [runbook](operations-runbook.md#local-development-and-verification). The script checks menu integrity, translation parity/placeholders/references, HTML/CSS paths, category fallbacks and syntax of all four application scripts. It does not execute their behavior, fetch external services or measure performance. This dependency-free scope was explicitly approved for this stage.

## Maintenance entry points and limitations

- For dish changes, update JSON and photographs, then reconcile affected HTML counts/headings and dictionary summaries before verification.
- For localization changes, update both dictionaries, placeholders and German HTML fallbacks. New dynamically constructed translation keys require an explicit verification rule.
- For new categories, add the JSON entry, photograph, category page and overview card; update totals and relevant highlights deliberately.
- For shared UI changes, review every repeated page shell and recheck keyboard, themes and responsive behavior.
- Documentation and verification changes do not authorize framework adoption, new functionality or deployment changes.

Ingredient/allergen information cannot be inferred reliably from the fictional names or photographs. There is no automated behavior suite or CI workflow. Deployment settings and recovery remain subject to the owner confirmations listed in the runbook. No additional feature work is approved here.

Evidence sources are the maintained files listed above, the verification script and owner reports explicitly attributed in this document. Review these handbooks after a significant implementation phase; do not use them as daily task logs.
