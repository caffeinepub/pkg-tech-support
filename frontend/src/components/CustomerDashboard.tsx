import React, { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, CreditCard, Shield, BookOpen } from 'lucide-react';
import ChatSection from './ChatSection';
import PaymentSection from './PaymentSection';
import ClientPortal from './ClientPortal';
import KnowledgeBaseView from './KnowledgeBaseView';

const AIAssistantChat = lazy(() => import('./AIAssistantChat'));

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Portal</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatSection />
        </TabsContent>

        <TabsContent value="portal">
          <ClientPortal />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseView isAdmin={false} />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
