import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Ticket, History, CreditCard, Plus, Shield, CheckCircle } from 'lucide-react';
import TicketListView from './TicketListView';
import TicketCreationForm from './TicketCreationForm';
import ServiceHistoryTimeline from './ServiceHistoryTimeline';
import { useGetUserTickets } from '../hooks/useTickets';

const SUPPORT_PLANS = [
  {
    name: 'Basic',
    price: '$9.99/mo',
    features: ['Email support', '48h response time', '5 tickets/month'],
    color: 'border-blue-200',
    popular: false,
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
    features: [
      'Dedicated agent',
      '1h response time',
      'Unlimited tickets',
      '24/7 support',
      'SLA guarantee',
    ],
    color: 'border-purple-200',
    popular: false,
  },
];

export default function ClientPortal() {
  const { data: tickets } = useGetUserTickets();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-display font-bold flex items-center gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Client Portal
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Manage your support tickets and account
          </p>
        </div>

        {/* New Ticket button — no payment gate, always accessible to authenticated customers */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-xl font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Plus className="w-4 h-4 mr-1" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-lg rounded-2xl border-2 shadow-modal"
            style={{ background: 'var(--modal-bg)', borderColor: 'var(--primary)' }}
          >
            <DialogHeader>
              <DialogTitle
                className="font-display font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Create Support Ticket
              </DialogTitle>
            </DialogHeader>
            <TicketCreationForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tickets">
        <TabsList
          className="w-full p-1 rounded-2xl gap-1 h-auto flex"
          style={{ background: 'var(--muted)' }}
        >
          <TabsTrigger
            value="tickets"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
          >
            <Ticket className="w-4 h-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
          >
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:font-semibold"
          >
            <CreditCard className="w-4 h-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4 animate-fade-in">
          {/* TicketListView fetches its own data internally */}
          <TicketListView />
        </TabsContent>

        <TabsContent value="history" className="mt-4 animate-fade-in">
          <ServiceHistoryTimeline tickets={tickets || []} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4 animate-fade-in">
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Choose a support plan that fits your needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUPPORT_PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={`border-2 ${plan.color} relative transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className="text-xs font-semibold px-3 py-1"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                        }}
                      >
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-6">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription
                      className="text-2xl font-bold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {plan.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: 'var(--success)' }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4 rounded-xl font-semibold"
                      variant={plan.popular ? 'default' : 'outline'}
                      style={
                        plan.popular
                          ? {
                              background: 'var(--primary)',
                              color: 'var(--primary-foreground)',
                            }
                          : {}
                      }
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
