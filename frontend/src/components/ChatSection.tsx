import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetChatMessages, useSendMessageForTicket, useMarkTicketMessagesAsRead } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useSetToggleState, useGetToggleState } from '../hooks/usePaymentToggle';
import { useGetUserTickets } from '../hooks/useTickets';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PaymentRequestModal from './PaymentRequestModal';
import type { SupportTicket } from '../backend';
import { TicketStatusOld } from '../backend';

interface ChatSectionProps {
  activeTicket?: SupportTicket | null;
}

const ChatSection: React.FC<ChatSectionProps> = ({ activeTicket: propTicket }) => {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userTickets } = useGetUserTickets();

  const activeTicket = propTicket ?? (userTickets && userTickets.length > 0 ? userTickets[0] : null);
  const ticketId = activeTicket ? activeTicket.ticketId : null;

  const [message, setMessage] = useState('');
  const [paymentToggle, setPaymentToggle] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTechnician = userProfile?.isTechnician === true;

  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(ticketId ?? null);
  const sendMessage = useSendMessageForTicket();
  const markRead = useMarkTicketMessagesAsRead();
  const setToggleState = useSetToggleState();
  const { data: toggleState } = useGetToggleState(ticketId ?? null);

  useEffect(() => {
    if (toggleState !== undefined && toggleState !== null) {
      setPaymentToggle(toggleState.toggleEnabled);
    }
  }, [toggleState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (ticketId !== null && messages && messages.length > 0) {
      markRead.mutate(ticketId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, messages?.length]);

  const handleSend = async () => {
    if (!message.trim() || !ticketId) return;
    try {
      await sendMessage.mutateAsync({ ticketId, content: message.trim() });
      setMessage('');
    } catch {
      // error surfaced via sendMessage.isError
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaymentToggle = async (checked: boolean) => {
    if (!ticketId) return;
    setPaymentToggle(checked);
    try {
      await setToggleState.mutateAsync({
        ticketId,
        toggleEnabled: checked,
        paymentRequested: checked,
        stripeSessionId: null,
      });
    } catch {
      setPaymentToggle(!checked);
      return;
    }
    if (checked) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    if (paymentToggle && ticketId) {
      setPaymentToggle(false);
      setToggleState.mutate({
        ticketId,
        toggleEnabled: false,
        paymentRequested: false,
        stripeSessionId: null,
      });
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const myPrincipal = identity?.getPrincipal().toString();

  if (!activeTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No Active Chat</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {isTechnician
            ? 'Select a ticket from the Tickets tab to start chatting with a customer.'
            : 'Create a support ticket to start chatting with a technician.'}
        </p>
      </div>
    );
  }

  const isResolved = activeTicket.status === TicketStatusOld.resolved;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              Ticket #{activeTicket.ticketId.toString()}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {String(activeTicket.status).replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </div>

        {/* Payment Toggle — only for technicians */}
        {isTechnician && !isResolved && (
          <div className="flex items-center gap-2">
            {toggleState?.toggleEnabled && (
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                Payment Requested
              </span>
            )}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <Label htmlFor="payment-toggle" className="text-xs text-muted-foreground cursor-pointer">
                Request Payment
              </Label>
              <Switch
                id="payment-toggle"
                checked={paymentToggle}
                onCheckedChange={handlePaymentToggle}
                disabled={setToggleState.isPending}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...messages]
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((msg) => {
                const isMe = msg.sender.toString() === myPrincipal;
                return (
                  <div
                    key={msg.messageId.toString()}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                        {isMe && (
                          <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      {isResolved ? (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center">
            <CheckCircle className="h-4 w-4 text-success" />
            This ticket has been resolved
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border bg-card/50">
          <div className="flex gap-2 items-end">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-background border-border text-sm"
              rows={1}
              disabled={sendMessage.isPending}
            />
            <Button
              size="icon"
              className="btn-primary h-11 w-11 shrink-0"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {sendMessage.isError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to send message. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Payment Request Modal */}
      <PaymentRequestModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        ticketId={ticketId}
        amount={299}
      />
    </div>
  );
};

export default ChatSection;
