# Development agent instructions

These instructions apply to the entire repository. Read [README.md](README.md) first to understand the product, then [SKILLS.md](SKILLS.md) for operational procedures. Explicit user instructions take priority.

## Purpose and architecture

Maintain a static WhatsApp shopping catalog with Apparel and Garage Sale, translations, and persistent theme preferences. AI assists development: the agent inspects source files, implements scoped changes, and presents evidence. The catalog owner decides inventory, prices, and publication.

- `src/data/products.json`: product inventory, quantities, COP prices, and photo paths.
- `src/data/translations.json`: messages by language and product names keyed by product ID.
- `src/pug/`: pages and shared components; `partials/catalog-mixins.pug` renders cards and modals.
- `src/scss/styles.scss`: Bootstrap styles, site surfaces, and the shared white photo background, defined once with `--product-image-background`.
- `src/js/i18n.js` and `src/js/scripts.js`: language and theme behavior, respectively.
- `scripts/`: build and development tools. `dist/` is generated output ignored by Git.

## Before changing code

1. Check `git status`, the working branch, and the PR target. Preserve existing user and agent changes.
2. Read the files that determine the requested behavior. Use the current repository state as evidence.
3. Define verifiable outcomes: affected products, language, theme, mobile layout, and navigation where applicable.
4. Resolve ambiguous photo or data assignments before using them if a mistake could affect a sale. Filenames provide clues; inspect the content as well.

## Implementation rules

- Write all repository documentation and code/configuration comments in English. Keep localized website text in its intended language; the site supports both English and Spanish.
- Edit source files and rebuild. Never fix a page only in `dist/`.
- Keep IDs stable when renaming products. Synchronize `products.<id>` across all languages.
- Do not invent prices, sizes, quantities, warranties, or product attributes. Respect unit pricing and distinguish pairs from packages.
- Preserve original photo files, resolution, and bytes unless a transformation is requested. Do not artificially enlarge small images to imply higher quality.
- Show photos completely and preserve their proportions. Unused space always uses the shared white background from the stylesheet, regardless of product or site theme. Do not add per-image configuration or inline styles for this uniform value.
- Add visible text and accessible labels to the dictionary. Preserve placeholders and the language of WhatsApp messages.
- Keep theme and language preferences independent and persistent. Preserve relative links and the `shoes.html` redirect.
- Reuse existing mixins and styles. Avoid adding frameworks, services, or dependencies without a concrete need.
- Keep `vercel.json` limited to Git deployments from `master`. Publish releases only for PRs merged into `master`, from the exact merge commit, after the build, tests, and complete source ZIP upload succeed. Do not use `pull_request_target` to execute code from an external branch.
- Keep BrowserSync and the inspector restricted to loopback, with the UI and tunnels disabled. Use the shared configuration for both development modes.
- Keep `.env` out of Git and leave `WPP_ID=` empty in `.env.example`.
- `WPP_ID` becomes part of public links during compilation. Never store secrets in frontend variables or expose credentials in logs, commits, or documentation.

## Validation and delivery

Run from the repository root:

```sh
npm run build
node --test tests/*.test.js
git diff --check
```

For visual changes, inspect cards and modals in a browser on mobile and desktop in both themes. For catalog or translation changes, verify availability, prices, units, and WhatsApp messages. Node tests do not replace visual review.

Review the complete diff and confirm all required files are included. Update the authorized PR with the final behavior and checks actually performed. Do not report a blocked check as passed. Merge or publish only when the user's request includes that action. Avoid overwriting the remote branch with a forced push.

## Completion criteria

The task is complete when the requested change is implemented, relevant checks pass, documentation matches the code, and the authorized branch and PR contain the result. Report any remaining limitations.
