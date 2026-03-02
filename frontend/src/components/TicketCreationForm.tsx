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
import { AlertCircle, Loader2, Ticket, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
import { useGetAllAvailableTechnicians } from '../hooks/useQueries';
import { useCreateSupportTicket } from '../hooks/useTickets';
import { useCreateSupportCheckoutSession } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';

interface TicketCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TicketCreationForm: React.FC<TicketCreationFormProps> = ({ onSuccess, onCancel }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'pay' | 'create'>('select');

  const { data: technicians, isLoading: loadingTechs } = useGetAllAvailableTechnicians();
  const createTicket = useCreateSupportTicket();
  const createCheckoutSession = useCreateSupportCheckoutSession();

  const availableTechs = (technicians ?? []).filter((t) => t.isAvailable);

  // Step 1: Validate technician selection and move to payment step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }

    setStep('pay');
  };

  // Step 2: Initiate $1 Stripe checkout
  const handlePayAndCreate = async () => {
    setError(null);

    try {
      // Store selected technician so we can use it after payment redirect
      sessionStorage.setItem('pendingTicketTechnician', selectedTechnician);

      const session = await createCheckoutSession.mutateAsync();
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Stripe needs to be first configured')) {
        setError('Payment system is not configured yet. Please contact support.');
      } else {
        setError(msg || 'Failed to initiate payment. Please try again.');
      }
    }
  };

  // Step 3: Create ticket after payment (called when payment is already completed)
  const handleCreateTicket = async () => {
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
        setError('Payment not yet confirmed. Please complete the $1 payment first.');
        setStep('pay');
      } else if (msg.includes('Rate limit')) {
        setError('Please wait a few minutes before creating another ticket.');
      } else if (msg.includes('not currently available')) {
        setError('The selected technician is not currently available. Please choose another.');
        setStep('select');
      } else {
        setError(msg || 'Failed to create ticket. Please try again.');
      }
    }
  };

  // Check if returning from payment (technician stored in sessionStorage)
  React.useEffect(() => {
    const pendingTech = sessionStorage.getItem('pendingTicketTechnician');
    if (pendingTech) {
      setSelectedTechnician(pendingTech);
      setStep('create');
      sessionStorage.removeItem('pendingTicketTechnician');
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* $1 Minimum Charge Notice */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary">Minimum $1 Service Fee</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            A one-time $1 USD charge is required to open a support ticket. This confirms your
            request and connects you with a technician.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`flex items-center gap-1 ${step === 'select' ? 'text-primary font-medium' : 'text-success'}`}>
          {step !== 'select' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-primary font-bold text-[10px]">1</span>}
          Select Technician
        </span>
        <span className="text-border">→</span>
        <span className={`flex items-center gap-1 ${step === 'pay' ? 'text-primary font-medium' : step === 'create' ? 'text-success' : 'text-muted-foreground'}`}>
          {step === 'create' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className={`w-4 h-4 rounded-full border flex items-center justify-center font-bold text-[10px] ${step === 'pay' ? 'border-primary text-primary' : 'border-muted-foreground'}`}>2</span>}
          Pay $1
        </span>
        <span className="text-border">→</span>
        <span className={`flex items-center gap-1 ${step === 'create' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <span className={`w-4 h-4 rounded-full border flex items-center justify-center font-bold text-[10px] ${step === 'create' ? 'border-primary text-primary' : 'border-muted-foreground'}`}>3</span>
          Create Ticket
        </span>
      </div>

      {/* Step 1: Technician Selection */}
      {step === 'select' && (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
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

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={availableTechs.length === 0 || loadingTechs}
            >
              Continue to Payment
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Payment */}
      {step === 'pay' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Payment Summary</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Support ticket access fee</span>
              <span className="font-bold text-foreground">$1.00 USD</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border pt-2">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-primary text-base">$1.00 USD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Secure payment via Stripe. You will be redirected to complete payment and then
              returned to create your ticket.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setStep('select'); setError(null); }}
              disabled={createCheckoutSession.isPending}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 btn-primary gap-2"
              onClick={handlePayAndCreate}
              disabled={createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Pay $1 &amp; Continue
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Create Ticket (after payment) */}
      {step === 'create' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success">Payment Confirmed</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your $1 payment was successful. Click below to create your support ticket.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Technician: </span>
              {selectedTechnician.slice(0, 20)}…
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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
              type="button"
              className="flex-1 btn-primary gap-2"
              onClick={handleCreateTicket}
              disabled={createTicket.isPending}
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating…
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCreationForm;
