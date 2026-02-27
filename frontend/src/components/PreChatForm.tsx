import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Loader2, User, Mail, HelpCircle } from 'lucide-react';

interface PreChatFormProps {
  isOpen: boolean;
  onSubmit: (data: { name: string; email: string; topic: string }) => void;
  onClose: () => void;
}

export default function PreChatForm({ isOpen, onSubmit, onClose }: PreChatFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; topic?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; topic?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!topic.trim()) newErrors.topic = 'Please describe your issue';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), topic: topic.trim() });
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
          borderColor: 'var(--primary)',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display font-bold" style={{ color: 'var(--foreground)' }}>
                Start a Support Chat
              </DialogTitle>
              <DialogDescription className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Tell us a bit about yourself and your issue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="pl-10 rounded-xl border-2"
                style={{ background: 'var(--card)', borderColor: errors.name ? 'var(--destructive)' : 'var(--border)' }}
              />
            </div>
            {errors.name && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="pl-10 rounded-xl border-2"
                style={{ background: 'var(--card)', borderColor: errors.email ? 'var(--destructive)' : 'var(--border)' }}
              />
            </div>
            {errors.email && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              What do you need help with?
            </Label>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Briefly describe your technical issue..."
                rows={3}
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border-2 resize-none outline-none transition-colors focus:border-primary"
                style={{
                  background: 'var(--card)',
                  borderColor: errors.topic ? 'var(--destructive)' : 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            {errors.topic && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.topic}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 font-medium"
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Starting...</>
              ) : (
                <><MessageCircle className="w-4 h-4 mr-2" />Start Chat</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
