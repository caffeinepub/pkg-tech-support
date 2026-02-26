import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  colorClass = 'text-primary',
}: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {icon && (
            <div className="p-2 bg-muted rounded-lg">
              {icon}
            </div>
          )}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
