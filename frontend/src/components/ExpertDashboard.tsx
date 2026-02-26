import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Ticket, BarChart2, BookOpen, Users } from 'lucide-react';
import ChatSection from './ChatSection';
import TicketListView from './TicketListView';
import TicketDetailView from './TicketDetailView';
import AnalyticsDashboard from './AnalyticsDashboard';
import KnowledgeBaseView from './KnowledgeBaseView';
import AdminLoginTracking from './AdminLoginTracking';
import { useGetAdminTickets } from '../hooks/useTickets';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { SupportTicket } from '../backend';

export default function ExpertDashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: tickets, isLoading: ticketsLoading } = useGetAdminTickets();

  const isAdmin = userProfile?.isTechnician;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedTicket(null); }}>
        <TabsList className="flex flex-wrap gap-1 w-full mb-6 h-auto">
          <TabsTrigger value="chat" className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Knowledge Base</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="chat">
          <ChatSection />
        </TabsContent>

        <TabsContent value="tickets">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Support Tickets
              </h2>
            </div>
            {selectedTicket ? (
              <TicketDetailView
                ticket={selectedTicket}
                onBack={() => setSelectedTicket(null)}
                isTechnician={true}
              />
            ) : (
              <TicketListView
                tickets={tickets || []}
                isLoading={ticketsLoading}
                onSelectTicket={setSelectedTicket}
                showAll
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseView isAdmin={true} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminLoginTracking />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
