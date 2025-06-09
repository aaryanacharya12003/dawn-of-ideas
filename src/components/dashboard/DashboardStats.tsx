
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  TrendingUp, 
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '@/types';
import { formatIndianCurrency } from '@/utils/formatCurrency';

interface DashboardStatsProps {
  stats: DashboardStatsType & {
    totalRevenue?: number;
    pendingAmount?: number;
    totalPayments?: number;
    verifiedPayments?: number;
    pendingVerification?: number;
  };
  isManager?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isManager = false }) => {
  const {
    totalStudents,
    studentsGrowth,
    roomsOccupied,
    totalRooms,
    occupancyRate,
    pendingPayments,
    studentsWithDues,
    monthlyRevenue,
    revenueGrowth,
    totalRevenue = 0,
    pendingAmount = 0,
    totalPayments = 0,
    verifiedPayments = 0,
    pendingVerification = 0
  } = stats;

  const statCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'blue',
      subtitle: studentsGrowth > 0 ? `+${studentsGrowth} this month` : 'No change',
      trend: studentsGrowth > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Room Occupancy',
      value: `${roomsOccupied}/${totalRooms}`,
      icon: Building,
      color: 'green',
      subtitle: `${occupancyRate}% occupied`,
      trend: occupancyRate > 80 ? 'up' : occupancyRate > 50 ? 'neutral' : 'down'
    },
    {
      title: 'Total Payments',
      value: totalPayments,
      icon: CreditCard,
      color: 'purple',
      subtitle: `${verifiedPayments} verified`,
      trend: verifiedPayments > pendingVerification ? 'up' : 'neutral'
    },
    {
      title: 'Verified Revenue',
      value: formatIndianCurrency(totalRevenue),
      icon: CheckCircle,
      color: 'green',
      subtitle: pendingAmount > 0 ? `${formatIndianCurrency(pendingAmount)} pending` : 'All verified',
      trend: totalRevenue > 0 ? 'up' : 'neutral'
    }
  ];

  // Add manager-specific stats
  if (isManager) {
    statCards.push({
      title: 'Students with Dues',
      value: studentsWithDues,
      icon: AlertCircle,
      color: 'orange',
      subtitle: studentsWithDues > 0 ? 'Requires attention' : 'All up to date',
      trend: studentsWithDues === 0 ? 'up' : 'down'
    });
  } else {
    // Admin/Accountant specific stats
    statCards.push(
      {
        title: 'Pending Verification',
        value: pendingVerification,
        icon: Clock,
        color: 'orange',
        subtitle: pendingVerification > 0 ? 'Needs review' : 'All verified',
        trend: pendingVerification === 0 ? 'up' : 'down'
      },
      {
        title: 'Monthly Revenue',
        value: formatIndianCurrency(monthlyRevenue),
        icon: TrendingUp,
        color: 'blue',
        subtitle: revenueGrowth >= 0 ? `+${formatIndianCurrency(Math.abs(revenueGrowth))} growth` : `${formatIndianCurrency(Math.abs(revenueGrowth))} decline`,
        trend: revenueGrowth >= 0 ? 'up' : 'down'
      },
      {
        title: 'Outstanding Dues',
        value: formatIndianCurrency(pendingPayments),
        icon: IndianRupee,
        color: 'red',
        subtitle: `${studentsWithDues} students`,
        trend: pendingPayments === 0 ? 'up' : 'down'
      }
    );
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-500';
      case 'green': return 'text-green-500';
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      case 'purple': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.slice(0, isManager ? 5 : 8).map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <IconComponent className={`h-5 w-5 ${getIconColor(stat.color)}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className={`text-xs ${getTrendColor(stat.trend)}`}>
                  {stat.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
