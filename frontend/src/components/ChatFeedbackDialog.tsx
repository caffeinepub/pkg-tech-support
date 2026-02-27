import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Star, Loader2, ThumbsUp } from 'lucide-react';

interface ChatFeedbackDialogProps {
  isOpen: boolean;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onClose: () => void;
}

export default function ChatFeedbackDialog({ isOpen, onSubmit, onClose }: ChatFeedbackDialogProps) {
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getRatingLabel = (val: number) => {
    if (val >= 9) return { label: 'Excellent!', color: 'var(--success)' };
    if (val >= 7) return { label: 'Good', color: 'var(--primary)' };
    if (val >= 5) return { label: 'Average', color: 'var(--warning)' };
    return { label: 'Poor', color: 'var(--destructive)' };
  };

  const { label: ratingLabel, color: ratingColor } = getRatingLabel(rating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(8);
        setComment('');
      }, 1500);
    } catch {
      // error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md rounded-2xl border-2 shadow-modal"
        style={{
          background: 'var(--modal-bg)',
          borderColor: 'var(--accent)',
        }}
      >
        {submitted ? (
          <div className="py-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--success)', color: 'var(--success-foreground)' }}
            >
              <ThumbsUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Thank You!
            </h3>
            <p style={{ color: 'var(--muted-foreground)' }}>Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-display font-bold" style={{ color: 'var(--foreground)' }}>
                    Rate Your Experience
                  </DialogTitle>
                  <DialogDescription style={{ color: 'var(--muted-foreground)' }}>
                    How was your support session?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Rating
                  </span>
                  <span className="text-2xl font-bold font-display" style={{ color: ratingColor }}>
                    {rating}/10 — {ratingLabel}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[rating]}
                  onValueChange={(val) => setRating(val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Comments <span style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 resize-none outline-none transition-colors focus:border-primary"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl border-2 font-medium"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</>
                  ) : (
                    <><Star className="w-4 h-4 mr-2" />Submit Feedback</>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
