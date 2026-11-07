# Changelog

All notable changes to `@todahq/mcp` are documented here. The project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-11-07

The first release from this repository's CI, through npm's Trusted Publishing, with provenance.

### Changed

- The package names its repository, homepage and issues, and carries its LICENSE.
- `bin` names the CLI as npm writes it, so publishing corrects nothing.

## [0.1.0] — 2026-11-07

### Added

- `toda-mcp connect <site>`: sets up the [abp-mcp bridge](https://github.com/tekthar/abp-mcp/tree/main/bridge) 0.6.0
  for a Toda site (its `/mcp`, the site's `toda-mcp` client, browser sign-in), signs you in, and adds the site to Claude
  Code, or to Claude Desktop with `--claude-desktop`. `--scope`, `--name` and `--read-only` go to the bridge.
- Any other command goes to the bridge as it is (`doctor`, `login`, `logout`, `profiles list`).
