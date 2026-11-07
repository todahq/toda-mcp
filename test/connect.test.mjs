import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BRIDGE, CLIENT_ID, UsageError, connectSteps, parseConnect, profileOf, siteOf } from '../src/connect.mjs';

test('connect sets up the bridge with Toda\'s client, then signs in, then adds it to Claude Code', () => {
  const { profile, steps } = connectSteps(parseConnect(['https://toda.example.com/some/page']));
  assert.equal(profile, 'toda-toda-example-com');
  assert.deepEqual(steps, [
    ['profiles', 'add', profile, '--url', 'https://toda.example.com/mcp', '--stage', 'production', '--auth', 'browser',
      '--client-id', CLIENT_ID, '--preset', 'all'],
    ['login', profile],
    ['install', profile, '--claude-code'],
  ]);
  assert.equal(CLIENT_ID, 'toda-mcp');
  assert.match(BRIDGE, /^abp-mcp@0\.6\.\d+$/);
});

test('Claude Desktop, a scope, a name and read-only go to the bridge as its own flags', () => {
  const desktop = connectSteps(parseConnect(['https://toda.example.com', '--claude-desktop', '--name', 'work', '--read-only']));
  assert.deepEqual(desktop.steps[0].slice(-2), ['--preset', 'read-only']);
  assert.deepEqual(desktop.steps[2], ['install', 'work', '--claude-desktop']);
  assert.deepEqual(connectSteps(parseConnect(['https://t.example', '--scope', 'project'])).steps[2],
    ['install', 'toda-t-example', '--claude-code', '--scope', 'project']);
});

test('only https sites, or http on this machine, and nothing a shell would read', () => {
  assert.equal(siteOf('http://localhost:3000/x?y=1'), 'http://localhost:3000');
  assert.equal(siteOf('https://toda.example.com:8443'), 'https://toda.example.com:8443');
  for (const bad of ['http://toda.example.com', 'ftp://toda.example.com', 'toda.example.com', 'https://a:b@toda.example.com']) {
    assert.throws(() => siteOf(bad), UsageError, bad);
  }
});

test('names, scopes and options are checked before anything runs', () => {
  assert.throws(() => profileOf('https://t.example', 'Work & play'), UsageError);
  assert.throws(() => connectSteps({ site: 'https://t.example', scope: 'everyone' }), UsageError);
  assert.throws(() => connectSteps({ site: 'https://t.example', desktop: true, scope: 'user' }), UsageError);
  assert.throws(() => parseConnect([]), UsageError);
  assert.throws(() => parseConnect(['https://a.example', 'https://b.example']), UsageError);
  assert.throws(() => parseConnect(['https://a.example', '--wat']), UsageError);
});
