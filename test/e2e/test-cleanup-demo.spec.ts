import { test, expect } from '../fixtures';
import { 
  generateTestIdea, 
  generateTestEvent,
  generateTestVote,
  generateTestInscription
} from '../helpers/test-data';

/**
 * Test de démonstration du système de nettoyage automatique
 * 
 * Ce test démontre comment :
 * 1. Utiliser les fixtures personnalisées qui nettoient automatiquement les données
 * 2. Générer des données de test reconnaissables avec les helpers
 * 3. Créer des données via API qui seront automatiquement supprimées après le test
 */

test.describe('Système de nettoyage automatique - Démonstration', () => {
  
  test('should create and auto-cleanup test idea', async ({ page }) => {
    // Générer des données de test
    const testIdea = generateTestIdea({
      title: 'Amélioration du système',
      description: 'Ceci est une idée de test qui sera automatiquement supprimée',
    });

    // Créer l'idée via l'API
    const response = await page.request.post('/api/ideas', {
      data: {
        title: testIdea.title,
        description: testIdea.description,
        proposedBy: testIdea.proposedBy,
        proposedByEmail: testIdea.proposedByEmail,
      }
    });

    // Vérifier que la création a réussi
    expect(response.ok()).toBeTruthy();
    
    const createdIdea = await response.json();
    console.log(`[Test Cleanup Demo] Idée créée avec ID: ${createdIdea.id}`);
    console.log(`[Test Cleanup Demo] Titre: ${testIdea.title}`);
    console.log(`[Test Cleanup Demo] Statut: ${createdIdea.status}`);
    
    // Vérifier que l'idée a été créée avec les bonnes données
    expect(createdIdea).toBeDefined();
    expect(createdIdea.id).toBeDefined();
    expect(createdIdea.title).toBe(testIdea.title);
    expect(createdIdea.status).toBe('pending'); // Les nouvelles idées ont le statut 'pending' par défaut
    
    // Note: GET /api/ideas filtre par status 'approved' ou 'completed', donc l'idée ne sera pas visible
    // Cette idée avec status 'pending' ne sera visible que dans l'interface admin
    console.log(`[Test Cleanup Demo] ✅ Cette idée sera automatiquement supprimée après le test`);
    
    // Note: Après ce test, la fixture autoCleanup supprimera automatiquement cette idée
  });

  test('should create and auto-cleanup test vote', async ({ page }) => {
    // D'abord créer une idée pour pouvoir voter
    const testIdea = generateTestIdea();
    
    const ideaResponse = await page.request.post('/api/ideas', {
      data: {
        title: testIdea.title,
        description: testIdea.description,
        proposedBy: testIdea.proposedBy,
        proposedByEmail: testIdea.proposedByEmail,
      }
    });
    
    // Vérifier que l'idée a été créée avec succès
    expect(ideaResponse.ok()).toBeTruthy();
    const createdIdea = await ideaResponse.json();
    expect(createdIdea.id).toBeDefined();
    
    console.log(`[Test Cleanup Demo] Idée créée avec ID: ${createdIdea.id}`);
    
    // Générer des données de vote
    const testVote = generateTestVote({
      voterName: 'Votant de test'
    });
    
    // Créer le vote
    const voteResponse = await page.request.post('/api/votes', {
      data: {
        ideaId: createdIdea.id,
        voterName: testVote.voterName,
        voterEmail: testVote.voterEmail,
      }
    });
    
    // Vérifier que le vote a été créé avec succès
    expect(voteResponse.ok()).toBeTruthy();
    
    const voteResult = await voteResponse.json();
    expect(voteResult.success).toBe(true);
    expect(voteResult.data).toBeDefined();
    expect(voteResult.data.ideaId).toBe(createdIdea.id);
    
    console.log(`[Test Cleanup Demo] Vote créé pour l'idée: ${createdIdea.id}`);
    console.log(`[Test Cleanup Demo] Votant: ${testVote.voterEmail}`);
    console.log(`[Test Cleanup Demo] ✅ Ce vote sera automatiquement supprimé après le test`);
    
    // Note: Le vote ET l'idée seront supprimés automatiquement
  });

  // Test 3: Événement et inscription - SKIPPED car nécessite authentification admin
  test.skip('should create and auto-cleanup test event and inscription', async ({ page }) => {
    // Note: POST /api/admin/events nécessite authentification avec requireAuth middleware
    // Ce test est désactivé car il ne peut pas fonctionner sans session admin
    // Pour tester les événements, utiliser plutôt les tests d'intégration avec authentification
    
    const testEvent = generateTestEvent({
      title: 'Événement de test',
      daysFromNow: 15,
      location: 'Salle de test'
    });
    
    console.log(`[Test Cleanup Demo] ⚠️  Test d'événement désactivé - nécessite authentification admin`);
    console.log(`[Test Cleanup Demo] Événement: ${testEvent.title}`);
  });

  test('should demonstrate multiple test data creation', async ({ page }) => {
    // Créer plusieurs idées de test (réduit à 2 pour éviter rate limiting)
    const ideas = [
      generateTestIdea({ title: 'Idée 1' }),
      generateTestIdea({ title: 'Idée 2' }),
    ];
    
    let createdCount = 0;
    
    for (const idea of ideas) {
      const response = await page.request.post('/api/ideas', {
        data: {
          title: idea.title,
          description: idea.description,
          proposedBy: idea.proposedBy,
          proposedByEmail: idea.proposedByEmail,
        }
      });
      
      if (response.ok()) {
        createdCount++;
      }
      
      // Délai pour éviter rate limiting
      await page.waitForTimeout(600);
    }
    
    console.log(`[Test Cleanup Demo] ${createdCount} idées créées`);
    console.log(`[Test Cleanup Demo] ✅ Toutes les idées seront automatiquement supprimées après le test`);
    
    expect(createdCount).toBeGreaterThan(0);
    
    // Note: Toutes les idées seront nettoyées automatiquement grâce à la fixture autoCleanup
  });
});

/**
 * Pour vérifier que le nettoyage fonctionne :
 * 
 * 1. Exécuter ce test : npx playwright test test-cleanup-demo
 * 2. Vérifier dans la console les messages de nettoyage
 * 3. Vérifier la base de données - aucune donnée de test ne devrait rester
 * 
 * Les logs de nettoyage ressembleront à :
 * [Cleanup] 🧹 Début du nettoyage des données de test...
 * [Cleanup] ✅ Nettoyage terminé : X enregistrement(s) supprimé(s)
 */
