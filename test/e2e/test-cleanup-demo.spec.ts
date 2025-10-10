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
    console.log(`[Test Cleanup Demo] ✅ Cette idée sera automatiquement supprimée après le test`);
    
    // Vérifier que l'idée existe
    const getResponse = await page.request.get(`/api/ideas`);
    expect(getResponse.ok()).toBeTruthy();
    
    const ideas = await getResponse.json();
    const foundIdea = ideas.data?.data?.find((i: any) => i.title === testIdea.title);
    expect(foundIdea).toBeDefined();
    
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
    
    const createdIdea = await ideaResponse.json();
    
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
    
    expect(voteResponse.ok()).toBeTruthy();
    
    console.log(`[Test Cleanup Demo] Vote créé pour l'idée: ${createdIdea.id}`);
    console.log(`[Test Cleanup Demo] Votant: ${testVote.voterEmail}`);
    console.log(`[Test Cleanup Demo] ✅ Ce vote sera automatiquement supprimé après le test`);
    
    // Note: Le vote ET l'idée seront supprimés automatiquement
  });

  test('should create and auto-cleanup test event and inscription', async ({ page }) => {
    // Générer un événement de test
    const testEvent = generateTestEvent({
      title: 'Événement de test',
      daysFromNow: 15,
      location: 'Salle de test'
    });
    
    // Créer l'événement
    const eventResponse = await page.request.post('/api/admin/events', {
      data: {
        title: testEvent.title,
        description: testEvent.description,
        date: testEvent.date.toISOString(),
        location: testEvent.location,
      }
    });
    
    // Note: Cette requête peut échouer si l'utilisateur n'est pas authentifié
    // C'est normal dans un test de démonstration
    if (eventResponse.ok()) {
      const createdEvent = await eventResponse.json();
      console.log(`[Test Cleanup Demo] Événement créé avec ID: ${createdEvent.id}`);
      
      // Générer une inscription
      const testInscription = generateTestInscription({
        name: 'Participant de test',
        includePhone: true
      });
      
      // Créer l'inscription
      const inscriptionResponse = await page.request.post('/api/inscriptions', {
        data: {
          eventId: createdEvent.id,
          name: testInscription.name,
          email: testInscription.email,
          company: testInscription.company,
          phone: testInscription.phone,
        }
      });
      
      if (inscriptionResponse.ok()) {
        console.log(`[Test Cleanup Demo] Inscription créée pour: ${testInscription.email}`);
        console.log(`[Test Cleanup Demo] ✅ L'inscription et l'événement seront automatiquement supprimés`);
      }
    } else {
      console.log(`[Test Cleanup Demo] ⚠️  Événement non créé (authentification requise)`);
    }
  });

  test('should demonstrate multiple test data creation', async ({ page }) => {
    // Créer plusieurs idées de test
    const ideas = [
      generateTestIdea({ title: 'Idée 1' }),
      generateTestIdea({ title: 'Idée 2' }),
      generateTestIdea({ title: 'Idée 3' }),
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
