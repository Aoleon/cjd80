/**
 * Validation utilities for Cockpit HeadsUp integration
 * Ensures HeadsUp can load safely and provides fallbacks
 */

export interface HeadsUpValidationResult {
  canLoad: boolean;
  errors: string[];
  warnings: string[];
  environment: {
    hasLocalStorage: boolean;
    hasWebSocket: boolean;
    hasDOM: boolean;
    browserSupported: boolean;
  };
}

/**
 * Check if browser supports localStorage
 */
export function checkLocalStorage(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if browser supports WebSocket
 */
export function checkWebSocket(): boolean {
  return typeof WebSocket !== 'undefined';
}

/**
 * Check if DOM is available (SSR safety)
 */
export function checkDOM(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if browser is supported (modern browsers)
 */
export function checkBrowserSupport(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for modern features
  const features = {
    promise: typeof Promise !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    proxy: typeof Proxy !== 'undefined',
    weakMap: typeof WeakMap !== 'undefined',
  };

  return Object.values(features).every((supported) => supported);
}

/**
 * Validate if HeadsUp assets are loaded
 */
export async function validateHeadsUpAssets(): Promise<{
  css: boolean;
  js: boolean;
}> {
  const result = { css: false, js: false };

  if (typeof document === 'undefined') return result;

  // Check CSS
  const cssLink = document.querySelector(
    'link[href*="cockpit-headup"]'
  ) as HTMLLinkElement;
  result.css = cssLink !== null;

  // Check JS
  result.js = typeof (window as any).CockpitHeadsUp !== 'undefined';

  return result;
}

/**
 * Comprehensive validation before enabling HeadsUp
 */
export function validateHeadsUpEnvironment(): HeadsUpValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasDOM = checkDOM();
  const hasLocalStorage = hasDOM ? checkLocalStorage() : false;
  const hasWebSocket = hasDOM ? checkWebSocket() : false;
  const browserSupported = hasDOM ? checkBrowserSupport() : false;

  // Critical errors (prevent loading)
  if (!hasDOM) {
    errors.push('DOM not available (SSR environment)');
  }

  if (!browserSupported) {
    errors.push('Browser not supported (missing modern features)');
  }

  // Warnings (can still load with degraded functionality)
  if (!hasLocalStorage) {
    warnings.push('localStorage not available (state won\'t persist)');
  }

  if (!hasWebSocket) {
    warnings.push('WebSocket not available (real-time features disabled)');
  }

  const canLoad = errors.length === 0;

  return {
    canLoad,
    errors,
    warnings,
    environment: {
      hasLocalStorage,
      hasWebSocket,
      hasDOM,
      browserSupported,
    },
  };
}

/**
 * Sanitize project name to prevent XSS
 */
export function sanitizeProjectName(projectName: string): string {
  return projectName
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .toLowerCase()
    .substring(0, 50); // Limit length
}

/**
 * Validate HeadsUp configuration
 */
export function validateHeadsUpConfig(config: {
  project?: string;
  autoDetect?: boolean;
  containerId?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.project) {
    if (typeof config.project !== 'string') {
      errors.push('project must be a string');
    } else if (config.project.length === 0) {
      errors.push('project cannot be empty');
    } else if (config.project.length > 100) {
      errors.push('project name too long (max 100 characters)');
    }
  }

  if (config.containerId) {
    if (typeof config.containerId !== 'string') {
      errors.push('containerId must be a string');
    } else if (!/^[a-z][a-z0-9-]*$/i.test(config.containerId)) {
      errors.push('containerId must be a valid HTML id');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check HeadsUp health status
 */
export function checkHeadsUpHealth(): {
  mounted: boolean;
  responsive: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let mounted = false;
  let responsive = false;

  if (typeof document !== 'undefined') {
    const container = document.getElementById('cockpit-headup-root');
    mounted = container !== null && container.children.length > 0;

    // Check if HeadsUp API is available
    if ((window as any).cockpitHeadsUpInstance) {
      const instance = (window as any).cockpitHeadsUpInstance;
      responsive = typeof instance.isMounted === 'function';
    }
  }

  if (mounted && !responsive) {
    errors.push('HeadsUp mounted but not responsive');
  }

  return {
    mounted,
    responsive,
    errors,
  };
}

/**
 * Performance monitoring for HeadsUp
 */
export class HeadsUpPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((values, name) => {
      result[name] = this.getStats(name);
    });
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Global instance
export const headsUpPerfMonitor = new HeadsUpPerformanceMonitor();
