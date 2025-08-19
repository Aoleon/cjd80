import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Users, Loader2, FileText, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Event, Inscription } from "@shared/schema";

interface InscriptionExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: (Event & { inscriptionCount: number }) | null;
}

export default function InscriptionExportModal({ 
  open, 
  onOpenChange, 
  event 
}: InscriptionExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: inscriptions, isLoading, error } = useQuery<Inscription[]>({
    queryKey: ["/api/events", event?.id, "inscriptions"],
    queryFn: async () => {
      if (!event) return [];
      const res = await fetch(`/api/events/${event.id}/inscriptions`);
      if (!res.ok) throw new Error("Erreur lors du chargement des inscriptions");
      return res.json();
    },
    enabled: open && !!event,
  });

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExportDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR").replace(/\//g, "-");
  };

  const exportToCSV = async () => {
    if (!inscriptions || !event) return;
    
    setIsExporting(true);
    
    try {
      // Prepare CSV content
      const headers = ["Nom", "Email", "Date d'inscription"];
      const csvContent = [
        headers.join(","),
        ...inscriptions.map(inscription => [
          `"${inscription.name}"`,
          `"${inscription.email}"`,
          `"${new Date(inscription.createdAt).toLocaleDateString("fr-FR")}"`
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `inscriptions-${event.title.replace(/[^a-zA-Z0-9]/g, "-")}-${formatExportDate(new Date())}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "✅ Export réussi !",
        description: `${inscriptions.length} inscription(s) exportée(s) en CSV`,
        duration: 4000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur lors de l'export",
        description: "Impossible d'exporter les inscriptions",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToTXT = async () => {
    if (!inscriptions || !event) return;
    
    setIsExporting(true);
    
    try {
      // Prepare TXT content
      const txtContent = [
        `INSCRIPTIONS - ${event.title.toUpperCase()}`,
        `Date de l'événement: ${formatEventDate(event.date.toString())}`,
        `Export généré le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
        `Nombre total d'inscriptions: ${inscriptions.length}`,
        "",
        "=".repeat(60),
        "",
        ...inscriptions.map((inscription, index) => [
          `${index + 1}. ${inscription.name}`,
          `   Email: ${inscription.email}`,
          `   Inscrit le: ${new Date(inscription.createdAt).toLocaleDateString("fr-FR")}`,
          ""
        ].join("\n"))
      ].join("\n");

      // Create and download file
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `inscriptions-${event.title.replace(/[^a-zA-Z0-9]/g, "-")}-${formatExportDate(new Date())}.txt`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "✅ Export réussi !",
        description: `Liste des ${inscriptions.length} inscription(s) exportée en TXT`,
        duration: 4000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur lors de l'export",
        description: "Impossible d'exporter les inscriptions",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Download className="h-5 w-5 text-cjd-green" />
            Exporter les inscriptions
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-cjd-green">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-cjd-green" />
                    <span>{formatEventDate(event.date.toString())}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-cjd-green" />
                    <span>{event.inscriptionCount} personne(s) inscrite(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Erreur lors du chargement des inscriptions</p>
            </div>
          )}

          {/* Inscriptions List Preview */}
          {inscriptions && inscriptions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-4">
                Aperçu des inscriptions ({inscriptions.length})
              </h4>
              
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {inscriptions.slice(0, 10).map((inscription, index) => (
                      <div key={inscription.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{inscription.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({inscription.email})</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(inscription.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    ))}
                    {inscriptions.length > 10 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        ... et {inscriptions.length - 10} autres inscription(s)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Options d'export</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CSV Export */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <Button
                        onClick={exportToCSV}
                        disabled={isExporting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Export CSV
                      </Button>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Format Excel/Google Sheets
                      </p>
                    </CardContent>
                  </Card>

                  {/* TXT Export */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <Button
                        onClick={exportToTXT}
                        disabled={isExporting}
                        variant="outline"
                        className="w-full border-cjd-green text-cjd-green hover:bg-cjd-green hover:text-white"
                        size="lg"
                      >
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Export TXT
                      </Button>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Liste formatée pour impression
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* No Inscriptions */}
          {inscriptions && inscriptions.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune inscription pour cet événement</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8"
              size="lg"
            >
              Fermer
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ À propos de l'export</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Les fichiers sont générés localement (aucun envoi serveur)</li>
            <li>• Le format CSV est compatible Excel/Google Sheets</li>
            <li>• Le format TXT est optimisé pour l'impression</li>
            <li>• Les données respectent le RGPD</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}