import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Ticket } from 'lucide-react';
import { useGetAllAvailableTechnicians } from '../hooks/useQueries';
import { useCreateSupportTicket } from '../hooks/useTickets';
import { Principal } from '@icp-sdk/core/principal';

interface TicketCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TicketCreationForm: React.FC<TicketCreationFormProps> = ({ onSuccess, onCancel }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: technicians, isLoading: loadingTechs } = useGetAllAvailableTechnicians();
  const createTicket = useCreateSupportTicket();

  const availableTechs = (technicians ?? []).filter((t) => t.isAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }

    try {
      const techPrincipal = Principal.fromText(selectedTechnician);
      await createTicket.mutateAsync(techPrincipal);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Payment must be completed')) {
        setError(
          'Please complete payment before creating a support ticket. Use the Payment tab to pay first.'
        );
      } else if (msg.includes('Rate limit')) {
        setError('Please wait a few minutes before creating another ticket.');
      } else if (msg.includes('not currently available')) {
        setError('The selected technician is not currently available. Please choose another.');
      } else {
        setError(msg || 'Failed to create ticket. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Notice */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
        <Ticket className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-success">Support Ticket</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect with a technician for expert help. Payment is handled separately via the Payment
            tab.
          </p>
        </div>
      </div>

      {/* Technician Selection */}
      <div className="space-y-2">
        <Label htmlFor="technician" className="text-foreground font-medium">
          Select Technician
        </Label>
        {loadingTechs ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available technicians...
          </div>
        ) : availableTechs.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-sm text-warning">
              No technicians are currently available. Please try again later.
            </p>
          </div>
        ) : (
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Choose an available technician" />
            </SelectTrigger>
            <SelectContent>
              {availableTechs.map((tech) => (
                <SelectItem
                  key={tech.technician.toString()}
                  value={tech.technician.toString()}
                >
                  Technician {tech.technician.toString().slice(0, 12)}…
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={createTicket.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 btn-primary"
          disabled={createTicket.isPending || availableTechs.length === 0}
        >
          {createTicket.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating…
            </>
          ) : (
            'Create Ticket'
          )}
        </Button>
      </div>
    </form>
  );
};

export default TicketCreationForm;
