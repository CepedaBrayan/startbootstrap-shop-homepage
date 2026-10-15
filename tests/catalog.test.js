'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../src/data/products.json');
const backgrounds = require('../src/data/image-backgrounds.json');
const assetRoot = path.resolve(__dirname, '../src/assets/img');

test('Catalog IDs, inventory and image references are valid', () => {
    const ids = new Set();
    for (const product of Object.values(catalog).flat()) {
        assert.match(product.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        assert(!ids.has(product.id), `Duplicate ID: ${product.id}`);
        ids.add(product.id);
        assert(Number.isInteger(product.quantity) && product.quantity >= 0, product.id);
        assert(Number.isFinite(product.price) && product.price >= 0, product.id);
        assert(Array.isArray(product.images), product.id);
        assert.equal(new Set(product.images).size, product.images.length, product.id);
        for (const image of product.images) {
            const file = path.resolve(assetRoot, image);
            assert(file.startsWith(assetRoot + path.sep), image);
            assert(fs.statSync(file).isFile(), image);
            assert.match(backgrounds[image] || '', /^#[0-9a-f]{6}$/i, `Missing/invalid backdrop: ${image}`);
        }
    }
});

test('Every configured image background is a hex color for an existing asset', () => {
    for (const [image, color] of Object.entries(backgrounds)) {
        assert.match(color, /^#[0-9a-f]{6}$/i, image);
        const file = path.resolve(assetRoot, image);
        assert(file.startsWith(assetRoot + path.sep), image);
        assert(fs.statSync(file).isFile(), image);
    }
});
