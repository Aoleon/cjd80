import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminFinancialDashboard from "@/components/admin/AdminFinancialDashboard";
import { BarChart3 } from "lucide-react";

export default function AdminFinanceDashboardPage() {
  return (
    <AdminPageLayout
      title="Tableau de bord financier"
      description="Vue d'ensemble financière avec KPIs étendus, écarts et prévisions"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Tableau de bord" },
      ]}
      icon={<BarChart3 className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <AdminFinancialDashboard />
    </AdminPageLayout>
  );
}




