(function () {
    'use strict';
    const storageKey = 'whatsapp-shop-theme';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let selectedTheme;
    try {
        selectedTheme = localStorage.getItem(storageKey);
    } catch (_) {
        // The theme still works when browser storage is unavailable.
    }
    if (selectedTheme !== 'light' && selectedTheme !== 'dark') selectedTheme = null;

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        document.querySelectorAll('.theme-toggle').forEach(function (button) {
            const dark = theme === 'dark';
            button.textContent = window.shopI18n.t(dark ? 'theme.dark' : 'theme.light');
            button.title = window.shopI18n.t(dark ? 'theme.activateLight' : 'theme.activateDark');
            button.setAttribute('aria-label', button.title);
            button.setAttribute('aria-pressed', String(dark));
        });
    }

    function currentTheme() {
        return selectedTheme || (systemTheme.matches ? 'dark' : 'light');
    }

    // Run in the head before CSS paints to avoid a light flash on dark pages.
    applyTheme(currentTheme());
    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(currentTheme());
        document.querySelectorAll('.theme-toggle').forEach(function (button) {
            button.addEventListener('click', function () {
                selectedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                applyTheme(selectedTheme);
                try {
                    localStorage.setItem(storageKey, selectedTheme);
                } catch (_) {}
            });
        });
    });
    document.addEventListener('shop:languagechange', function () {
        applyTheme(currentTheme());
    });
    systemTheme.addEventListener('change', function () {
        if (!selectedTheme) applyTheme(currentTheme());
    });
    window.addEventListener('storage', function (event) {
        if (event.key === storageKey || event.key === null) {
            selectedTheme = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
            applyTheme(currentTheme());
        }
    });
})();
