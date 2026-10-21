(function () {
    'use strict';

    function init() {
        if (!window.bootstrap || !window.bootstrap.Modal) return;
        const galleries = new Map(Array.from(document.querySelectorAll('[data-gallery-product]'),
            element => [element.dataset.galleryProduct, element]));
        if (!galleries.size) return;

        const stateKey = 'shopProductGallery';
        let active = null;
        let transitioning = false;
        let waitingForBack = false;

        function requestedProduct() {
            return new URL(window.location.href).searchParams.get('product');
        }

        function productURL(id, shareable) {
            const url = new URL(window.location.href);
            if (shareable) {
                url.search = '';
                url.hash = '';
            }
            url.searchParams.set('product', id);
            return url.href;
        }

        function syncFromURL() {
            // Bootstrap ignores show/hide calls during transitions. Reconcile afterward.
            if (transitioning || waitingForBack) return;
            const desired = galleries.get(requestedProduct()) || null;
            if (active && active !== desired) {
                window.bootstrap.Modal.getOrCreateInstance(active).hide();
            } else if (!active && desired) {
                window.bootstrap.Modal.getOrCreateInstance(desired).show();
            }
        }

        function setStatus(element, key) {
            const status = element.querySelector('[data-share-status]');
            if (key) {
                status.dataset.i18n = key;
                status.textContent = window.shopI18n.t(key);
            } else {
                delete status.dataset.i18n;
                status.textContent = '';
            }
        }

        galleries.forEach(function (element, id) {
            const copyButton = element.querySelector('[data-copy-product-link]');
            const fallback = element.querySelector('[data-share-fallback]');
            const input = element.querySelector('[data-share-url]');
            let copyAttempt = 0;

            element.addEventListener('show.bs.modal', function () {
                active = element;
                transitioning = true;
                copyAttempt++;
                fallback.hidden = true;
                setStatus(element, null);
                input.value = productURL(id, true);
                if (requestedProduct() !== id) {
                    window.history.pushState(Object.assign({}, window.history.state, {
                        [stateKey]: id
                    }), '', productURL(id, false));
                }
            });

            element.addEventListener('shown.bs.modal', function () {
                transitioning = false;
                syncFromURL();
            });

            element.addEventListener('hide.bs.modal', function () {
                transitioning = true;
                copyAttempt++;
                if (requestedProduct() !== id) return;
                if (window.history.state && window.history.state[stateKey] === id) {
                    // Only traverse entries created when opening a gallery on this page.
                    waitingForBack = true;
                    window.history.back();
                } else {
                    // A directly opened shared link must close into the catalog, not leave it.
                    const url = new URL(window.location.href);
                    url.searchParams.delete('product');
                    window.history.replaceState(window.history.state, '', url.href);
                }
            });

            element.addEventListener('hidden.bs.modal', function () {
                active = null;
                transitioning = false;
                syncFromURL();
                if (!galleries.has(requestedProduct())) {
                    const trigger = Array.from(document.querySelectorAll('.product-photo'))
                        .find(button => button.dataset.productId === id);
                    if (trigger) trigger.focus({preventScroll: true});
                }
            });

            copyButton.addEventListener('click', async function () {
                const attempt = ++copyAttempt;
                const url = productURL(id, true);
                input.value = url;
                try {
                    await navigator.clipboard.writeText(url);
                    if (attempt !== copyAttempt) return;
                    fallback.hidden = true;
                    setStatus(element, 'share.copied');
                } catch (_) {
                    if (attempt !== copyAttempt) return;
                    fallback.hidden = false;
                    setStatus(element, 'share.manual');
                    input.focus();
                    input.select();
                }
            });
            input.addEventListener('click', function () { input.select(); });
        });

        window.addEventListener('popstate', function () {
            waitingForBack = false;
            syncFromURL();
        });
        syncFromURL();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
