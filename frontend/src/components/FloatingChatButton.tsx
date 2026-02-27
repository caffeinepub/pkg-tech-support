import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import ProactiveChatInvitation from './ProactiveChatInvitation';

export default function FloatingChatButton() {
  const navigate = useNavigate();
  const [showInvitation, setShowInvitation] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      setShowInvitation(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleAccept = () => {
    setShowInvitation(false);
    navigate({ to: '/' });
  };

  const handleDismiss = () => {
    setShowInvitation(false);
    setDismissed(true);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setShowInvitation(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Proactive invitation */}
      {showInvitation && !isOpen && (
        <div className="w-72">
          <ProactiveChatInvitation onAccept={handleAccept} onDismiss={handleDismiss} />
        </div>
      )}

      {/* Main floating button */}
      <div className="relative">
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ background: 'var(--primary)', opacity: 0.3 }}
        />
        <button
          onClick={handleButtonClick}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-primary transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          aria-label="Chat support"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
