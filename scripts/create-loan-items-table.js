#!/usr/bin/env node
/**
 * Script pour créer la table loan_items dans la base de données
 * Usage: node scripts/create-loan-items-table.js
 * 
 * Nécessite DATABASE_URL dans les variables d'environnement
 */

import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error('❌ Erreur: DATABASE_URL n\'est pas définie');
  console.log('\n💡 Pour définir DATABASE_URL:');
  console.log('   export DATABASE_URL="postgresql://user:password@host:port/database"');
  console.log('   ou créez un fichier .env avec: DATABASE_URL=...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTable() {
  try {
    console.log('📦 Création de la table loan_items...');
    
    const sqlFile = join(__dirname, 'create-loan-items-table.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    
    // Exécuter le SQL
    await pool.query(sql);
    
    console.log('✅ Table loan_items créée avec succès!');
    console.log('✅ Index créés avec succès!');
    
    // Vérifier que la table existe
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'loan_items'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Vérification: La table existe bien dans la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n💡 La table existe peut-être déjà. Vérifiez avec:');
      console.log('   SELECT * FROM loan_items LIMIT 1;');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTable();

