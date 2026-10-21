# AI-assisted development procedures

This is the repository's operating guide for agents and developers. It complements [AGENTS.md](AGENTS.md). No plugin installation or model running inside the website is required. AI is used during development, and the result remains a static site.

Write repository documentation and code/configuration comments in English. Preserve the intended languages of localized website content and translation examples.

## 1. Update inventory

**Input:** an approved list of products, unit prices, quantities, and sizes.

1. Locate the product by ID in `src/data/products.json` and compare its current state with the approved input.
2. Keep `id` stable. Use a unique ID for each variant that needs its own stock, price, or photos.
3. Store `price` as a numeric COP amount and `quantity` as an integer. Use `null` when size or its unit does not apply; do not invent values.
4. Set `saleUnit: "pair"` for products sold by the pair. Both price and quantity refer to individual pairs, rather than the packages shown in photos.
5. Update `products.<id>` in every language in `translations.json`. Product name changes must also appear in WhatsApp messages.
6. Rebuild and verify the card and purchase message in English and Spanish.

**Expected result:** consistent inventory without accidental duplicates or missing translations.

## 2. Add images and galleries

**Input:** attached originals or a ZIP whose filenames identify the products.

1. List the files and inspect their dimensions and content. Ignore ZIP system metadata and prevent extraction outside the working directory.
2. Map each file to a product ID. Verify brand, color, and variant before assigning it.
3. Copy originals to `src/assets/img/apparel/` or `src/assets/img/garage/` with descriptive filenames and their actual format. Avoid spaces; do not recompress for convenience.
4. Add paths relative to `src/assets/img/` to `images`. The first image is the cover. Prefer a sharp, representative photo; resolution alone does not establish the correct variant.
5. Keep useful existing photos, remove duplicates, and exclude photos of other variants. Each gallery must belong to a single product.
6. Preserve the shared white background defined by `--product-image-background` in `src/scss/styles.scss`. New photos need no color registration: cards and modals inherit the same variable in both themes and use `object-fit: contain` to fill unused space without cropping or stretching the photo. Do not add color maps or per-image inline styles for this uniform value.
7. Rebuild, verify that every photo loads, and cycle through the modal controls. Review portrait and landscape images in both themes and at mobile and desktop sizes.
8. Compare hashes of originals and copies to confirm unchanged bytes when original quality is required.

**Expected result:** correct images, preserved originals, and fully painted photo areas.

## 3. Add languages or text

1. Edit `src/data/translations.json`. Each language has `name`, `locale`, and `messages`.
2. To add French, copy `languages.en` to `languages.fr`, set `name` to `Français` and `locale` to `fr-FR`, then translate the messages. The language button discovers languages from the JSON.
3. Preserve keys and placeholders such as `{name}`, `{size}`, `{count}`, and `{number}`. The fallback uses `defaultLanguage`, currently `en`.
4. Connect visible text with `data-i18n` and attributes with `data-i18n-alt`, `data-i18n-aria-label`, or `data-i18n-content`. Pass parameters as JSON in `data-i18n-params`.
5. Run the tests and verify language switching, page reloads, navigation, and WhatsApp messages. Prices remain in COP with Colombian number formatting.

**Expected result:** complete translations without logic changes when adding a language. Runtime fallback tolerates missing messages; tests require complete translations for shipped languages.

## 4. Change the interface or theme

1. Locate the Pug page or shared mixin that renders the element.
2. Use `--shop-*` variables for site surfaces, text, and borders. The shared `--product-image-background` remains white in both themes.
3. Preserve semantic buttons, accessible names, visible focus, and modal close/navigation controls.
4. Keep language initialization before `scripts.js`. Theme handling uses `shopI18n` and runs in the document head to avoid a light flash on dark pages.
5. Review the home page, Apparel, Garage Sale, and modals in both themes at mobile and desktop widths. Change language and theme independently and verify persistence.

**Expected result:** consistent behavior without horizontal overflow or loss of accessibility.

## 5. Prepare a reviewable PR

1. Confirm the authorized branch and PR. Use the current remote state as the base and preserve other changes.
2. Run the build, tests, and whitespace checks described in `AGENTS.md`. For dependency changes, also run `npm audit` and check development startup. The server must listen only on `127.0.0.1`, with the UI and tunnels disabled.
3. Review data, paths, and translations as well as code. Exclude `dist/`, `node_modules`, temporary files, `.env`, and credentials. The `.env.example` template must contain an empty `WPP_ID=`.
4. Summarize the final behavior and validation. Identify blocked checks without presenting them as passed.
5. Upload the commit to the PR branch, verify it contains the change, and merge only when requested.
6. Automatic releases run only after merging into `master`. Keep the ZIP limited to source code without local files, preserve pinned action revisions and validation, and publish from a draft only after the asset upload succeeds. Releases do not replace Vercel deployments.

**Expected result:** a clearly scoped PR with verifiable evidence and current documentation.
