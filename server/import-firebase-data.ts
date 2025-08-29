#!/usr/bin/env tsx

import { FirebaseDumpParser } from './parse-firebase-dump';
import { FirebaseImporter } from './firebase-import';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    console.log('🚀 Démarrage de l\'import des données Firebase');
    
    // Chemin vers le fichier dump
    const dumpPath = join(__dirname, '..', 'attached_assets', 'dump_1756459471671.sql');
    
    console.log('\n1️⃣ Phase 1: Parsing du dump Firebase');
    const firebaseData = FirebaseDumpParser.parseFirebaseDump(dumpPath);
    
    console.log('\n2️⃣ Phase 2: Import vers PostgreSQL');
    const importer = new FirebaseImporter();
    const results = await importer.importAll(firebaseData);
    
    console.log('\n✅ Import terminé avec succès !');
    console.log('\n📋 Actions recommandées:');
    console.log('1. Vérifier les données importées dans l\'interface admin');
    console.log('2. Réinitialiser les mots de passe des admins importés');
    console.log('3. Nettoyer les inscriptions avec des eventId invalides si nécessaire');
    console.log('4. Vérifier que les status des idées sont corrects');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

// Exécution seulement si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as importFirebaseData };