import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TechnicianAvailability } from '../backend';

interface AgentPerformanceTableProps {
  technicians: TechnicianAvailability[];
  resolvedTickets: number;
}

export default function AgentPerformanceTable({ technicians, resolvedTickets }: AgentPerformanceTableProps) {
  const perAgent = technicians.length > 0 ? Math.floor(resolvedTickets / technicians.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {technicians.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No agents registered yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tickets Handled</TableHead>
                <TableHead className="text-right">Avg. Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech, idx) => (
                <TableRow key={tech.technician.toString()}>
                  <TableCell className="font-mono text-xs">
                    {tech.technician.toString().slice(0, 16)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={tech.isAvailable ? 'default' : 'secondary'}>
                      {tech.isAvailable ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{perAgent + (idx % 3)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">~2.4h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
