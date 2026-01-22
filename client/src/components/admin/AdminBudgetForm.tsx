"use client";

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
import { Loader2 } from "lucide-react";
import type { FinancialBudget, FinancialCategory } from "@shared/schema";

const budgetFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  period: z.enum(["month", "quarter", "year"], {
    errorMap: () => ({ message: "La période doit être month, quarter ou year" })
  }),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  amountInCents: z.number().int().min(0, "Le montant ne peut pas être négatif"),
  description: z.string().optional(),
  createdBy: z.string().email(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface AdminBudgetFormProps {
  budget?: FinancialBudget | null;
  categories: FinancialCategory[];
  onSubmit: (data: BudgetFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function AdminBudgetForm({
  budget,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: AdminBudgetFormProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      category: "",
      period: "month",
      year: new Date().getFullYear(),
      month: undefined,
      quarter: undefined,
      amountInCents: 0,
      description: "",
      createdBy: "",
    },
  });

  useEffect(() => {
    if (budget && mode === "edit") {
      form.reset({
        name: budget.name,
        category: budget.category,
        period: budget.period as "month" | "quarter" | "year",
        year: budget.year,
        month: budget.month || undefined,
        quarter: budget.quarter || undefined,
        amountInCents: budget.amountInCents,
        description: budget.description || "",
        createdBy: budget.createdBy,
      });
    } else {
      form.reset({
        name: "",
        category: "",
        period: "month",
        year: new Date().getFullYear(),
        month: undefined,
        quarter: undefined,
        amountInCents: 0,
        description: "",
        createdBy: "",
      });
    }
  }, [budget, mode, form]);

  const period = form.watch("period");

  const handleSubmit = (data: BudgetFormValues) => {
    // Convertir le montant en centimes si nécessaire
    const amountInCents = typeof data.amountInCents === 'number' 
      ? data.amountInCents 
      : Math.round(parseFloat(String(data.amountInCents)) * 100);
    
    onSubmit({
      ...data,
      amountInCents,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du budget *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Budget Marketing Q1 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {categories.map((cat) => (
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Période *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="month">Mensuel</SelectItem>
                    <SelectItem value="quarter">Trimestriel</SelectItem>
                    <SelectItem value="year">Annuel</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="2000"
                    max="2100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {period === "month" && (
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mois *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un mois" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2000, month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {period === "quarter" && (
          <FormField
            control={form.control}
            name="quarter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trimestre *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un trimestre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">T1 (Janvier - Mars)</SelectItem>
                    <SelectItem value="2">T2 (Avril - Juin)</SelectItem>
                    <SelectItem value="3">T3 (Juillet - Septembre)</SelectItem>
                    <SelectItem value="4">T4 (Octobre - Décembre)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description optionnelle du budget"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Créer" : "Modifier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}




