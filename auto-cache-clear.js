#!/usr/bin/env node

// Script automatique pour vider le cache après chaque modification
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateCacheVersions() {
  const swPath = path.join(__dirname, 'client/public/sw.js');
  const timestamp = Date.now();
  
  try {
    let content = fs.readFileSync(swPath, 'utf8');
    
    // Remplacer les versions de cache avec timestamp
    content = content.replace(
      /const CACHE_NAME = `cjd-amiens-v\${Date\.now\(\)}`/,
      `const CACHE_NAME = 'cjd-amiens-v${timestamp}'`
    );
    
    content = content.replace(
      /const API_CACHE = `cjd-api-cache-v\${Date\.now\(\)}`/,
      `const API_CACHE = 'cjd-api-cache-v${timestamp}'`
    );
    
    content = content.replace(
      /const STATIC_CACHE = `cjd-static-v\${Date\.now\(\)}`/,
      `const STATIC_CACHE = 'cjd-static-v${timestamp}'`
    );
    
    content = content.replace(
      /const FONTS_CACHE = `cjd-fonts-v\${Date\.now\(\)}`/,
      `const FONTS_CACHE = 'cjd-fonts-v${timestamp}'`
    );
    
    content = content.replace(
      /const IMAGES_CACHE = `cjd-images-v\${Date\.now\(\)}`/,
      `const IMAGES_CACHE = 'cjd-images-v${timestamp}'`
    );
    
    // Mettre à jour le message de log
    content = content.replace(
      /console\.log\('\[SW\] Service Worker CJD Amiens chargé - Version .+'\);/,
      `console.log('[SW] Service Worker CJD Amiens chargé - Version ${timestamp} - Cache auto-purgé');`
    );
    
    fs.writeFileSync(swPath, content, 'utf8');
    console.log(`✅ Cache versions mises à jour: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du cache:', error);
  }
}

// Exécuter la mise à jour
updateCacheVersions();