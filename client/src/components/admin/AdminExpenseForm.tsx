import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import type { FinancialExpense, FinancialCategory, FinancialBudget } from "@shared/schema";

const expenseFormSchema = z.object({
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().min(1, "La description est requise").max(500, "La description ne peut pas dépasser 500 caractères"),
  amountInCents: z.number().int().min(0, "Le montant ne peut pas être négatif"),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD"),
  paymentMethod: z.string().optional(),
  vendor: z.string().optional(),
  budgetId: z.string().optional().nullable(),
  receiptUrl: z.string().optional(),
  createdBy: z.string().email(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface AdminExpenseFormProps {
  expense?: FinancialExpense | null;
  categories: FinancialCategory[];
  budgets?: FinancialBudget[];
  onSubmit: (data: ExpenseFormValues) => void;
  onCancel: () => void;
  onUploadReceipt?: (file: File) => Promise<string>;
  isLoading?: boolean;
  isUploading?: boolean;
  mode: "create" | "edit";
}

export default function AdminExpenseForm({
  expense,
  categories,
  budgets = [],
  onSubmit,
  onCancel,
  onUploadReceipt,
  isLoading = false,
  isUploading = false,
  mode,
}: AdminExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "",
      description: "",
      amountInCents: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      vendor: "",
      budgetId: null,
      receiptUrl: "",
      createdBy: "",
    },
  });

  useEffect(() => {
    if (expense && mode === "edit") {
      form.reset({
        category: expense.category,
        description: expense.description,
        amountInCents: expense.amountInCents,
        expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod || "",
        vendor: expense.vendor || "",
        budgetId: expense.budgetId || null,
        receiptUrl: expense.receiptUrl || "",
        createdBy: expense.createdBy,
      });
    } else {
      form.reset({
        category: "",
        description: "",
        amountInCents: 0,
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        vendor: "",
        budgetId: null,
        receiptUrl: "",
        createdBy: "",
      });
    }
  }, [expense, mode, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadReceipt) return;

    try {
      const url = await onUploadReceipt(file);
      form.setValue("receiptUrl", url);
    } catch (error) {
      console.error("Erreur lors de l'upload du justificatif:", error);
    }
  };

  const handleSubmit = (data: ExpenseFormValues) => {
    // Convertir le montant en centimes si nécessaire
    const amountInCents = typeof data.amountInCents === 'number' 
      ? data.amountInCents 
      : Math.round(parseFloat(String(data.amountInCents)) * 100);
    
    onSubmit({
      ...data,
      amountInCents,
    });
  };

  const expenseCategories = categories.filter(c => c.type === "expense");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Input placeholder="Description de la dépense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amountInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (en euros) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(Math.round(value * 100)); // Convertir en centimes
                    }}
                    value={field.value ? (field.value / 100).toFixed(2) : "0.00"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expenseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de la dépense *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moyen de paiement</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un moyen de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="transfer">Virement</SelectItem>
                    <SelectItem value="check">Chèque</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du fournisseur" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {budgets.length > 0 && (
          <FormField
            control={form.control}
            name="budgetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget associé (optionnel)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucun budget</SelectItem>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.name} ({new Date(budget.createdAt).getFullYear()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {onUploadReceipt && (
          <FormField
            control={form.control}
            name="receiptUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justificatif</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {field.value && (
                      <div className="text-sm text-gray-600">
                        Justificatif: <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir le fichier</a>
                      </div>
                    )}
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Upload en cours...
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isUploading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Créer" : "Modifier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}




