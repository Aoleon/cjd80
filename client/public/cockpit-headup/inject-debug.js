/**
 * Cockpit Headup - Direct injection script WITH DEBUG
 */

(function() {
  'use strict';

  console.log('[Cockpit Debug] Script started');

  // Ne pas injecter si déjà présent
  if (document.getElementById('cockpit-headup-root')) {
    console.log('[Cockpit Debug] Already injected, skipping');
    return;
  }

  console.log('🚀 Cockpit Headup - Direct injection started');

  // 1. Injecter le CSS
  console.log('[Cockpit Debug] Injecting CSS...');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/cockpit-headup/assets/index-2FdVRW21.css';
  link.onload = function() {
    console.log('[Cockpit Debug] CSS loaded successfully');
  };
  link.onerror = function() {
    console.error('[Cockpit Debug] Failed to load CSS');
  };
  document.head.appendChild(link);

  // 2. Créer le conteneur React
  console.log('[Cockpit Debug] Creating root element...');
  const root = document.createElement('div');
  root.id = 'cockpit-headup-root';
  root.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483646;';
  console.log('[Cockpit Debug] Root element created:', root);

  // 3. Injecter dès que le DOM est prêt
  const inject = function() {
    console.log('[Cockpit Debug] Injecting into DOM...');
    console.log('[Cockpit Debug] document.body exists?', !!document.body);

    if (document.body) {
      document.body.appendChild(root);
      console.log('[Cockpit Debug] Root appended to body');
      console.log('[Cockpit Debug] Root in DOM?', !!document.getElementById('cockpit-headup-root'));

      // 4. Charger le script React
      console.log('[Cockpit Debug] Loading React module...');
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/cockpit-headup/assets/index-CygLmMKE.js';
      script.onload = function() {
        console.log('✅ Cockpit Headup - Loaded successfully');
        // Vérifier que React a monté le composant
        setTimeout(() => {
          const btn = document.querySelector('.cockpit-fab');
          console.log('[Cockpit Debug] Button found?', !!btn);
          if (!btn) {
            console.error('[Cockpit Debug] React component not rendered!');
          }
        }, 1000);
      };
      script.onerror = function(e) {
        console.error('❌ Failed to load Cockpit Headup', e);
      };
      document.body.appendChild(script);
      console.log('[Cockpit Debug] Script tag appended');
    } else {
      console.error('[Cockpit Debug] document.body is null!');
    }
  };

  if (document.readyState === 'loading') {
    console.log('[Cockpit Debug] DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    console.log('[Cockpit Debug] DOM already loaded, injecting now');
    inject();
  }

})();
