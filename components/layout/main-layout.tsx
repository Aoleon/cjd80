import Header from './header';
import Footer from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Layout principal avec header et footer
 * Utilisé pour les pages publiques et protégées
 */
export default function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
