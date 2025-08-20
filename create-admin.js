// Script pour créer/modifier les administrateurs avec hash Scrypt
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from './server/db.js';
import { admins } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmins() {
  try {
    // Supprimer les anciens admins
    await db.delete(admins);
    
    // Créer Thibault comme admin principal
    const thibaultPassword = await hashPassword('CjdAdmin2025!');
    await db.insert(admins).values({
      email: 'thibault@youcom.io',
      password: thibaultPassword,
      addedBy: 'system'
    });
    console.log('✅ Admin Thibault créé avec succès');
    
    // Créer Maxence comme second admin
    const maxencePassword = await hashPassword('MaxAdmin2025!');
    await db.insert(admins).values({
      email: 'maxencebonduelle@gmail.com',
      password: maxencePassword,
      addedBy: 'thibault@youcom.io'
    });
    console.log('✅ Admin Maxence créé avec succès');
    
    console.log('\n🔐 Identifiants de connexion:');
    console.log('Thibault: thibault@youcom.io / CjdAdmin2025!');
    console.log('Maxence: maxencebonduelle@gmail.com / MaxAdmin2025!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

createAdmins();