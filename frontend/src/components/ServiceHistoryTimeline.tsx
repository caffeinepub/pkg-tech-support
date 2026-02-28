import React from 'react';
import { Clock, CheckCircle, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { TicketStatusOld } from '../backend';
import { useGetCustomerHistory } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const ServiceHistoryTimeline: React.FC = () => {
  const { data: tickets, isLoading, error } = useGetCustomerHistory();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-destructive font-medium">Failed to load service history</p>
        <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  const resolvedTickets = (tickets ?? []).filter(
    (t) => t.status === TicketStatusOld.resolved
  );

  if (resolvedTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No Service History Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your resolved support sessions will appear here once a technician marks them as resolved.
        </p>
      </div>
    );
  }

  const sorted = [...resolvedTickets].sort(
    (a, b) => Number(b.updatedAt) - Number(a.updatedAt)
  );

  return (
    <div className="space-y-0">
      {sorted.map((ticket, index) => (
        <div key={ticket.ticketId.toString()} className="relative flex gap-4 pb-8">
          {/* Timeline line */}
          {index < sorted.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
          )}

          {/* Icon */}
          <div className="shrink-0 w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center z-10">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Support Session #{ticket.ticketId.toString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resolved on {formatDate(ticket.updatedAt)}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full border shrink-0 text-success bg-success/10 border-success/20">
                Resolved
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {formatDate(ticket.createdAt)}
              </span>
              {ticket.messages && ticket.messages.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Feedback */}
            {ticket.feedback && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Number(ticket.feedback!.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {Number(ticket.feedback.rating)}/5
                  </span>
                </div>
                {ticket.feedback.comment && (
                  <p className="text-xs text-muted-foreground italic">
                    "{ticket.feedback.comment}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceHistoryTimeline;
