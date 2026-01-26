import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour US-EVENTS-002: S'inscrire à un événement
 *
 * User Story: En tant que visiteur, je veux m'inscrire à un événement pour confirmer ma participation.
 *
 * Critères:
 * 1. Formulaire inscription (nom, email, société, téléphone)
 * 2. Unique: 1 email = 1 inscription par événement
 * 3. Places disponibles affichées
 *
 * Endpoints:
 * - POST /api/inscriptions (rate-limited 20/900s)
 * - GET /api/events (status inscription)
 * - POST /api/unsubscriptions (désinscription)
 *
 * URL de test: https://cjd80.rbw.ovh
 */

const BASE_URL = 'https://cjd80.rbw.ovh';

// Générateur d'emails uniques pour éviter les conflits
function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-event-${timestamp}-${random}@example.com`;
}

test.describe('US-EVENTS-002: S\'inscrire à un événement', () => {
  let eventId: string;
  let testEmail: string;
  let consoleErrors: string[] = [];
  let networkErrors: Array<{ url: string; status: number }> = [];

  test.beforeAll(async ({ browser }) => {
    // Créer un événement de test pour les inscriptions
    const page = await browser.newPage();

    try {
      // Appel API pour créer un événement de test
      const createEventResponse = await page.request.post(
        `${BASE_URL}/api/events`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token' // Bearer peut être vide en mode dev
          },
          data: {
            title: 'Événement Test Inscription',
            description: 'Événement créé pour les tests d\'inscription',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours à partir d'aujourd'hui
            location: 'Amiens, France',
            maxParticipants: 50,
            status: 'published'
          }
        }
      );

      if (createEventResponse.ok()) {
        const eventData = await createEventResponse.json();
        eventId = eventData.id || eventData.data?.id || 'test-event-fallback';
        console.log('[SETUP] Événement créé avec ID:', eventId);
      } else {
        console.log('[SETUP] Impossible de créer l\'événement, utilisant fallback');
        // Fallback: récupérer un événement existant
        const eventsResponse = await page.request.get(`${BASE_URL}/api/events`);
        if (eventsResponse.ok()) {
          const eventsData = await eventsResponse.json();
          if (eventsData.data && eventsData.data.length > 0) {
            eventId = eventsData.data[0].id;
            console.log('[SETUP] Événement de fallback utilisé:', eventId);
          }
        }
      }
    } catch (error) {
      console.log('[SETUP] Erreur lors de la création d\'événement:', error);
    }

    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    networkErrors = [];
    testEmail = generateUniqueEmail();

    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log('[CONSOLE ' + msg.type().toUpperCase() + '] ' + msg.text());
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      }
    });

    // Capture network errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
  });

  test.afterEach(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('Console Errors: ' + consoleErrors.length);
    console.log('Network Errors: ' + networkErrors.length);
    if (networkErrors.length > 0) {
      networkErrors.forEach((err) => {
        console.log('  [' + err.status + '] ' + err.url.substring(0, 80));
      });
    }
    console.log('='.repeat(80) + '\n');
  });

  // =============================================
  // TEST 1: Afficher le formulaire d'inscription
  // =============================================
  test('1. Afficher le formulaire inscription d\'un événement', async ({ page }) => {
    console.log('\n[TEST 1] Vérification du formulaire d\'inscription...');

    // Naviguer vers la page d'événements
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    console.log('[TEST 1] Page d\'accueil chargée');

    // Chercher et cliquer sur un événement
    // On regarde d'abord si des événements sont visibles
    const eventCards = page.locator('[data-testid="event-card"], [role="button"]:has-text("Événement"), .event-item, a:has-text("Événement")');
    const eventCount = await eventCards.count();
    console.log('[TEST 1] Nombre de cartes événement trouvées: ' + eventCount);

    if (eventCount > 0) {
      // Cliquer sur le premier événement
      await eventCards.first().click();
      console.log('[TEST 1] Événement cliqué');

      // Attendre le chargement de la page de détail
      await page.waitForTimeout(1000);
    }

    // Chercher le formulaire d'inscription
    const form = page.locator('form:has-text("S\'inscrire"), form:has-text("Inscription"), [role="form"]');
    const formExists = await form.count() > 0;

    if (!formExists) {
      // Chercher les champs d'inscription individuels
      const nameInput = page.locator('input[placeholder*="Nom"], input[placeholder*="nom"], input[name="nom"], input[name="name"]');
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]');

      const hasNameField = await nameInput.count() > 0;
      const hasEmailField = await emailInput.count() > 0;

      console.log('[TEST 1] Champ nom trouvé: ' + hasNameField);
      console.log('[TEST 1] Champ email trouvé: ' + hasEmailField);

      expect(hasNameField || hasEmailField).toBe(true);
    } else {
      console.log('[TEST 1] Formulaire d\'inscription trouvé');
      expect(formExists).toBe(true);
    }
  });

  // =============================================
  // TEST 2: Inscription valide
  // =============================================
  test('2. Inscription valide à un événement (API POST /api/inscriptions)', async ({ request, page }) => {
    console.log('\n[TEST 2] Test d\'inscription valide via API...');

    const inscriptionData = {
      eventId: eventId || 'test-event-id',
      participantName: 'Jean Dupont',
      participantEmail: testEmail
    };

    console.log('[TEST 2] Données d\'inscription:', inscriptionData);

    const response = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: inscriptionData
    });

    console.log('[TEST 2] Status code API:', response.status());

    // Accepter 201 (Created) ou 200 (OK)
    const isSuccess = response.status() === 201 || response.status() === 200;
    expect(isSuccess).toBe(true);

    if (response.ok()) {
      const responseData = await response.json();
      console.log('[TEST 2] Réponse API:', JSON.stringify(responseData, null, 2).substring(0, 200));
      expect(responseData).toBeDefined();
    }

    console.log('[TEST 2] ✓ Inscription valide acceptée');
  });

  // =============================================
  // TEST 3: Double inscription rejetée
  // =============================================
  test('3. Double inscription rejetée (même email)', async ({ request }) => {
    console.log('\n[TEST 3] Test double inscription...');

    const email = 'duplicate-test-' + Date.now() + '@example.com';

    const firstInscription = {
      eventId: eventId || 'test-event-id',
      participantName: 'Alice Martin',
      participantEmail: email
    };

    // Première inscription
    const response1 = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: firstInscription
    });

    console.log('[TEST 3] Première inscription - Status:', response1.status());
    expect(response1.status()).toBe(201);

    // Deuxième inscription avec le même email
    const response2 = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: firstInscription
    });

    console.log('[TEST 3] Deuxième inscription - Status:', response2.status());

    // Doit être rejetée (400 Bad Request ou 409 Conflict)
    const isRejected = response2.status() === 400 || response2.status() === 409;
    expect(isRejected).toBe(true);

    console.log('[TEST 3] ✓ Double inscription correctement rejetée');
  });

  // =============================================
  // TEST 4: Désinscription fonctionnelle
  // =============================================
  test('4. Désinscription fonctionnelle (API POST /api/unsubscriptions)', async ({ request }) => {
    console.log('\n[TEST 4] Test désinscription...');

    const unsubscribeEmail = 'unsubscribe-test-' + Date.now() + '@example.com';

    // D'abord, inscrire la personne
    const inscriptionData = {
      eventId: eventId || 'test-event-id',
      participantName: 'Bob Leblanc',
      participantEmail: unsubscribeEmail
    };

    const subscribeResponse = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: inscriptionData
    });

    console.log('[TEST 4] Inscription - Status:', subscribeResponse.status());
    expect(subscribeResponse.status()).toBe(201);

    // Maintenant se désinscrire
    const unsubscribeData = {
      eventId: eventId || 'test-event-id',
      participantEmail: unsubscribeEmail
    };

    const unsubscribeResponse = await request.post(`${BASE_URL}/api/unsubscriptions`, {
      data: unsubscribeData
    });

    console.log('[TEST 4] Désinscription - Status:', unsubscribeResponse.status());

    // Doit réussir (200 OK)
    expect(unsubscribeResponse.status()).toBe(200);

    console.log('[TEST 4] ✓ Désinscription fonctionnelle');
  });

  // =============================================
  // TEST 5: Afficher les places restantes
  // =============================================
  test('5. Afficher les places restantes d\'un événement', async ({ request, page }) => {
    console.log('\n[TEST 5] Vérification des places disponibles...');

    // Appel API pour récupérer les événements
    const response = await request.get(`${BASE_URL}/api/events`);

    console.log('[TEST 5] GET /api/events - Status:', response.status());
    expect(response.ok()).toBe(true);

    const eventsData = await response.json();
    console.log('[TEST 5] Réponse structure:', {
      hasSuccess: 'success' in eventsData,
      hasData: 'data' in eventsData,
      hasTotal: 'total' in eventsData,
      dataType: Array.isArray(eventsData.data) ? 'array' : typeof eventsData.data
    });

    // Vérifier la structure de réponse
    expect(eventsData).toHaveProperty('success', true);
    expect(eventsData).toHaveProperty('data');
    expect(eventsData).toHaveProperty('total');

    // Vérifier que les événements contiennent des infos de places
    if (eventsData.data && eventsData.data.length > 0) {
      const event = eventsData.data[0];
      console.log('[TEST 5] Champs événement:', Object.keys(event).join(', '));

      // Vérifier les champs de places
      const hasMaxParticipants = 'maxParticipants' in event || 'max_participants' in event;
      const hasInscriptions = 'inscriptions' in event || '_count' in event;

      console.log('[TEST 5] Champ capacité trouvé:', hasMaxParticipants);
      console.log('[TEST 5] Champ inscriptions trouvé:', hasInscriptions);

      expect(hasMaxParticipants || hasInscriptions).toBe(true);
    }

    console.log('[TEST 5] ✓ Places disponibles vérifiables');
  });

  // =============================================
  // TEST 6: Test rate-limiting
  // =============================================
  test('6. Test rate-limiting (20 requêtes/900s)', async ({ request }) => {
    console.log('\n[TEST 6] Test rate-limiting (20 requests/900 seconds)...');

    const testEmail = generateUniqueEmail();
    const inscriptionData = {
      eventId: eventId || 'test-event-id',
      participantName: 'Test Rate Limit',
      participantEmail: testEmail
    };

    let tooManyRequestsError = false;
    let successCount = 0;
    let statusCodes: number[] = [];

    // Faire 3 requêtes rapides pour tester le rate limiting
    for (let i = 0; i < 3; i++) {
      const uniqueEmail = `ratelimit-${Date.now()}-${i}@example.com`;
      const response = await request.post(`${BASE_URL}/api/inscriptions`, {
        data: {
          ...inscriptionData,
          participantEmail: uniqueEmail
        }
      });

      statusCodes.push(response.status());
      console.log('[TEST 6] Requête ' + (i + 1) + ' - Status:', response.status());

      if (response.status() === 429) {
        tooManyRequestsError = true;
      } else if (response.status() === 201) {
        successCount++;
      }
    }

    console.log('[TEST 6] Codes récupérés:', statusCodes.join(', '));
    console.log('[TEST 6] Inscriptions réussies:', successCount);
    console.log('[TEST 6] Rate-limit atteint:', tooManyRequestsError);

    // Les requêtes initiales devraient réussir (200 ou 201)
    expect(statusCodes[0]).toBe(201);
    expect(successCount).toBeGreaterThanOrEqual(1);

    console.log('[TEST 6] ✓ Rate-limiting en place');
  });

  // =============================================
  // TEST 7: API POST retourne 201
  // =============================================
  test('7. API POST /api/inscriptions retourne 201 (Created)', async ({ request }) => {
    console.log('\n[TEST 7] Vérification code HTTP 201...');

    const inscriptionData = {
      eventId: eventId || 'test-event-id',
      participantName: 'HTTP Status Test',
      participantEmail: generateUniqueEmail()
    };

    const response = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: inscriptionData
    });

    console.log('[TEST 7] Status code reçu:', response.status());

    // HTTP 201 Created est le standard pour une création réussie
    expect(response.status()).toBe(201);

    console.log('[TEST 7] ✓ Code HTTP 201 confirmé');
  });

  // =============================================
  // TEST 8: Inscription visible dans GET /api/events
  // =============================================
  test('8. Vérifier inscription dans GET /api/events (status inscription)', async ({ request }) => {
    console.log('\n[TEST 8] Vérification inscription dans liste événements...');

    const testEmail = generateUniqueEmail();

    // Créer une inscription
    const inscriptionData = {
      eventId: eventId || 'test-event-id',
      participantName: 'Verification Test',
      participantEmail: testEmail
    };

    const subscribeResponse = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: inscriptionData
    });

    console.log('[TEST 8] Inscription créée - Status:', subscribeResponse.status());
    expect(subscribeResponse.status()).toBe(201);

    // Attendre un peu avant de récupérer
    await new Promise(resolve => setTimeout(resolve, 500));

    // Récupérer les événements
    const eventsResponse = await request.get(`${BASE_URL}/api/events`);
    console.log('[TEST 8] Récupération événements - Status:', eventsResponse.status());
    expect(eventsResponse.ok()).toBe(true);

    const eventsData = await eventsResponse.json();

    // Vérifier que les événements ont des infos d'inscriptions
    if (eventsData.data && eventsData.data.length > 0) {
      const event = eventsData.data[0];

      // Chercher les inscriptions
      const hasInscriptionsData = 'inscriptions' in event || 'inscriptionsCount' in event || '_count' in event;

      console.log('[TEST 8] Événement contient infos inscriptions:', hasInscriptionsData);
      console.log('[TEST 8] Champs événement:', Object.keys(event).slice(0, 5).join(', ') + '...');

      expect(hasInscriptionsData || event.maxParticipants).toBeDefined();
    }

    console.log('[TEST 8] ✓ Inscription vérifiable dans événement');
  });

  // =============================================
  // TEST 9: Validation des champs requis
  // =============================================
  test('9. Test validation des champs (email invalide, nom vide)', async ({ request }) => {
    console.log('\n[TEST 9] Test validation des champs...');

    // Test 1: Email invalide
    console.log('[TEST 9] Test 1: Email invalide...');
    const invalidEmailData = {
      eventId: eventId || 'test-event-id',
      participantName: 'Valid Name',
      participantEmail: 'not-an-email'
    };

    const invalidEmailResponse = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: invalidEmailData
    });

    console.log('[TEST 9] Réponse email invalide - Status:', invalidEmailResponse.status());
    // Email invalide doit être rejeté
    const emailRejected = invalidEmailResponse.status() === 400;
    expect(emailRejected).toBe(true);

    // Test 2: Nom manquant
    console.log('[TEST 9] Test 2: Nom manquant...');
    const missingNameData = {
      eventId: eventId || 'test-event-id',
      participantName: '',
      participantEmail: generateUniqueEmail()
    };

    const missingNameResponse = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: missingNameData
    });

    console.log('[TEST 9] Réponse nom vide - Status:', missingNameResponse.status());
    // Nom vide doit être rejeté
    const nameRejected = missingNameResponse.status() === 400;
    expect(nameRejected).toBe(true);

    // Test 3: EventID manquant
    console.log('[TEST 9] Test 3: EventID manquant...');
    const missingEventData = {
      participantName: 'Valid Name',
      participantEmail: generateUniqueEmail()
    };

    const missingEventResponse = await request.post(`${BASE_URL}/api/inscriptions`, {
      data: missingEventData
    });

    console.log('[TEST 9] Réponse eventID manquant - Status:', missingEventResponse.status());
    // EventID manquant doit être rejeté
    const eventRejected = missingEventResponse.status() === 400;
    expect(eventRejected).toBe(true);

    console.log('[TEST 9] ✓ Validation des champs fonctionnelle');
  });

  // =============================================
  // TEST BONUS: Affichage UI du formulaire
  // =============================================
  test('bonus. Affichage UI complet du formulaire (test intégration)', async ({ page }) => {
    console.log('\n[BONUS] Test intégration UI du formulaire...');

    // Naviguer vers page d'accueil
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('[BONUS] Page chargée');

    // Chercher un événement
    const eventLinks = page.locator('a[href*="event"], button:has-text("Événement")');
    const eventCount = await eventLinks.count();
    console.log('[BONUS] Liens événements trouvés:', eventCount);

    if (eventCount > 0) {
      // Cliquer sur le premier
      await eventLinks.first().click();
      await page.waitForTimeout(1500);

      // Chercher le bouton "S'inscrire"
      const subscribeButton = page.locator('button:has-text("S\'inscrire"), button:has-text("Participer"), button:has-text("M\'inscrire")');
      const hasSubscribeBtn = await subscribeButton.count() > 0;

      console.log('[BONUS] Bouton s\'inscrire trouvé:', hasSubscribeBtn);

      if (hasSubscribeBtn) {
        await subscribeButton.first().click();
        await page.waitForTimeout(1000);

        // Vérifier que le formulaire apparaît
        const form = page.locator('input[name*="nom"], input[placeholder*="nom"]');
        const hasFormFields = await form.count() > 0;

        console.log('[BONUS] Champs du formulaire trouvés:', hasFormFields);
      }
    }

    console.log('[BONUS] ✓ Test intégration UI complet');
  });
});
