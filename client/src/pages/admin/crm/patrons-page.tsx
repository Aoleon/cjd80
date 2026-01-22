"use client";

import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminPatronsPage from "../../admin-patrons-page";
import { Building2 } from "lucide-react";

export default function AdminCrmPatronsPage() {
  return (
    <AdminPageLayout
      title="Gestion des Mécènes"
      description="Gérer les relations avec les entreprises"
      breadcrumbs={[
        { label: "CRM", path: "/admin/crm/patrons" },
        { label: "Mécènes" },
      ]}
      icon={<Building2 className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminPatronsPage />
    </AdminPageLayout>
  );
}

