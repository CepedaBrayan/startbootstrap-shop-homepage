'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../src/js/catalog-sort.js'), 'utf8');

function catalog(prices) {
    const original = prices.map((price, id) => ({id, dataset: {productPrice: String(price)}}));
    const grid = {children: [...original], appendChild(element) {
        this.children.splice(this.children.indexOf(element), 1);
        this.children.push(element);
    }};
    let change;
    const select = {value: 'asc', addEventListener(event, handler) {if (event === 'change') change = handler;}};
    return {
        grid, original, select,
        querySelector(selector) {return selector === '[data-price-sort]' ? select : grid;},
        sort(value) {select.value = value;change();}
    };
}

test('Shared sorter uses numeric prices, stable ties and the existing card nodes', () => {
    const a = catalog([100000, 25000, 90000, 25000, 1800000]);
    const b = catalog([50000, 100000, 80000]);
    vm.runInNewContext(script, {document: {readyState: 'interactive', querySelectorAll: () => [a, b]}});
    assert.deepEqual(a.grid.children.map(x => x.id), [1, 3, 2, 0, 4]);
    assert.deepEqual(b.grid.children.map(x => x.id), [0, 2, 1]);
    a.sort('desc');assert.deepEqual(a.grid.children.map(x => x.id), [4, 0, 2, 1, 3]);
    assert.deepEqual(b.grid.children.map(x => x.id), [0, 2, 1]);
    a.sort('asc');assert.deepEqual(a.grid.children.map(x => x.id), [1, 3, 2, 0, 4]);
    assert.equal(new Set(a.grid.children).size, a.original.length);
    assert(a.grid.children.every(x => a.original.includes(x)));
});

test('Sorter waits for DOM readiness and safely ignores pages without catalogs', () => {
    let ready;
    vm.runInNewContext(script, {document: {
        readyState: 'loading', querySelectorAll: () => [],
        addEventListener(event, handler) {assert.equal(event, 'DOMContentLoaded');ready = handler;}
    }});
    assert.equal(typeof ready, 'function');assert.doesNotThrow(ready);
});
