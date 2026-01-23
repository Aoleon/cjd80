import { useBranding } from '@/contexts/BrandingContext';

export function useBrandingConfig() {
  const { branding, isLoading, isCustomized, reloadBranding } = useBranding();
  
  return {
    branding,
    isLoading,
    isCustomized,
    reloadBranding,
    // Helpers
    getAppName: () => branding.app.name,
    getShortAppName: () => branding.app.shortName,
    getOrgName: () => branding.organization.fullName,
    getIdeaBoxName: () => branding.app.ideaBoxName,
    getPrimaryColor: () => branding.colors.primary,
  };
}
