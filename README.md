# @todahq/mcp

Connect Claude Code or Claude Desktop to a Toda site in one command, signed in as you.

```bash
npx -y @todahq/mcp connect https://toda.example.com
```

It sets up the [abp-mcp bridge](https://github.com/tekthar/abp-mcp/tree/main/bridge) for the site, opens your browser
to sign in on the site, and adds the site to Claude Code. On the site's page you choose what Claude may do: read
only, or read and write. You take it back under "Apps you've allowed" on your page in Toda.

You need Node.js 22 or later. Your own page in Toda shows the same command with the site's address filled in.

Toda is at [todahq](https://github.com/todahq); this wrapper is Apache-2.0 licensed, and RELEASING.md says how it's published.

## Options

| Option | Does |
|---|---|
| `--claude-desktop` | Adds the site to Claude Desktop instead of Claude Code. |
| `--scope user\|project\|local` | Claude Code's scope (`user` by default). |
| `--name <name>` | The profile's name (`toda-` and the site's host by default). |
| `--read-only` | Has the bridge hold back every tool that writes, whatever you allow on the site. |

Any other command goes to the bridge as it is: `npx -y @todahq/mcp doctor <name>` checks each step, and
`npx -y @todahq/mcp logout <name>` signs out and forgets the sign-in.

## What it runs

```bash
npx -y abp-mcp@0.6.0 profiles add toda-toda-example-com --url https://toda.example.com/mcp --stage production \
  --auth browser --client-id toda-mcp --preset all
npx -y abp-mcp@0.6.0 login toda-toda-example-com
npx -y abp-mcp@0.6.0 install toda-toda-example-com --claude-code
```

Every Toda site has the `toda-mcp` client for the bridge: a public client with PKCE, sending you back only to the
bridge on your own machine (`http://127.0.0.1:33418-33420/callback`). The bridge keeps your refresh token in your
operating system's keychain.

## Tools

Toda's own tools are listed for Claude at once. A plugin's tools are found when they're needed: Claude searches with
`mcp_search_tools`, reads one with `mcp_describe_tools` and calls it with `mcp_call_tool`. So a site with many plugins
doesn't fill Claude's context before the conversation starts.
