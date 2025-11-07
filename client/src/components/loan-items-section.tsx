import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Package, Loader2, Plus, User, Image as ImageIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimplePagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoanItemSchema, type InsertLoanItem, LOAN_STATUS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getShortAppName } from '@/config/branding';
import type { LoanItem } from "@shared/schema";

interface PaginatedLoanItemsResponse {
  success: boolean;
  data: {
    data: LoanItem[];
    total: number;
    page: number;
    limit: number;
  };
}

interface LoanItemsSectionProps {
  onNavigateToPropose?: () => void;
}

export default function LoanItemsSection({ onNavigateToPropose }: LoanItemsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const limit = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery<PaginatedLoanItemsResponse>({
    queryKey: ["/api/loan-items", page, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      const res = await fetch(`/api/loan-items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch loan items');
      return res.json();
    }
  });

  const form = useForm<InsertLoanItem>({
    resolver: zodResolver(insertLoanItemSchema),
    defaultValues: {
      title: "",
      description: "",
      lenderName: "",
      photoUrl: undefined,
      proposedBy: "",
      proposedByEmail: "",
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLoanItem) => {
      const res = await fetch("/api/loan-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Matériel proposé",
        description: "Votre proposition a été envoyée et sera validée par un administrateur.",
      });
      form.reset();
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const loanItems = response?.data?.data || [];
  const total = response?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  const handleSubmit = (data: InsertLoanItem) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      [LOAN_STATUS.AVAILABLE]: "bg-success text-white",
      [LOAN_STATUS.BORROWED]: "bg-warning text-white",
      [LOAN_STATUS.UNAVAILABLE]: "bg-error text-white",
      [LOAN_STATUS.PENDING]: "bg-gray-400 text-white",
    };
    return badges[status as keyof typeof badges] || "bg-gray-400 text-white";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      [LOAN_STATUS.AVAILABLE]: "Disponible",
      [LOAN_STATUS.BORROWED]: "Emprunté",
      [LOAN_STATUS.UNAVAILABLE]: "Indisponible",
      [LOAN_STATUS.PENDING]: "En attente",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">Erreur lors du chargement du matériel</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-cjd-green mb-3">
          📦 Matériel disponible au prêt
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Découvrez le matériel que les JDs mettent à disposition
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un matériel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" className="bg-cjd-green hover:bg-success-dark">
          Rechercher
        </Button>
      </form>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : loanItems && loanItems.length > 0 ? (
        <div className="grid gap-5 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
          {loanItems.map((item) => (
            <Card key={item.id} className="bg-white border-2 border-gray-100 hover:border-cjd-green/30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
              {/* Photo */}
              {item.photoUrl ? (
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <CardContent className="pt-5 pb-5 pl-5 pr-5 sm:pt-6 sm:pb-6 sm:pl-6 sm:pr-6">
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Prêté par: <strong>{item.lenderName}</strong></span>
                  </div>

                  {item.description && (
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchQuery ? "Aucun matériel trouvé" : "Aucun matériel disponible"}
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? "Essayez avec d'autres mots-clés" 
              : "Soyez le premier à proposer du matériel !"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <SimplePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Formulaire de proposition */}
      <div className="mt-12 pt-8 border-t-4 border-cjd-green">
        <Card className="bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="pt-6 pb-6 pl-6 pr-6 sm:pt-8 sm:pb-8 sm:pl-8 sm:pr-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-cjd-green mb-2">
                Proposer du matériel
              </h2>
              <p className="text-gray-600">
                Vous avez du matériel à prêter ? Proposez-le à la communauté !
              </p>
            </div>

            <Button
              onClick={() => setFormOpen(true)}
              className="w-full bg-cjd-green hover:bg-success-dark text-white"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Proposer du matériel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de proposition */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposer du matériel au prêt</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous. Votre proposition sera validée par un administrateur.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du matériel *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Projecteur Epson..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le matériel, son état, ses caractéristiques..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lenderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du JD qui prête *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proposedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Votre nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposedByEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Votre email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    form.reset();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-cjd-green hover:bg-success-dark"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Proposer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

