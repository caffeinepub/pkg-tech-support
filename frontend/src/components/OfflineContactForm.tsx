import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OfflineContactFormProps {
  onClose?: () => void;
}

export default function OfflineContactForm({ onClose }: OfflineContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border-2 p-8 text-center shadow-modal"
        style={{ background: 'var(--modal-bg)', borderColor: 'var(--success)' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--success)', color: 'var(--success-foreground)' }}
        >
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Message Sent!
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
          We'll get back to you within 24 hours at <strong>{email}</strong>
        </p>
        {onClose && (
          <Button onClick={onClose} className="rounded-xl"
            style={{ background: 'var(--success)', color: 'var(--success-foreground)' }}>
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 shadow-modal overflow-hidden"
      style={{ background: 'var(--modal-bg)', borderColor: 'var(--warning)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ background: 'var(--warning)', color: 'var(--warning-foreground)' }}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Leave a Message</h3>
          <p className="text-sm opacity-90">All experts are currently offline</p>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Info badges */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}>
            <Clock className="w-3.5 h-3.5" />
            Response within 24 hours
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}>
            <Phone className="w-3.5 h-3.5" />
            praveenjaexperts@gmail.com
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="rounded-xl border-2"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="rounded-xl border-2"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Message</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your technical issue in detail..."
              rows={4}
              required
              className="w-full px-3 py-2.5 text-sm rounded-xl border-2 resize-none outline-none transition-colors focus:border-primary"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
            className="w-full rounded-xl py-3 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Send Message</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
