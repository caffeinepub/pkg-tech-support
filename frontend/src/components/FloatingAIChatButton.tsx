import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import AIAssistantChat from './AIAssistantChat';

export default function FloatingAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* AI Chat Panel */}
      {isOpen && (
        <div
          className="w-80 rounded-2xl shadow-modal border border-secondary/30 overflow-hidden animate-scale-in"
          style={{ background: 'var(--modal-bg)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-semibold">AI Assistant</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20 font-medium">Beta</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
              aria-label="Close AI chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <AIAssistantChat />
          </div>
        </div>
      )}

      {/* Floating AI button */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ background: 'var(--secondary)', opacity: 0.3 }}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
          aria-label="AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
