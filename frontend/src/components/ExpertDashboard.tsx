import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Ticket, BarChart2, BookOpen, Activity } from 'lucide-react';
import ChatSection from './ChatSection';
import TicketListView from './TicketListView';
import AnalyticsDashboard from './AnalyticsDashboard';
import KnowledgeBaseView from './KnowledgeBaseView';
import AdminLoginTracking from './AdminLoginTracking';

export default function ExpertDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList
            className="w-full mb-6 p-1 rounded-2xl gap-1 h-auto flex"
            style={{ background: 'var(--muted)' }}
          >
            <TabsTrigger
              value="chat"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Live Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="kb"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="animate-fade-in">
            <ChatSection />
          </TabsContent>
          <TabsContent value="tickets" className="animate-fade-in">
            {/* showAll=true loads admin tickets (all tickets) */}
            <TicketListView showAll={true} />
          </TabsContent>
          <TabsContent value="analytics" className="animate-fade-in">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="kb" className="animate-fade-in">
            <KnowledgeBaseView />
          </TabsContent>
          <TabsContent value="admin" className="animate-fade-in">
            <AdminLoginTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
