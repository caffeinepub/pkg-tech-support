import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TicketVolumeChartProps {
  totalTickets: number;
}

interface DailyDataPoint {
  date: string;
  tickets: number;
}

function generateMockDailyData(total: number): DailyDataPoint[] {
  const data: DailyDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const value = Math.max(0, Math.floor((total / 30) * (0.5 + Math.random())));
    data.push({ date: label, tickets: value });
  }
  return data;
}

export default function TicketVolumeChart({ totalTickets }: TicketVolumeChartProps) {
  const data = generateMockDailyData(totalTickets);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Ticket Volume (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="tickets"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
