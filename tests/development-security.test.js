'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {once} = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const browserSync = require('browser-sync');
const config = require('../scripts/browser-sync-config');

test('Development server binds only to loopback and serves only dist, without UI or tunnel', {timeout: 15000}, async t => {
    const bs = browserSync.create('development-security-test');
    t.after(() => bs.exit());
    await new Promise((resolve, reject) => bs.init({
        ...config, port: 0, open: false, files: false, watch: false, logLevel: 'silent'
    }, error => error ? reject(error) : resolve()));
    const server = bs.instance.server;
    if (!server.listening) await once(server, 'listening');
    const address = server.address();
    assert.equal(address.address, '127.0.0.1');
    assert.equal(bs.getOption('ui'), false);
    assert.equal(bs.getOption('tunnel'), false);
    const base = `http://127.0.0.1:${address.port}`;
    assert.equal((await fetch(base + '/')).status, 200);
    for (const file of ['/.env', '/.env.example', '/package.json', '/scripts/start.js']) {
        assert.equal((await fetch(base + file)).status, 404, file);
    }
});

test('Environment template contains only an empty WhatsApp variable', () => {
    const root = path.resolve(__dirname, '..');
    assert.equal(fs.readFileSync(path.join(root, '.env.example'), 'utf8'), 'WPP_ID=\n');
});
