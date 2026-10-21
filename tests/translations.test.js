'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const dictionary = require('../src/data/translations.json');
const catalog = require('../src/data/products.json');
const fallback = dictionary.languages[dictionary.defaultLanguage].messages;
const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

test('Each shipped language translates every message and preserves interpolation fields', () => {
    for (const [code, language] of Object.entries(dictionary.languages)) {
        assert(language.name && language.locale, `Missing metadata for ${code}`);
        assert.deepEqual(Object.keys(language.messages).sort(), Object.keys(fallback).sort(), code);
        for (const [key, message] of Object.entries(language.messages)) {
            assert.equal(typeof message, 'string', `${code}: ${key}`);
            assert(message.trim(), `${code}: empty ${key}`);
            assert.deepEqual(placeholders(message), placeholders(fallback[key]), `${code}: ${key}`);
        }
    }
});

test('All catalog products have translated names and descriptions in every shipped language', () => {
    for (const language of Object.values(dictionary.languages)) {
        for (const product of Object.values(catalog).flat()) {
            assert(language.messages[`products.${product.id}`], product.id);
            assert(language.messages[`productDescriptions.${product.id}`], `Missing description: ${product.id}`);
        }
    }
});
