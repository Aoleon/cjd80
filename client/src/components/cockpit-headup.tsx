'use client';

import { useEffect, useRef, useState } from 'react';
import {
  validateHeadsUpEnvironment,
  validateHeadsUpConfig,
  sanitizeProjectName,
  headsUpPerfMonitor,
  checkHeadsUpHealth,
} from '@/lib/headup-validator';

export interface CockpitHeadsUpProps {
  enabled?: boolean;
  project?: string;
  autoDetect?: boolean;
  onError?: (error: Error) => void;
  onLoadSuccess?: () => void;
}

/**
 * Client component to inject Cockpit HeadsUp overlay
 * Dynamically loads the cockpit-headup library and mounts it
 * Includes validation, error handling, and performance monitoring
 */
export function CockpitHeadsUp({
  enabled = false,
  project,
  autoDetect = true,
  onError,
  onLoadSuccess,
}: CockpitHeadsUpProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const instanceRef = useRef<any>(null);
  const loadStartTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      // Cleanup if disabled
      if (instanceRef.current) {
        const unmountStart = performance.now();
        instanceRef.current.unmount();
        const unmountDuration = performance.now() - unmountStart;
        headsUpPerfMonitor.recordMetric('unmount', unmountDuration);
        instanceRef.current = null;
      }
      setValidationErrors([]);
      return;
    }

    // Validate environment before loading
    const envValidation = validateHeadsUpEnvironment();
    if (!envValidation.canLoad) {
      setValidationErrors(envValidation.errors);
      console.error('[CockpitHeadsUp] Environment validation failed:', envValidation.errors);
      onError?.(new Error(`Environment validation failed: ${envValidation.errors.join(', ')}`));
      return;
    }

    // Log warnings but continue
    if (envValidation.warnings.length > 0) {
      console.warn('[CockpitHeadsUp] Warnings:', envValidation.warnings);
    }

    // Validate configuration
    const configValidation = validateHeadsUpConfig({ project, autoDetect });
    if (!configValidation.valid) {
      setValidationErrors(configValidation.errors);
      console.error('[CockpitHeadsUp] Config validation failed:', configValidation.errors);
      onError?.(new Error(`Config validation failed: ${configValidation.errors.join(', ')}`));
      return;
    }

    // Sanitize project name if provided
    const safeProject = project ? sanitizeProjectName(project) : undefined;

    // Load the cockpit-headup script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if ((window as any).CockpitHeadsUp) {
          setIsLoaded(true);
          resolve((window as any).CockpitHeadsUp);
          return;
        }

        loadStartTime.current = performance.now();

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/cockpit-headup/cockpit-headup.css';
        link.onerror = () => {
          console.warn('[CockpitHeadsUp] CSS failed to load');
        };
        document.head.appendChild(link);

        // Load JS (UMD version for maximum compatibility)
        const script = document.createElement('script');
        script.src = '/cockpit-headup/cockpit-headup.umd.js';
        script.async = true;
        script.onload = () => {
          const loadDuration = performance.now() - loadStartTime.current;
          headsUpPerfMonitor.recordMetric('script-load', loadDuration);
          setIsLoaded(true);
          resolve((window as any).CockpitHeadsUp);
        };
        script.onerror = () => {
          const error = new Error('Failed to load cockpit-headup script');
          console.error('[CockpitHeadsUp]', error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    };

    // Initialize
    loadScript()
      .then((CockpitHeadsUpClass: any) => {
        if (!instanceRef.current) {
          const mountStart = performance.now();

          const instance = new CockpitHeadsUpClass({
            project: safeProject,
            autoDetect,
          });
          instance.mount();

          const mountDuration = performance.now() - mountStart;
          headsUpPerfMonitor.recordMetric('mount', mountDuration);

          instanceRef.current = instance;
          console.log('[CockpitHeadsUp] Mounted successfully', {
            project: safeProject,
            autoDetect,
            loadTime: performance.now() - loadStartTime.current,
          });

          // Health check after mount
          setTimeout(() => {
            const health = checkHeadsUpHealth();
            if (health.errors.length > 0) {
              console.error('[CockpitHeadsUp] Health check failed:', health.errors);
              onError?.(new Error(`Health check failed: ${health.errors.join(', ')}`));
            } else {
              console.log('[CockpitHeadsUp] Health check passed');
              onLoadSuccess?.();
            }
          }, 1000);
        }
      })
      .catch((error) => {
        console.error('[CockpitHeadsUp] Initialization error:', error);
        onError?.(error);
      });

    // Cleanup on unmount
    return () => {
      if (instanceRef.current) {
        const unmountStart = performance.now();
        instanceRef.current.unmount();
        const unmountDuration = performance.now() - unmountStart;
        headsUpPerfMonitor.recordMetric('unmount', unmountDuration);
        instanceRef.current = null;
      }
    };
  }, [enabled, project, autoDetect, onError, onLoadSuccess]);

  // Display validation errors in development
  if (process.env.NODE_ENV === 'development' && validationErrors.length > 0) {
    console.error('[CockpitHeadsUp] Validation errors:', validationErrors);
  }

  // This component doesn't render anything visible
  // The cockpit overlay is injected into the DOM directly
  return null;
}
