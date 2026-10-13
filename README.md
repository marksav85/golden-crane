# Restaurant Website Project

This is a website project for a restaurant showcasing its menu, contact information, and providing a responsive user experience. The project is built using HTML, CSS, JavaScript, and Bootstrap.

## Features

- **Menu Page:** Explore our delicious offerings with detailed descriptions and images.
- **Contact Information:** Find our address, phone number, email address and location in google maps for inquiries and reservations.
- **Responsive Design:** Enjoy a seamless browsing experience across various devices and screen sizes.

## Technologies Used

- **HTML:** Used for structuring the content of the website.
- **CSS:** Utilized for styling and enhancing the visual appeal.
- **JavaScript:** Implemented for dynamic functionality and interactions.
- **Bootstrap:** Employed for responsive design components and layout utilities.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 and follow the menu links. Stop the server with Ctrl+C.
No installation or build step is required. Use HTTP rather than opening HTML files
directly: browsers restrict the JSON fetch when using `file://`.

## Editing the menu

`data/menu.json` is the source of truth for all 153 dishes in twelve categories.
Its top-level `currency` is `EUR`, and `categories` contains objects with an `id`,
display `name`, and `items` array. Each item has:

- `id`: a unique stable identifier, such as `beef-01`.
- `code`: the preserved menu code, such as `B01`.
- `name` and `description`: localized `de`/`en` objects for dish titles and descriptions.
- `price`: a positive number in euros, such as `14.90`, without a currency symbol.
- `image`: the existing photograph path relative to the website root.

Edit names, descriptions and prices directly in JSON. Keep identifiers, codes,
category IDs and image mappings stable. Use valid JSON with double quotes and no
trailing commas. Numeric `14.9` and `14.90` mean the same amount; the renderer
always displays two decimal places, for example `14,90 €` in German or `€14.90` in English.

Each category page selects its data through the menu section's `data-category`
attribute. `js/menu.js` fetches the dataset and builds the existing Bootstrap
card structure using DOM elements. A failed request or invalid category displays
a clear error message. JavaScript is required to display the menu items.

The destination-inspired dish names, ingredient descriptions and fixed prices
are fictional demonstration content, not authentic regional recipe claims or
verified commercial information. Photographs retain their original item order
and have not been visually identified for this refactor; review dish/photo
pairings before presenting them as accurate. Each dish now has one displayed
price, replacing the old randomly generated small/large prices. No verified
dietary or allergen labels are provided. Interface dictionaries include a
demonstration allergen notice for use as pages are migrated.

## Phase 2: shared foundation

The new brand is **Golden Crane**, a fictional Asian-fusion concept in Magdeburg.
Migration is incremental: **only `pages/single-menus/beef.html` currently has the
new header/footer, DE/EN and light/dark controls, and `css/golden-crane.css`.**
The twelve category pages render bilingual menu data again, retaining the old
Bootstrap card layout. Other headers, page copy and styling remain legacy content
until their migration; the Awards route and Bootstrap/jQuery are still present.
Language and theme preferences are read across all pages, but legacy unmarked
English content is not translated by changing the preference.

Menu category `name` and `introduction`, and each item `name`/`description`, now
contain `de` and `en` strings. Keep prices, IDs, codes and image paths shared.
`data/de.json` and `data/en.json` contain interface translations with matching
nested keys; keep their placeholders such as `{category}` and `{count}` aligned.
German is the default and fallback language.

`js/i18n.js` exposes `window.GoldenCraneI18n`:

- `ready`: resolves after loading the initial dictionaries and applying preference.
- `language`: the active `de` or `en` language.
- `setLanguage(language)`: changes and persists the language asynchronously.
- `t(key, parameters, fallback)`: resolves a dotted dictionary key and placeholders.
- `localized(value, fallback)`: resolves a menu text object with German fallback.
- `apply()`: translates marked interface elements.
- `setMetadataContext({ category })`: supplies localized category text for metadata.

Mark text-only elements with `data-i18n="navigation.menu"`; mark attributes with
`data-i18n-aria-label`, `data-i18n-title`, `data-i18n-alt` or
`data-i18n-placeholder`. Put German fallback text/attributes in the HTML. Keep
icons outside translated text elements because updates use `textContent`.
`data-page="home|menu|category|about"` on `<html>` selects metadata translations.
The renderer listens for `goldencrane:languagechange` and updates existing cards;
it fetches `menu.json` once per page load. Dictionary requests are also cached.
Prices use `de-DE` or `en-IE` euro formatting.

Load `js/theme.js` synchronously in the head before stylesheets. It sets
`data-theme` before painting, follows the OS until manually overridden, and
persists explicit selections. The design stylesheet also follows the OS when
JavaScript is disabled. New components use `gc-*` classes and semantic variables;
legacy CSS is unchanged. During Bootstrap coexistence, use explicit breakpoint
units: Bootstrap changes the root font size to 10px.

Language buttons use `data-language="de|en"`; theme buttons use
`data-theme-choice="light|dark"`. Both report state with `aria-pressed`.
`js/navigation.js` handles the pilot's disclosure navigation, including Escape
and returning focus to the toggle. Without JavaScript the navigation stays
visible; the pilot has German fallback content and a menu JavaScript notice.

Next: migrate menu-card styling in Phase 3, then migrate remaining page shells
and content. Remove legacy dependencies only after all pages are independent.

## Phase 3: menu category pilot

The Beef page now uses the custom menu-category design without loading Bootstrap,
jQuery or the legacy stylesheet locally. Those dependencies remain unchanged on
all other pages. The shared header and footer from Phase 2 are retained.

The `data-menu-layout="cards"` attribute on the category section opts into
semantic `article` cards and the `gc-menu-grid` / `gc-menu-card` components.
Without that attribute, `js/menu.js` keeps the original Bootstrap markup. The
new grid uses two columns on wide desktop screens and one column elsewhere;
photographs sit beside text when space permits and stack on narrow screens.
Descriptions remain complete. The first two photographs load eagerly; later
photographs use native lazy loading with reserved aspect ratios.

The pilot includes translated overview links at the top and bottom, the actual
item count, localized introduction and demonstration pricing/allergen notices.
Phase 4 can reuse this opt-in layout across the remaining categories after review.

## Phase 4: complete menu migration

All twelve category routes now use the approved Beef template and shared
`data-menu-layout="cards"` renderer. `pages/menu-categories.html` uses the same
header, footer, typography, language/theme controls and a 1/2/4-column overview.
All thirteen menu pages are independent of Bootstrap, jQuery, legacy CSS and
lazysizes. The homepage, About and Awards pages still use their original assets;
those files and vendor dependencies remain in place.

The overview includes German category cards directly in HTML so links, names,
introductions and images remain available without JavaScript. Its
`data-menu-overview` section lets the existing `js/menu.js` load the authoritative
dataset once and update existing names, introductions, counts and image alt text
on language changes. Photographs and links are retained rather than rebuilt.
If loading fails, an explanatory translated message appears while the German
fallback cards remain usable. Keep fallback card content synchronized with the
corresponding category when editing the dataset.

Overview photographs are capped at their original 200 × 200 CSS-pixel size;
the first four load eagerly and the others use native lazy loading. Original
photographs and all item data are unchanged. Next: migrate the homepage and
About content, then retire the Awards route and remove unused dependencies only
when the remaining legacy pages no longer need them.
