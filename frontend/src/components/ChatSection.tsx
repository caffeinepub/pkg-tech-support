import { useState, useEffect, useRef } from 'react';
import {
  useGetUserTickets,
  useGetChatMessages,
  useSendMessageForTicket,
  useSetTechnicianAvailability,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, User, Clock, MessageCircle, RefreshCw } from 'lucide-react';
import { SupportTicket, TicketStatusOld } from '../backend';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ChatSection() {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();
  const { data: userProfile } = useGetCallerUserProfile();

  const { data: tickets = [], isLoading: ticketsLoading } = useGetUserTickets();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTicketId = selectedTicket?.ticketId ?? null;

  // Fetch messages scoped to the selected ticket using getChatMessages(ticketId)
  const {
    data: ticketMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetChatMessages(selectedTicketId);

  const sendMessageForTicket = useSendMessageForTicket();
  const setAvailability = useSetTechnicianAvailability();

  // Auto-select first ticket when tickets load
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  // Keep selectedTicket in sync with latest data from the tickets list
  useEffect(() => {
    if (selectedTicket && tickets.length > 0) {
      const updated = tickets.find(
        (t) => t.ticketId.toString() === selectedTicket.ticketId.toString()
      );
      if (updated) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticketMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!selectedTicket) {
      toast.error('Please select a ticket first');
      return;
    }

    if (selectedTicket.status === TicketStatusOld.resolved) {
      toast.error('Cannot send messages on a resolved ticket');
      return;
    }

    try {
      await sendMessageForTicket.mutateAsync({
        ticketId: selectedTicket.ticketId,
        content: messageContent.trim(),
      });
      setMessageContent('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message');
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await setAvailability.mutateAsync(checked);
      setIsAvailable(checked);
      toast.success(checked ? 'You are now available' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  const getStatusColor = (status: TicketStatusOld) => {
    if (status === TicketStatusOld.open) return 'bg-blue-500';
    if (status === TicketStatusOld.inProgress) return 'bg-yellow-500';
    if (status === TicketStatusOld.resolved) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = (status: TicketStatusOld) => {
    if (status === TicketStatusOld.open) return 'Open';
    if (status === TicketStatusOld.inProgress) return 'In Progress';
    if (status === TicketStatusOld.resolved) return 'Resolved';
    return 'Unknown';
  };

  const isResolved = selectedTicket?.status === TicketStatusOld.resolved;

  if (ticketsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Support Chat
          </CardTitle>
          <CardDescription>
            {userProfile?.isTechnician
              ? 'No active support tickets. Wait for customers to create tickets.'
              : 'No active support tickets. Please create a support ticket from the My Portal tab to start chatting with a technician.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <img
              src="/assets/generated/support-technician.dim_400x300.jpg"
              alt="Support"
              className="mx-auto rounded-lg mb-6 max-w-xs"
            />
            <p className="text-muted-foreground mb-4">
              {userProfile?.isTechnician
                ? 'You will see tickets here when customers need help'
                : 'Once you have an active support ticket, you can chat directly with your assigned technician here.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort messages chronologically
  const sortedMessages = [...ticketMessages].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  );

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Tickets Sidebar */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Support Tickets</CardTitle>
          {/* Availability toggle: only shown to technicians */}
          {userProfile?.isTechnician && (
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={handleAvailabilityToggle}
              />
              <Label htmlFor="availability" className="text-sm">
                Available
              </Label>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {tickets.map((ticket) => (
                <button
                  key={ticket.ticketId.toString()}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTicket?.ticketId.toString() === ticket.ticketId.toString()
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-muted border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      Ticket #{ticket.ticketId.toString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(ticket.status)} text-white text-xs`}
                    >
                      {getStatusText(ticket.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(ticket.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat</CardTitle>
              <CardDescription>
                {selectedTicket && `Ticket #${selectedTicket.ticketId.toString()}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedTicket && (
                <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                  {getStatusText(selectedTicket.status)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetchMessages()}
                title="Refresh messages"
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Messages area */}
          <div
            ref={scrollRef}
            className="h-[380px] overflow-y-auto mb-4 pr-2 space-y-4"
          >
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : messagesError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-destructive mb-2">Failed to load messages</p>
                  <Button variant="outline" size="sm" onClick={() => refetchMessages()}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            ) : sortedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              sortedMessages.map((msg) => {
                const isCurrentUser = msg.sender.toString() === currentPrincipal;
                return (
                  <div
                    key={msg.messageId.toString()}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isCurrentUser
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <User
                          className={`h-3 w-3 ${
                            isCurrentUser
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isCurrentUser
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isCurrentUser
                            ? 'You'
                            : userProfile?.isTechnician
                            ? 'Customer'
                            : 'Technician'}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isCurrentUser
                            ? 'text-emerald-900 dark:text-emerald-100'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          isCurrentUser
                            ? 'text-emerald-600 dark:text-emerald-500'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message input — always visible for all authenticated users */}
          {isResolved ? (
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                This ticket is resolved. You cannot send new messages.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={sendMessageForTicket.isPending || !selectedTicket}
                className="flex-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={
                  sendMessageForTicket.isPending ||
                  !selectedTicket ||
                  !messageContent.trim()
                }
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {sendMessageForTicket.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
