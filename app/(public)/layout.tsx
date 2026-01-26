import MainLayout from '@/components/layout/main-layout';

/**
 * Layout pour les pages publiques
 * Pas de protection d'authentification
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout showHeader={true} showFooter={true}>
      {children}
    </MainLayout>
  );
}
