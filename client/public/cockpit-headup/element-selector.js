/**
 * Element Selector Tool
 * Permet de sélectionner visuellement un élément dans l'interface
 * et d'extraire son HTML/CSS pour analyse par l'agent IA
 */

(function() {
  'use strict';

  class ElementSelector {
    constructor() {
      this.active = false;
      this.overlay = null;
      this.highlightBox = null;
      this.tooltip = null;
      this.hoveredElement = null;
      this.onSelectCallback = null;
    }

    /**
     * Active le mode sélection d'élément
     */
    activate(onSelectCallback) {
      if (this.active) return;

      this.active = true;
      this.onSelectCallback = onSelectCallback;

      // Créer l'overlay
      this.createOverlay();

      // Ajouter les event listeners
      this.addEventListeners();

      console.log('🎯 Element Selector activated');
    }

    /**
     * Désactive le mode sélection
     */
    deactivate() {
      if (!this.active) return;

      this.active = false;
      this.removeEventListeners();

      // Supprimer l'overlay
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }

      this.hoveredElement = null;
      this.onSelectCallback = null;

      console.log('🎯 Element Selector deactivated');
    }

    /**
     * Crée l'overlay visuel
     */
    createOverlay() {
      // Container overlay
      this.overlay = document.createElement('div');
      this.overlay.id = 'element-selector-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        cursor: crosshair;
        background: rgba(0, 0, 0, 0.05);
        pointer-events: auto;
      `;

      // Highlight box
      this.highlightBox = document.createElement('div');
      this.highlightBox.id = 'element-selector-highlight';
      this.highlightBox.style.cssText = `
        position: absolute;
        border: 3px solid #667eea;
        background: rgba(102, 126, 234, 0.1);
        pointer-events: none;
        display: none;
        transition: all 0.1s ease;
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
      `;

      // Tooltip
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'element-selector-tooltip';
      this.tooltip.style.cssText = `
        position: absolute;
        background: #1a1a2e;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        pointer-events: none;
        display: none;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        word-wrap: break-word;
      `;

      // Instructions banner
      const instructions = document.createElement('div');
      instructions.id = 'element-selector-instructions';
      instructions.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000001;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      instructions.innerHTML = `
        <span style="font-size: 20px;">🎯</span>
        <span>Cliquez sur un élément pour le sélectionner</span>
        <button id="element-selector-cancel" style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 8px;
          transition: background 0.2s;
        ">Annuler (ESC)</button>
      `;

      this.overlay.appendChild(this.highlightBox);
      this.overlay.appendChild(this.tooltip);
      this.overlay.appendChild(instructions);
      document.body.appendChild(this.overlay);

      // Cancel button handler
      document.getElementById('element-selector-cancel').addEventListener('click', () => {
        this.deactivate();
      });
    }

    /**
     * Ajoute les event listeners
     */
    addEventListeners() {
      this.handleMouseMove = this.onMouseMove.bind(this);
      this.handleClick = this.onClick.bind(this);
      this.handleKeyDown = this.onKeyDown.bind(this);

      document.addEventListener('mousemove', this.handleMouseMove, true);
      document.addEventListener('click', this.handleClick, true);
      document.addEventListener('keydown', this.handleKeyDown, true);
    }

    /**
     * Supprime les event listeners
     */
    removeEventListeners() {
      if (this.handleMouseMove) {
        document.removeEventListener('mousemove', this.handleMouseMove, true);
      }
      if (this.handleClick) {
        document.removeEventListener('click', this.handleClick, true);
      }
      if (this.handleKeyDown) {
        document.removeEventListener('keydown', this.handleKeyDown, true);
      }
    }

    /**
     * Gère le mouvement de la souris
     */
    onMouseMove(event) {
      // Ignorer les éléments de l'overlay
      if (event.target === this.overlay ||
          event.target.id.startsWith('element-selector-')) {
        return;
      }

      const element = event.target;
      this.hoveredElement = element;

      // Obtenir les dimensions de l'élément
      const rect = element.getBoundingClientRect();

      // Positionner la highlight box
      this.highlightBox.style.display = 'block';
      this.highlightBox.style.left = rect.left + 'px';
      this.highlightBox.style.top = rect.top + 'px';
      this.highlightBox.style.width = rect.width + 'px';
      this.highlightBox.style.height = rect.height + 'px';

      // Mettre à jour le tooltip
      const selector = this.generateSelector(element);
      const tagName = element.tagName.toLowerCase();
      const classNames = element.className ? `.${element.className.split(' ').join('.')}` : '';
      const id = element.id ? `#${element.id}` : '';

      this.tooltip.innerHTML = `
        <div style="margin-bottom: 4px; color: #667eea; font-weight: bold;">
          ${tagName}${id}${classNames}
        </div>
        <div style="color: #888; font-size: 11px;">
          ${selector}
        </div>
      `;

      // Positionner le tooltip
      this.tooltip.style.display = 'block';
      const tooltipX = Math.min(event.clientX + 15, window.innerWidth - 320);
      const tooltipY = event.clientY + 15;
      this.tooltip.style.left = tooltipX + 'px';
      this.tooltip.style.top = tooltipY + 'px';
    }

    /**
     * Gère le clic sur un élément
     */
    onClick(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.hoveredElement) return;

      // Extraire les données de l'élément
      const elementData = this.extractElementData(this.hoveredElement);

      // Callback avec les données
      if (this.onSelectCallback) {
        this.onSelectCallback(elementData);
      }

      // Désactiver le sélecteur
      this.deactivate();
    }

    /**
     * Gère les touches clavier
     */
    onKeyDown(event) {
      // ESC pour annuler
      if (event.key === 'Escape') {
        event.preventDefault();
        this.deactivate();
      }
    }

    /**
     * Génère un sélecteur CSS unique pour l'élément
     */
    generateSelector(element) {
      if (element.id) {
        return `#${element.id}`;
      }

      const path = [];
      let current = element;

      while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
          const classes = current.className.trim().split(/\s+/).filter(c => c);
          if (classes.length > 0) {
            selector += '.' + classes.join('.');
          }
        }

        // Ajouter un nth-child si nécessaire pour unicité
        if (current.parentElement) {
          const siblings = Array.from(current.parentElement.children);
          const sameTagSiblings = siblings.filter(s =>
            s.tagName === current.tagName &&
            s.className === current.className
          );

          if (sameTagSiblings.length > 1) {
            const index = sameTagSiblings.indexOf(current) + 1;
            selector += `:nth-child(${index})`;
          }
        }

        path.unshift(selector);
        current = current.parentElement;

        // Limiter la profondeur
        if (path.length >= 5) break;
      }

      return path.join(' > ');
    }

    /**
     * Extrait toutes les données pertinentes de l'élément
     */
    extractElementData(element) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Obtenir les parents
      const parents = [];
      let parent = element.parentElement;
      let depth = 0;
      while (parent && depth < 3) {
        parents.push({
          tag: parent.tagName.toLowerCase(),
          id: parent.id || null,
          className: parent.className || null,
          selector: this.generateSelector(parent)
        });
        parent = parent.parentElement;
        depth++;
      }

      // Extraire les propriétés CSS importantes
      const relevantStyles = {
        display: computedStyle.display,
        position: computedStyle.position,
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        zIndex: computedStyle.zIndex
      };

      return {
        // Informations de base
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: element.className || null,

        // Sélecteurs
        selector: this.generateSelector(element),

        // Contenu
        textContent: element.textContent?.substring(0, 200) || null,
        innerHTML: element.innerHTML?.substring(0, 500) || null,
        outerHTML: element.outerHTML?.substring(0, 1000) || null,

        // Attributs
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),

        // Position et dimensions
        boundingRect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom
        },

        // Style
        computedStyle: relevantStyles,

        // Hiérarchie
        parents: parents,

        // Métadonnées
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
    }
  }

  // Instance globale
  window.elementSelector = new ElementSelector();

  console.log('✅ Element Selector script loaded');
})();
