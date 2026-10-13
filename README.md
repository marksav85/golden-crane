# Golden Crane — Asian Fusion Restaurant

A responsive, bilingual restaurant website built with HTML, CSS and vanilla JavaScript. This portfolio project showcases a modern Asian-fusion restaurant concept with a JSON-driven menu, German and English language support, light and dark themes, and an integrated Google Maps location view.

**[Explore the live website](https://golden-crane.marksavilledesigns.com/)**

## Features

- Browse 153 dishes across 12 menu categories, with photographs, descriptions and prices.
- Switch between German and English, with language preferences saved across visits.
- Choose between light and dark themes, with automatic system preference detection.
- Explore responsive menu cards and category pages optimized for desktop, tablet and mobile screens.
- View the restaurant's Magdeburg location through an interactive Google Maps embed.
- Navigate using accessible controls, visible focus states and responsive mobile navigation.

## Technology

HTML5, CSS3, vanilla JavaScript, JSON and Google Maps. The interface uses CSS Grid and Flexbox, CSS custom properties and native browser APIs. No frontend framework, external JavaScript libraries or build step is required.

The website is deployed on Cloudflare Pages with a custom domain.

## Technical highlights

- A centralized JSON dataset manages all 153 dishes, including bilingual names and descriptions, prices, item codes and image references. A reusable JavaScript renderer generates menu cards dynamically.
- A lightweight localization system uses shared translation dictionaries, caches language data and updates page content, accessibility labels and metadata without reloading the page.
- Light and dark themes use CSS custom properties, respect the operating system's preferences and persist manual selections across visits.
- Responsive layouts use reusable CSS components and semantic HTML. Native image lazy loading, keyboard-accessible navigation and reduced-motion support improve usability and performance.
- Menu data loads once per page, while language changes update text without refetching the dataset or recreating images. Layout optimizations help minimize visual shifts on longer menu pages.

The website is designed for modern browsers. German content remains available as an HTML fallback, although dynamically generated menu items require JavaScript.

## Credits

The website's visual design was developed with reference to concepts generated using Google Stitch and implemented with custom HTML, CSS and JavaScript.

Golden Crane is a fictional restaurant created as a web development portfolio project. It does not represent a real operating restaurant.
