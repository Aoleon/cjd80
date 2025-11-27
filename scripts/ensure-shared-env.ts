#!/usr/bin/env tsx

/**
 * Injecte automatiquement les variables MinIO/GraphQL/Redis/Authentik/Listmonk partagées dans les `.env`
 * des projets détectés dans /Users/thibault/Dev. Si la variable est absente,
 * elle est ajoutée avec la valeur par défaut depuis `config/shared-env.defaults`.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveProjectTargets } from "./utils/projectTargets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultsFile = path.join(repoRoot, "config", "shared-env.defaults");

if (!fs.existsSync(defaultsFile)) {
  console.error(`❌ Fichier de références introuvable: ${defaultsFile}`);
  process.exit(1);
}

function parseEnv(content: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) {
      entries[key] = value;
    }
  }
  return entries;
}

const defaultEntries = parseEnv(fs.readFileSync(defaultsFile, "utf8"));
const requiredKeys = Object.keys(defaultEntries);

function ensureEnvFile(projectPath: string): string {
  const envPath = path.join(projectPath, ".env");
  if (fs.existsSync(envPath)) {
    return envPath;
  }
  const examplePath = path.join(projectPath, ".env.example");
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log(`📄 [.env] Copié depuis .env.example -> ${projectPath}`);
    return envPath;
  }
  fs.writeFileSync(envPath, "# Auto-généré par ensure-shared-env\n");
  console.log(`🆕 [.env] Créé vide -> ${projectPath}`);
  return envPath;
}

function applyDefaultsToEnv(envPath: string) {
  const raw = fs.readFileSync(envPath, "utf8");
  const existingEntries = parseEnv(raw);
  const missing = requiredKeys.filter((key) => !(key in existingEntries));
  if (missing.length === 0) {
    return false;
  }

  const additions = missing.map((key) => `${key}=${defaultEntries[key] ?? ""}`);
  const header = `\n# --- Shared defaults (auto) ${new Date().toISOString()} ---\n`;
  fs.appendFileSync(envPath, header + additions.join("\n") + "\n");
  console.log(`➕ [${path.basename(envPath)}] Ajout de ${missing.length} variables (${missing.join(", ")})`);
  return true;
}

function parseCliTargets(): string[] | undefined {
  const entries: string[] = [];
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--targets=")) {
      entries.push(
        ...arg
          .replace("--targets=", "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      );
    }
  }
  return entries.length ? entries : undefined;
}

function main() {
  const targets = resolveProjectTargets({ cliTargets: parseCliTargets() });
  if (targets.length === 0) {
    console.warn("⚠️ Aucun projet détecté pour injection des .env");
    return;
  }

  let updatedProjects = 0;
  for (const projectPath of targets) {
    try {
      const envPath = ensureEnvFile(projectPath);
      const changed = applyDefaultsToEnv(envPath);
      if (changed) {
        updatedProjects++;
      }
    } catch (error) {
      console.warn(`⚠️ Impossible d'actualiser ${projectPath}: ${String(error)}`);
    }
  }

  console.log(`✅ Injection terminée (${updatedProjects}/${targets.length} projets modifiés)`);
}

main();
