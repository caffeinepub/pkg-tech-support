import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart2, Ticket, CheckCircle, Clock, Users } from 'lucide-react';
import MetricCard from './MetricCard';
import TicketVolumeChart from './TicketVolumeChart';
import OpenTicketsByPriorityChart from './OpenTicketsByPriorityChart';
import AgentPerformanceTable from './AgentPerformanceTable';
import { useGetAnalyticsMetrics } from '../hooks/useAnalytics';
import { useGetAllAvailableTechnicians } from '../hooks/useQueries';

export default function AnalyticsDashboard() {
  const { data: metrics, isLoading, error } = useGetAnalyticsMetrics();
  const { data: technicians } = useGetAllAvailableTechnicians();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load analytics: {error.message}</AlertDescription>
      </Alert>
    );
  }

  const total = Number(metrics?.totalTickets || 0);
  const open = Number(metrics?.openTickets || 0);
  const resolved = Number(metrics?.resolvedTickets || 0);
  const rate = Number(metrics?.resolutionRate || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Tickets"
          value={total}
          subtitle="All time"
          icon={<Ticket className="w-5 h-5 text-primary" />}
          colorClass="text-primary"
        />
        <MetricCard
          label="Open Tickets"
          value={open}
          subtitle="Needs attention"
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          colorClass="text-yellow-600"
        />
        <MetricCard
          label="Resolved"
          value={resolved}
          subtitle="Successfully closed"
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          colorClass="text-green-600"
        />
        <MetricCard
          label="Resolution Rate"
          value={`${rate}%`}
          subtitle="Of all tickets"
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
          colorClass="text-blue-600"
          trend={rate >= 70 ? 'up' : rate >= 40 ? 'neutral' : 'down'}
          trendValue={rate >= 70 ? 'Good performance' : rate >= 40 ? 'Average' : 'Needs improvement'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TicketVolumeChart totalTickets={total} />
        <OpenTicketsByPriorityChart openTickets={open} totalTickets={total} />
      </div>

      <AgentPerformanceTable
        technicians={technicians || []}
        resolvedTickets={resolved}
      />
    </div>
  );
}
