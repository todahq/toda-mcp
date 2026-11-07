#!/usr/bin/env node
// toda-mcp: connect Claude Code or Claude Desktop to a Toda site in one command (ADR 0025). It runs the abp-mcp bridge's
// own commands with Toda's settings filled in; any other command goes to the bridge as it is (doctor, login, logout...).
import { spawnSync } from 'node:child_process';
import { BRIDGE, UsageError, connectSteps, parseConnect } from '../src/connect.mjs';

const HELP = `toda-mcp: connect Claude to a Toda site, signed in as you.

  toda-mcp connect <site> [--claude-desktop] [--scope user|project|local] [--name <name>] [--read-only]
      Sets up the abp-mcp bridge for the site, opens your browser to sign in on the site, and adds it to Claude Code
      (or Claude Desktop). You choose on the site's page what Claude may do: read only, or read and write.

  toda-mcp <any abp-mcp command>
      Runs the bridge's own command, such as: toda-mcp doctor <name>, toda-mcp logout <name>, toda-mcp profiles list

Needs Node.js 22 or later.`;

// On Windows npx is a .cmd, which runs only through a shell; every argument here is checked first (connect.mjs).
const bridge = (args) =>
  spawnSync('npx', ['-y', BRIDGE, ...args], { stdio: 'inherit', shell: process.platform === 'win32' }).status ?? 1;

function main(argv) {
  const [command, ...rest] = argv;
  if (command === undefined || command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP);
    return 0;
  }

  if (command !== 'connect') {
    return bridge(argv);
  }

  const { profile, steps } = connectSteps(parseConnect(rest));
  for (const step of steps) {
    const status = bridge(step);
    if (status !== 0) {
      console.error(`\ntoda-mcp: "abp-mcp ${step.join(' ')}" stopped (exit ${status}). Fix what it says, then run toda-mcp connect again, or toda-mcp doctor ${profile}.`);
      return status;
    }
  }

  console.log(`\nConnected: Claude starts the bridge for ${profile} by itself from now on. Check it any time with: toda-mcp doctor ${profile}`);
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`toda-mcp: ${error.message}\nRun toda-mcp --help for usage.`);
    process.exitCode = 2;
  } else {
    throw error;
  }
}
