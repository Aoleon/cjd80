/**
 * Element Selector - Cockpit Headup
 * Permet de sélectionner visuellement des éléments DOM
 */

(function() {
  'use strict';

  class ElementSelector {
    constructor() {
      this.isActive = false;
      this.callback = null;
      this.overlay = null;
      this.tooltip = null;
      this.selectedElement = null;
      this.hoveredElement = null;

      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    activate(callback) {
      if (this.isActive) return;

      this.callback = callback;
      this.isActive = true;

      // Create overlay
      this.createOverlay();
      this.createTooltip();

      // Add event listeners
      document.addEventListener('mousemove', this.handleMouseMove, true);
      document.addEventListener('click', this.handleClick, true);
      document.addEventListener('keydown', this.handleKeyDown, true);

      // Change cursor
      document.body.style.cursor = 'crosshair';

      console.log('[ElementSelector] Activated - Click on an element to select it (ESC to cancel)');
    }

    deactivate() {
      if (!this.isActive) return;

      this.isActive = false;
      this.callback = null;

      // Remove event listeners
      document.removeEventListener('mousemove', this.handleMouseMove, true);
      document.removeEventListener('click', this.handleClick, true);
      document.removeEventListener('keydown', this.handleKeyDown, true);

      // Remove overlay and tooltip
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }

      if (this.tooltip) {
        this.tooltip.remove();
        this.tooltip = null;
      }

      // Reset cursor
      document.body.style.cursor = '';

      // Clear highlights
      if (this.hoveredElement) {
        this.hoveredElement.style.outline = '';
        this.hoveredElement = null;
      }

      console.log('[ElementSelector] Deactivated');
    }

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'cockpit-element-selector-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(102, 126, 234, 0.05);
        z-index: 999998;
        pointer-events: none;
      `;
      document.body.appendChild(this.overlay);
    }

    createTooltip() {
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'cockpit-element-selector-tooltip';
      this.tooltip.style.cssText = `
        position: fixed;
        padding: 8px 12px;
        background: #667eea;
        color: white;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        font-weight: 500;
        pointer-events: none;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: none;
        max-width: 300px;
        word-wrap: break-word;
      `;
      document.body.appendChild(this.tooltip);
    }

    handleMouseMove(event) {
      if (!this.isActive) return;

      event.preventDefault();
      event.stopPropagation();

      const element = document.elementFromPoint(event.clientX, event.clientY);

      // Ignore tooltip, overlay, and cockpit elements
      if (!element ||
          element === this.tooltip ||
          element === this.overlay ||
          element.closest('#cockpit-headup-root') ||
          element.closest('.modern-chat')) {
        return;
      }

      // Remove highlight from previous element
      if (this.hoveredElement && this.hoveredElement !== element) {
        this.hoveredElement.style.outline = '';
      }

      // Highlight current element
      this.hoveredElement = element;
      element.style.outline = '2px solid #667eea';
      element.style.outlineOffset = '2px';

      // Update tooltip
      this.updateTooltip(element, event.clientX, event.clientY);
    }

    handleClick(event) {
      if (!this.isActive) return;

      event.preventDefault();
      event.stopPropagation();

      const element = this.hoveredElement;

      if (!element ||
          element === this.tooltip ||
          element === this.overlay ||
          element.closest('#cockpit-headup-root') ||
          element.closest('.modern-chat')) {
        return;
      }

      // Extract element data
      const elementData = this.extractElementData(element);

      // Clear highlight
      element.style.outline = '';

      // Call callback
      if (this.callback) {
        this.callback(elementData);
      }

      // Deactivate
      this.deactivate();

      console.log('[ElementSelector] Element selected:', elementData);
    }

    handleKeyDown(event) {
      if (!this.isActive) return;

      // ESC to cancel
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.deactivate();
        console.log('[ElementSelector] Cancelled by user');
      }
    }

    updateTooltip(element, x, y) {
      if (!this.tooltip) return;

      const selector = this.generateSelector(element);
      const tag = element.tagName.toLowerCase();
      const text = element.textContent?.trim().substring(0, 50) || '';

      this.tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="font-weight: 600;">
            <span style="opacity: 0.7;">&lt;</span>${tag}<span style="opacity: 0.7;">&gt;</span>
          </div>
          <div style="font-size: 11px; opacity: 0.9;">
            ${selector}
          </div>
          ${text ? `<div style="font-size: 10px; opacity: 0.7; font-style: italic;">
            "${text}${text.length === 50 ? '...' : ''}"
          </div>` : ''}
          <div style="font-size: 10px; opacity: 0.7; margin-top: 2px;">
            Click to select • ESC to cancel
          </div>
        </div>
      `;

      // Position tooltip near cursor
      const offsetX = 15;
      const offsetY = 15;
      let tooltipX = x + offsetX;
      let tooltipY = y + offsetY;

      // Keep tooltip in viewport
      const tooltipRect = this.tooltip.getBoundingClientRect();
      if (tooltipX + tooltipRect.width > window.innerWidth) {
        tooltipX = x - tooltipRect.width - offsetX;
      }
      if (tooltipY + tooltipRect.height > window.innerHeight) {
        tooltipY = y - tooltipRect.height - offsetY;
      }

      this.tooltip.style.left = tooltipX + 'px';
      this.tooltip.style.top = tooltipY + 'px';
      this.tooltip.style.display = 'block';
    }

    generateSelector(element) {
      // Try ID first
      if (element.id) {
        return `#${element.id}`;
      }

      // Try unique class
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).filter(c => c);
        if (classes.length > 0) {
          const selector = `.${classes.join('.')}`;
          if (document.querySelectorAll(selector).length === 1) {
            return selector;
          }
        }
      }

      // Build path from root
      const path = [];
      let current = element;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.tagName.toLowerCase();

        // Add ID if available
        if (current.id) {
          selector += `#${current.id}`;
          path.unshift(selector);
          break;
        }

        // Add first class if available
        if (current.className && typeof current.className === 'string') {
          const firstClass = current.className.trim().split(/\s+/)[0];
          if (firstClass) {
            selector += `.${firstClass}`;
          }
        }

        // Add nth-child if needed for uniqueness
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            child => child.tagName === current.tagName
          );
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-child(${index})`;
          }
        }

        path.unshift(selector);
        current = parent;

        // Stop at body or after 5 levels
        if (!current || current.tagName === 'BODY' || path.length >= 5) {
          break;
        }
      }

      return path.join(' > ');
    }

    extractElementData(element) {
      const selector = this.generateSelector(element);
      const rect = element.getBoundingClientRect();

      return {
        selector,
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        textContent: element.textContent?.trim().substring(0, 200) || null,
        outerHTML: element.outerHTML.substring(0, 500),
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        xpath: this.getXPath(element)
      };
    }

    getXPath(element) {
      if (element.id) {
        return `//*[@id="${element.id}"]`;
      }

      if (element === document.body) {
        return '/html/body';
      }

      let index = 0;
      const siblings = element.parentNode?.childNodes || [];

      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
          const tagName = element.tagName.toLowerCase();
          const parent = element.parentNode;
          const parentPath = parent ? this.getXPath(parent) : '';
          return `${parentPath}/${tagName}[${index + 1}]`;
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          index++;
        }
      }

      return '';
    }
  }

  // Create global instance
  window.elementSelector = new ElementSelector();

  console.log('[ElementSelector] Loaded and ready');
})();
