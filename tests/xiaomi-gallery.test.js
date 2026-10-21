'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const catalog = require('../src/data/products.json');
const dictionary = require('../src/data/translations.json');

test('Xiaomi listing has the approved inventory and translated condition', () => {
    const product = catalog.garage.find(item => item.id === 'xiaomi-smart-band-8-pro');
    assert(product);
    assert.equal(product.quantity, 1);
    assert.equal(product.price, 120000);
    assert.equal(product.size, null);
    assert.equal(product.sizeUnit, null);
    assert.equal(product.images.length, 7);
    assert.match(dictionary.languages.en.messages[`products.${product.id}`], /used - good condition/);
    assert.match(dictionary.languages.es.messages[`products.${product.id}`], /usado - buen estado/);
});

test('All seven Xiaomi photos preserve their original JPEG bytes', () => {
    // SHA-256 of the supplied originals, in gallery order (IMG_9304, 9306,
    // 9305, 9303, 9302, 9307, 9308). The last is embedded, not re-encoded.
    const hashes = [
        'e4afa6f4bf92d47d1b1448c3d8395f1ccfafeb8539d7aaed2de9d8bffe4102db',
        '40e1717aaf029cdaf4c57670b870cd57b0f0b19faaf3a6f71b4912859289e1c2',
        '97a8fac30fa2b3625bad2f9ffc0fa739c1420716f00b38635ef798e9cffa349f',
        '71372b9a2ffa238b059ccb7d5cbb8fb9585252112de6ed82a058a5e9260950bc',
        'b881d21209002e67a803f3b96a12ff66bf72614a53bd9b0c3458bb24921f7895',
        'efc30b3bf65dfea7224e9bcbe6091f0aebd879681b5b2fa195ebc3e010f25200',
        '84477d2d44477f760be6312ffc62598094904cb06ae367c5216ff1548a256479'
    ];
    const product = catalog.garage.find(item => item.id === 'xiaomi-smart-band-8-pro');
    for (const [index, image] of product.images.entries()) {
        let bytes = fs.readFileSync(path.join(__dirname, '../src/assets/img', image));
        if (image.endsWith('.svg')) {
            const svg = bytes.toString('utf8');
            assert.match(svg, /width="1152" height="1536" viewBox="0 0 1152 1536"/);
            assert.match(svg, /transform="translate\(0 1536\) rotate\(-90\)"/);
            const embedded = svg.match(/href="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
            assert(embedded, 'Rotation wrapper must contain the original photo');
            assert.equal((svg.match(/href=/g) || []).length, 1);
            assert(!/<script|<foreignObject|\son\w+=/i.test(svg));
            bytes = Buffer.from(embedded[1], 'base64');
        }
        assert.equal(createHash('sha256').update(bytes).digest('hex'), hashes[index], image);
    }
});
