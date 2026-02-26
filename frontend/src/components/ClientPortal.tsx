import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Ticket, History, CreditCard, Plus, Shield } from 'lucide-react';
import { useGetUserTickets } from '../hooks/useTickets';
import TicketListView from './TicketListView';
import TicketDetailView from './TicketDetailView';
import TicketCreationForm from './TicketCreationForm';
import ServiceHistoryTimeline from './ServiceHistoryTimeline';
import { SupportTicket } from '../backend';

const SUPPORT_PLANS = [
  {
    name: 'Basic',
    price: '$9.99/mo',
    features: ['Email support', '48h response time', '5 tickets/month'],
    color: 'border-blue-200',
  },
  {
    name: 'Premium',
    price: '$29.99/mo',
    features: ['Priority support', '4h response time', 'Unlimited tickets', 'Live chat'],
    color: 'border-primary',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99.99/mo',
    features: ['Dedicated agent', '1h response time', 'Unlimited tickets', '24/7 support', 'SLA guarantee'],
    color: 'border-purple-200',
  },
];

export default function ClientPortal() {
  const { data: tickets, isLoading } = useGetUserTickets();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Client Portal
          </h2>
          <p className="text-sm text-muted-foreground">Manage your support tickets and account</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <TicketCreationForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="tickets">
            <Ticket className="w-4 h-4 mr-1" /> My Tickets
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-1" /> History
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="w-4 h-4 mr-1" /> Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          {selectedTicket ? (
            <TicketDetailView
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
            />
          ) : (
            <TicketListView
              tickets={tickets || []}
              isLoading={isLoading}
              onSelectTicket={setSelectedTicket}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ServiceHistoryTimeline tickets={tickets || []} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a support plan that fits your needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUPPORT_PLANS.map(plan => (
                <Card key={plan.name} className={`border-2 ${plan.color} relative`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-2xl font-bold text-primary">{plan.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map(f => (
                        <li key={f} className="text-sm flex items-center gap-2">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => alert(`Razorpay integration for ${plan.name} plan coming soon`)}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Secure payments powered by Razorpay. Cancel anytime.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
