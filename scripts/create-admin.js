// Script pour créer/modifier les administrateurs
// NOTE: Avec Authentik, les mots de passe ne sont plus stockés localement
// Ce script crée uniquement les entrées dans la base de données locale
// Les utilisateurs doivent être créés dans Authentik séparément
import { db } from './server/db.js';
import { admins } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAdmins() {
  try {
    console.log('⚠️  ATTENTION: Avec Authentik, les utilisateurs doivent être créés dans Authentik.');
    console.log('Ce script crée uniquement les entrées dans la base de données locale.\n');
    
    // Créer Thibault comme admin principal
    await db.insert(admins).values({
      email: 'thibault@youcom.io',
      password: undefined, // Password géré par Authentik
      firstName: 'Thibault',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
      addedBy: 'system'
    });
    console.log('✅ Admin Thibault créé dans la base de données');
    console.log('   → Créez cet utilisateur dans Authentik avec le même email\n');
    
    // Créer Maxence comme second admin
    await db.insert(admins).values({
      email: 'maxencebonduelle@gmail.com',
      password: undefined, // Password géré par Authentik
      firstName: 'Maxence',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
      addedBy: 'thibault@youcom.io'
    });
    console.log('✅ Admin Maxence créé dans la base de données');
    console.log('   → Créez cet utilisateur dans Authentik avec le même email\n');
    
    console.log('📋 Prochaines étapes:');
    console.log('1. Créez les utilisateurs dans Authentik (Directory > Users)');
    console.log('2. Assignez les groupes correspondants aux rôles');
    console.log('3. Les utilisateurs pourront se connecter via Authentik');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

createAdmins();