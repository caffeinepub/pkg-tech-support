import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Ticket,
  BarChart2,
  BookOpen,
  Shield,
  History,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import ChatSection from './ChatSection';
import TicketListView from './TicketListView';
import AnalyticsDashboard from './AnalyticsDashboard';
import KnowledgeBaseView from './KnowledgeBaseView';
import AdminLoginTracking from './AdminLoginTracking';
import { useGetExpertHistory } from '../hooks/useQueries';
import { TicketStatusOld } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

const ExpertHistorySection: React.FC = () => {
  const { data: tickets, isLoading, error } = useGetExpertHistory();

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
        <p className="text-destructive font-medium">Failed to load history</p>
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
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No Resolved Tickets Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Tickets you resolve will appear here as your service history.
        </p>
      </div>
    );
  }

  const sorted = [...resolvedTickets].sort(
    (a, b) => Number(b.updatedAt) - Number(a.updatedAt)
  );

  return (
    <div className="space-y-0 p-4">
      {sorted.map((ticket, index) => (
        <div key={ticket.ticketId.toString()} className="relative flex gap-4 pb-8">
          {index < sorted.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
          )}
          <div className="shrink-0 w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center z-10">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Ticket #{ticket.ticketId.toString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resolved on {formatDate(ticket.updatedAt)}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full border shrink-0 text-success bg-success/10 border-success/20">
                Resolved
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {formatDate(ticket.createdAt)}
              </span>
              <span>
                Customer: {ticket.customer.toString().slice(0, 10)}...
              </span>
            </div>
            {ticket.feedback && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= Number(ticket.feedback!.rating)
                            ? 'text-amber-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Customer rating: {Number(ticket.feedback.rating)}/5
                  </span>
                </div>
                {ticket.feedback.comment && (
                  <p className="text-xs text-muted-foreground italic mt-1">
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

const ExpertDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card/50 px-2 pt-2">
          <TabsList className="grid grid-cols-6 bg-muted/50 w-full">
            <TabsTrigger value="chat" className="gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1 text-xs">
              <Ticket className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 text-xs">
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs">
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="kb" className="gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">KB</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-1 text-xs">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
          <ChatSection />
        </TabsContent>

        <TabsContent value="tickets" className="flex-1 overflow-y-auto mt-0 p-4">
          <TicketListView showAll={true} />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-0">
          <ExpertHistorySection />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-y-auto mt-0 p-4">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="kb" className="flex-1 overflow-y-auto mt-0 p-4">
          <KnowledgeBaseView />
        </TabsContent>

        <TabsContent value="admin" className="flex-1 overflow-y-auto mt-0 p-4">
          <AdminLoginTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpertDashboard;
