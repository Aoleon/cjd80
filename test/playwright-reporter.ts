import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DevRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedByName: string;
}

class PlaywrightBugReporter implements Reporter {
  private failedTests: Array<{
    test: TestCase;
    result: TestResult;
  }> = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests.push({ test, result });
    }
  }

  async onEnd(result: FullResult) {
    if (this.failedTests.length === 0) {
      console.log('✅ Tous les tests sont passés - aucun bug à rapporter');
      return;
    }

    console.log(`\n🐛 ${this.failedTests.length} test(s) en échec - Création des rapports de bug...\n`);

    for (const { test, result } of this.failedTests) {
      await this.createBugReport(test, result);
    }
  }

  private async createBugReport(test: TestCase, result: TestResult) {
    const testName = test.title;
    const testFile = test.location.file.split('/').pop();
    const errorMessage = result.error?.message || 'Erreur inconnue';
    const errorStack = result.error?.stack || '';
    
    // Extraire le screenshot si disponible
    let screenshotInfo = '';
    if (result.attachments && result.attachments.length > 0) {
      const screenshot = result.attachments.find(a => a.name === 'screenshot');
      if (screenshot && screenshot.path) {
        screenshotInfo = `\n**Screenshot:** ${screenshot.path}`;
      }
    }

    const description = `
**Test échoué:** ${testName}
**Fichier:** ${testFile}
**Ligne:** ${test.location.line}

**Message d'erreur:**
\`\`\`
${errorMessage}
\`\`\`

**Stack trace:**
\`\`\`
${errorStack.substring(0, 1500)}${errorStack.length > 1500 ? '\n... (tronqué)' : ''}
\`\`\`
${screenshotInfo}

**Durée du test:** ${result.duration}ms
**Statut:** ${result.status}

---
*Ce bug a été créé automatiquement par le reporter Playwright E2E*
    `.trim();

    const bugReport: DevRequest = {
      title: `[E2E] ${testName.substring(0, 150)}`,
      description,
      type: 'bug',
      priority: this.determinePriority(test, result),
      requestedBy: 'playwright-reporter@cjd-amiens.fr',
      requestedByName: 'Playwright E2E Reporter',
    };

    try {
      // Appel à l'API pour créer la demande
      const response = await fetch('http://localhost:5000/api/admin/development-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: En production, il faudrait une authentification appropriée
          // Pour le moment, on utilise un endpoint spécial pour le reporter
        },
        body: JSON.stringify(bugReport),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Bug report créé: "${bugReport.title}" (ID: ${data.id})`);
        if (data.githubIssueUrl) {
          console.log(`   🔗 GitHub Issue: ${data.githubIssueUrl}`);
        }
      } else {
        const error = await response.text();
        console.error(`❌ Erreur création bug report: ${error}`);
        
        // Fallback: écrire dans un fichier local
        this.writeBugToFile(bugReport);
      }
    } catch (error) {
      console.error(`❌ Erreur connexion API:`, error);
      
      // Fallback: écrire dans un fichier local
      this.writeBugToFile(bugReport);
    }
  }

  private determinePriority(test: TestCase, result: TestResult): 'low' | 'medium' | 'high' | 'critical' {
    // Critères de priorité basés sur le type de test et la nature de l'échec
    const testName = test.title.toLowerCase();
    
    // Critique si c'est un test de pagination ou d'affichage de données essentielles
    if (testName.includes('pagination') || testName.includes('display all')) {
      return 'critical';
    }
    
    // Haute priorité pour les tests de workflow ou de fonctionnalités principales
    if (testName.includes('workflow') || testName.includes('modal') || testName.includes('responsive')) {
      return 'high';
    }
    
    // Timeout = problème de performance
    if (result.status === 'timedOut') {
      return 'high';
    }
    
    // Par défaut : moyenne
    return 'medium';
  }

  private writeBugToFile(bugReport: DevRequest) {
    const { writeFileSync, mkdirSync, existsSync } = require('fs');
    const { join } = require('path');
    
    const bugDir = join(process.cwd(), 'test-results', 'bug-reports');
    if (!existsSync(bugDir)) {
      mkdirSync(bugDir, { recursive: true });
    }
    
    const filename = `bug-${Date.now()}.json`;
    const filepath = join(bugDir, filename);
    
    writeFileSync(filepath, JSON.stringify(bugReport, null, 2));
    console.log(`📝 Bug report sauvegardé localement: ${filepath}`);
  }
}

export default PlaywrightBugReporter;
