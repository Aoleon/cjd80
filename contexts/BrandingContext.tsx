import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { brandingCore } from '@/lib/config/branding-core';
import type { BrandingCore } from '@/lib/config/branding-core';
import { branding as defaultBranding } from '@/lib/config/branding';

interface BrandingContextType {
  branding: BrandingCore & { assets?: typeof defaultBranding.assets };
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
  const [brandingState, setBrandingState] = useState<BrandingCore & { assets?: typeof defaultBranding.assets }>({
    ...brandingCore,
    assets: defaultBranding.assets
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomized, setIsCustomized] = useState(false);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/branding');
      
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
          let logoUrl: string = defaultBranding.assets.logo;
          if (customConfig.logoFilename) {
            // Le logo uploadé est accessible via MinIO
            // URL MinIO: http://localhost:9000/assets/{filename}
            const minioEndpoint = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MINIO_ENDPOINT) || 'localhost:9000';
            const minioProtocol = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MINIO_USE_SSL === 'true') ? 'https' : 'http';
            logoUrl = `${minioProtocol}://${minioEndpoint}/assets/${customConfig.logoFilename}`;
          }

          setBrandingState({
            ...mergedConfig,
            assets: {
              ...defaultBranding.assets,
              logo: logoUrl as any // Allow dynamic MinIO URLs
            }
          });
          setIsCustomized(true);
        }
      }
    } catch (error) {
      console.error('Failed to load branding config:', error);
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
