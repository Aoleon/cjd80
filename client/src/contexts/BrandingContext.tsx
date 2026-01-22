"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { brandingCore } from '@/config/branding-core';
import type { BrandingCore } from '@/config/branding-core';
import { branding as defaultBranding } from '@/config/branding';

// Type pour les assets qui accepte à la fois StaticImageData et string pour le logo
type BrandingAssets = Omit<typeof defaultBranding.assets, 'logo'> & {
  logo: string | typeof defaultBranding.assets.logo;
};

interface BrandingContextType {
  branding: BrandingCore & { assets?: BrandingAssets };
  isLoading: boolean;
  isCustomized: boolean;
  reloadBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// Deep merge utility function
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];
    
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue) as any;
      } else {
        result[key] = sourceValue as any;
      }
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }
  
  return result;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [brandingState, setBrandingState] = useState<BrandingCore & { assets?: BrandingAssets }>({
    ...brandingCore,
    assets: defaultBranding.assets
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomized, setIsCustomized] = useState(false);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/branding');

      // Si 401/403, utiliser les valeurs par défaut sans erreur
      if (response.status === 401 || response.status === 403) {
        setBrandingState({
          ...brandingCore,
          assets: defaultBranding.assets
        });
        setIsCustomized(false);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        if (result.data.isDefault) {
          // Using default values
          setBrandingState({
            ...brandingCore,
            assets: defaultBranding.assets
          });
          setIsCustomized(false);
        } else {
          // Using customized values from DB
          const customConfig = JSON.parse(result.data.config);
          // Deep merge with defaults to preserve nested default values
          const mergedConfig = deepMerge(brandingCore, customConfig);
          
          // Si un logo a été uploadé, utiliser celui-ci
          let logoUrl: string | typeof defaultBranding.assets.logo = defaultBranding.assets.logo;
          if (customConfig.logoFilename) {
            // Le logo uploadé est accessible via MinIO
            // URL MinIO: http://localhost:9000/assets/{filename}
            const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'localhost:9000';
            const minioProtocol = process.env.NEXT_PUBLIC_MINIO_USE_SSL === 'true' ? 'https' : 'http';
            logoUrl = `${minioProtocol}://${minioEndpoint}/assets/${customConfig.logoFilename}`;
          }
          
          setBrandingState({
            ...mergedConfig,
            assets: {
              ...defaultBranding.assets,
              logo: logoUrl
            }
          });
          setIsCustomized(true);
        }
      }
    } catch (error) {
      // Utiliser console.warn au lieu de console.error pour ne pas polluer la console
      // en environnement non authentifié
      console.warn('Branding config not loaded, using defaults');
      // Fallback to default values
      setBrandingState({
        ...brandingCore,
        assets: defaultBranding.assets
      });
      setIsCustomized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ 
      branding: brandingState, 
      isLoading, 
      isCustomized,
      reloadBranding: loadBranding 
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}
