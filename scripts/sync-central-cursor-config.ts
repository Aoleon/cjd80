#!/usr/bin/env tsx

/**
 * Synchronise la configuration Cursor centrale (règles, docs, scripts) vers tous les projets.
 * Utilisation :
 *   npx tsx scripts/sync-central-cursor-config.ts
 *   CURSOR_CONFIG_TARGETS="/chemin/projet1,/chemin/projet2" npx tsx scripts/sync-central-cursor-config.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveProjectTargets } from "./utils/projectTargets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
let cliTargets: string[] | undefined;

for (const arg of args) {
  if (arg.startsWith("--targets=")) {
    cliTargets = arg
      .replace("--targets=", "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

const repoRoot = path.resolve(__dirname, "..");
const targets = resolveProjectTargets({ cliTargets });

if (targets.length === 0) {
  console.warn("⚠️  Aucun dépôt détecté sous /Users/thibault/Dev. Ajoutez --targets ou définissez CURSOR_CONFIG_TARGETS.");
}

const directoriesToCopy = [".cursor", ".cursor-config-export"];
const filesToCopy = [
  ".cursorrules",
  ".cursorignore",
  path.join("config", "shared-env.defaults"),
  path.join("config", "ssh_connections.json"),
  path.join("config", "ssh_connections.local.example"),
];
const docsToCopy = [
  "AGENT_COORDINATION_STATE.json",
  "AGENT_TASKS_QUEUE.json",
  "AGENT_EVENTS.json",
  "AGENT_ROLES_CONFIG.json",
  "AGENT_MODELS_MATRIX.md",
  "AGENT_METRICS.json",
  "AGENT_INSIGHTS.md",
  "AGENT_AUTOMATED_FEEDBACK.md",
  "AGENT_MCP_TOOLS.md",
  "AUTONOMOUS_RUN_PROTOCOL.md",
  "AUTONOMY_CRON.md",
];
const scriptsToCopy = [
  "autonomous-run.ts",
  "update-agent-metrics.ts",
  "sync-central-cursor-config.ts",
  "audit-autonomous-config.ts",
  "generate-agent-insights.ts",
  "manage-agent-tasks.ts",
  "autonomous-cron.sh",
  "ensure-shared-env.ts",
  "aggregate-ssh-connections.ts",
  "agent-feedback-loop.ts",
  "playwright-runner.ts",
  "bootstrap-agent.ts",
];

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`📁 Copié ${src} -> ${dest}`);
}

function copyFile(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`📄 Copié ${src} -> ${dest}`);
}

function syncProject(projectPath: string) {
  if (!fs.existsSync(projectPath)) {
    console.warn(`⚠️  Projet introuvable: ${projectPath}`);
    return;
  }

  for (const dirName of directoriesToCopy) {
    const srcDir = path.join(repoRoot, dirName);
    const destDir = path.join(projectPath, dirName);
    copyDir(srcDir, destDir);
  }

  for (const fileName of filesToCopy) {
    const srcFile = path.join(repoRoot, fileName);
    const destFile = path.join(projectPath, fileName);
    copyFile(srcFile, destFile);
  }

  for (const docName of docsToCopy) {
    const srcDoc = path.join(repoRoot, "docs", docName);
    const destDoc = path.join(projectPath, "docs", docName);
    copyFile(srcDoc, destDoc);
  }

  for (const scriptName of scriptsToCopy) {
    const srcScript = path.join(repoRoot, "scripts", scriptName);
    const destScript = path.join(projectPath, "scripts", scriptName);
    copyFile(srcScript, destScript);
  }
}

function main() {
  console.log("🔁 Synchronisation de la configuration Cursor centrale...");
  for (const target of targets) {
    syncProject(target);
  }
  console.log("✅ Synchronisation terminée");
}

main();
