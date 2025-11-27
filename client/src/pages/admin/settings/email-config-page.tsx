import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminEmailConfigPage from "../../admin-email-config-page";
import { Mail } from "lucide-react";

export default function AdminSettingsEmailConfigPage() {
  return (
    <AdminPageLayout
      title="Configuration Email"
      description="Configurer les paramètres SMTP pour l'envoi d'emails"
      breadcrumbs={[
        { label: "Paramètres", path: "/admin/settings" },
        { label: "Email" },
      ]}
      icon={<Mail className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminEmailConfigPage />
    </AdminPageLayout>
  );
}

