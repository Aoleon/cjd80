import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { brandingCore } from '@/config/branding-core';
import type { BrandingCore } from '@/config/branding-core';

interface BrandingContextType {
  branding: BrandingCore;
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
  const [branding, setBranding] = useState<BrandingCore>(brandingCore);
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
          setBranding(brandingCore);
          setIsCustomized(false);
        } else {
          // Using customized values from DB
          const customConfig = JSON.parse(result.data.config);
          // Deep merge with defaults to preserve nested default values
          setBranding(deepMerge(brandingCore, customConfig));
          setIsCustomized(true);
        }
      }
    } catch (error) {
      console.error('Failed to load branding config:', error);
      // Fallback to default values
      setBranding(brandingCore);
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
      branding, 
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
