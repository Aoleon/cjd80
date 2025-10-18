#!/usr/bin/env tsx

/**
 * Script d'importation des rapports de bugs Playwright
 * Ce script importe automatiquement les rapports de bugs générés par Playwright
 * dans le système de demandes de développement.
 */

import { readFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

interface DevRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedByName: string;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cjd-amiens.fr';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const API_URL = process.env.API_URL || 'http://localhost:5000';

async function login(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!response.ok) {
      console.error('❌ Échec de connexion:', await response.text());
      return null;
    }

    // Récupérer le cookie de session
    const cookies = response.headers.get('set-cookie');
    return cookies;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return null;
  }
}

async function importBugReports() {
  console.log('🔄 Importation des rapports de bugs Playwright...\n');

  const bugDir = join(process.cwd(), 'test-results', 'bug-reports');
  
  try {
    const files = readdirSync(bugDir).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('✅ Aucun rapport de bug à importer');
      return;
    }

    console.log(`📦 ${files.length} rapport(s) de bug trouvé(s)\n`);

    // Se connecter en tant qu'admin
    const sessionCookie = await login();
    if (!sessionCookie) {
      console.error('❌ Impossible de se connecter - Arrêt de l\'importation');
      return;
    }

    let imported = 0;
    let failed = 0;

    for (const file of files) {
      const filepath = join(bugDir, file);
      try {
        const content = readFileSync(filepath, 'utf-8');
        const bugReport: DevRequest = JSON.parse(content);

        // Créer la demande de développement
        const response = await fetch(`${API_URL}/api/admin/development-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie,
          },
          body: JSON.stringify(bugReport),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Importé: "${bugReport.title}"`);
          console.log(`   ID: ${data.id}`);
          if (data.githubIssueUrl) {
            console.log(`   🔗 GitHub: ${data.githubIssueUrl}`);
          }
          console.log('');

          // Supprimer le fichier après import réussi
          unlinkSync(filepath);
          imported++;
        } else {
          console.error(`❌ Échec import "${bugReport.title}":`, await response.text());
          failed++;
        }
      } catch (error) {
        console.error(`❌ Erreur lecture fichier ${file}:`, error);
        failed++;
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ Importés: ${imported}`);
    console.log(`   ❌ Échecs: ${failed}`);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('✅ Aucun rapport de bug à importer (dossier inexistant)');
    } else {
      console.error('❌ Erreur:', error);
    }
  }
}

// Exécuter l'importation
importBugReports().catch(console.error);
