// Script pour créer des données de test (admin + membre)
// NOTE: Avec Authentik, les mots de passe ne sont plus stockés localement
// Ce script crée uniquement les entrées dans la base de données locale
// Les utilisateurs doivent être créés dans Authentik séparément
import 'dotenv/config';
import { db } from '../server/db.js';
import { admins, members } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

async function createTestData() {
  try {
    console.log('🔧 Création des données de test...\n');
    console.log('⚠️  ATTENTION: Avec Authentik, les utilisateurs doivent être créés dans Authentik.\n');

    // Créer un admin de test
    const testAdminEmail = 'test@admin.com';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, testAdminEmail)).limit(1);
    
    if (existingAdmin.length === 0) {
      await db.insert(admins).values({
        email: testAdminEmail,
        password: undefined, // Password géré par Authentik
        addedBy: 'system',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active',
        isActive: true
      });
      console.log('✅ Admin de test créé dans la base de données');
      console.log('   → Créez cet utilisateur dans Authentik avec le même email');
    } else {
      // Mettre à jour l'admin existant pour s'assurer qu'il est actif
      await db.update(admins)
        .set({
          password: undefined, // Password géré par Authentik
          status: 'active',
          isActive: true,
          role: 'super_admin'
        })
        .where(eq(admins.email, testAdminEmail));
      console.log('✅ Admin de test mis à jour dans la base de données');
      console.log('   → Assurez-vous que cet utilisateur existe dans Authentik');
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

    console.log('\n📋 Informations de test:');
    console.log('Admin:');
    console.log(`  Email: ${testAdminEmail}`);
    console.log('  → Créez cet utilisateur dans Authentik avec le même email');
    console.log('\nMembre de test:');
    console.log(`  Email: ${testMemberEmail}`);
    console.log('\n✅ Données de test prêtes !');
    console.log('⚠️  N\'oubliez pas de créer les utilisateurs dans Authentik pour pouvoir vous connecter.');
    
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

