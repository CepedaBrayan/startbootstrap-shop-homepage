(function () {
    'use strict';

    function initializeCatalogs() {
        document.querySelectorAll('[data-catalog]').forEach(function (catalog) {
            const select = catalog.querySelector('[data-price-sort]');
            const grid = catalog.querySelector('[data-product-grid]');
            if (!select || !grid) return;

            const products = Array.from(grid.children).map(function (element, index) {
                return {element: element, price: Number(element.dataset.productPrice), index: index};
            });

            function sortProducts() {
                const direction = select.value === 'desc' ? -1 : 1;
                products.sort(function (a, b) {
                    return direction * (a.price - b.price) || a.index - b.index;
                });
                products.forEach(function (product) {
                    grid.appendChild(product.element);
                });
            }

            select.addEventListener('change', sortProducts);
            sortProducts();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCatalogs);
    } else {
        initializeCatalogs();
    }
})();
