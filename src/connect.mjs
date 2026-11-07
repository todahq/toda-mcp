// Toda's wrapper around the abp-mcp bridge (ADR 0025, abp-mcp 0.6.0): what `toda-mcp connect <site>` runs, as plain
// steps a test can check without running anything. The bridge does the work; this only fills in Toda's settings.

/** The bridge version this wrapper sets up. The command Claude runs afterwards is the bridge's own (`npx -y abp-mcp`). */
export const BRIDGE = 'abp-mcp@0.6.0';

/** The client every Toda site seeds for the bridge (Toda.Guard.Integration's OidcClientSeeder.BridgeClientId). */
export const CLIENT_ID = 'toda-mcp';

export class UsageError extends Error {}

/**
 * The site's address, checked: https, or http only on this machine (as the bridge requires). Only the origin is kept,
 * and it may hold nothing a shell would read, since on Windows the bridge's commands run through one.
 */
export function siteOf(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new UsageError(`"${text}" isn't an address. Give the site's address, such as https://toda.example.com`);
  }

  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new UsageError('The address must start with https:// (http:// only for this machine).');
  }

  if (url.username || url.password) {
    throw new UsageError("The address can't hold a user name or a password.");
  }

  const origin = url.origin;
  if (!/^https?:\/\/[A-Za-z0-9.\-[\]:]+$/.test(origin)) {
    throw new UsageError(`"${origin}" holds characters a site's address doesn't.`);
  }

  return origin;
}

/** The profile's name: given, or "toda-" and the site's host, so two sites don't share one. */
export function profileOf(site, name) {
  if (name !== undefined) {
    if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(name)) {
      throw new UsageError('A name is up to 60 lowercase letters, digits and hyphens, starting with a letter or digit.');
    }

    return name;
  }

  const host = new URL(site).hostname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `toda-${host}`.slice(0, 60);
}

/**
 * The bridge commands for `connect`, in order: add the profile, sign in, add it to Claude. The site's own consent page
 * decides what the agent may do (reading only, or reading and writing), so the bridge's own filter lets everything
 * through unless `readOnly` asks it to hold writes back too.
 */
export function connectSteps({ site, name, desktop = false, scope, readOnly = false }) {
  const origin = siteOf(site);
  const profile = profileOf(origin, name);
  if (scope !== undefined && !['user', 'project', 'local'].includes(scope)) {
    throw new UsageError('--scope is user, project or local.');
  }

  if (desktop && scope !== undefined) {
    throw new UsageError('--scope is for Claude Code only.');
  }

  const add = ['profiles', 'add', profile, '--url', `${origin}/mcp`, '--stage', 'production', '--auth', 'browser',
    '--client-id', CLIENT_ID, '--preset', readOnly ? 'read-only' : 'all'];
  const install = desktop ? ['install', profile, '--claude-desktop'] : ['install', profile, '--claude-code', ...(scope ? ['--scope', scope] : [])];
  return { profile, steps: [add, ['login', profile], install] };
}

/** `connect`'s arguments: the site, then --name, --claude-desktop, --scope and --read-only. */
export function parseConnect(args) {
  const options = {};
  const rest = [...args];
  while (rest.length > 0) {
    const arg = rest.shift();
    if (arg === '--name') options.name = rest.shift();
    else if (arg === '--claude-desktop') options.desktop = true;
    else if (arg === '--claude-code') options.desktop = false;
    else if (arg === '--scope') options.scope = rest.shift();
    else if (arg === '--read-only') options.readOnly = true;
    else if (arg.startsWith('--')) throw new UsageError(`Unknown option ${arg}.`);
    else if (options.site === undefined) options.site = arg;
    else throw new UsageError(`One site at a time ("${arg}" is one too many).`);
  }

  if (options.site === undefined) {
    throw new UsageError("Give the site's address: toda-mcp connect https://toda.example.com");
  }

  return options;
}
