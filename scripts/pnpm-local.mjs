#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cachedPnpm = path.join(root, "work", "corepack", "v1", "pnpm", "12.4.1", "bin", "pnpm.mjs");
const args = process.argv.slice(2);

const command = existsSync(cachedPnpm)
  ? { bin: process.execPath, args: [cachedPnpm, ...args] }
  : { bin: process.platform === "win32" ? "corepack.cmd" : "corepack", args: ["pnpm", ...args] };

const result = spawnSync(command.bin, command.args, {
  cwd: root,
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
