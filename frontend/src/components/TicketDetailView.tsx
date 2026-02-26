import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, User, Clock, CheckCircle } from 'lucide-react';
import { SupportTicket, TicketStatusOld } from '../backend';
import { useUpdateTicketStatus } from '../hooks/useTickets';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface TicketDetailViewProps {
  ticket: SupportTicket;
  onBack?: () => void;
  isTechnician?: boolean;
}

function getStatusKey(status: TicketStatusOld): string {
  if (status === TicketStatusOld.open) return 'open';
  if (status === TicketStatusOld.inProgress) return 'inProgress';
  if (status === TicketStatusOld.resolved) return 'resolved';
  return 'open';
}

function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  inProgress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function TicketDetailView({ ticket, onBack, isTechnician }: TicketDetailViewProps) {
  const { identity } = useInternetIdentity();
  const updateStatus = useUpdateTicketStatus();
  const [newStatus, setNewStatus] = useState<string>(getStatusKey(ticket.status));

  const statusKey = getStatusKey(ticket.status);
  const isParticipant =
    identity &&
    (ticket.customer.toString() === identity.getPrincipal().toString() ||
      ticket.technician.toString() === identity.getPrincipal().toString());

  const handleStatusUpdate = () => {
    const statusMap: Record<string, TicketStatusOld> = {
      open: TicketStatusOld.open,
      inProgress: TicketStatusOld.inProgress,
      resolved: TicketStatusOld.resolved,
    };
    updateStatus.mutate({ ticketId: ticket.ticketId, status: statusMap[newStatus] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <h2 className="text-lg font-semibold">Ticket #{ticket.ticketId.toString()}</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[statusKey]}`}>
          {statusKey === 'open' ? 'Open' : statusKey === 'inProgress' ? 'In Progress' : 'Resolved'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-mono text-xs truncate">
                {ticket.customer.toString().slice(0, 20)}...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Technician:</span>
              <span className="font-mono text-xs truncate">
                {ticket.technician.toString().slice(0, 20)}...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDateTime(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span>{formatDateTime(ticket.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {(isTechnician || isParticipant) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={updateStatus.isPending || newStatus === statusKey}
                className="w-full"
                size="sm"
              >
                {updateStatus.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Update Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {ticket.messages && ticket.messages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages ({ticket.messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {ticket.messages.map((msg, idx) => (
                  <div key={idx} className="text-sm p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="font-mono">{msg.sender.toString().slice(0, 15)}...</span>
                      <span>{formatDateTime(msg.timestamp)}</span>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {ticket.feedback && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500">
                {'★'.repeat(Number(ticket.feedback.rating))}
              </span>
              <span className="text-muted-foreground text-sm">({ticket.feedback.rating}/5)</span>
            </div>
            {ticket.feedback.comment && (
              <p className="text-sm text-muted-foreground">{ticket.feedback.comment}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
