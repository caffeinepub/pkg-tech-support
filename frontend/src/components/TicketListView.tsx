import React, { useState } from 'react';
import { useGetUserTickets, useGetAdminTickets, useGetTicket } from '../hooks/useTickets';
import { SupportTicket, TicketStatusOld } from '../backend';
import { Ticket, Clock, CheckCircle, AlertCircle, Loader2, Filter } from 'lucide-react';
import TicketDetailView from './TicketDetailView';
import { useGetCallerUserProfile } from '../hooks/useQueries';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  [TicketStatusOld.open]: {
    label: 'Open',
    color: 'var(--warning)',
    bg: 'oklch(0.70 0.20 45 / 0.12)',
    icon: AlertCircle,
  },
  [TicketStatusOld.inProgress]: {
    label: 'In Progress',
    color: 'var(--primary)',
    bg: 'oklch(0.52 0.18 195 / 0.12)',
    icon: Clock,
  },
  [TicketStatusOld.resolved]: {
    label: 'Resolved',
    color: 'var(--success)',
    bg: 'oklch(0.58 0.18 145 / 0.12)',
    icon: CheckCircle,
  },
};

// Sub-component that fetches a single ticket and renders TicketDetailView
function TicketDetailLoader({
  ticketId,
  onBack,
  isTechnician,
}: {
  ticketId: bigint;
  onBack: () => void;
  isTechnician: boolean;
}) {
  const { data: ticket, isLoading } = useGetTicket(ticketId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <p>Ticket not found.</p>
        <button
          onClick={onBack}
          className="mt-4 underline text-sm"
          style={{ color: 'var(--primary)' }}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return <TicketDetailView ticket={ticket} onBack={onBack} isTechnician={isTechnician} />;
}

interface TicketListViewProps {
  /** If true, loads admin tickets (all tickets); otherwise loads user tickets */
  showAll?: boolean;
}

export default function TicketListView({ showAll = false }: TicketListViewProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const isTechnician = !!userProfile?.isTechnician;

  const {
    data: userTickets,
    isLoading: userLoading,
    error: userError,
  } = useGetUserTickets();

  const {
    data: adminTickets,
    isLoading: adminLoading,
    error: adminError,
  } = useGetAdminTickets();

  const tickets: SupportTicket[] = showAll
    ? (adminTickets || [])
    : (userTickets || []);
  const isLoading = showAll ? adminLoading : userLoading;
  const error = showAll ? adminError : userError;

  const [selectedTicketId, setSelectedTicketId] = useState<bigint | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatusOld | 'all'>('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border-2 p-6 text-center"
        style={{
          borderColor: 'var(--destructive)',
          background: 'oklch(0.55 0.22 25 / 0.08)',
        }}
      >
        <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--destructive)' }} />
        <p style={{ color: 'var(--destructive)' }}>Failed to load tickets</p>
      </div>
    );
  }

  if (selectedTicketId !== null) {
    return (
      <TicketDetailLoader
        ticketId={selectedTicketId}
        onBack={() => setSelectedTicketId(null)}
        isTechnician={isTechnician}
      />
    );
  }

  const filtered = tickets.filter((t) =>
    statusFilter === 'all' ? true : t.status === statusFilter
  );

  const filterOptions: Array<{ value: TicketStatusOld | 'all'; label: string }> = [
    { value: 'all', label: 'All Tickets' },
    { value: TicketStatusOld.open, label: 'Open' },
    { value: TicketStatusOld.inProgress, label: 'In Progress' },
    { value: TicketStatusOld.resolved, label: 'Resolved' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={
              statusFilter === opt.value
                ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
            }
          >
            {opt.label}
          </button>
        ))}
        <span className="text-sm ml-1" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border-2 p-12 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <Ticket className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
            No tickets found
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {statusFilter === 'all'
              ? 'No support tickets yet.'
              : `No ${statusFilter} tickets.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const statusKey = ticket.status as string;
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG[TicketStatusOld.open];
            const StatusIcon = cfg.icon;
            return (
              <button
                key={ticket.ticketId.toString()}
                onClick={() => setSelectedTicketId(ticket.ticketId)}
                className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-card-hover interactive-card"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                        Ticket #{ticket.ticketId.toString()}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(Number(ticket.createdAt) / 1_000_000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
