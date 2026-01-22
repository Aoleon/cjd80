/**
 * Feature flags system for Cockpit HeadsUp
 * Allows gradual rollout and A/B testing of features
 */

export interface FeatureFlags {
  // Core features
  enableHeadsUp: boolean;
  enableChat: boolean;
  enableMonitoring: boolean;
  enableAnalytics: boolean;

  // Advanced features
  enableTypeScriptDiagnostics: boolean;
  enablePerformanceMetrics: boolean;
  enableErrorTracking: boolean;
  enableSecurityAudits: boolean;

  // Experimental features
  enableAIAgent: boolean;
  enableVoiceCommands: boolean;
  enableCollaboration: boolean;

  // Development features
  enableDebugMode: boolean;
  enableMockData: boolean;
  enableTestMode: boolean;
}

export interface FeatureFlagConfig {
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  projectId?: string;
  customFlags?: Partial<FeatureFlags>;
}

const DEFAULT_FLAGS: Record<'development' | 'staging' | 'production', FeatureFlags> = {
  development: {
    enableHeadsUp: true,
    enableChat: true,
    enableMonitoring: true,
    enableAnalytics: false,
    enableTypeScriptDiagnostics: true,
    enablePerformanceMetrics: true,
    enableErrorTracking: true,
    enableSecurityAudits: true,
    enableAIAgent: true,
    enableVoiceCommands: false,
    enableCollaboration: false,
    enableDebugMode: true,
    enableMockData: true,
    enableTestMode: true,
  },
  staging: {
    enableHeadsUp: true,
    enableChat: true,
    enableMonitoring: true,
    enableAnalytics: true,
    enableTypeScriptDiagnostics: true,
    enablePerformanceMetrics: true,
    enableErrorTracking: true,
    enableSecurityAudits: true,
    enableAIAgent: true,
    enableVoiceCommands: false,
    enableCollaboration: false,
    enableDebugMode: false,
    enableMockData: false,
    enableTestMode: false,
  },
  production: {
    enableHeadsUp: true,
    enableChat: true,
    enableMonitoring: false, // Disabled in prod initially
    enableAnalytics: true,
    enableTypeScriptDiagnostics: false, // Expensive, enable gradually
    enablePerformanceMetrics: true,
    enableErrorTracking: true,
    enableSecurityAudits: false, // Heavy, enable for specific users
    enableAIAgent: true,
    enableVoiceCommands: false, // Experimental
    enableCollaboration: false, // Not ready
    enableDebugMode: false,
    enableMockData: false,
    enableTestMode: false,
  },
};

class FeatureFlagsManager {
  private flags: FeatureFlags;
  private config: FeatureFlagConfig;
  private readonly STORAGE_KEY = 'headup-feature-flags';

  constructor(config: FeatureFlagConfig) {
    this.config = config;
    this.flags = this.loadFlags();
  }

  private loadFlags(): FeatureFlags {
    // Start with environment defaults
    const env = this.config.environment as 'development' | 'staging' | 'production';
    const defaultFlags = DEFAULT_FLAGS[env];
    const baseFlags: FeatureFlags = defaultFlags ? { ...defaultFlags } : { ...DEFAULT_FLAGS.production };

    // Override with custom flags
    let flags: FeatureFlags = baseFlags;
    if (this.config.customFlags) {
      // Merge custom flags ensuring all required properties exist
      const merged = { ...flags };
      for (const key in this.config.customFlags) {
        const customKey = key as keyof FeatureFlags;
        const customValue = this.config.customFlags[customKey];
        if (customValue !== undefined) {
          merged[customKey] = customValue;
        }
      }
      flags = merged;
    }

    // Override with stored flags (development only)
    if (this.config.environment === 'development' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const storedFlags = JSON.parse(stored) as Record<string, unknown>;
          const merged = { ...flags };
          for (const key in storedFlags) {
            const storedKey = key as keyof FeatureFlags;
            const storedValue = storedFlags[key];
            if (storedValue !== undefined && typeof storedValue === 'boolean') {
              merged[storedKey] = storedValue;
            }
          }
          flags = merged;
        }
      } catch (e) {
        console.warn('[FeatureFlags] Failed to load from localStorage');
      }
    }

    return flags;
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature] === true;
  }

  /**
   * Enable a feature (development only)
   */
  enable(feature: keyof FeatureFlags): void {
    if (this.config.environment !== 'development') {
      console.warn('[FeatureFlags] Cannot modify flags in non-development environment');
      return;
    }

    this.flags[feature] = true;
    this.persistFlags();
  }

  /**
   * Disable a feature (development only)
   */
  disable(feature: keyof FeatureFlags): void {
    if (this.config.environment !== 'development') {
      console.warn('[FeatureFlags] Cannot modify flags in non-development environment');
      return;
    }

    this.flags[feature] = false;
    this.persistFlags();
  }

  /**
   * Toggle a feature (development only)
   */
  toggle(feature: keyof FeatureFlags): void {
    if (this.config.environment !== 'development') {
      console.warn('[FeatureFlags] Cannot modify flags in non-development environment');
      return;
    }

    this.flags[feature] = !this.flags[feature];
    this.persistFlags();
  }

  /**
   * Get all flags
   */
  getAll(): Readonly<FeatureFlags> {
    return { ...this.flags };
  }

  /**
   * Reset to environment defaults
   */
  reset(): void {
    if (this.config.environment !== 'development') {
      console.warn('[FeatureFlags] Cannot reset flags in non-development environment');
      return;
    }

    const defaultFlags = DEFAULT_FLAGS[this.config.environment];
    if (defaultFlags) {
      this.flags = { ...defaultFlags };
    }
    this.persistFlags();
  }

  /**
   * Persist flags to localStorage (development only)
   */
  private persistFlags(): void {
    if (this.config.environment !== 'development' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (e) {
      console.warn('[FeatureFlags] Failed to persist to localStorage');
    }
  }

  /**
   * Get feature flag stats
   */
  getStats(): { total: number; enabled: number; disabled: number } {
    const entries = Object.entries(this.flags);
    return {
      total: entries.length,
      enabled: entries.filter(([_, value]) => value === true).length,
      disabled: entries.filter(([_, value]) => value === false).length,
    };
  }

  /**
   * Export flags as JSON
   */
  export(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  /**
   * Import flags from JSON (development only)
   */
  import(json: string): void {
    if (this.config.environment !== 'development') {
      console.warn('[FeatureFlags] Cannot import flags in non-development environment');
      return;
    }

    try {
      const imported = JSON.parse(json);
      this.flags = { ...this.flags, ...imported };
      this.persistFlags();
    } catch (e) {
      console.error('[FeatureFlags] Failed to import flags:', e);
    }
  }
}

// Determine environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    if (process.env.NODE_ENV === 'development') return 'development';
    if (process.env.NEXT_PUBLIC_ENV === 'staging') return 'staging';
  }
  return 'production';
};

// Global instance
export const featureFlags = new FeatureFlagsManager({
  environment: getEnvironment(),
});

// Export for testing
export { FeatureFlagsManager };

// Convenience hooks for React
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(feature);
}

// Type guard
export function isFeatureFlagKey(key: string): key is keyof FeatureFlags {
  const devFlags = DEFAULT_FLAGS.development;
  return devFlags ? key in devFlags : false;
}
