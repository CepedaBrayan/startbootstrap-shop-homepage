'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../src/js/product-gallery.js'), 'utf8');

function element(dataset = {}) {
    const listeners = new Map();
    return {
        dataset, hidden: false, value: '', textContent: '', focused: false, selected: false,
        addEventListener(name, handler) {
            if (!listeners.has(name)) listeners.set(name, []);
            listeners.get(name).push(handler);
        },
        emit(name) { return Promise.all((listeners.get(name) || []).map(handler => handler())); },
        focus() { this.focused = true; },
        select() { this.selected = true; }
    };
}

function harness(url = 'https://shop.example/views/garage.html', clipboard = {writeText: async () => {}}) {
    const transitions = [], navigations = [];
    const window = element();
    window.location = {href: url};
    const entries = [{url, state: {existing: 'preserved'}}];
    let cursor = 0;
    window.history = {
        get state() { return entries[cursor].state; },
        get length() { return entries.length; },
        pushState(state, _, nextURL) {
            entries.splice(cursor + 1);
            entries.push({state, url: nextURL});
            cursor++;
            window.location.href = nextURL;
        },
        replaceState(state, _, nextURL) {
            entries[cursor] = {state, url: nextURL};
            window.location.href = nextURL;
        },
        back() { navigate(-1); },
        forward() { navigate(1); }
    };
    function navigate(delta) {
        navigations.push(() => {
            const next = cursor + delta;
            if (next < 0 || next >= entries.length) return;
            cursor = next;
            window.location.href = entries[cursor].url;
            window.emit('popstate');
        });
    }
    const modals = ['watch', 'bag'].map(id => {
        const modal = element({galleryProduct: id});
        const children = {
            '[data-copy-product-link]': element(), '[data-share-fallback]': element(),
            '[data-share-url]': element(), '[data-share-status]': element()
        };
        modal.querySelector = selector => children[selector];
        modal.shown = false;
        modal.busy = false;
        modal.instance = {
            show() {
                if (modal.shown || modal.busy) return;
                modal.emit('show.bs.modal');
                modal.shown = true;
                modal.busy = true;
                transitions.push(() => { modal.busy = false; modal.emit('shown.bs.modal'); });
            },
            hide() {
                if (!modal.shown || modal.busy) return;
                modal.emit('hide.bs.modal');
                modal.shown = false;
                modal.busy = true;
                transitions.push(() => { modal.busy = false; modal.emit('hidden.bs.modal'); });
            }
        };
        return modal;
    });
    const triggers = modals.map(modal => element({productId: modal.dataset.galleryProduct}));
    const document = element();
    document.readyState = 'loading';
    document.querySelectorAll = selector => selector === '[data-gallery-product]' ? modals : triggers;
    window.bootstrap = {Modal: {getOrCreateInstance: modal => modal.instance}};
    window.shopI18n = {t: key => key};
    vm.runInNewContext(script, {window, document, navigator: {clipboard}, URL});
    document.emit('DOMContentLoaded');
    function settle() {
        let remaining = 30;
        while (navigations.length || transitions.length) {
            assert(remaining-- > 0, 'Navigation should converge');
            if (navigations.length) navigations.shift()();
            else transitions.shift()();
        }
    }
    return {window, modals, triggers, transitions, navigations, settle};
}

test('A direct shared link opens only its product and closes into the same catalog', () => {
    const h = harness('https://shop.example/views/garage.html?campaign=sale&product=watch#catalog');
    h.settle();
    assert.deepEqual(h.modals.map(modal => modal.shown), [true, false]);
    h.modals[0].instance.hide();
    h.settle();
    assert.equal(h.window.location.href, 'https://shop.example/views/garage.html?campaign=sale#catalog');
    assert.equal(h.window.history.length, 1);
    assert.equal(h.window.history.state.existing, 'preserved');
    assert(h.triggers[0].focused);
});

