# Releasing

`@todahq/mcp` is published to npm from this repository's CI, through npm's Trusted Publishing: npm gives the
`publish` job a short-lived token over OIDC, so no npm token is stored anywhere, and the package carries provenance
that ties it to the commit and the workflow run.

## A release

1. Update `version` in `package.json` and add the version's section to `CHANGELOG.md`. Merge it to `main`.
2. Tag the merge commit `v<version>` and push the tag:

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

3. CI runs the tests, checks that the tag is `package.json`'s version and that npm doesn't have it yet, publishes,
   and makes the GitHub release. The `publish` job runs in the `release` environment, so it waits for a reviewer
   there if the environment asks for one.

## The trusted publisher (set up once)

On npmjs.com, in `@todahq/mcp`'s settings, under Trusted Publisher, choose GitHub Actions and fill in:

| Field | Value |
| --- | --- |
| Organization or user | `todahq` |
| Repository | `toda-mcp` |
| Workflow filename | `ci.yml` |
| Environment name | `release` |

Publishing access doesn't require two-factor authentication, and tokens aren't disallowed: CI needs neither, since
its token comes over OIDC. That also means an npm token with publish rights on this package can still publish, so
keep such tokens out of machines and CI that don't need them. A package must exist on npm before a trusted publisher
can be set up, so its first version (0.1.0) was published by hand.
