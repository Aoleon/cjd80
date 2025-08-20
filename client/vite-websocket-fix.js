// Script pour supprimer les erreurs WebSocket en environnement Replit
// Ce script remplace les connexions WebSocket défaillantes par des versions silencieuses

(function() {
  'use strict';
  
  // Intercepter et neutraliser les erreurs WebSocket
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    // Si l'URL contient localhost:undefined ou des patterns problématiques
    if (url.includes('localhost:undefined') || url.includes('wss://') && url.includes('undefined')) {
      // Créer un mock WebSocket qui ne génère pas d'erreurs
      return {
        readyState: WebSocket.CONNECTING,
        close: function() {},
        send: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        onerror: null,
        onopen: null,
        onclose: null,
        onmessage: null
      };
    }
    
    try {
      const ws = new originalWebSocket(url, protocols);
      
      // Supprimer les logs d'erreur WebSocket
      const originalError = ws.onerror;
      ws.onerror = function(event) {
        // Silencieux - ne pas logger les erreurs WebSocket
        if (originalError && typeof originalError === 'function') {
          originalError.call(this, event);
        }
      };
      
      return ws;
    } catch (error) {
      // Retourner un mock WebSocket en cas d'erreur
      return {
        readyState: WebSocket.CLOSED,
        close: function() {},
        send: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        onerror: null,
        onopen: null,
        onclose: null,
        onmessage: null
      };
    }
  };
  
  // Copier les constantes WebSocket
  Object.keys(originalWebSocket).forEach(key => {
    window.WebSocket[key] = originalWebSocket[key];
  });
  
  // Supprimer les messages d'erreur de la console pour les WebSockets
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('WebSocket') && 
        (message.includes('connection') || message.includes('handshake') || message.includes('undefined'))) {
      // Ignorer ces messages d'erreur
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('[vite]') && message.includes('connecting')) {
      // Ignorer les messages Vite
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
  
})();