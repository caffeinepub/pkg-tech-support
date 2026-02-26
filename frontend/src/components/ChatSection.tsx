import { useState, useEffect, useRef } from 'react';
import { useGetUserMessages, useGetUserTickets, useSendMessage, useSetTechnicianAvailability } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, User, Clock } from 'lucide-react';
import { ChatMessage, SupportTicket, TicketStatusOld } from '../backend';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ChatSection() {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();
  const { data: userProfile } = useGetCallerUserProfile();

  const { data: messages = [], isLoading: messagesLoading } = useGetUserMessages();
  const { data: tickets = [], isLoading: ticketsLoading } = useGetUserTickets();
  const sendMessage = useSendMessage();
  const setAvailability = useSetTechnicianAvailability();

  const [messageContent, setMessageContent] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() || !selectedTicket) {
      toast.error('Please enter a message');
      return;
    }

    const recipient = userProfile?.isTechnician
      ? selectedTicket.customer
      : selectedTicket.technician;

    try {
      await sendMessage.mutateAsync({
        recipient,
        content: messageContent.trim(),
      });
      setMessageContent('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await setAvailability.mutateAsync(checked);
      setIsAvailable(checked);
      toast.success(checked ? 'You are now available' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update availability');
      console.error(error);
    }
  };

  const getTicketMessages = (ticket: SupportTicket): ChatMessage[] => {
    return messages
      .filter(
        (msg) =>
          (msg.sender.toString() === ticket.customer.toString() &&
            msg.recipient.toString() === ticket.technician.toString()) ||
          (msg.sender.toString() === ticket.technician.toString() &&
            msg.recipient.toString() === ticket.customer.toString())
      )
      .sort((a, b) => Number(a.timestamp - b.timestamp));
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  if (messagesLoading || ticketsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Chat</CardTitle>
          <CardDescription>
            {userProfile?.isTechnician
              ? 'No active support tickets. Wait for customers to create tickets.'
              : 'No active support tickets. Contact a technician to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <img
              src="/assets/generated/support-technician.dim_400x300.jpg"
              alt="Support"
              className="mx-auto rounded-lg mb-6 max-w-xs"
            />
            <p className="text-muted-foreground mb-4">
              {userProfile?.isTechnician
                ? 'You will see tickets here when customers need help'
                : 'Create a support ticket to start chatting with a technician'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ticketMessages = selectedTicket ? getTicketMessages(selectedTicket) : [];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Tickets Sidebar */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Support Tickets</CardTitle>
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
                    selectedTicket?.ticketId === ticket.ticketId
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
                    {new Date(Number(ticket.createdAt) / 1000000).toLocaleDateString()}
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
            {selectedTicket && (
              <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                {getStatusText(selectedTicket.status)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] mb-4 pr-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
            <div className="space-y-4">
              {ticketMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                ticketMessages.map((msg) => {
                  const isCurrentUser = msg.sender.toString() === currentPrincipal;
                  return (
                    <div
                      key={msg.messageId.toString()}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                          isCurrentUser
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User
                            className={`h-3 w-3 ${
                              isCurrentUser
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
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
                          className={`text-sm ${
                            isCurrentUser
                              ? 'text-emerald-900 dark:text-emerald-100'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {msg.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
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
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={sendMessage.isPending || !selectedTicket}
            />
            <Button type="submit" disabled={sendMessage.isPending || !selectedTicket}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
