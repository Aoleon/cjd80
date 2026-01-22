/**
 * Cockpit Headup - Diagnostic Script
 * Run in browser console to debug injection issues
 */

(function() {
  console.log('=== COCKPIT HEADUP DIAGNOSTIC ===\n');

  // 1. Check if root element exists
  const root = document.getElementById('cockpit-headup-root');
  console.log('1. Root element (#cockpit-headup-root):', root ? '✅ EXISTS' : '❌ NOT FOUND');

  if (root) {
    console.log('   - innerHTML length:', root.innerHTML.length);
    console.log('   - children count:', root.children.length);
    console.log('   - Computed styles:');
    const styles = window.getComputedStyle(root);
    console.log('     * display:', styles.display);
    console.log('     * visibility:', styles.visibility);
    console.log('     * opacity:', styles.opacity);
    console.log('     * z-index:', styles.zIndex);
    console.log('     * position:', styles.position);
    console.log('     * pointer-events:', styles.pointerEvents);
    console.log('     * width:', styles.width);
    console.log('     * height:', styles.height);

    // List all children
    if (root.children.length > 0) {
      console.log('   - Children:');
      Array.from(root.children).forEach((child, i) => {
        console.log(`     ${i + 1}. <${child.tagName.toLowerCase()}> class="${child.className}"`);
      });
    } else {
      console.log('   ⚠️ Root exists but has NO children!');
    }
  }

  // 2. Check for FAB button
  const fab = document.querySelector('.cockpit-fab');
  console.log('\n2. FAB button (.cockpit-fab):', fab ? '✅ EXISTS' : '❌ NOT FOUND');

  if (fab) {
    const fabStyles = window.getComputedStyle(fab);
    console.log('   - Computed styles:');
    console.log('     * display:', fabStyles.display);
    console.log('     * visibility:', fabStyles.visibility);
    console.log('     * opacity:', fabStyles.opacity);
    console.log('     * z-index:', fabStyles.zIndex);
    console.log('     * position:', fabStyles.position);
    console.log('     * bottom:', fabStyles.bottom);
    console.log('     * right:', fabStyles.right);
    console.log('     * width:', fabStyles.width);
    console.log('     * height:', fabStyles.height);
    console.log('     * pointer-events:', fabStyles.pointerEvents);

    const rect = fab.getBoundingClientRect();
    console.log('   - Position on screen:');
    console.log('     * top:', rect.top);
    console.log('     * left:', rect.left);
    console.log('     * visible in viewport:', rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth);
  }

  // 3. Check if CSS is loaded
  const cssLink = document.querySelector('link[href*="cockpit-headup"][href*=".css"]');
  console.log('\n3. CSS stylesheet:', cssLink ? '✅ LOADED' : '❌ NOT FOUND');
  if (cssLink) {
    console.log('   - href:', cssLink.href);
  }

  // 4. Check if JS module is loaded
  const jsScript = document.querySelector('script[src*="cockpit-headup"][src*=".js"]');
  console.log('\n4. JS module:', jsScript ? '✅ LOADED' : '❌ NOT FOUND');
  if (jsScript) {
    console.log('   - src:', jsScript.src);
    console.log('   - type:', jsScript.type);
  }

  // 5. Check inject script
  const injectScript = document.querySelector('script[src*="cockpit-headup-inject"]');
  console.log('\n5. Inject script:', injectScript ? '✅ LOADED' : '❌ NOT FOUND');
  if (injectScript) {
    console.log('   - src:', injectScript.src);
  }

  // 6. Check all cockpit-related elements
  const allCockpit = document.querySelectorAll('[id*="cockpit"], [class*="cockpit"]');
  console.log('\n6. All cockpit-related elements:', allCockpit.length);
  if (allCockpit.length > 0) {
    allCockpit.forEach((el, i) => {
      console.log(`   ${i + 1}. <${el.tagName.toLowerCase()}> id="${el.id}" class="${el.className}"`);
    });
  }

  // 7. Check z-index stacking context
  console.log('\n7. Z-index analysis:');
  const allElements = document.querySelectorAll('*');
  const highZIndex = Array.from(allElements)
    .map(el => ({ el, zIndex: parseInt(window.getComputedStyle(el).zIndex) || 0 }))
    .filter(item => item.zIndex > 1000)
    .sort((a, b) => b.zIndex - a.zIndex)
    .slice(0, 10);

  console.log('   Top 10 highest z-index elements:');
  highZIndex.forEach((item, i) => {
    console.log(`   ${i + 1}. z-index: ${item.zIndex} - <${item.el.tagName.toLowerCase()}> class="${item.el.className}"`);
  });

  // 8. React mounting check
  console.log('\n8. React mounting:');
  if (root && root._reactRootContainer) {
    console.log('   ✅ React root attached');
  } else if (root) {
    console.log('   ⚠️ Root exists but React might not be mounted yet');
  }

  console.log('\n=== END DIAGNOSTIC ===');
  console.log('\nTo get this data as JSON, run: window.cockpitDiagnostic()');

  // Export function for programmatic access
  window.cockpitDiagnostic = function() {
    const root = document.getElementById('cockpit-headup-root');
    const fab = document.querySelector('.cockpit-fab');

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      root: {
        exists: !!root,
        innerHTML: root?.innerHTML.substring(0, 500),
        childrenCount: root?.children.length || 0,
        styles: root ? {
          display: window.getComputedStyle(root).display,
          visibility: window.getComputedStyle(root).visibility,
          opacity: window.getComputedStyle(root).opacity,
          zIndex: window.getComputedStyle(root).zIndex,
          pointerEvents: window.getComputedStyle(root).pointerEvents,
        } : null
      },
      fab: {
        exists: !!fab,
        styles: fab ? {
          display: window.getComputedStyle(fab).display,
          visibility: window.getComputedStyle(fab).visibility,
          opacity: window.getComputedStyle(fab).opacity,
          zIndex: window.getComputedStyle(fab).zIndex,
          position: window.getComputedStyle(fab).position,
        } : null,
        rect: fab ? fab.getBoundingClientRect() : null
      },
      assets: {
        css: !!document.querySelector('link[href*="cockpit-headup"][href*=".css"]'),
        js: !!document.querySelector('script[src*="cockpit-headup"][src*=".js"]'),
        inject: !!document.querySelector('script[src*="cockpit-headup-inject"]')
      }
    };
  };

})();
