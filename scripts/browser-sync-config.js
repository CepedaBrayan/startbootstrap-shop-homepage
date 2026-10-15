'use strict';
const path = require('node:path');

// Development is available only on this computer, never on the LAN.
module.exports = {
    server: path.resolve(__dirname, '../dist'),
    files: path.resolve(__dirname, '../dist/**/*'),
    listen: '127.0.0.1',
    host: '127.0.0.1',
    localOnly: true,
    ui: false,
    online: false,
    tunnel: false,
    reloadDelay: 2000,
    reloadDebounce: 2000
};
