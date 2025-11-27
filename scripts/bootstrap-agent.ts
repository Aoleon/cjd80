#!/usr/bin/env tsx

import { spawnSync } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

interface CliOptions {
  installCron?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(path.join(__dirname, ".."));

function parseArgs(): CliOptions {
  const opts: CliOptions = {};
  for (const arg of process.argv.slice(2)) {
    if (arg === "--install-cron") {
      opts.installCron = true;
    }
  }
  return opts;
}

function runStep(label: string, command: string[], cwd: string = repoRoot) {
  console.log(`➡️  ${label}`);
  const result = spawnSync(command[0], command.slice(1), { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Échec étape: ${label}`);
  }
}

function ensureCronEntry(scriptPath: string) {
  const cronLine = `0 * * * * cd ${repoRoot} && ${scriptPath} >> ${path.join(os.homedir(), "logs", "autonomy.log")} 2>&1`;
  const current = spawnSync("crontab", ["-l"], { encoding: "utf-8" });
  let cronText = "";
  if (current.status === 0 && current.stdout) {
    cronText = current.stdout;
    if (cronText.includes(scriptPath)) {
      console.log("⏱️  Cron déjà configuré.");
      return;
    }
  }
  const updated = `${cronText.trim()}\n${cronLine}\n`;
  const apply = spawnSync("crontab", ["-"], { input: updated, encoding: "utf-8" });
  if (apply.status !== 0) {
    throw new Error("Impossible d'installer la tâche cron");
  }
  console.log("⏱️  Cron autonome installé");
}

function main() {
  const options = parseArgs();
  runStep("Installation des dépendances npm", ["npm", "install"]);
  runStep("Bootstrap de l'environnement Python", ["bash", "scripts/bootstrap.sh"]);
  runStep("Installation Playwright (dépendances)", ["npx", "playwright", "install", "--with-deps"]);
  runStep("Injection des variables partagées", ["npx", "tsx", "scripts/ensure-shared-env.ts"]);
  runStep("Synchronisation de la configuration Cursor", ["npx", "tsx", "scripts/sync-central-cursor-config.ts"]);

  if (options.installCron) {
    const scriptPath = path.join(repoRoot, "scripts", "autonomous-cron.sh");
    ensureCronEntry(scriptPath);
  } else {
    console.log("ℹ️  Ajoutez --install-cron pour programmer la routine autonome.");
  }

  console.log("✅ Bootstrap complet");
}

main();
