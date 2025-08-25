import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Idea } from "@shared/schema";

interface EditIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: Idea;
}

export default function EditIdeaModal({ open, onOpenChange, idea }: EditIdeaModalProps) {
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateIdeaMutation = useMutation({
    mutationFn: async (data: { title: string; description: string | null }) => {
      const response = await fetch(`/api/admin/ideas/${idea.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "✅ Idée modifiée",
        description: "L'idée a été mise à jour avec succès",
        variant: "default",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "❌ Erreur de validation",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }

    updateIdeaMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
    });
  };

  const handleCancel = () => {
    setTitle(idea.title);
    setDescription(idea.description || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-cjd-green" />
            Modifier l'idée
          </DialogTitle>
          <DialogDescription>
            Modifier le titre et la description de l'idée proposée par {idea.proposedBy}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
              Titre *
            </Label>
            <Input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de l'idée..."
              className="w-full"
              required
              maxLength={255}
              data-testid="input-edit-title"
            />
            <p className="text-xs text-gray-500">
              {title.length}/255 caractères
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre idée en détail..."
              className="w-full min-h-32 resize-y"
              maxLength={1000}
              data-testid="textarea-edit-description"
            />
            <p className="text-xs text-gray-500">
              {description.length}/1000 caractères
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateIdeaMutation.isPending}
              className="px-6"
              data-testid="button-cancel-edit"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateIdeaMutation.isPending || !title.trim()}
              className="bg-cjd-green hover:bg-cjd-green-dark px-6"
              data-testid="button-save-edit"
            >
              {updateIdeaMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}