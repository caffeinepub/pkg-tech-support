import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Ticket, AlertCircle, CheckCircle } from 'lucide-react';
import { useGetAllAvailableTechnicians } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportTicket } from '../backend';

interface TicketCreationFormProps {
  onSuccess?: (ticket: SupportTicket) => void;
  onCancel?: () => void;
}

export default function TicketCreationForm({ onSuccess, onCancel }: TicketCreationFormProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: technicians, isLoading: techLoading } = useGetAllAvailableTechnicians();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [error, setError] = useState('');

  const availableTechs = (technicians || []).filter((t) => t.isAvailable);

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!selectedTechnician) throw new Error('Please select a technician');
      const { Principal } = await import('@icp-sdk/core/principal');
      const techPrincipal = Principal.fromText(selectedTechnician);
      return actor.createSupportTicket(techPrincipal);
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.refetchQueries({ queryKey: ['userTickets'] });
      onSuccess?.(ticket);
    },
    onError: (err: Error) => {
      // Surface the backend error message directly
      const msg = err.message || 'Failed to create ticket. Please try again.';
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!selectedTechnician) {
      setError('Please select an available technician');
      return;
    }

    createTicketMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Free ticket notice */}
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
        style={{ background: 'oklch(0.95 0.05 160)', color: 'oklch(0.35 0.12 160)' }}
      >
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span>Creating a support ticket is <strong>free</strong>. No payment required.</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticket-title">Title</Label>
        <Input
          id="ticket-title"
          placeholder="Brief description of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticket-desc">Description</Label>
        <Textarea
          id="ticket-desc"
          placeholder="Detailed description of the problem..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assign Technician</Label>
        {techLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available technicians...
          </div>
        ) : availableTechs.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              No technicians are currently available. Please try again later.
            </p>
          </div>
        ) : (
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
            <SelectTrigger>
              <SelectValue placeholder="Select a technician" />
            </SelectTrigger>
            <SelectContent>
              {availableTechs.map((tech) => (
                <SelectItem
                  key={tech.technician.toString()}
                  value={tech.technician.toString()}
                >
                  Technician {tech.technician.toString().slice(0, 16)}…
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={createTicketMutation.isPending}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={createTicketMutation.isPending || availableTechs.length === 0}
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {createTicketMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4 mr-2" /> Create Ticket (Free)
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
