
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatIndianCurrency } from '@/utils/formatCurrency';
import { format, differenceInDays, addDays } from 'date-fns';

interface DashboardChartsProps {
  showExtended?: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ showExtended = false }) => {
  const { rooms, pgs } = useData();

  // Calculate occupancy data for each month
  const occupancyData = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    
    const monthlyData = [];
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      
      const monthName = format(month, 'MMM');
      
      // Calculate historical occupancy (simplified simulation)
      const occupancyBase = 60 + Math.floor(Math.random() * 20); // Base occupancy between 60-80%
      const trend = i * 2; // Slight upward trend
      const occupancy = Math.min(occupancyBase + trend, 100); // Cap at 100%
      
      monthlyData.push({
        month: monthName,
        occupancy
      });
    }
    
    return monthlyData;
  }, []);
  
  // Calculate revenue data by PG
  const revenueData = useMemo(() => {
    if (!pgs.length) {
      return [];
    }
    
    // Get all rooms with their PG ID
    const pgRevenue = pgs.map(pg => {
      const pgRooms = rooms.filter(room => room.pgId === pg.id);
      const students = pgRooms.flatMap(room => room.students);
      const payments = students.flatMap(student => student.payments);
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        name: pg.name,
        value: totalRevenue,
        fill: pg.id === pgs[0].id ? '#8884d8' : 
              pg.id === pgs[1]?.id ? '#82ca9d' : '#ffc658'
      };
    });
    
    return pgRevenue;
  }, [pgs, rooms]);
  
  // Calculate lease expiry data
  const leaseExpiryData = useMemo(() => {
    const today = new Date();
    const nextSixMonths = [];
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(today);
      month.setMonth(today.getMonth() + i);
      
      const monthName = format(month, 'MMM');
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Count students with lease ending in this month
      const expiryCount = rooms.flatMap(room => room.students).filter(student => {
        const endDate = new Date(student.endDate);
        return endDate >= monthStart && endDate <= monthEnd;
      }).length;
      
      nextSixMonths.push({
        month: monthName,
        expiryCount
      });
    }
    
    return nextSixMonths;
  }, [rooms]);
  
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                <span>Occupancy Trend</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[200px] md:h-[250px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={occupancyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    unit="%" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Month
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].payload.month}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Occupancy
                                </span>
                                <span className="font-bold">
                                  {payload[0].value}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    name="Occupancy Rate" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Comparison Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                <span>Revenue Comparison</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[200px] md:h-[250px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => 
                      window.innerWidth > 500 ? `${name}: ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={window.innerWidth > 500}
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${formatIndianCurrency(value)}`, 'Revenue']}
                  />
                  <Legend
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extended Charts (shown when showExtended=true) */}
      {showExtended && (
        <div className="mt-6">
          {/* Lease Expiry Heatmap */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Lease Expiry Heatmap</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[200px] md:h-[250px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leaseExpiryData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      width={30}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} students`, 'Lease Expiry']}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                    <Bar 
                      dataKey="expiryCount"
                      name="Lease Expiry"
                      fill="#ffc658" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default DashboardCharts;
