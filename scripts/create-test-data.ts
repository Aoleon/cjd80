// Script pour créer des données de test (admin + membre)
import 'dotenv/config';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from '../server/db.js';
import { admins, members } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestData() {
  try {
    console.log('🔧 Création des données de test...\n');

    // Créer un admin de test
    const testAdminEmail = 'test@admin.com';
    const testAdminPassword = 'TestAdmin123!';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, testAdminEmail)).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword(testAdminPassword);
      await db.insert(admins).values({
        email: testAdminEmail,
        password: hashedPassword,
        addedBy: 'system',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active',
        isActive: true
      });
      console.log('✅ Admin de test créé avec succès');
    } else {
      // Mettre à jour l'admin existant pour s'assurer qu'il est actif
      const hashedPassword = await hashPassword(testAdminPassword);
      await db.update(admins)
        .set({
          password: hashedPassword,
          status: 'active',
          isActive: true,
          role: 'super_admin'
        })
        .where(eq(admins.email, testAdminEmail));
      console.log('✅ Admin de test mis à jour avec succès');
    }

    // Créer un membre de test
    const testMemberEmail = 'test.member@example.com';
    
    // Vérifier si le membre existe déjà
    const existingMember = await db.select().from(members).where(eq(members.email, testMemberEmail)).limit(1);
    
    if (existingMember.length === 0) {
      await db.insert(members).values({
        email: testMemberEmail,
        firstName: 'Jean',
        lastName: 'Dupont',
        company: 'Entreprise Test',
        phone: '0123456789',
        role: 'CEO',
        status: 'active',
        engagementScore: 75,
        activityCount: 10,
        firstSeenAt: new Date(),
        lastActivityAt: new Date(),
      });
      console.log('✅ Membre de test créé avec succès');
    } else {
      console.log('ℹ️  Membre de test existe déjà');
    }

    console.log('\n🔐 Identifiants de test:');
    console.log('Admin:');
    console.log(`  Email: ${testAdminEmail}`);
    console.log(`  Mot de passe: ${testAdminPassword}`);
    console.log('\nMembre de test:');
    console.log(`  Email: ${testMemberEmail}`);
    console.log('\n✅ Données de test prêtes !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    const { pool } = await import('../server/db.js');
    await pool.end();
    process.exit(0);
  }
}

createTestData();

