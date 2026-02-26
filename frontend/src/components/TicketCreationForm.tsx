import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Ticket } from 'lucide-react';
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
  const { data: technicians } = useGetAllAvailableTechnicians();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [error, setError] = useState('');

  const availableTechs = (technicians || []).filter(t => t.isAvailable);

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
      onSuccess?.(ticket);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!selectedTechnician) { setError('Please select an available technician'); return; }
    createTicketMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ticket-title">Title</Label>
        <Input
          id="ticket-title"
          placeholder="Brief description of the issue"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticket-desc">Description</Label>
        <Textarea
          id="ticket-desc"
          placeholder="Detailed description of the problem..."
          value={description}
          onChange={e => setDescription(e.target.value)}
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
        {availableTechs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No technicians currently available</p>
        ) : (
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
            <SelectTrigger>
              <SelectValue placeholder="Select a technician" />
            </SelectTrigger>
            <SelectContent>
              {availableTechs.map(tech => (
                <SelectItem key={tech.technician.toString()} value={tech.technician.toString()}>
                  {tech.technician.toString().slice(0, 20)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createTicketMutation.isPending || availableTechs.length === 0}>
          {createTicketMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
          ) : (
            <><Ticket className="w-4 h-4 mr-2" /> Create Ticket</>
          )}
        </Button>
      </div>
    </form>
  );
}
