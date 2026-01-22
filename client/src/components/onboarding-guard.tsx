"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Composant qui redirige automatiquement vers l'onboarding
 * si c'est une première installation
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Ignorer la vérification sur certaines routes
  const skipRoutes = ['/onboarding', '/auth', '/test-error'];
  const shouldSkipCheck = skipRoutes.some(route => pathname.startsWith(route));

  const { data: setupStatus, isLoading } = useQuery({
    queryKey: ["/api/setup/status"],
    queryFn: async () => {
      const res = await fetch("/api/setup/status");
      if (!res.ok) throw new Error('Failed to load setup status');
      return res.json();
    },
    enabled: !shouldSkipCheck,
    retry: 1,
    staleTime: 30000, // Cache pendant 30 secondes
  });

  if (shouldSkipCheck) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  // Si c'est une première installation, rediriger vers l'onboarding
  useEffect(() => {
    if (setupStatus?.data?.isFirstInstall) {
      router.push('/onboarding');
    }
  }, [setupStatus?.data?.isFirstInstall, router]);

  // Afficher un loader pendant la redirection
  if (setupStatus?.data?.isFirstInstall) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  return <>{children}</>;
}
