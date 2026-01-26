'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, queryKeys } from '@/lib/api/client';

interface Patron {
  id: string;
  name: string;
  type?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface EditPatronModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patron: Patron | null;
}

const STATUS_OPTIONS = ['active', 'inactive', 'pending'];

export default function EditPatronModal({ open, onOpenChange, patron }: EditPatronModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mettre a jour les etats quand le patron change ou le modal s'ouvre
  useEffect(() => {
    if (open && patron) {
      setName(patron.name || '');
      setType(patron.type || '');
      setAmount(patron.amount ? patron.amount.toString() : '');
      setStartDate(patron.startDate ? patron.startDate.split('T')[0] : '');
      setEndDate(patron.endDate ? patron.endDate.split('T')[0] : '');
      setStatus(patron.status || 'active');
    } else if (!open) {
      // Reinitialiser les champs quand le modal se ferme
      setName('');
      setType('');
      setAmount('');
      setStartDate('');
      setEndDate('');
      setStatus('active');
    }
  }, [open, patron]);

  const updatePatronMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type?: string;
      amount?: number;
      startDate?: string;
      endDate?: string;
      status: string;
    }) => {
      if (!patron) throw new Error('Aucun sponsor selectione');
      return api.put(`/api/patrons/${patron.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patrons.all });
      toast({
        title: 'Sponsor modifie',
        description: 'Le sponsor a ete mis a jour avec succes',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Erreur de validation',
        description: 'Le nom du sponsor est requis',
        variant: 'destructive',
      });
      return;
    }

    updatePatronMutation.mutate({
      name: name.trim(),
      type: type.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
    });
  };

  const handleCancel = () => {
    if (patron) {
      setName(patron.name || '');
      setType(patron.type || '');
      setAmount(patron.amount ? patron.amount.toString() : '');
      setStartDate(patron.startDate ? patron.startDate.split('T')[0] : '');
      setEndDate(patron.endDate ? patron.endDate.split('T')[0] : '');
      setStatus(patron.status || 'active');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            Modifier le sponsor
          </DialogTitle>
          <DialogDescription>
            Modifier les informations du sponsor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
              Nom *
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom du sponsor..."
              className="w-full"
              required
              maxLength={255}
            />
          </div>

          {/* Type Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-type" className="text-sm font-medium text-gray-700">
              Type
            </Label>
            <Input
              id="edit-type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Entreprise, Particulier, Association..."
              className="w-full"
              maxLength={100}
            />
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">
              Montant (EUR)
            </Label>
            <Input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full"
              step="0.01"
              min="0"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date" className="text-sm font-medium text-gray-700">
                Date debut
              </Label>
              <Input
                id="edit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end-date" className="text-sm font-medium text-gray-700">
                Date fin
              </Label>
              <Input
                id="edit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700">
              Statut *
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updatePatronMutation.isPending}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updatePatronMutation.isPending || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              {updatePatronMutation.isPending ? (
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
