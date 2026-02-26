import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface SLAIndicatorProps {
  dueTimestamp: bigint;
  priority?: string;
  compact?: boolean;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Overdue';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function SLAIndicator({ dueTimestamp, compact = false }: SLAIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const dueMs = Number(dueTimestamp) / 1_000_000;
    const update = () => {
      const remaining = dueMs - Date.now();
      setTimeRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dueTimestamp]);

  const isBreached = timeRemaining <= 0;
  const isWarning = timeRemaining > 0 && timeRemaining < 2 * 60 * 60 * 1000;

  if (compact) {
    return (
      <Badge variant={isBreached ? 'destructive' : isWarning ? 'outline' : 'secondary'} className="text-xs">
        {isBreached ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
        {formatTimeRemaining(timeRemaining)}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
      isBreached
        ? 'bg-destructive/10 text-destructive border border-destructive/30'
        : isWarning
        ? 'bg-warning/10 text-warning border border-warning/30'
        : 'bg-muted text-muted-foreground'
    }`}>
      {isBreached ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="font-medium">
        {isBreached ? 'SLA Breached' : `SLA: ${formatTimeRemaining(timeRemaining)} remaining`}
      </span>
    </div>
  );
}
