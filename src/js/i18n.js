(function () {
    'use strict';
    const dictionary = JSON.parse(document.getElementById('shop-translations').textContent);
    const languages = Object.keys(dictionary.languages);
    const fallback = dictionary.defaultLanguage;
    const storageKey = 'whatsapp-shop-language';
    let saved;
    try { saved = localStorage.getItem(storageKey); } catch (_) {}
    function preferredLanguage() {
        for (const locale of navigator.languages || [navigator.language]) {
            const code = (locale || '').toLowerCase().split('-')[0];
            if (languages.includes(code)) return code;
        }
        return fallback;
    }
    let language = languages.includes(saved) ? saved : preferredLanguage();
    function t(key, params) {
        const messages = dictionary.languages[language].messages;
        const text = messages[key] ?? dictionary.languages[fallback].messages[key] ?? key;
        return text.replace(/\{(\w+)\}/g, function (match, name) {
            return params && params[name] !== undefined ? String(params[name]) : match;
        });
    }
    function applyLanguage() {
        document.documentElement.lang = language;
        document.querySelectorAll('[data-i18n], [data-i18n-alt], [data-i18n-aria-label], [data-i18n-content]').forEach(function (element) {
            const params = JSON.parse(element.dataset.i18nParams || '{}');
            if (element.dataset.productId) params.name = t('products.' + element.dataset.productId);
            if (element.dataset.i18n) element.textContent = t(element.dataset.i18n, params);
            for (const [attribute, key] of [['alt', 'i18nAlt'], ['aria-label', 'i18nAriaLabel'], ['content', 'i18nContent']]) {
                if (element.dataset[key]) element.setAttribute(attribute, t(element.dataset[key], params));
            }
        });
        document.querySelectorAll('[data-whatsapp-product]').forEach(function (link) {
            const size = link.dataset.productSize ? t('whatsapp.size', {size: link.dataset.productSize}) : '';
            const message = t('whatsapp.message', {name: t('products.' + link.dataset.whatsappProduct), size: size});
            const url = new URL(link.href);
            url.searchParams.set('text', message);
            link.href = url.toString();
        });
        const next = languages[(languages.indexOf(language) + 1) % languages.length];
        document.querySelectorAll('.language-toggle').forEach(function (button) {
            button.textContent = t('language.button', {language: dictionary.languages[language].name});
            button.setAttribute('aria-label', t('language.next', {language: dictionary.languages[next].name}));
            button.title = button.getAttribute('aria-label');
        });
        document.dispatchEvent(new CustomEvent('shop:languagechange'));
    }
    window.shopI18n = {t: t, getLanguage: function () { return language; }};
    document.documentElement.lang = language;
    document.addEventListener('DOMContentLoaded', function () {
        applyLanguage();
        document.querySelectorAll('.language-toggle').forEach(function (button) {
            button.addEventListener('click', function () {
                language = languages[(languages.indexOf(language) + 1) % languages.length];
                try { localStorage.setItem(storageKey, language); } catch (_) {}
                applyLanguage();
            });
        });
    });
    window.addEventListener('storage', function (event) {
        if (event.key === storageKey || event.key === null) {
            language = languages.includes(event.newValue) ? event.newValue : preferredLanguage();
            applyLanguage();
        }
    });
})();
