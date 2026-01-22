"use client";

import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

interface FinancialReport {
  period: string;
  revenues: {
    subscriptions: number;
    sponsorships: number;
    other: number;
    total: number;
  };
  expenses: {
    byCategory: { category: string; amount: number }[];
    total: number;
  };
  budgets: {
    byCategory: { category: string; amount: number }[];
    total: number;
  };
  variances: {
    revenues: number;
    expenses: number;
    balance: number;
  };
  forecasts: {
    nextPeriod: number;
    confidence: string;
  };
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [period, setPeriod] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const isSuperAdmin = user?.role === "super_admin";

  const { data: reportResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: FinancialReport }>(
    ["/api/admin/finance/reports", reportType, period, year],
    async () => {
      const params = new URLSearchParams();
      params.append("period", period.toString());
      params.append("year", year.toString());
      
      const res = await fetch(`/api/admin/finance/reports/${reportType}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch financial report');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const report = reportResponse?.data;

  const handleExportCSV = () => {
    if (!report) return;

    const csvData = [
      ['Période', report.period],
      [''],
      ['REVENUS'],
      ['Souscriptions', formatEuros(report.revenues.subscriptions)],
      ['Sponsorings', formatEuros(report.revenues.sponsorships)],
      ['Autres', formatEuros(report.revenues.other)],
      ['Total revenus', formatEuros(report.revenues.total)],
      [''],
      ['DÉPENSES'],
      ...report.expenses.byCategory.map(e => [e.category, formatEuros(e.amount)]),
      ['Total dépenses', formatEuros(report.expenses.total)],
      [''],
      ['BUDGETS'],
      ...report.budgets.byCategory.map(b => [b.category, formatEuros(b.amount)]),
      ['Total budgets', formatEuros(report.budgets.total)],
      [''],
      ['ÉCARTS'],
      ['Revenus', formatEuros(report.variances.revenues)],
      ['Dépenses', formatEuros(report.variances.expenses)],
      ['Solde', formatEuros(report.variances.balance)],
      [''],
      ['PRÉVISIONS'],
      ['Période suivante', formatEuros(report.forecasts.nextPeriod)],
      ['Confiance', report.forecasts.confidence],
    ];

    // Convertir le tableau de tableaux en CSV
    const csv = csvData.map(row => 
      row.map(cell => {
        const cellStr = String(cell ?? '');
        // Échapper les guillemets et entourer de guillemets si nécessaire
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-financier-${reportType}-${period}-${year}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export réussi",
      description: "Le rapport a été exporté en CSV.",
    });
  };

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout
        title="Rapports financiers"
        description="Génération et export de rapports financiers"
        icon={<FileText className="w-5 h-5 text-cjd-green" />}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Rapports financiers"
      description="Génération et export de rapports financiers"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Rapports" },
      ]}
      icon={<FileText className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <div className="space-y-6">
        {/* Sélection du rapport */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du rapport</CardTitle>
            <CardDescription>Sélectionnez le type de rapport et la période</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Type de rapport</Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as 'monthly' | 'quarterly' | 'yearly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {reportType === 'monthly' ? 'Mois' : reportType === 'quarterly' ? 'Trimestre' : 'Année'}
                </Label>
                <Input
                  type="number"
                  min={reportType === 'monthly' ? 1 : reportType === 'quarterly' ? 1 : 2000}
                  max={reportType === 'monthly' ? 12 : reportType === 'quarterly' ? 4 : 2100}
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Année</Label>
                <Input
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleExportCSV} disabled={!report || isLoading} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rapport */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-2 text-red-600">
                <AlertCircle className="h-8 w-8" />
                <p>{error.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : report ? (
          <div className="space-y-6">
            {/* En-tête */}
            <Card>
              <CardHeader>
                <CardTitle>Rapport financier - {report.period}</CardTitle>
                <CardDescription>Période: {reportType === 'monthly' ? 'Mensuel' : reportType === 'quarterly' ? 'Trimestriel' : 'Annuel'}</CardDescription>
              </CardHeader>
            </Card>

            {/* Revenus */}
            <Card>
              <CardHeader>
                <CardTitle>Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Souscriptions</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatEuros(report.revenues.subscriptions)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sponsorings</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatEuros(report.revenues.sponsorships)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Autres</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatEuros(report.revenues.other)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Total revenus</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatEuros(report.revenues.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Dépenses */}
            <Card>
              <CardHeader>
                <CardTitle>Dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.expenses.byCategory.map((expense) => (
                      <TableRow key={expense.category}>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatEuros(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total dépenses</TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatEuros(report.expenses.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Budgets */}
            <Card>
              <CardHeader>
                <CardTitle>Budgets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.budgets.byCategory.map((budget) => (
                      <TableRow key={budget.category}>
                        <TableCell>{budget.category}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatEuros(budget.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total budgets</TableCell>
                      <TableCell className="text-right">
                        {formatEuros(report.budgets.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Écarts */}
            <Card>
              <CardHeader>
                <CardTitle>Écarts</CardTitle>
                <CardDescription>Comparaison réel vs prévu/budgété</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Écart revenus</span>
                    <Badge variant={report.variances.revenues >= 0 ? "default" : "destructive"}>
                      {formatEuros(report.variances.revenues)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Écart dépenses</span>
                    <Badge variant={report.variances.expenses <= 0 ? "default" : "destructive"}>
                      {formatEuros(report.variances.expenses)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Écart solde</span>
                    <Badge variant={report.variances.balance >= 0 ? "default" : "destructive"}>
                      {formatEuros(report.variances.balance)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prévisions */}
            <Card>
              <CardHeader>
                <CardTitle>Prévisions période suivante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Montant prévu</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatEuros(report.forecasts.nextPeriod)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Niveau de confiance</span>
                    <Badge variant={report.forecasts.confidence === 'high' ? 'default' : report.forecasts.confidence === 'medium' ? 'secondary' : 'outline'}>
                      {report.forecasts.confidence === 'high' ? 'Élevée' : report.forecasts.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}

