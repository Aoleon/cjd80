'use client';

import { MainLayout } from "@/components/layout";
import LoanItemsSection from "@/components/loan-items-section";

export default function LoanPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <LoanItemsSection />
      </div>
    </MainLayout>
  );
}
