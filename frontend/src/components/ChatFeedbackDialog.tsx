import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ChatFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function ChatFeedbackDialog({ open, onClose, onSubmit }: ChatFeedbackDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      toast.success('Thank you for your feedback!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) => {
    if (value <= 2) return 'Poor';
    if (value <= 4) return 'Fair';
    if (value <= 6) return 'Good';
    if (value <= 8) return 'Very Good';
    return 'Excellent';
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-sky-50 dark:bg-sky-950">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Rate Your Support Experience</DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            Help us improve by sharing your feedback
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-gray-900 dark:text-gray-100">How would you rate your experience?</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[rating]}
                  onValueChange={(value) => setRating(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 min-w-[80px]">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{rating}/10</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {getRatingLabel(rating)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-comment" className="text-gray-900 dark:text-gray-100">Additional Comments (Optional)</Label>
              <Textarea
                id="feedback-comment"
                placeholder="Tell us more about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Skip
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
