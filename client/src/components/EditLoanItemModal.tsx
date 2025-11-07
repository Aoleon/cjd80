import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateLoanItemSchema, type LoanItem } from "@shared/schema";
import { z } from "zod";

interface EditLoanItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LoanItem | null;
}

const editFormSchema = updateLoanItemSchema.extend({
  photoFile: z.instanceof(File).optional().or(z.literal(undefined)),
});

type EditLoanItemForm = z.infer<typeof editFormSchema> & {
  photoFile?: File;
};

export default function EditLoanItemModal({ 
  open, 
  onOpenChange, 
  item 
}: EditLoanItemModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<EditLoanItemForm>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      description: "",
      lenderName: "",
      photoUrl: undefined,
    }
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description || "",
        lenderName: item.lenderName,
        photoUrl: item.photoUrl || undefined,
      });
      setPhotoPreview(item.photoUrl || null);
    }
  }, [item, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditLoanItemForm) => {
      // D'abord mettre à jour les champs texte
      const updateData: any = {
        title: data.title,
        description: data.description || null,
        lenderName: data.lenderName,
      };

      await apiRequest("PUT", `/api/admin/loan-items/${item!.id}`, updateData);

      // Ensuite uploader la photo si fournie
      if (data.photoFile) {
        const formData = new FormData();
        formData.append("photo", data.photoFile);
        
        const res = await fetch(`/api/admin/loan-items/${item!.id}/photo`, {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erreur lors de l'upload de la photo");
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
      toast({
        title: "Matériel mis à jour",
        description: "Les informations ont été modifiées avec succès.",
      });
      onOpenChange(false);
      form.reset();
      setPhotoPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("photoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: EditLoanItemForm) => {
    updateMutation.mutate(data);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Modifier le matériel
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du matériel
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du matériel" {...field} />
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
                      placeholder="Description du matériel"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
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
                    <Input placeholder="Nom du JD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {photoPreview && (
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handlePhotoChange(e);
                          onChange(e.target.files?.[0]);
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  setPhotoPreview(null);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-cjd-green hover:bg-success-dark"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

