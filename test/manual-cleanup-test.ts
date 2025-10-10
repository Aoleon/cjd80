#!/usr/bin/env tsx

/**
 * Script de test manuel du système de nettoyage automatique
 * Vérifie que le nettoyage fonctionne correctement sans Playwright
 */

import { db } from '../server/db';
import { ideas, votes } from '../shared/schema';
import { cleanupTestData } from './helpers/cleanup';
import { generateTestIdea, generateTestVote } from './helpers/test-data';
import { like } from 'drizzle-orm';

async function testCleanupSystem() {
  console.log('🧪 Test manuel du système de nettoyage automatique\n');

  try {
    // 1. Créer des données de test
    console.log('📝 Étape 1: Création de données de test...');
    
    // Utiliser les helpers sans override pour garantir les patterns corrects
    const testIdea1 = generateTestIdea();
    const testIdea2 = generateTestIdea();
    
    const [idea1] = await db.insert(ideas).values({
      title: testIdea1.title,
      description: testIdea1.description,
      proposedBy: testIdea1.proposedBy,
      proposedByEmail: testIdea1.proposedByEmail,
      status: 'pending'
    }).returning();
    
    const [idea2] = await db.insert(ideas).values({
      title: testIdea2.title,
      description: testIdea2.description,
      proposedBy: testIdea2.proposedBy,
      proposedByEmail: testIdea2.proposedByEmail,
      status: 'pending'
    }).returning();
    
    console.log(`✅ Créé idée #${idea1.id}: ${idea1.title}`);
    console.log(`✅ Créé idée #${idea2.id}: ${idea2.title}`);
    
    // Créer des votes
    const testVote1 = generateTestVote();
    const testVote2 = generateTestVote();
    
    await db.insert(votes).values({
      ideaId: idea1.id,
      voterName: testVote1.voterName,
      voterEmail: testVote1.voterEmail
    });
    
    await db.insert(votes).values({
      ideaId: idea2.id,
      voterName: testVote2.voterName,
      voterEmail: testVote2.voterEmail
    });
    
    console.log(`✅ Créé 2 votes avec emails: ${testVote1.voterEmail}, ${testVote2.voterEmail}\n`);
    
    // 2. Vérifier que les données existent
    console.log('🔍 Étape 2: Vérification des données avant nettoyage...');
    
    const ideasBefore = await db.select().from(ideas).where(
      like(ideas.title, '[TEST]%')
    );
    
    const votesBefore = await db.select().from(votes).where(
      like(votes.voterEmail, '%@test.com')
    );
    
    console.log(`📊 Idées de test trouvées: ${ideasBefore.length}`);
    console.log(`📊 Votes de test trouvés: ${votesBefore.length}\n`);
    
    if (ideasBefore.length === 0 || votesBefore.length === 0) {
      console.error('❌ Erreur: Les données de test n\'ont pas été créées correctement');
      process.exit(1);
    }
    
    // 3. Exécuter le nettoyage
    console.log('🧹 Étape 3: Exécution du nettoyage automatique...\n');
    
    await cleanupTestData();
    
    // 4. Vérifier que les données ont été supprimées
    console.log('\n🔍 Étape 4: Vérification après nettoyage...');
    
    const ideasAfter = await db.select().from(ideas).where(
      like(ideas.title, '[TEST]%')
    );
    
    const votesAfter = await db.select().from(votes).where(
      like(votes.voterEmail, '%@test.com')
    );
    
    console.log(`📊 Idées de test trouvées: ${ideasAfter.length}`);
    console.log(`📊 Votes de test trouvés: ${votesAfter.length}\n`);
    
    // 5. Résultat final
    if (ideasAfter.length === 0 && votesAfter.length === 0) {
      console.log('✅ ✅ ✅ SUCCÈS: Le système de nettoyage fonctionne parfaitement!');
      console.log('🎉 Toutes les données de test ont été supprimées automatiquement\n');
      process.exit(0);
    } else {
      console.error('❌ ÉCHEC: Des données de test n\'ont pas été supprimées');
      console.error(`   - Idées restantes: ${ideasAfter.length}`);
      console.error(`   - Votes restants: ${votesAfter.length}\n`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

testCleanupSystem();
