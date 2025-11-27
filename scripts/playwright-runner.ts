#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import os from "os";
import { spawnSync } from "child_process";
import { Client as MinioClient } from "minio";
import { fileURLToPath } from "url";

interface RunnerConfig {
  configFile?: string;
  projects?: string[];
  reporter?: string;
  retries?: number;
  envFile?: string;
  reportDir?: string;
  upload?: {
    enabled?: boolean;
    bucket?: string;
    prefix?: string;
    retainLocal?: boolean;
  };
}

interface CliOptions {
  projectPath?: string;
  skipUpload?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const matrixPath = path.join(__dirname, "..", "config", "playwright.matrix.json");

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};
  for (const arg of args) {
    if (arg.startsWith("--project=")) {
      options.projectPath = arg.replace("--project=", "");
    } else if (arg.startsWith("--projectPath=")) {
      options.projectPath = arg.replace("--projectPath=", "");
    } else if (arg === "--skip-upload" || arg === "--skipUpload") {
      options.skipUpload = true;
    }
  }
  return options;
}

function loadMatrix(): Record<string, RunnerConfig> {
  if (!fs.existsSync(matrixPath)) {
    return { default: {} };
  }
  return JSON.parse(fs.readFileSync(matrixPath, "utf-8")) as Record<string, RunnerConfig>;
}

function loadEnvFile(filePath: string) {
  if (!filePath) return;
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) return;
  const content = fs.readFileSync(absolute, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Répertoire introuvable: ${dir}`);
  }
}

async function uploadReport(archivePath: string, objectName: string, bucket?: string) {
  const endpoint = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
  const parsed = new URL(endpoint);
  const port = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;
  const useSSL = parsed.protocol === "https:" || process.env.MINIO_USE_SSL === "true";
  const client = new MinioClient({
    endPoint: parsed.hostname,
    port,
    useSSL,
    accessKey: process.env.MINIO_ACCESS_KEY ?? "",
    secretKey: process.env.MINIO_SECRET_KEY ?? "",
  });

  const bucketName = bucket ?? process.env.MINIO_BUCKET_TEST_REPORTS ?? "qa-test-reports";

  const bucketExists = await new Promise<boolean>((resolve, reject) => {
    client.bucketExists(bucketName, (err, exists) => {
      if (err && err.code !== "NoSuchBucket") {
        reject(err);
        return;
      }
      resolve(Boolean(exists));
    });
  });

  if (!bucketExists) {
    await new Promise<void>((resolve, reject) => {
      client.makeBucket(bucketName, (err?: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  await new Promise<void>((resolve, reject) => {
    client.fPutObject(bucketName, objectName, archivePath, { "Content-Type": "application/gzip" }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function main() {
  const options = parseArgs();
  const projectPath = path.resolve(options.projectPath ?? process.cwd());
  ensureDirectoryExists(projectPath);

  const matrix = loadMatrix();
  const config: RunnerConfig = {
    ...(matrix.default ?? {}),
    ...(matrix[projectPath] ?? {}),
  };

  if (config.envFile) {
    loadEnvFile(path.join(projectPath, config.envFile));
  }

  const playwrightArgs = ["playwright", "test"];
  if (config.configFile) {
    playwrightArgs.push(`--config=${config.configFile}`);
  }
  if (config.projects && config.projects.length) {
    for (const project of config.projects) {
      playwrightArgs.push(`--project=${project}`);
    }
  }
  if (config.reporter) {
    playwrightArgs.push(`--reporter=${config.reporter}`);
  }
  if (config.retries !== undefined) {
    playwrightArgs.push(`--retries=${config.retries}`);
  }

  const result = spawnSync("npx", playwrightArgs, {
    cwd: projectPath,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error("Playwright tests failed");
  }

  if (config.upload?.enabled !== false && !options.skipUpload) {
    const reportDir = path.join(projectPath, config.reportDir ?? "playwright-report");
    if (fs.existsSync(reportDir)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const prefix = config.upload?.prefix ?? path.basename(projectPath);
      const objectName = `${prefix}/${timestamp}-playwright-report.tar.gz`;
      const archivePath = path.join(os.tmpdir(), `playwright-report-${Date.now()}.tar.gz`);
      const tarResult = spawnSync("tar", ["-czf", archivePath, "-C", reportDir, "."]);
      if (tarResult.status !== 0) {
        console.warn("⚠️ Impossible de compresser le rapport Playwright");
      } else {
        await uploadReport(archivePath, objectName, config.upload?.bucket);
        console.log(`☁️  Rapport Playwright envoyé vers MinIO (${objectName})`);
        if (!config.upload?.retainLocal) {
          fs.unlinkSync(archivePath);
        }
      }
    } else {
      console.warn(`⚠️ Aucun rapport Playwright trouvé dans ${reportDir}`);
    }
  }
}

main().catch((error) => {
  console.error("❌ playwight-runner", error);
  process.exit(1);
});
