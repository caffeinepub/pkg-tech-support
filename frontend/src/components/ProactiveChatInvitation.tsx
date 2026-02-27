import React from 'react';
import { MessageCircle, X, Zap } from 'lucide-react';

interface ProactiveChatInvitationProps {
  onAccept: () => void;
  onDismiss: () => void;
}

export default function ProactiveChatInvitation({ onAccept, onDismiss }: ProactiveChatInvitationProps) {
  return (
    <div className="animate-scale-in rounded-2xl shadow-modal border border-primary/30 overflow-hidden"
      style={{ background: 'var(--modal-bg)' }}>
      {/* Header strip */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-sm font-semibold">Expert Online</span>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              Chat with a Support Expert
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Get instant help with your technical issues
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="btn-primary flex-1 text-xs py-2 rounded-lg"
          >
            <Zap className="w-3.5 h-3.5" />
            Start Chat
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 text-xs py-2 rounded-lg border font-medium transition-colors hover:bg-muted"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
