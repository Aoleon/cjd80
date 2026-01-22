"use client";

import { useState } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminLoanItemsPanel from "@/components/admin/AdminLoanItemsPanel";
import LoanItemDetailModal from "@/components/LoanItemDetailModal";
import EditLoanItemModal from "@/components/EditLoanItemModal";
import FeatureGuard from "@/components/FeatureGuard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Package } from "lucide-react";
import { getShortAppName } from '@/config/branding';

export default function AdminLoansPage() {
  const { user, isLoading } = useAuth();
  const [loanItemDetailModalOpen, setLoanItemDetailModalOpen] = useState(false);
  const [selectedLoanItem, setSelectedLoanItem] = useState<any | null>(null);
  const [editLoanItemModalOpen, setEditLoanItemModalOpen] = useState(false);
  const [loanItemToEdit, setLoanItemToEdit] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cjd-green text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold">{getShortAppName()}</h1>
                <p className="text-white/90">Administration - Boîte à Kiffs</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à l'administration.</p>
        </main>
      </div>
    );
  }

  return (
    <FeatureGuard featureKey="loan" featureName="La gestion du prêt">
      <AdminPageLayout
        title="Gestion du Prêt"
        description="Gérer le matériel disponible au prêt"
        breadcrumbs={[
          { label: "Contenu", path: "/admin/content" },
          { label: "Prêt" },
        ]}
        icon={<Package className="w-5 h-5 text-cjd-green" />}
        showCard={false}
      >
        <AdminLoanItemsPanel
          enabled={true}
          onViewDetail={(item) => { setSelectedLoanItem(item); setLoanItemDetailModalOpen(true); }}
          onEdit={(item) => { setLoanItemToEdit(item); setEditLoanItemModalOpen(true); }}
        />
        
        <LoanItemDetailModal 
          open={loanItemDetailModalOpen} 
          onOpenChange={setLoanItemDetailModalOpen} 
          item={selectedLoanItem}
          onEdit={(item) => { setLoanItemToEdit(item); setEditLoanItemModalOpen(true); }}
        />
        <EditLoanItemModal 
          open={editLoanItemModalOpen} 
          onOpenChange={setEditLoanItemModalOpen} 
          item={loanItemToEdit}
        />
      </AdminPageLayout>
    </FeatureGuard>
  );
}

