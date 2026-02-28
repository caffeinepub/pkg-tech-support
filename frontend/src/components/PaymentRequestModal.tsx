import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, X, Loader2, AlertCircle } from 'lucide-react';
import { useGetToggleState } from '../hooks/usePaymentToggle';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PaymentRequestModalProps {
  ticketId: bigint | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Generates a unique transaction ID for PayU.
 */
function generateTxnId(): string {
  return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PaymentRequestModal({
  ticketId,
  isOpen,
  onClose,
}: PaymentRequestModalProps) {
  const { data: toggleState } = useGetToggleState(ticketId);
  const { data: userProfile } = useGetCallerUserProfile();
  const { actor } = useActor();
  const formRef = useRef<HTMLFormElement>(null);

  // Amount requested by the technician (default ₹99 if not specified)
  const amount = '99.00';
  const productInfo = 'Technical Support Session';
  const firstName = userProfile?.displayName || 'Customer';
  const email = 'customer@pkgtech.support';
  const phone = '9999999999';

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const successUrl = `${baseUrl}/payment-success`;
  const failureUrl = `${baseUrl}/payment-failure`;

  // Mutation to generate PayU hash from backend
  const generateHashMutation = useMutation({
    mutationFn: async (): Promise<{
      hash: string;
      key: string;
      txnid: string;
    }> => {
      if (!actor) throw new Error('Actor not available');
      if (!ticketId) throw new Error('No ticket selected');

      const txnid = generateTxnId();

      // Call backend to generate PayU hash
      // The backend generates: sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
      const result = await (actor as any).generatePayUHash({
        ticketId,
        txnid,
        amount,
        productInfo,
        firstName,
        email,
      });

      return { hash: result.hash, key: result.key, txnid };
    },
    onError: (err: Error) => {
      toast.error('Failed to initiate payment: ' + err.message);
    },
  });

  const handlePayNow = async () => {
    try {
      const result = await generateHashMutation.mutateAsync();

      // Build and submit the PayU form
      if (formRef.current) {
        const form = formRef.current;
        (form.querySelector('[name="key"]') as HTMLInputElement).value = result.key;
        (form.querySelector('[name="txnid"]') as HTMLInputElement).value = result.txnid;
        (form.querySelector('[name="hash"]') as HTMLInputElement).value = result.hash;
        form.submit();
      }
    } catch {
      // Error already handled in onError
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md rounded-2xl border-2 shadow-modal"
        style={{ background: 'var(--modal-bg)', borderColor: 'var(--primary)' }}
      >
        <DialogHeader>
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-2"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <CreditCard className="w-6 h-6 flex-shrink-0" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Payment Requested
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm">
                Your technician has requested payment for this session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-1">
          {/* Payment Details */}
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Service
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {productInfo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Ticket
              </span>
              <Badge variant="outline">#{ticketId?.toString()}</Badge>
            </div>
            <div
              className="flex items-center justify-between pt-2 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                Total Amount
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                ₹{amount}
              </span>
            </div>
          </div>

          {/* Security note */}
          <div
            className="flex items-start gap-2 rounded-lg p-3"
            style={{ background: 'var(--muted)' }}
          >
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Payments are processed securely via PayU. Your card details are never stored on our
              servers.
            </p>
          </div>

          {/* PayU hidden form — submitted programmatically */}
          <form
            ref={formRef}
            action="https://secure.payu.in/_payment"
            method="POST"
            style={{ display: 'none' }}
          >
            <input type="hidden" name="key" value="" />
            <input type="hidden" name="txnid" value="" />
            <input type="hidden" name="amount" value={amount} />
            <input type="hidden" name="productinfo" value={productInfo} />
            <input type="hidden" name="firstname" value={firstName} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="surl" value={successUrl} />
            <input type="hidden" name="furl" value={failureUrl} />
            <input type="hidden" name="hash" value="" />
          </form>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              disabled={generateHashMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
            <Button
              className="flex-1 rounded-xl font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              onClick={handlePayNow}
              disabled={generateHashMutation.isPending}
            >
              {generateHashMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ₹{amount}
                </>
              )}
            </Button>
          </div>

          {generateHashMutation.isError && (
            <div
              className="flex items-center gap-2 rounded-lg p-3"
              style={{ background: 'oklch(0.95 0.02 25)', color: 'var(--destructive)' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs">
                Payment initiation failed. Please try again or contact support.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
