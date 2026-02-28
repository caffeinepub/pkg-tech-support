import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import ChatSection from './ChatSection';
import ClientPortal from './ClientPortal';
import KnowledgeBaseView from './KnowledgeBaseView';
import PaymentSection from './PaymentSection';
import PaymentRequestModal from './PaymentRequestModal';
import { useGetUserTickets } from '../hooks/useTickets';
import { useGetToggleState } from '../hooks/usePaymentToggle';
import { TicketStatusOld } from '../backend';

// Polls the active ticket's payment toggle and shows modal when enabled
const PaymentModalController: React.FC = () => {
  const { data: tickets } = useGetUserTickets();
  const [modalShown, setModalShown] = useState(false);

  // Find the most recent open/inProgress ticket
  const activeTicket = tickets
    ? [...tickets]
        .filter(
          (t) =>
            t.status === TicketStatusOld.open ||
            t.status === TicketStatusOld.inProgress
        )
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]
    : null;

  const ticketId = activeTicket?.ticketId ?? null;

  const { data: toggleState } = useGetToggleState(ticketId ?? null);

  // Show modal when technician enables payment toggle
  useEffect(() => {
    if (toggleState?.toggleEnabled && !modalShown) {
      setModalShown(true);
    }
    if (!toggleState?.toggleEnabled) {
      setModalShown(false);
    }
  }, [toggleState?.toggleEnabled]);

  const handleClose = () => {
    setModalShown(false);
  };

  return (
    <PaymentRequestModal
      isOpen={modalShown}
      onClose={handleClose}
      ticketId={ticketId}
      amount={299}
    />
  );
};

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('portal');

  return (
    <div className="flex flex-col h-full">
      {/* Payment modal controller — always mounted */}
      <PaymentModalController />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card/50 px-2 pt-2">
          <TabsList className="grid grid-cols-4 bg-muted/50 w-full">
            <TabsTrigger value="portal" className="gap-1 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Portal</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="kb" className="gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="portal" className="flex-1 overflow-hidden mt-0">
          <ClientPortal />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
          <ChatSection />
        </TabsContent>

        <TabsContent value="kb" className="flex-1 overflow-y-auto mt-0 p-4">
          <KnowledgeBaseView />
        </TabsContent>

        <TabsContent value="payment" className="flex-1 overflow-y-auto mt-0 p-4">
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
