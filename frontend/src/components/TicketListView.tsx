import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Ticket, ChevronRight } from 'lucide-react';
import { SupportTicket, TicketStatusOld } from '../backend';

interface TicketListViewProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
  onSelectTicket?: (ticket: SupportTicket) => void;
  showAll?: boolean;
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  inProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  inProgress: 'In Progress',
  resolved: 'Resolved',
};

function getStatusKey(status: TicketStatusOld): string {
  if (status === TicketStatusOld.open) return 'open';
  if (status === TicketStatusOld.inProgress) return 'inProgress';
  if (status === TicketStatusOld.resolved) return 'resolved';
  return 'open';
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TicketListView({ tickets, isLoading, onSelectTicket }: TicketListViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return getStatusKey(t.status) === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} ticket(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tickets found</p>
          <p className="text-sm">Create a new ticket to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const statusKey = getStatusKey(ticket.status);
            const borderColor =
              statusKey === 'open'
                ? '#3b82f6'
                : statusKey === 'inProgress'
                ? '#f59e0b'
                : '#10b981';
            return (
              <Card
                key={ticket.ticketId.toString()}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: borderColor }}
                onClick={() => onSelectTicket?.(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          #{ticket.ticketId.toString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusColors[statusKey]
                          }`}
                        >
                          {statusLabels[statusKey]}
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate">Support Session</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket.updatedAt)}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
