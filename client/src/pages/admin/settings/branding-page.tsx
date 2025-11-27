import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminBrandingPage from "../../admin-branding-page";
import { Palette } from "lucide-react";

export default function AdminSettingsBrandingPage() {
  return (
    <AdminPageLayout
      title="Configuration du Branding"
      description="Personnaliser l'apparence de la plateforme"
      breadcrumbs={[
        { label: "Paramètres", path: "/admin/settings" },
        { label: "Branding" },
      ]}
      icon={<Palette className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminBrandingPage />
    </AdminPageLayout>
  );
}

