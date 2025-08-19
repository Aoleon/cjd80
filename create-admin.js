import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./server/db.js";
import { admins } from "./shared/schema.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("Admin123!");
    
    await db.insert(admins).values({
      email: "admin@cjd-amiens.fr",
      password: hashedPassword,
      addedBy: null,
    });
    
    console.log("✅ Compte administrateur créé avec succès !");
    console.log("📧 Email: admin@cjd-amiens.fr");
    console.log("🔐 Mot de passe: Admin123!");
    console.log("⚠️  Changez ce mot de passe après la première connexion");
    
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      console.log("ℹ️  Compte administrateur déjà existant");
      console.log("📧 Email: admin@cjd-amiens.fr");
      console.log("🔐 Mot de passe: Admin123!");
    } else {
      console.error("❌ Erreur lors de la création du compte:", error.message);
    }
    process.exit(1);
  }
}

createAdmin();