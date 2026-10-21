# WhatsApp Shop — Apparel & Garage Sale

A static catalog for clothing, footwear, accessories and garage-sale items. Visitors browse prices, availability and photos, then open WhatsApp with the selected product and size in their message. Prices are displayed in Colombian pesos (COP).

The site includes English and Spanish, persistent language and light/dark preferences, photo galleries and responsive layouts. Inventory lives in JSON files and is compiled into HTML. There is no backend for orders, payments or automatic stock reservations.

## Getting started

Use Node.js 22 and npm. Install the dependencies from the lockfile:

```sh
git clone https://github.com/CepedaBrayan/startbootstrap-shop-homepage.git
cd startbootstrap-shop-homepage
npm ci
```

Copy `.env.example` to `.env` and set the seller's WhatsApp number, including the country code and digits only:

```dotenv
WPP_ID=573001234567
```

Replace the example number before building. `WPP_ID` is embedded in public purchase links; it is not a secret. Local `.env` files are ignored by Git. Only `.env.example`, with an empty `WPP_ID`, is tracked. Removing `.env` from the current branch does not erase historical versions. Never put private credentials in frontend configuration.

```sh
npm start
```

This builds the site, starts BrowserSync and watches source files. Open the local URL shown in the terminal, normally `http://127.0.0.1:3000`. The server binds exclusively to `127.0.0.1`; its administration UI and tunnels are disabled. Both development modes use `scripts/browser-sync-config.js`. `npm run start:debug` also limits the debugger to `127.0.0.1:9229`.

Changes to products, translations and shared components rebuild the pages. Stylesheet changes rebuild the CSS. Restart development after changing `.env` so the new number is included in the build.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Clean and generate the complete site in `dist/` |
| `npm start` | Build, start the local server and reload on changes |
| `npm run build:pug` | Generate HTML from Pug templates and JSON data |
| `npm run build:scss` | Compile Bootstrap and custom styles |
| `npm run build:scripts` | Copy browser JavaScript |
| `npm run build:assets` | Copy images and other assets |
| `node --test tests/*.test.js` | Check catalog data, translations, sorting, local-server isolation and release packaging |
| `git diff --check` | Check whitespace errors |

`dist/` is generated output: edit `src/` and rebuild. To host the site, publish the complete contents of `dist/` while preserving its directory structure. Set `WPP_ID` in the build environment. Bootstrap JavaScript is loaded from jsDelivr; images, styles and application scripts are served locally by the site.

## Project structure

| Source | Responsibility |
| --- | --- |
| `src/data/products.json` | Products grouped into `apparel` and `garage` |
| `src/data/translations.json` | Languages, UI messages and translated product names |
| `src/assets/img/` | Original image files |
| `src/pug/index.pug` | Category selection page |
| `src/pug/views/` | Catalog pages and the legacy Shoes redirect |
| `src/pug/partials/catalog-mixins.pug` | Shared catalog, sorting control, cards and photo modals |
| `src/pug/partials/footer.pug` | Shared copyright and subtle AI-assisted development credit |
| `src/scss/styles.scss` | Site styles, themes and image presentation |
| `src/js/i18n.js` | Language selection, translation and persistence |
| `src/js/scripts.js` | Theme selection and persistence |
| `src/js/catalog-sort.js` | Shared numeric price sorting |
| `scripts/` | Build, development and release tools |

## Maintaining products and photos

Each product has an `id`, `name`, `quantity`, `size`, `sizeUnit`, `price` and `images`. Prices are numeric COP amounts. Image paths are relative to `src/assets/img/`. Size and its unit may be `null`. Use `saleUnit: "pair"` for items sold by the pair: both quantity and price refer to individual pairs.

Keep IDs stable when renaming products, and update `products.<id>` in every language. Give variants with their own inventory or photos separate entries. White Adidas, white Puma and black Puma socks are separate products.

The first image is the cover; remaining images appear in the modal. Preserve original formats, resolution and bytes unless a transformation is requested. Photos retain their proportions and remain fully visible. The shared `--product-image-background` variable in `src/scss/styles.scss` defines white once for every product photo, in both themes. New photos need no separate color configuration or inline styles.

The Xiaomi Smart Band 8 Pro gallery uses six unchanged portrait JPEGs and one self-contained portrait SVG wrapping the original landscape JPEG. The SVG rotates the embedded photo 90° counterclockwise without cropping, recompression or external image requests; its original JPEG bytes remain intact.

## Price sorting and page layout

