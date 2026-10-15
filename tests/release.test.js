'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync, spawnSync} = require('node:child_process');
const releaseScript = path.resolve(__dirname, '../scripts/create-release.sh');
const options = {skip: process.platform === 'win32' ? 'Release integration uses Bash and unzip on the Ubuntu Actions runner' : false};

function fixture(t, initial = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shop-release-test-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    const git = args => execFileSync('git', args, {cwd: dir, encoding: 'utf8'}).trim();
    git(['init', '--quiet']);
    fs.writeFileSync(path.join(dir, 'README.md'), 'tracked source\n');
    fs.writeFileSync(path.join(dir, '.env.example'), 'WPP_ID=\n');
    fs.writeFileSync(path.join(dir, '.gitignore'), '.env\ndist/\nnode_modules/\n');
    git(['add', 'README.md', '.env.example', '.gitignore']);
    git(['-c', 'user.name=Release Test', '-c', 'user.email=test@example.invalid', 'commit', '--quiet', '-m', 'Source fixture']);
    const sha = git(['rev-parse', 'HEAD']);
    fs.writeFileSync(path.join(dir, 'README.md'), 'uncommitted edit\n');
    fs.writeFileSync(path.join(dir, '.env'), 'PRIVATE_TEST_VALUE=not-for-release\n');
    for (const folder of ['dist', 'node_modules']) {
        fs.mkdirSync(path.join(dir, folder));
        fs.writeFileSync(path.join(dir, folder, 'local.txt'), 'local only');
    }
    const bin = path.join(dir, 'bin'); fs.mkdirSync(bin);
    const statePath = path.join(dir, 'gh-state.json');
    fs.writeFileSync(statePath, JSON.stringify({exists: false, calls: [], ...initial}));
    const mock = `#!/usr/bin/env node
const fs=require('fs'),cp=require('child_process');
const p=process.env.MOCK_STATE,s=JSON.parse(fs.readFileSync(p,'utf8')),a=process.argv.slice(2);
s.calls.push(a);function save(){fs.writeFileSync(p,JSON.stringify(s));}
if(a[0]!=='release')process.exit(9);
if(a[1]==='view'){save();if(!s.exists)process.exit(1);console.log(String(s.draft));}
else if(a[1]==='create'){s.exists=true;s.draft=true;save();}
else if(a[1]==='upload'){
 if(s.failUpload){save();process.exit(2);}
 s.assets=cp.execFileSync('unzip',['-Z1',a[3]],{encoding:'utf8'}).trim().split('\\n');
 s.readme=cp.execFileSync('unzip',['-p',a[3],'whatsapp-shop/README.md'],{encoding:'utf8'});save();
}
else if(a[1]==='edit'){if(!s.assets)process.exit(8);s.draft=false;save();}
else process.exit(9);
`;
    fs.writeFileSync(path.join(bin, 'gh'), mock, {mode: 0o755});
    const run = (releaseCommit = sha) => spawnSync('bash', [releaseScript], {
        cwd: dir, encoding: 'utf8', env: {...process.env, PATH: bin + path.delimiter + process.env.PATH,
            GH_TOKEN: 'test-placeholder', GH_REPO: 'example/shop', RELEASE_COMMIT: releaseCommit,
            PR_NUMBER: '42', MERGED_AT: '2026-10-15T21:00:00Z', MOCK_STATE: statePath}
    });
    return {run, state: () => JSON.parse(fs.readFileSync(statePath, 'utf8')), sha, git};
}

test('Release ZIP contains only committed source and publishing is idempotent', options, t => {
    const f = fixture(t);const first = f.run();assert.equal(first.status, 0, first.stderr);
    let s = f.state();assert.equal(s.draft, false);assert.equal(s.readme, 'tracked source\n');
    assert(s.assets.includes('whatsapp-shop/.env.example'));
    assert(!s.assets.some(p => /\/(?:\.env$|dist\/|node_modules\/)/.test(p)));
    const create = s.calls.find(a => a[1] === 'create');
    assert.equal(create[2], 'v2026.10.15.42');assert(create.includes('--generate-notes'));
    assert.equal(create[create.indexOf('--target') + 1], f.sha);
    const count = s.calls.filter(a => a[1] === 'upload').length;
    assert.equal(f.run().status, 0);s = f.state();
    assert.equal(s.calls.filter(a => a[1] === 'upload').length, count);
});

test('An upload failure leaves a draft without publishing', options, t => {
    const f = fixture(t, {failUpload: true});const failed = f.run();
    assert.notEqual(failed.status, 0);assert.equal(f.state().draft, true);
    assert(!f.state().calls.some(a => a[1] === 'edit'));
});

test('An existing draft is completed without recreating the release', options, t => {
    const f = fixture(t, {exists: true, draft: true});const result = f.run();
    assert.equal(result.status, 0, result.stderr);assert.equal(f.state().draft, false);
    assert(!f.state().calls.some(a => a[1] === 'create'));
});

test('Release refuses a commit that tracks an environment file', options, t => {
    const f = fixture(t);
    f.git(['add', '--force', '.env']);
    f.git(['-c', 'user.name=Release Test', '-c', 'user.email=test@example.invalid', 'commit', '--quiet', '-m', 'Unsafe fixture']);
    const result = f.run(f.git(['rev-parse', 'HEAD']));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /containing local environment files/);
    assert.deepEqual(f.state().calls, []);
});
