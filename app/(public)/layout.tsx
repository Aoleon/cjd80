/**
 * Layout pour les pages publiques
 * Pas de protection d'authentification
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
