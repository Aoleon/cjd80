import { ReactNode } from "react";
import AdminHeader from "@/components/admin-header";
import AdminBreadcrumbs from "@/components/admin-breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  icon?: ReactNode;
  showHeader?: boolean; // Option pour afficher/masquer AdminHeader
  showCard?: boolean; // Option pour afficher/masquer le Card wrapper
}

export default function AdminPageLayout({
  title,
  description,
  breadcrumbs,
  children,
  icon,
  showHeader = true,
  showCard = true,
}: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <AdminHeader />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <AdminBreadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {icon || <Shield className="w-5 h-5 text-cjd-green" />}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          </div>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>

        {/* Page Content */}
        {showCard ? (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

