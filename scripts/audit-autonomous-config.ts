#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { resolveProjectTargets } from "./utils/projectTargets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, "..");

const directoriesToCheck = [".cursor", ".cursor-config-export"];
const filesToCheck = [
  ".cursorrules",
  ".cursorignore",
  path.join("config", "shared-env.defaults"),
  path.join("config", "ssh_connections.json"),
  path.join("config", "ssh_connections.local.example"),
];
const docsToCheck = [
  "AGENT_COORDINATION_STATE.json",
  "AGENT_TASKS_QUEUE.json",
  "AGENT_EVENTS.json",
  "AGENT_ROLES_CONFIG.json",
  "AGENT_MODELS_MATRIX.md",
  "AGENT_METRICS.json",
  "AUTONOMOUS_RUN_PROTOCOL.md",
  "AGENT_AUTOMATED_FEEDBACK.md",
  "AGENT_INSIGHTS.md",
  "AGENT_MCP_TOOLS.md",
  "AUTONOMY_CRON.md",
];
const scriptsToCheck = [
  "autonomous-run.ts",
  "sync-central-cursor-config.ts",
  "update-agent-metrics.ts",
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

interface CliOptions {
  targets: string[];
  fix: boolean;
  json: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let cliTargets: string[] | undefined;
  let fix = false;
  let json = false;

  for (const arg of args) {
    if (arg.startsWith("--targets=")) {
      cliTargets = arg.replace("--targets=", "").split(",").map((t) => t.trim()).filter(Boolean);
    } else if (arg === "--fix") {
      fix = true;
    } else if (arg === "--json") {
      json = true;
    }
  }

  const targets = resolveProjectTargets({ cliTargets });
  return { targets, fix, json };
}

function hashFile(filePath: string) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hashDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return null;
  }
  const hash = crypto.createHash("sha256");
  const files: string[] = [];

  function walk(current: string) {
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        walk(path.join(current, entry));
      }
    } else {
      files.push(current);
    }
  }

  walk(dirPath);
  files.sort().forEach((file) => {
    hash.update(file.replace(dirPath, ""));
    hash.update(fs.readFileSync(file));
  });
  return hash.digest("hex");
}

function compareHashes(type: string, srcHash: string | null, destHash: string | null) {
  if (srcHash === null && destHash === null) return { status: "missing", message: `${type} absent des deux côtés` };
  if (destHash === null) return { status: "missing", message: `${type} absent dans le projet cible` };
  if (srcHash !== destHash) return { status: "mismatch", message: `${type} différent de la source` };
  return { status: "ok", message: `${type} synchronisé` };
}

function auditProject(projectPath: string) {
  if (!fs.existsSync(projectPath)) {
    return { target: projectPath, error: "Projet introuvable" };
  }

  const findings: Array<{ item: string; status: string; message: string }> = [];

  for (const dirName of directoriesToCheck) {
    const srcDir = path.join(repoRoot, dirName);
    const destDir = path.join(projectPath, dirName);
    const result = compareHashes(
      dirName,
      hashDirectory(srcDir),
      fs.existsSync(destDir) ? hashDirectory(destDir) : null
    );
    findings.push({ item: dirName, status: result.status, message: result.message });
  }

  const files = [...filesToCheck, ...docsToCheck.map((doc) => path.join("docs", doc)), ...scriptsToCheck.map((s) => path.join("scripts", s))];
  for (const relPath of files) {
    const srcPath = path.join(repoRoot, relPath);
    const destPath = path.join(projectPath, relPath);
    const hasSrc = fs.existsSync(srcPath);
    const hasDest = fs.existsSync(destPath);
    const result = compareHashes(
      relPath,
      hasSrc ? hashFile(srcPath) : null,
      hasDest ? hashFile(destPath) : null
    );
    findings.push({ item: relPath, status: result.status, message: result.message });
  }

  const mismatches = findings.filter((f) => f.status !== "ok");
  return {
    target: projectPath,
    ok: mismatches.length === 0,
    findings,
  };
}

function main() {
  const options = parseArgs();
  const results = options.targets.map((target) => auditProject(target));

  if (options.json) {
    console.log(JSON.stringify({ results }, null, 2));
  } else {
    for (const result of results) {
      if ("error" in result) {
        console.error(`❌ ${result.target}: ${result.error}`);
        continue;
      }
      if (result.ok) {
        console.log(`✅ ${result.target}: configuration synchronisée`);
      } else {
        console.warn(`⚠️  ${result.target}: divergences détectées`);
        for (const finding of result.findings.filter((f) => f.status !== "ok")) {
          console.warn(`   - ${finding.item}: ${finding.message}`);
        }
      }
    }
  }

  const hasIssues = results.some((result) => "error" in result || (!result.ok));
  if (hasIssues && options.fix) {
    console.log("🔧 Corrections en cours via sync-central-cursor-config...");
    const syncResult = spawnSync("npx", ["tsx", "scripts/sync-central-cursor-config.ts", `--targets=${options.targets.join(",")}`], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    if (syncResult.status !== 0) {
      console.error("❌ Échec de la synchronisation automatique");
      process.exit(syncResult.status ?? 1);
    }
  } else if (hasIssues) {
    process.exitCode = 1;
  }
}

main();
