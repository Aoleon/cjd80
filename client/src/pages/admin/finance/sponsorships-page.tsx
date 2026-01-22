"use client";

import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminSponsorshipsPage from "../../admin-sponsorships-page";
import { Award } from "lucide-react";

export default function AdminFinanceSponsorshipsPage() {
  return (
    <AdminPageLayout
      title="Gestion des Sponsorings"
      description="Vue d'ensemble et gestion centralisée des sponsorings d'événements"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Sponsorings" },
      ]}
      icon={<Award className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminSponsorshipsPage />
    </AdminPageLayout>
  );
}

