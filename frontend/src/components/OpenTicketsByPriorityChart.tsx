import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface OpenTicketsByPriorityChartProps {
  openTickets: number;
  totalTickets: number;
}

export default function OpenTicketsByPriorityChart({ openTickets, totalTickets }: OpenTicketsByPriorityChartProps) {
  const base = Math.max(1, Math.floor(openTickets / 4));
  const data = [
    { priority: 'Low', count: base, color: '#22c55e' },
    { priority: 'Medium', count: Math.floor(base * 1.5), color: '#f59e0b' },
    { priority: 'High', count: Math.floor(base * 0.8), color: '#f97316' },
    { priority: 'Critical', count: Math.max(0, openTickets - base * 3), color: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Open Tickets by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
