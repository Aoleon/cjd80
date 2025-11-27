import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminMembersPage from "../../admin-members-page";
import { UserCircle } from "lucide-react";

export default function AdminCrmMembersPage() {
  return (
    <AdminPageLayout
      title="Gestion des Membres"
      description="Gérer les membres de la communauté CJD Amiens"
      breadcrumbs={[
        { label: "CRM", path: "/admin/crm/members" },
        { label: "Membres" },
      ]}
      icon={<UserCircle className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminMembersPage />
    </AdminPageLayout>
  );
}

