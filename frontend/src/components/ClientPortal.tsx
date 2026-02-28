import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, History, Ticket, Star } from 'lucide-react';
import TicketListView from './TicketListView';
import ServiceHistoryTimeline from './ServiceHistoryTimeline';
import TicketCreationForm from './TicketCreationForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClientPortalProps {
  onStartChat?: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ onStartChat }) => {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <h2 className="font-semibold text-foreground">My Support Portal</h2>
        <Button
          size="sm"
          className="btn-primary gap-1.5"
          onClick={() => setShowCreateTicket(true)}
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 mb-0 grid grid-cols-3 bg-muted/50">
          <TabsTrigger value="tickets" className="gap-1.5 text-xs">
            <Ticket className="h-3.5 w-3.5" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" />
            Service History
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" />
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="flex-1 overflow-y-auto mt-0 p-4">
          <TicketListView showAll={false} />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 p-4">
          <ServiceHistoryTimeline />
        </TabsContent>

        <TabsContent value="plans" className="flex-1 overflow-y-auto mt-0 p-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Support Plans</h3>
            <div className="grid gap-4">
              {/* Basic Plan */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">Basic Support</h4>
                    <p className="text-muted-foreground text-sm">Essential tech help</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹299</p>
                    <p className="text-xs text-muted-foreground">per session</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Remote diagnosis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Basic troubleshooting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> 24–48 hr turnaround
                  </li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="bg-primary/5 border-2 border-primary rounded-xl p-5 shadow-card relative">
                <div className="absolute -top-3 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">Premium Support</h4>
                    <p className="text-muted-foreground text-sm">Priority assistance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹599</p>
                    <p className="text-xs text-muted-foreground">per session</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Everything in Basic
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Priority queue
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Screen sharing support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Same-day resolution
                  </li>
                </ul>
              </div>

              {/* Sponsorship Plan */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">Sponsorship</h4>
                    <p className="text-muted-foreground text-sm">Dedicated expert</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-secondary">₹1499</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Everything in Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Dedicated technician
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> Unlimited sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span> On-site visits (Jaipur)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
        <DialogContent className="max-w-lg bg-modal-bg border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Support Ticket</DialogTitle>
          </DialogHeader>
          <TicketCreationForm
            onSuccess={() => setShowCreateTicket(false)}
            onCancel={() => setShowCreateTicket(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortal;
