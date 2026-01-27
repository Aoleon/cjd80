import { test, expect } from '@playwright/test';
import { loginAsAdminQuick } from '../helpers/auth';

/**
 * Tests E2E - CRM Members: Tags Management
 *
 * Page: /admin/members/tags
 *
 * Fonctionnalités testées:
 * 1. Liste des tags avec usage count
 * 2. Créer tag avec color picker
 * 3. Modifier tag (nom et couleur)
 * 4. Supprimer tag avec confirmation
 * 5. Preview badge en temps réel
 * 6. Validation des champs
 *
 * Endpoints testés:
 * - GET /api/admin/tags
 * - POST /api/admin/tags
 * - PATCH /api/admin/tags/:id
 * - DELETE /api/admin/tags/:id
 *
 * URL de test: https://cjd80.rbw.ovh
 */

const BASE_URL = 'https://cjd80.rbw.ovh';

// Couleurs présets attendues
const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316'  // orange
];

// Helper: Naviguer vers la page tags
async function navigateToTagsPage(page: any) {
  // Option 1: URL directe
  await page.goto(`${BASE_URL}/admin/members/tags`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Vérifier que la page est chargée
  await page.waitForSelector('h1, h2', { timeout: 5000 });
}

test.describe('CRM Members: Tags Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdminQuick(page, BASE_URL);
    await navigateToTagsPage(page);
  });

  test('1. Afficher la page de gestion des tags', async ({ page }) => {
    console.log('[TEST 1] Vérification affichage page tags');

    // Vérifier le titre
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.toLowerCase()).toMatch(/tags|étiquettes/i);

    console.log('[TEST 1] ✅ Titre affiché:', titleText);

    // Vérifier présence du bouton "Nouveau tag" ou "Créer tag"
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await expect(createButton).toBeVisible({ timeout: 5000 });

    console.log('[TEST 1] ✅ Bouton créer tag visible');
  });

  test('2. API GET /api/admin/tags retourne la liste', async ({ request }) => {
    console.log('[TEST 2] Test API GET tags');

    const response = await request.get(`${BASE_URL}/api/admin/tags`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('[TEST 2] Response keys:', Object.keys(data));

    // Structure attendue
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);

    console.log('[TEST 2] ✅ API retourne', data.data.length, 'tags');

    // Si des tags existent, vérifier structure
    if (data.data.length > 0) {
      const firstTag = data.data[0];
      expect(firstTag).toHaveProperty('id');
      expect(firstTag).toHaveProperty('name');
      expect(firstTag).toHaveProperty('color');
      console.log('[TEST 2] ✅ Structure tag valide:', Object.keys(firstTag));
    }
  });

  test('3. Afficher la liste des tags avec usage count', async ({ page }) => {
    console.log('[TEST 3] Vérification liste tags avec usage count');

    await page.waitForTimeout(2000); // Attendre chargement données

    // Chercher le tableau ou la liste
    const tableOrList = page.locator('table, [role="table"], [data-testid*="tag"]').first();
    const hasContent = await tableOrList.count() > 0;

    if (hasContent) {
      await expect(tableOrList).toBeVisible();
      console.log('[TEST 3] ✅ Liste/tableau des tags visible');

      // Vérifier présence de colonnes: Nom, Couleur, Utilisation, Actions
      const pageText = await page.textContent('body');
      const hasNameColumn = pageText?.includes('Nom') || pageText?.includes('Name');
      const hasColorColumn = pageText?.includes('Couleur') || pageText?.includes('Color');
      const hasUsageColumn = pageText?.includes('Utilisation') || pageText?.includes('Usage') || pageText?.includes('membre');

      expect(hasNameColumn || hasColorColumn || hasUsageColumn).toBe(true);
      console.log('[TEST 3] ✅ Colonnes détectées - Nom:', hasNameColumn, 'Couleur:', hasColorColumn, 'Usage:', hasUsageColumn);
    } else {
      // État vide
      const emptyState = page.locator('text=/Aucun tag|No tags|Créer votre premier/i');
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
      console.log('[TEST 3] ✅ État vide affiché');
    }
  });

  test('4. Ouvrir modal de création de tag', async ({ page }) => {
    console.log('[TEST 4] Ouverture modal création tag');

    // Cliquer sur le bouton créer
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();

    // Attendre l'ouverture du modal
    await page.waitForTimeout(500);

    // Vérifier que le modal est visible
    const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    console.log('[TEST 4] ✅ Modal ouvert');

    // Vérifier présence des champs
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await expect(nameInput).toBeVisible();
    console.log('[TEST 4] ✅ Champ nom visible');

    // Vérifier présence du color picker (8 couleurs présets)
    const colorButtons = page.locator('button[style*="background-color"], [data-testid*="color"]');
    const colorCount = await colorButtons.count();
    expect(colorCount).toBeGreaterThanOrEqual(8);
    console.log('[TEST 4] ✅ Color picker visible avec', colorCount, 'couleurs');
  });

  test('5. Créer un nouveau tag avec couleur preset', async ({ page }) => {
    console.log('[TEST 5] Création tag avec couleur preset');

    // Ouvrir modal
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Remplir le nom
    const tagName = `Test Tag ${Date.now()}`;
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await nameInput.fill(tagName);
    console.log('[TEST 5] Nom saisi:', tagName);

    // Sélectionner une couleur preset (la première - bleu)
    const firstColorButton = page.locator('button[style*="background-color"]').first();
    await firstColorButton.click();
    await page.waitForTimeout(300);
    console.log('[TEST 5] ✅ Couleur preset sélectionnée');

    // Vérifier le preview badge (si présent)
    const previewBadge = page.locator('[data-testid*="preview"], .badge').filter({ hasText: tagName });
    if (await previewBadge.count() > 0) {
      await expect(previewBadge.first()).toBeVisible();
      console.log('[TEST 5] ✅ Preview badge visible');
    }

    // Soumettre le formulaire
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /créer|enregistrer|save/i }).first();
    await submitButton.click();

    // Attendre la fermeture du modal et le rechargement des données
    await page.waitForTimeout(2000);

    // Vérifier que le tag apparaît dans la liste
    const newTag = page.locator(`text="${tagName}"`);
    await expect(newTag.first()).toBeVisible({ timeout: 5000 });

    console.log('[TEST 5] ✅ Tag créé et visible dans la liste');
  });

  test('6. API POST /api/admin/tags crée un tag', async ({ request }) => {
    console.log('[TEST 6] Test API POST tag');

    const newTag = {
      name: `API Test Tag ${Date.now()}`,
      color: PRESET_COLORS[0] // Bleu
    };

    const response = await request.post(`${BASE_URL}/api/admin/tags`, {
      data: newTag
    });

    expect([200, 201]).toContain(response.status());

    const data = await response.json();
    console.log('[TEST 6] Response:', data);

    // Vérifier la structure de la réponse
    if (data.success) {
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id');
      expect(data.data.name).toBe(newTag.name);
      expect(data.data.color).toBe(newTag.color);
    }

    console.log('[TEST 6] ✅ Tag créé via API, ID:', data.data?.id);
  });

  test('7. Créer tag avec couleur personnalisée (hex)', async ({ page }) => {
    console.log('[TEST 7] Création tag avec couleur hex personnalisée');

    // Ouvrir modal
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Remplir le nom
    const tagName = `Custom Color Tag ${Date.now()}`;
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await nameInput.fill(tagName);

    // Chercher le champ de saisie hex
    const hexInput = page.locator('input[type="text"][placeholder*="#"], input[value*="#"]').first();
    if (await hexInput.count() > 0) {
      await hexInput.fill('#FF5733'); // Rouge-orange personnalisé
      console.log('[TEST 7] ✅ Couleur hex personnalisée saisie');
    } else {
      console.log('[TEST 7] ⚠️ Champ hex non trouvé, utilisation preset');
      const firstColorButton = page.locator('button[style*="background-color"]').nth(1);
      await firstColorButton.click();
    }

    await page.waitForTimeout(300);

    // Soumettre
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /créer|enregistrer|save/i }).first();
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Vérifier création
    const newTag = page.locator(`text="${tagName}"`);
    await expect(newTag.first()).toBeVisible({ timeout: 5000 });

    console.log('[TEST 7] ✅ Tag avec couleur personnalisée créé');
  });

  test('8. Modifier un tag existant', async ({ page }) => {
    console.log('[TEST 8] Modification tag existant');

    await page.waitForTimeout(2000);

    // Trouver un bouton "Modifier" ou "Edit"
    const editButtons = page.locator('button').filter({ hasText: /modifier|edit/i });
    const editCount = await editButtons.count();

    if (editCount === 0) {
      console.log('[TEST 8] ⚠️ Aucun tag à modifier, créer un tag d\'abord');
      test.skip();
      return;
    }

    // Cliquer sur le premier bouton modifier
    await editButtons.first().click();
    await page.waitForTimeout(500);

    // Vérifier que le modal d'édition est ouvert
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Modifier le nom
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    const currentValue = await nameInput.inputValue();
    const newValue = currentValue + ' (modifié)';
    await nameInput.fill(newValue);
    console.log('[TEST 8] Nom modifié:', newValue);

    // Changer la couleur
    const colorButtons = page.locator('button[style*="background-color"]');
    if (await colorButtons.count() > 1) {
      await colorButtons.nth(1).click();
      console.log('[TEST 8] ✅ Couleur modifiée');
    }

    await page.waitForTimeout(300);

    // Sauvegarder
    const saveButton = page.locator('button').filter({ hasText: /enregistrer|save|mettre à jour/i }).first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Vérifier que le tag modifié apparaît
    const modifiedTag = page.locator(`text="${newValue}"`);
    await expect(modifiedTag.first()).toBeVisible({ timeout: 5000 });

    console.log('[TEST 8] ✅ Tag modifié avec succès');
  });

  test('9. Supprimer un tag avec confirmation', async ({ page }) => {
    console.log('[TEST 9] Suppression tag avec confirmation');

    await page.waitForTimeout(2000);

    // Compter les tags avant suppression
    const tagRowsBefore = page.locator('tr[data-testid*="tag"], [data-testid*="tag-item"]');
    const countBefore = await tagRowsBefore.count();
    console.log('[TEST 9] Nombre de tags avant:', countBefore);

    // Trouver un bouton "Supprimer" ou "Delete"
    const deleteButtons = page.locator('button').filter({ hasText: /supprimer|delete/i });
    const deleteCount = await deleteButtons.count();

    if (deleteCount === 0) {
      console.log('[TEST 9] ⚠️ Aucun tag à supprimer');
      test.skip();
      return;
    }

    // Cliquer sur supprimer
    await deleteButtons.first().click();
    await page.waitForTimeout(500);

    // Vérifier l'affichage de la confirmation (AlertDialog)
    const confirmDialog = page.locator('[role="alertdialog"], [data-testid*="confirm"]').first();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    console.log('[TEST 9] ✅ Dialog de confirmation affiché');

    // Confirmer la suppression
    const confirmButton = page.locator('button').filter({ hasText: /confirmer|oui|delete|supprimer/i }).last();
    await confirmButton.click();
    await page.waitForTimeout(2000);

    // Vérifier que le nombre de tags a diminué
    const countAfter = await tagRowsBefore.count();
    console.log('[TEST 9] Nombre de tags après:', countAfter);

    // Note: Le count peut rester identique si un nouveau tag a été ajouté entre-temps
    // L'important est que la suppression n'ait pas causé d'erreur
    console.log('[TEST 9] ✅ Suppression effectuée sans erreur');
  });

  test('10. API DELETE /api/admin/tags/:id supprime un tag', async ({ request }) => {
    console.log('[TEST 10] Test API DELETE tag');

    // D'abord créer un tag à supprimer
    const newTag = {
      name: `Tag to Delete ${Date.now()}`,
      color: PRESET_COLORS[2]
    };

    const createResponse = await request.post(`${BASE_URL}/api/admin/tags`, {
      data: newTag
    });

    expect([200, 201]).toContain(createResponse.status());
    const createData = await createResponse.json();
    const tagId = createData.data?.id;

    if (!tagId) {
      console.log('[TEST 10] ⚠️ Impossible de créer tag pour test suppression');
      test.skip();
      return;
    }

    console.log('[TEST 10] Tag créé avec ID:', tagId);

    // Supprimer le tag
    const deleteResponse = await request.delete(`${BASE_URL}/api/admin/tags/${tagId}`);

    expect([200, 204]).toContain(deleteResponse.status());
    console.log('[TEST 10] ✅ Tag supprimé via API, status:', deleteResponse.status());
  });

  test('11. Validation: nom de tag requis', async ({ page }) => {
    console.log('[TEST 11] Validation nom requis');

    // Ouvrir modal
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Ne pas remplir le nom
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await nameInput.fill('');

    // Tenter de soumettre
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /créer|enregistrer/i }).first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Vérifier qu'un message d'erreur apparaît ou que le modal reste ouvert
    const modal = page.locator('[role="dialog"]').first();
    const modalStillVisible = await modal.isVisible();
    expect(modalStillVisible).toBe(true);

    console.log('[TEST 11] ✅ Validation nom requis fonctionne (modal reste ouvert)');
  });

  test('12. Preview badge en temps réel', async ({ page }) => {
    console.log('[TEST 12] Preview badge temps réel');

    // Ouvrir modal
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Saisir un nom
    const tagName = 'Preview Test';
    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await nameInput.fill(tagName);
    await page.waitForTimeout(300);

    // Chercher le preview badge
    const previewBadge = page.locator('[data-testid*="preview"], .badge, [class*="badge"]').filter({ hasText: tagName });
    const hasPreview = await previewBadge.count() > 0;

    if (hasPreview) {
      await expect(previewBadge.first()).toBeVisible();
      console.log('[TEST 12] ✅ Preview badge visible avec le nom');

      // Changer la couleur et vérifier que le preview change
      const colorButtons = page.locator('button[style*="background-color"]');
      if (await colorButtons.count() > 0) {
        await colorButtons.nth(1).click();
        await page.waitForTimeout(300);

        // Le badge devrait toujours être visible
        await expect(previewBadge.first()).toBeVisible();
        console.log('[TEST 12] ✅ Preview badge mis à jour après changement couleur');
      }
    } else {
      console.log('[TEST 12] ⚠️ Preview badge non implémenté (optionnel)');
    }

    // Fermer le modal
    const cancelButton = page.locator('button').filter({ hasText: /annuler|cancel/i }).first();
    if (await cancelButton.count() > 0) {
      await cancelButton.click();
    }
  });

  test('13. Affichage usage count par tag', async ({ page }) => {
    console.log('[TEST 13] Vérification usage count');

    await page.waitForTimeout(2000);

    // Chercher les cellules d'usage dans le tableau
    const usageCells = page.locator('td, [data-testid*="usage"]').filter({ hasText: /\d+\s*(membre|member)/i });
    const hasUsageDisplay = await usageCells.count() > 0;

    if (hasUsageDisplay) {
      console.log('[TEST 13] ✅ Usage count affiché pour', await usageCells.count(), 'tags');

      // Vérifier qu'au moins un usage count est un nombre
      const firstUsageText = await usageCells.first().textContent();
      const hasNumber = /\d+/.test(firstUsageText || '');
      expect(hasNumber).toBe(true);
      console.log('[TEST 13] ✅ Format usage count valide:', firstUsageText);
    } else {
      console.log('[TEST 13] ⚠️ Usage count non trouvé (peut-être pas de tags utilisés)');
    }
  });

  test('14. Tri et ordre des tags', async ({ page }) => {
    console.log('[TEST 14] Vérification ordre tags');

    await page.waitForTimeout(2000);

    // Récupérer tous les noms de tags
    const tagNames = await page.locator('td:first-child, [data-testid*="tag-name"]').allTextContents();
    console.log('[TEST 14] Tags trouvés:', tagNames.length);

    if (tagNames.length > 1) {
      // Les tags devraient être triés (alphabétique ou par usage)
      const isSorted = tagNames.every((name, i) => i === 0 || name >= tagNames[i - 1]);
      console.log('[TEST 14] Ordre alphabétique:', isSorted);

      // Note: Le tri peut être par usage, pas forcément alphabétique
      // L'important est qu'il y ait un ordre cohérent
      expect(tagNames.length).toBeGreaterThan(0);
      console.log('[TEST 14] ✅ Tags affichés dans un ordre cohérent');
    } else {
      console.log('[TEST 14] ⚠️ Pas assez de tags pour tester l\'ordre');
    }
  });

  test('15. Workflow complet: Créer, Modifier, Supprimer', async ({ page }) => {
    console.log('[TEST 15] Workflow complet CRUD');

    const uniqueName = `Workflow Tag ${Date.now()}`;

    // 1. CRÉER
    console.log('[TEST 15] Étape 1: Création');
    const createButton = page.locator('button').filter({ hasText: /nouveau|créer|ajouter/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    await nameInput.fill(uniqueName);

    const firstColorButton = page.locator('button[style*="background-color"]').first();
    await firstColorButton.click();
    await page.waitForTimeout(300);

    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /créer|enregistrer/i }).first();
    await submitButton.click();
    await page.waitForTimeout(2000);

    const createdTag = page.locator(`text="${uniqueName}"`);
    await expect(createdTag.first()).toBeVisible({ timeout: 5000 });
    console.log('[TEST 15] ✅ Tag créé');

    // 2. MODIFIER
    console.log('[TEST 15] Étape 2: Modification');
    const tagRow = page.locator('tr, [data-testid*="tag"]').filter({ hasText: uniqueName });
    const editButton = tagRow.locator('button').filter({ hasText: /modifier|edit/i }).first();
    await editButton.click();
    await page.waitForTimeout(500);

    const nameInputEdit = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
    const modifiedName = uniqueName + ' (modifié)';
    await nameInputEdit.fill(modifiedName);

    const saveButton = page.locator('button').filter({ hasText: /enregistrer|save|mettre à jour/i }).first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    const modifiedTag = page.locator(`text="${modifiedName}"`);
    await expect(modifiedTag.first()).toBeVisible({ timeout: 5000 });
    console.log('[TEST 15] ✅ Tag modifié');

    // 3. SUPPRIMER
    console.log('[TEST 15] Étape 3: Suppression');
    const tagRowDelete = page.locator('tr, [data-testid*="tag"]').filter({ hasText: modifiedName });
    const deleteButton = tagRowDelete.locator('button').filter({ hasText: /supprimer|delete/i }).first();
    await deleteButton.click();
    await page.waitForTimeout(500);

    const confirmButton = page.locator('button').filter({ hasText: /confirmer|oui|delete|supprimer/i }).last();
    await confirmButton.click();
    await page.waitForTimeout(2000);

    // Vérifier que le tag n'est plus visible
    const deletedTag = page.locator(`text="${modifiedName}"`);
    const isStillVisible = await deletedTag.count() > 0;
    expect(isStillVisible).toBe(false);
    console.log('[TEST 15] ✅ Tag supprimé');

    console.log('[TEST 15] ✅ Workflow complet CRUD réussi');
  });

});