test('Opening, Back, Forward and closing a gallery keep URL and history synchronized', () => {
    const h = harness();
    h.modals[0].instance.show();
    h.settle();
    assert.equal(new URL(h.window.location.href).searchParams.get('product'), 'watch');
    assert.equal(h.window.history.length, 2);
    h.window.history.back(); h.settle();
    assert.equal(h.modals[0].shown, false);
    h.window.history.forward(); h.settle();
    assert.equal(h.modals[0].shown, true);
    h.modals[0].instance.hide();
    // A close transition may finish before the browser dispatches popstate.
    h.transitions.shift()();
    assert.equal(h.modals[0].shown, false);
    h.settle();
    assert.equal(h.window.location.href, 'https://shop.example/views/garage.html');
    h.modals[1].instance.show(); h.settle();
    assert.equal(h.window.history.length, 2);
    assert.equal(new URL(h.window.location.href).searchParams.get('product'), 'bag');
});

test('Back and Forward during modal transitions converge without stacked galleries', () => {
    const h = harness();
    h.modals[0].instance.show();
    h.window.history.back();
    h.navigations.shift()();
    h.settle();
    assert(h.modals.every(modal => !modal.shown));
    h.window.history.forward(); h.settle();
    h.window.history.back();
    h.navigations.shift()();
    h.window.history.forward();
    h.navigations.shift()();
    h.settle();
    assert.deepEqual(h.modals.map(modal => modal.shown), [true, false]);
});

test('History navigation between products waits for the previous modal to close', () => {
    const h = harness('https://shop.example/views/garage.html?product=watch');
    h.settle();
    h.window.history.pushState({}, '', 'https://shop.example/views/garage.html?product=bag');
    h.window.emit('popstate');
    assert.equal(h.modals[1].shown, false);
    h.settle();
    assert.deepEqual(h.modals.map(modal => modal.shown), [false, true]);
    h.window.history.back(); h.settle();
    assert.deepEqual(h.modals.map(modal => modal.shown), [true, false]);
});

test('Unknown, malformed and missing product IDs leave the catalog usable', () => {
    for (const query of ['', '?product=', '?product=missing', '?product=%E0%A4%A', '?product=%22%3E%3Cscript%3E']) {
        const h = harness('https://shop.example/views/apparel.html' + query);
        h.settle();
        assert(h.modals.every(modal => !modal.shown));
        h.modals[0].instance.show(); h.settle();
        assert.equal(new URL(h.window.location.href).searchParams.get('product'), 'watch');
    }
});

test('Copy uses a clean product URL and reports success only after writing it', async () => {
    let copied;
    const h = harness('https://shop.example/views/garage.html?tracking=private&product=watch#catalog', {
        writeText: async text => { copied = text; }
    });
    h.settle();
    const modal = h.modals[0];
    await modal.querySelector('[data-copy-product-link]').emit('click');
    assert.equal(copied, 'https://shop.example/views/garage.html?product=watch');
    assert.equal(modal.querySelector('[data-share-status]').dataset.i18n, 'share.copied');
    assert.equal(modal.querySelector('[data-share-fallback]').hidden, true);
});

test('Denied or unavailable clipboard access offers a selected manual-copy field', async () => {
    for (const clipboard of [null, {writeText: async () => { throw new Error('Denied'); }}]) {
        const h = harness('https://shop.example/views/garage.html?product=watch', clipboard);
        h.settle();
        const modal = h.modals[0];
        await modal.querySelector('[data-copy-product-link]').emit('click');
        assert.equal(modal.querySelector('[data-share-status]').dataset.i18n, 'share.manual');
        assert.equal(modal.querySelector('[data-share-fallback]').hidden, false);
        assert(modal.querySelector('[data-share-url]').focused);
        assert(modal.querySelector('[data-share-url]').selected);
        assert.equal(modal.querySelector('[data-share-url]').value, h.window.location.href);
    }
});

test('Late clipboard responses do not update a closed gallery', async () => {
    let resolve;
    const h = harness('https://shop.example/views/garage.html?product=watch', {
        writeText: () => new Promise(done => { resolve = done; })
    });
    h.settle();
    const pending = h.modals[0].querySelector('[data-copy-product-link]').emit('click');
    h.modals[0].instance.hide(); h.settle(); resolve(); await pending;
    assert.equal(h.modals[0].querySelector('[data-share-status]').textContent, '');
});
