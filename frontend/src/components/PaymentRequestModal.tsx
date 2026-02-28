import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, Smartphone, X, CheckCircle } from 'lucide-react';

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: bigint | null;
  amount?: number;
}

const PaymentRequestModal: React.FC<PaymentRequestModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  amount = 299,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [paid, setPaid] = useState(false);

  const handleClose = () => {
    setPaid(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md bg-modal-bg border-border shadow-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Request
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your technician has requested payment for this support session.
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Payment Confirmed!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Thank you. Your technician has been notified.
              </p>
            </div>
            <Button className="btn-primary w-full mt-2" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Amount */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-primary">₹{amount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ticket #{ticketId?.toString() ?? '—'}
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  paymentMethod === 'upi'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                UPI / QR
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Card
              </button>
            </div>

            {/* UPI Payment */}
            {paymentMethod === 'upi' && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                    <img
                      src="/assets/Screenshot_2025-12-28-11-07-00-174_com.phonepe.app.jpg"
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Scan QR to Pay</p>
                  <p className="text-xs text-muted-foreground">
                    Use PhonePe, Google Pay, Paytm or any UPI app
                  </p>
                  <div className="bg-muted rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs text-muted-foreground">UPI ID</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      praveenjaexperts@upi
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Card payments are processed via Stripe.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact your technician for a payment link.
                  </p>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-success shrink-0" />
              <span>Secure payment. Your financial data is never stored.</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button className="flex-1 btn-primary" onClick={() => setPaid(true)}>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                I've Paid
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRequestModal;
