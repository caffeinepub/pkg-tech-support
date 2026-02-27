import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, LayoutDashboard, BookOpen, CreditCard } from 'lucide-react';
import ChatSection from './ChatSection';
import ClientPortal from './ClientPortal';
import KnowledgeBaseView from './KnowledgeBaseView';
import PaymentSection from './PaymentSection';

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full mb-6 p-1 rounded-2xl gap-1 h-auto flex"
            style={{ background: 'var(--muted)' }}>
            <TabsTrigger
              value="chat"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                data-[state=active]:shadow-md data-[state=active]:font-semibold"
              style={{
                '--tw-data-active-bg': 'var(--tab-selected-bg)',
              } as React.CSSProperties}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Live Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="portal"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>My Portal</span>
            </TabsTrigger>
            <TabsTrigger
              value="kb"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                data-[state=active]:shadow-md data-[state=active]:font-semibold"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="animate-fade-in">
            <ChatSection />
          </TabsContent>
          <TabsContent value="portal" className="animate-fade-in">
            <ClientPortal />
          </TabsContent>
          <TabsContent value="kb" className="animate-fade-in">
            <KnowledgeBaseView />
          </TabsContent>
          <TabsContent value="payment" className="animate-fade-in">
            <PaymentSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
