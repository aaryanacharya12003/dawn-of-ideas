
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedProps {
  pgId?: string; // Optional pgId for filtering activities by PG
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ pgId }) => {
  const { rooms, pgs } = useData();
  const { user } = useAuth();
  
  // Generate activity feed items from actual connected data
  const activityItems = useMemo(() => {
    // Filter rooms by pgId if provided (for managers)
    const filteredRooms = pgId 
      ? rooms.filter(room => room.pgId === pgId)
      : rooms;
    
    // Get PG name for display
    const getPGName = (roomPgId: string) => {
      const pg = pgs.find(p => p.id === roomPgId);
      return pg?.name || 'Unknown PG';
    };
    
    const allPayments = filteredRooms.flatMap(room =>
      room.students.flatMap(student =>
        student.payments.map(payment => ({
          id: payment.id,
          type: 'payment',
          date: new Date(payment.date),
          studentName: student.name,
          roomNumber: room.number,
          pgName: getPGName(room.pgId || ''),
          amount: payment.amount,
          mode: payment.mode
        }))
      )
    );
    
    // Sort by date, most recent first
    const sortedItems = allPayments.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Take only the 5 most recent items
    return sortedItems.slice(0, 5);
  }, [rooms, pgs, pgId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityItems.length > 0 ? (
          activityItems.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              {getActivityIcon(activity.type)}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Payment of ₹{activity.amount.toLocaleString()} received from {activity.studentName}
                </p>
                <div className="flex text-xs text-muted-foreground">
                  <p>{activity.pgName} • Room {activity.roomNumber} • {activity.mode} • </p>
                  <time className="ml-1" dateTime={activity.date.toISOString()}>
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                  </time>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity to display</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
