import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { SupportTicket } from "../backend";
import { TicketStatusOld } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetToggleState,
  useSetToggleState,
} from "../hooks/usePaymentToggle";
import {
  useGetCallerUserProfile,
  useGetChatMessages,
  useMarkTicketMessagesAsRead,
  useSendMessageForTicket,
} from "../hooks/useQueries";
import { useGetUserTickets } from "../hooks/useTickets";
import PaymentRequestModal from "./PaymentRequestModal";

interface ChatSectionProps {
  activeTicket?: SupportTicket | null;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  activeTicket: propTicket,
}) => {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userTickets } = useGetUserTickets();

  const isTechnician = userProfile?.isTechnician === true;

  // For customers: auto-select the most recent open/inProgress ticket if no prop
  const autoTicket = React.useMemo(() => {
    if (propTicket !== undefined) return propTicket;
    if (!userTickets || userTickets.length === 0) return null;
    const active = [...userTickets]
      .filter(
        (t) =>
          t.status === TicketStatusOld.open ||
          t.status === TicketStatusOld.inProgress,
      )
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    return (
      active[0] ??
      userTickets.sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt),
      )[0] ??
      null
    );
  }, [propTicket, userTickets]);

  const activeTicket = propTicket !== undefined ? propTicket : autoTicket;
  const ticketId = activeTicket ? activeTicket.ticketId : null;

  const [message, setMessage] = useState("");
  const [paymentToggle, setPaymentToggle] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(
    ticketId ?? null,
  );
  const sendMessage = useSendMessageForTicket();
  const markRead = useMarkTicketMessagesAsRead();
  const setToggleState = useSetToggleState();
  const { data: toggleState } = useGetToggleState(ticketId ?? null);

  // Sync payment toggle state from backend
  useEffect(() => {
    if (toggleState != null) {
      setPaymentToggle(toggleState.toggleEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleState]);

  // Show payment modal for customers when expert enables payment toggle
  // biome-ignore lint/correctness/useExhaustiveDependencies: showPaymentModal intentionally excluded to avoid loop
  useEffect(() => {
    if (!isTechnician && toggleState?.toggleEnabled && !showPaymentModal) {
      setShowPaymentModal(true);
    }
    if (!toggleState?.toggleEnabled) {
      setShowPaymentModal(false);
    }
  }, [isTechnician, toggleState?.toggleEnabled]);

  // Scroll to bottom ONLY when new messages arrive (not on initial mount)
  useEffect(() => {
    const currentLength = messages?.length ?? 0;
    if (currentLength > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = currentLength;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  // Mark messages as read when active ticket and messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: markRead.mutate excluded intentionally
  useEffect(() => {
    if (ticketId !== null && messages && messages.length > 0) {
      markRead.mutate(ticketId);
    }
  }, [ticketId, messages?.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const clearImage = useCallback(() => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imagePreview]);

  const handleSend = async () => {
    if ((!message.trim() && !imageFile) || !ticketId) return;
    try {
      // Send text message (image support via ExternalBlob is separate)
      if (message.trim()) {
        await sendMessage.mutateAsync({ ticketId, content: message.trim() });
        setMessage("");
      }
      clearImage();
    } catch {
      // error surfaced via sendMessage.isError
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      if (checked) {
        setShowPaymentModal(true);
      }
    } catch {
      setPaymentToggle(!checked);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const myPrincipal = identity?.getPrincipal().toString();

  // No active ticket — show empty state
  if (!activeTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "var(--muted)" }}
        >
          <MessageSquare
            className="h-8 w-8"
            style={{ color: "var(--muted-foreground)" }}
          />
        </div>
        <h3
          className="font-semibold text-lg mb-2"
          style={{ color: "var(--foreground)" }}
        >
          No Active Chat
        </h3>
        <p
          className="text-sm max-w-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {isTechnician
            ? "Select a ticket from the Tickets tab to start chatting with a customer."
            : "Create a support ticket to start chatting with a technician."}
        </p>
      </div>
    );
  }

  const isResolved = activeTicket.status === TicketStatusOld.resolved;

  const statusLabel =
    activeTicket.status === TicketStatusOld.open
      ? "Open"
      : activeTicket.status === TicketStatusOld.inProgress
        ? "In Progress"
        : "Resolved";

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: "var(--border)",
          background: isTechnician
            ? "oklch(0.52 0.18 145 / 0.08)"
            : "oklch(0.52 0.18 195 / 0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: isTechnician
                ? "oklch(0.52 0.18 145 / 0.15)"
                : "oklch(0.52 0.18 195 / 0.15)",
            }}
          >
            <MessageSquare
              className="h-4 w-4"
              style={{
                color: isTechnician ? "var(--success)" : "var(--primary)",
              }}
            />
          </div>
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--foreground)" }}
            >
              Ticket #{activeTicket.ticketId.toString()}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Payment Toggle — only for technicians on non-resolved tickets */}
        {isTechnician && !isResolved && (
          <div className="flex items-center gap-2">
            {toggleState?.toggleEnabled && (
              <span
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--success)" }}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Payment Requested
              </span>
            )}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: "var(--muted)" }}
            >
              <CreditCard
                className="h-3.5 w-3.5"
                style={{ color: "var(--muted-foreground)" }}
              />
              <Label
                htmlFor="payment-toggle"
                className="text-xs cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                Request Payment
              </Label>
              <Switch
                id="payment-toggle"
                checked={paymentToggle}
                onCheckedChange={handlePaymentToggle}
                disabled={setToggleState.isPending}
                data-ocid="payment.toggle"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: "var(--primary)" }}
            />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="chat.empty_state"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: "var(--muted)" }}
            >
              <MessageSquare
                className="h-6 w-6"
                style={{ color: "var(--muted-foreground)" }}
              />
            </div>
            <p className="font-medium" style={{ color: "var(--foreground)" }}>
              No messages yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...messages]
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((msg) => {
                const isMe = msg.sender.toString() === myPrincipal;
                const isUnread = !msg.isRead && !isMe;
                return (
                  <div
                    key={msg.messageId.toString()}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                      style={
                        isMe
                          ? {
                              background: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }
                          : isUnread
                            ? {
                                background: "oklch(0.52 0.18 145 / 0.12)",
                                color: "oklch(0.25 0.15 145)",
                                border:
                                  "1.5px solid oklch(0.52 0.18 145 / 0.35)",
                                fontWeight: 600,
                              }
                            : {
                                background: "var(--card)",
                                color: "oklch(0.22 0.14 145)",
                                border: "1px solid var(--border)",
                              }
                      }
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.content}
                      </p>
                      {msg.attachment && (
                        <div className="mt-2">
                          <img
                            src={msg.attachment.getDirectURL()}
                            alt="Attachment"
                            className="max-w-full rounded-lg max-h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: isMe
                            ? "oklch(1 0 0 / 0.65)"
                            : "var(--muted-foreground)",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                        {isMe && (
                          <span className="ml-1">
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
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

      {/* Resolved notice */}
      {isResolved ? (
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: "var(--border)",
            background: "oklch(0.58 0.18 145 / 0.08)",
          }}
        >
          <div
            className="flex items-center gap-2 text-sm justify-center font-medium"
            style={{ color: "var(--success)" }}
          >
            <CheckCircle className="h-4 w-4" />
            This ticket has been resolved
          </div>
        </div>
      ) : (
        /* Message Input */
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          {/* Image preview */}
          {imagePreview && (
            <div className="mb-2 relative w-fit">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-24 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: "var(--destructive)",
                  color: "var(--destructive-foreground)",
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            {/* Image attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
              title="Attach image"
              data-ocid="chat.upload_button"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 min-h-[44px] max-h-32 resize-none text-sm"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
              }}
              rows={1}
              disabled={sendMessage.isPending}
              data-ocid="chat.input"
            />
            <Button
              size="icon"
              className="btn-primary h-11 w-11 shrink-0"
              onClick={handleSend}
              disabled={
                (!message.trim() && !imageFile) || sendMessage.isPending
              }
              data-ocid="chat.send_button"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {sendMessage.isError && (
            <div
              className="flex items-center gap-1.5 mt-2 text-xs"
              data-ocid="chat.error_state"
              style={{ color: "var(--destructive)" }}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to send. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Payment Request Modal (for customers when expert requests payment) */}
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
