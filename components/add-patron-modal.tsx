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
import { Loader2, Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, queryKeys } from '@/lib/api/client';

interface AddPatronModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = ['active', 'inactive', 'pending'];

export default function AddPatronModal({ open, onOpenChange }: AddPatronModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setName('');
      setType('');
      setAmount('');
      setStartDate('');
      setEndDate('');
      setStatus('active');
    }
  }, [open]);

  const addPatronMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type?: string;
      amount?: number;
      startDate?: string;
      endDate?: string;
      status: string;
    }) => {
      return api.post('/api/patrons', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patrons.all });
      toast({
        title: 'Sponsor ajoute',
        description: 'Le nouveau sponsor a ete ajoute avec succes',
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

    addPatronMutation.mutate({
      name: name.trim(),
      type: type.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
    });
  };

  const handleCancel = () => {
    setName('');
    setType('');
    setAmount('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Ajouter un sponsor
          </DialogTitle>
          <DialogDescription>
            Ajouter un nouveau sponsor ou mecene a l'association
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="add-name" className="text-sm font-medium text-gray-700">
              Nom *
            </Label>
            <Input
              id="add-name"
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
            <Label htmlFor="add-type" className="text-sm font-medium text-gray-700">
              Type
            </Label>
            <Input
              id="add-type"
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
            <Label htmlFor="add-amount" className="text-sm font-medium text-gray-700">
              Montant (EUR)
            </Label>
            <Input
              id="add-amount"
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
              <Label htmlFor="add-start-date" className="text-sm font-medium text-gray-700">
                Date debut
              </Label>
              <Input
                id="add-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-end-date" className="text-sm font-medium text-gray-700">
                Date fin
              </Label>
              <Input
                id="add-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="add-status" className="text-sm font-medium text-gray-700">
              Statut *
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="add-status">
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
              disabled={addPatronMutation.isPending}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={addPatronMutation.isPending || !name.trim()}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              {addPatronMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