Apparel and Garage Sale use the same `productCatalog` mixin and `catalog-sort.js`. The selector offers low-to-high pricing by default and high-to-low pricing. It uses numeric `data-product-price` values, keeps the original relative order of equally priced items, and moves existing cards to preserve their modal targets and purchase links.

Changing language or theme retains the current sorting selection. Labels are defined in the translation dictionary, and the selector follows the active theme. The category selection page shares the catalog header, margins and card spacing on mobile. On desktop (992px and wider), it becomes a viewport-height landing page with side-by-side category cards, flexible image areas and a visible footer, without vertical scrolling. Smaller screens keep the stacked, scrollable layout.

All three main pages share a footer with a small, understated `powered by AI assisted` credit. The requested credit remains in English in both site languages and adapts to the active theme.

## Languages and themes

`translations.json` defines `defaultLanguage` and `languages`. Each language contains `name`, `locale` and `messages`. To add another language, copy the English entry, assign its language code, name and locale, then translate every message while preserving keys and placeholders such as `{name}`, `{size}` and `{count}`. The language button automatically cycles through the configured entries; no JavaScript change is needed.

On the first visit, the site chooses a supported browser language or the configured default. Missing messages use the default-language dictionary. The theme follows the system preference until the visitor selects one. Explicit choices persist across navigation, and language and theme remain independent. The dictionary is embedded in HTML during compilation, so changes require a rebuild.

## AI-assisted development

The repository provides explicit context, source ownership and repeatable checks for developers and AI agents:

- [AGENTS.md](AGENTS.md) defines repository-wide instructions, editing boundaries and completion criteria.
- [SKILLS.md](SKILLS.md) describes procedures for inventory, images, languages, interface changes and pull requests.

The workflow is **inspect → implement → validate → review the diff → update the PR**. AI assists with development; the catalog owner supplies commercial information. The generated site does not require an AI service at runtime.

Run `npm audit` to review dependencies without changing the lockfile. Verify dependency updates through builds and tests. The October 15, 2026 review reduced affected packages from 29 to 6. The remaining alerts derive from the unpatched `braces` advisory GHSA-vfj7-8cjw-p6xm in development tooling. The project's patterns are fixed and its development server is restricted to loopback. The production-only audit reported zero alerts. Remaining development alerts still require reassessment when upstream fixes become available; do not hide them with audit exclusions or forced downgrades.

Publish only `dist/`. Both `npm start` and `start:debug` are local development tools.

Before delivering a change:

```sh
npm run build
node --test tests/*.test.js
git diff --check
```

For visual changes, inspect cards and galleries on mobile and desktop in both themes. For inventory or translation changes, also verify quantities, units, prices and WhatsApp messages. Report the checks actually performed and any remaining limitations.

## Vercel and automatic releases

`vercel.json` permits automatic Git deployments only from `master`. The `**` rule disables other branches, including names containing slashes. This applies to branches containing the configuration; older branches need the same file or a project-level Vercel setting. It does not remove existing previews or block manual CLI/API deployments.

In Vercel, keep `master` as the Production Branch, `npm run build` as the Build Command, `dist` as the Output Directory, and configure `WPP_ID` for production. To cancel preview builds project-wide, select **Settings → Build and Deployment → Ignored Build Step → Only build production**. Canceled builds may remain visible in deployment history.

`.github/workflows/release.yml` responds to PR closures targeting `master` and publishes only merged PRs. It checks out the exact merged commit, installs the lockfile, builds and runs tests. It then creates a GitHub release with automatic notes and a source ZIP containing the tracked code and empty environment template, without `.env`, `node_modules` or `dist`. This is a source package to install and build, rather than a compiled website bundle. Vercel builds production separately with its own environment variables.

Tags follow `vYYYY.MM.DD.PR_NUMBER`, using the UTC merge date, for example `v2026.10.15.4`. Re-running a completed workflow does not duplicate a release. A draft is published only after the ZIP upload succeeds; an upload failure leaves a recoverable draft. Direct pushes to `master` and unmerged PR closures do not publish releases.

Authentication uses the automatic `GITHUB_TOKEN` with `contents: write` for the release job. No personal token or Vercel credentials are required. The validation build uses a placeholder phone number; compiled output is not included in the source ZIP. Official actions are pinned to commit SHAs. Local tests exercise packaging, retry handling and publication ordering through a simulated `gh` client; the full GitHub workflow runs after a merge.

## License and attribution

Adapted from **Start Bootstrap — Shop Homepage**, using Bootstrap 5.2.3. The original [MIT license](LICENSE) and attribution are preserved. Product photographs and trademarks belong to their respective owners; the code license does not grant rights to those materials.
