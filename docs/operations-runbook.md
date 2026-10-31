# Golden Crane — Operations Runbook

Procedures for running and maintaining the static portfolio site. See the [Development Handbook](development-handbook.md) for implementation details.

## Service, configuration and ownership

- Repository: [marksav85/golden-crane](https://github.com/marksav85/golden-crane), maintained on `main`.
- Production: [golden-crane.marksavilledesigns.com](https://golden-crane.marksavilledesigns.com/), hosted on Cloudflare Pages according to the owner and README.
- Local environment: HTTP-served repository files; no build, backend, database, application secrets or environment variables are required by the current source.
- External dependencies: Google Fonts for typography; Google Maps for the location iframe and external street link. Local fallback fonts remain available if Fonts fails; Maps requires provider access.

The project owner authorizes releases, maintains repository access and coordinates hosting/domain administration. Exact Cloudflare account roles, domain registrar, renewal responsibilities and any additional operators are not recorded. No monitoring or alert configuration exists in the repository; dashboard-side monitoring and escalation arrangements are unconfirmed.

Evidence boundary: the owner reported successful Pages deployment and accepted browser appearance/functionality, mobile Performance 93 and earlier Accessibility 100 / Best Practices 100 / SEO 92. These are historical owner reports, not guarantees for later changes. Dashboard settings, deployed commit identity and rollback capability were not independently checked during documentation.

## Local development and verification

Use a modern browser, Git when working with version control, and Node.js for the verifier. The verifier was run successfully on Node.js 24.21.0; the repository has no formal runtime-version pin. Node is a maintenance tool, not a production runtime. Python 3 is one dependency-free HTTP-serving option if already installed.

From the repository root:

```bash
python3 -m http.server 5501 --bind 127.0.0.1
```

Open `http://127.0.0.1:5501/`; stop the server with Ctrl+C. An equivalent existing static HTTP server is also suitable. Direct `file://` access is unsuitable because browser origin/security restrictions prevent reliable JSON fetching. No package installation is needed.

In a second terminal at the repository root:

```bash
node tests/verify.mjs
git diff --check
```

The verifier exits zero on success and nonzero with a descriptive failure on error. It checks JSON schema essentials, positive prices/EUR, uniqueness, category/dish images, dictionary keys and placeholders, referenced translations, local HTML/CSS paths and fragments, category fallback conventions/counts, and Node syntax checks for all four application scripts.

It uses a tokenizer tailored to this site's static HTML, not a complete HTML validator. Dynamic translation keys need explicit rules. It does not execute application behavior, check external responses, validate translation quality, audit accessibility or measure performance. No build, lint framework, package manager or CI workflow is configured. If an execution sandbox blocks syntax-check subprocesses, obtain permission to run them; do not report that blocked run as passing.

### Browser acceptance and production smoke check

After changes affecting the site, record the environment, revision, viewport and result:

1. Open Home → menu overview → a category → overview, and Home → About. Confirm the Awards compatibility page links to About. Include short and long category examples, such as dessert and sushi.
2. Switch German/English; check shared text, dish text, EUR prices, titles and image alternatives. Reload and navigate to confirm preference persistence.
3. Test light/dark selection, persistence, first-paint appearance and the crane color. Test system preference with the saved theme cleared through browser storage tools.
4. Check mobile/desktop layout, keyboard access, visible focus, skip links, mobile toggle and Escape behavior. Review console/network errors, missing content and image loading.
5. Scroll to Maps and confirm the intended Halberstädter Straße location and external link. Check typography and fallback behavior if an external provider is unavailable.

Owner acceptance is separate from technical verification. Earlier acceptance is supplied; changes that could affect journeys or presentation need affected acceptance repeated. For performance changes, repeat mobile Lighthouse under consistent conditions and compare several runs; verify that the crane preload is reused and layout remains stable. Do not treat a previous score as a new result.

## Releases through Cloudflare Pages

The existing GitHub integration has processed pushes to this repository. Current production-branch selection, build command, output directory, preview rules, environment variables/bindings and account permissions are dashboard-only facts not established by the source. The application needs no build step, but that does not establish the actual Pages settings.

For an authorized release:

1. Review the Git diff/status, run structural verification and complete affected browser acceptance.
2. Have the authorized operator confirm the connected repository, production branch, static output scope and release trigger in Pages before pushing. Confirm the deployment contains the public HTML, CSS, scripts, JSON and images. Do not assume a dashboard value from the local folder structure.
3. Commit/push only with owner authorization. Observe the deployment logs and final revision/status in Pages.
4. Verify the production URL over HTTPS, representative nested routes, menu/dictionary requests, images, themes, language selection and Maps. Record the deployed revision and outcomes separately from successful Git push output.

There are no source-required application secrets or bindings to provision. If dashboard-only configuration exists, the operator must identify it and confirm preservation by the actual release method before making changes. Do not invent credentials, replace the deployment workflow or alter settings to follow this document.

## Content maintenance

For menu edits, change [data/menu.json](../data/menu.json), keep IDs/codes unique and prices positive numeric EUR values, and provide both languages. Add photographs at the referenced paths. Category photographs use `images/menu-category-tiles/menu-<id>.jpg`. Reconcile category-page fallback headings/counts, overview cards, homepage highlights and numeric dictionary summaries when relevant. Preserve the existing 153 dish and twelve category photographs unless a separately reviewed content change requires otherwise.

For shared translations, update [data/de.json](../data/de.json) and [data/en.json](../data/en.json) together, retaining placeholder names and nonempty values. Update corresponding German HTML fallbacks. Run verification, review both languages in a browser, then use the approved release procedure. Preserve the existing Maps embed and street link unless the owner explicitly approves a location change.

## Troubleshooting

| Symptom | Diagnose and correct safely | Recheck |
| --- | --- | --- |
| Menu remains loading or shows an error | Use HTTP, inspect console and `data/menu.json` response; run the verifier for invalid fields/paths. Correct reviewed data or serving errors. | Reload category; verify dishes and language changes. |
| English does not load or text remains German | Inspect `data/en.json` and `data/de.json` responses and keys. Failed dictionary requests are cached for the page; reload after correcting the cause. | Switch both ways, inspect metadata and reload. |
| Theme seems stuck | Inspect `golden-crane-theme` in local storage and system preference. A saved choice intentionally overrides the system; blocked storage prevents persistence. | Test both themes and a fresh preference state. |
| Nested page loses assets | Compare relative HTML paths and script-derived root URLs; check case-sensitive filenames and CSS-relative assets. | Run verifier and load the nested route directly. |
| Crane is missing or downloaded twice | Inspect SVG response, CSS mask and preload URL/fetch compatibility; preserve anonymous CORS and theme coloring. | Inspect network and both themes. |
| Fonts or Maps fail | Inspect provider requests, network/content blockers and policy errors. Do not replace the verified Maps URL merely because an external request fails. | Check fallback fonts and retry Maps, including its street link. |

## Recovery, access and outstanding facts

Git tracks website source, not Cloudflare/DNS configuration. Ignored Stitch references are not backed up by the website repository. There is no application database to restore. Provider configuration and access recovery need separate owner-managed records.

No production rollback or restore procedure has been tested here. Before a consequential release, the operator must establish the available recovery path and permissions. For source regression, review a known-good revision and propose a targeted revert/new corrective commit through the normal approval process; do not reset shared history. A provider rollback is only an option after the operator confirms it is available and suitable. Re-run local checks and the production smoke check after any authorized recovery.

Keep GitHub, hosting and domain permissions limited to authorized maintainers. Store credentials/recovery material privately, never in these documents or client files. Secret rotation is not an application procedure today; privileged account recovery belongs to the relevant account owner.

Outstanding operator confirmations: current Pages target/branch and release settings; deployed revision; output scope; dashboard variables/bindings if any; monitoring/log access and escalation; domain renewal ownership; and a verified recovery path. These are operational knowledge gaps, not evidence that the accepted website is currently failing. Owner review of this runbook and acceptance of its remaining limitations are still required.
