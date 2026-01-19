/**
 * BASELINE TESTS - Server Actions Migration
 *
 * Ces tests capturent l'état fonctionnel AVANT la migration vers Server Actions.
 * Ils doivent tous passer à 100% avant de démarrer Phase 1.
 *
 * Exécution:
 * npm run test:e2e -- server-actions-migration-baseline.spec.ts
 *
 * Baseline créée: 2026-01-19 - Phase 0
 */

import { test, expect, Page } from '@playwright/test'

// Helper pour vérifier l'absence d'erreurs console
const consoleErrors: string[] = []

test.beforeEach(async ({ page }) => {
  // Capturer les erreurs console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  page.on('pageerror', error => {
    consoleErrors.push(error.message)
  })
})

test.afterEach(async () => {
  // Vérifier qu'il n'y a pas d'erreurs console
  if (consoleErrors.length > 0) {
    console.log('Console errors detected:', consoleErrors)
  }
  consoleErrors.length = 0 // Reset
})

test.describe('BASELINE - Phase 1: Public Core Routes', () => {
  test('créer une idée (POST /api/ideas)', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    // Aller à la page de proposition
    await page.goto('http://localhost:3000/propose')

    // Screenshot avant
    await page.screenshot({ path: '/tmp/baseline-propose-before.png' })

    // Remplir formulaire
    const timestamp = Date.now()
    await page.fill('[name="title"]', `Test Baseline ${timestamp}`)
    await page.fill('[name="description"]', 'Test migration Server Actions')
    await page.selectOption('[name="category"]', { index: 1 })

    // Submit
    await page.click('button[type="submit"]')

    // Attendre redirection ou message succès
    await page.waitForTimeout(2000)

    // Screenshot après
    await page.screenshot({ path: '/tmp/baseline-propose-after.png' })

    // Vérifier que l'idée apparaît dans la liste
    await page.goto('http://localhost:3000/')
    const ideaExists = await page.locator(`text=${timestamp}`).isVisible()
    expect(ideaExists).toBeTruthy()

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })

  test('voter pour une idée (POST /api/votes)', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    // Screenshot avant
    await page.screenshot({ path: '/tmp/baseline-vote-before.png' })

    // Cliquer sur première idée
    const firstIdea = page.locator('[data-testid="idea-card"]').first()
    await firstIdea.click()

    // Vote
    await page.click('[data-testid="vote-button"]')
    await page.waitForTimeout(1000)

    // Screenshot après
    await page.screenshot({ path: '/tmp/baseline-vote-after.png' })

    // Vérifier vote enregistré
    const voteCount = await page.locator('[data-testid="vote-count"]').textContent()
    expect(parseInt(voteCount || '0')).toBeGreaterThan(0)

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })

  test('s\'inscrire à un événement (POST /api/inscriptions)', async ({ page }) => {
    await page.goto('http://localhost:3000/events')

    // Screenshot avant
    await page.screenshot({ path: '/tmp/baseline-inscription-before.png' })

    // Cliquer sur premier événement
    const firstEvent = page.locator('[data-testid="event-card"]').first()
    await firstEvent.click()

    // Remplir formulaire inscription
    await page.fill('[name="firstName"]', 'Test')
    await page.fill('[name="lastName"]', 'Baseline')
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`)

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Screenshot après
    await page.screenshot({ path: '/tmp/baseline-inscription-after.png' })

    // Vérifier message succès
    const successMessage = await page.locator('text=/inscrit|merci/i').isVisible()
    expect(successMessage).toBeTruthy()

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })

  test('proposer un membre (POST /api/members/propose)', async ({ page }) => {
    await page.goto('http://localhost:3000/propose')

    // Screenshot avant
    await page.screenshot({ path: '/tmp/baseline-propose-member-before.png' })

    // Remplir formulaire membre
    await page.selectOption('[name="type"]', 'member')
    await page.fill('[name="firstName"]', 'Test')
    await page.fill('[name="lastName"]', 'Baseline')
    await page.fill('[name="email"]', `member-${Date.now()}@example.com`)

    // Submit
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Screenshot après
    await page.screenshot({ path: '/tmp/baseline-propose-member-after.png' })

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })
})

test.describe('BASELINE - Phase 2: Admin Content Management', () => {
  // TODO: Nécessite auth admin - à implémenter après setup auth
  test.skip('supprimer une idée (DELETE /api/ideas/:id)', async ({ page }) => {
    // Test admin - nécessite login
  })

  test.skip('créer un événement (POST /api/events)', async ({ page }) => {
    // Test admin - nécessite login
  })
})

test.describe('BASELINE - Performance', () => {
  test('temps de chargement page ideas', async ({ page }) => {
    const start = Date.now()
    await page.goto('http://localhost:3000/')
    const loadTime = Date.now() - start

    console.log(`⏱️  Page load time: ${loadTime}ms`)

    // Baseline performance: < 3000ms
    expect(loadTime).toBeLessThan(3000)

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })

  test('temps de chargement page events', async ({ page }) => {
    const start = Date.now()
    await page.goto('http://localhost:3000/events')
    const loadTime = Date.now() - start

    console.log(`⏱️  Events page load time: ${loadTime}ms`)

    // Baseline performance: < 3000ms
    expect(loadTime).toBeLessThan(3000)

    // Pas d'erreurs console
    expect(consoleErrors.length).toBe(0)
  })
})

test.describe('BASELINE - UI Integrity', () => {
  test('screenshot homepage', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({
      path: '/tmp/baseline-homepage.png',
      fullPage: true,
    })

    // Vérifier éléments clés présents
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
  })

  test('screenshot ideas page', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({
      path: '/tmp/baseline-ideas-page.png',
      fullPage: true,
    })
  })

  test('screenshot events page', async ({ page }) => {
    await page.goto('http://localhost:3000/events')
    await page.waitForLoadState('networkidle')
    await page.screenshot({
      path: '/tmp/baseline-events-page.png',
      fullPage: true,
    })
  })
})
