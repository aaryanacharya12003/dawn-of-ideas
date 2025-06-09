
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  iconBackground?: string;
  iconColor?: string;
  className?: string;
  trend?: {
    value: string;
    positive: boolean;
  }
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  description,
  icon, 
  trend, 
  iconBackground = "bg-primary/10", 
  iconColor = "text-primary",
  className = ""
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <p className={`text-xs mt-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full ${iconBackground} flex items-center justify-center ${iconColor} ${className}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
