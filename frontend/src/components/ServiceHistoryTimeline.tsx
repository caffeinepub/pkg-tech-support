import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { SupportTicket, TicketStatusOld } from '../backend';

interface ServiceHistoryTimelineProps {
  tickets: SupportTicket[];
}

function getStatusKey(status: TicketStatusOld): string {
  if (status === TicketStatusOld.open) return 'open';
  if (status === TicketStatusOld.inProgress) return 'inProgress';
  if (status === TicketStatusOld.resolved) return 'resolved';
  return 'open';
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ServiceHistoryTimeline({ tickets }: ServiceHistoryTimelineProps) {
  const closedTickets = tickets
    .filter((t) => getStatusKey(t.status) === 'resolved')
    .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));

  if (closedTickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No service history yet</p>
        <p className="text-sm">Resolved tickets will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {closedTickets.map((ticket) => (
          <div key={ticket.ticketId.toString()} className="relative flex gap-4 pl-12">
            <div className="absolute left-3 top-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 bg-card border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">
                    Support Ticket #{ticket.ticketId.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Resolved on {formatDate(ticket.updatedAt)}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                  Resolved
                </Badge>
              </div>
              {ticket.feedback && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Rating: {'★'.repeat(Number(ticket.feedback.rating))}
                    {'☆'.repeat(5 - Number(ticket.feedback.rating))}
                  </p>
                  {ticket.feedback.comment && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{ticket.feedback.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
