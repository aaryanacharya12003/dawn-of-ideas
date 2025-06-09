
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Sample calendar events
const events = [
  { date: new Date(2025, 4, 14), type: 'check-in', title: 'Sanjay Kumar - Room 201' },
  { date: new Date(2025, 4, 15), type: 'check-out', title: 'Meera Shah - Room 305' },
  { date: new Date(2025, 4, 16), type: 'maintenance', title: 'Room 402 - AC Repair' },
  { date: new Date(2025, 4, 20), type: 'check-in', title: 'Rohit Patel - Room 103' },
  { date: new Date(2025, 4, 22), type: 'check-out', title: 'Neha Verma - Room 206' },
  { date: new Date(2025, 4, 25), type: 'lease-expiry', title: '5 Lease Expirations' },
];

const DashboardCalendar: React.FC = () => {
  // Returns event for a particular date if it exists
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Custom day render function to show event indicators
  const renderDayContent = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (!dayEvents.length) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.map((event, i) => (
                <span 
                  key={i}
                  className={`block h-1.5 w-1.5 rounded-full ${
                    event.type === 'check-in' ? 'bg-green-500' :
                    event.type === 'check-out' ? 'bg-red-500' :
                    event.type === 'maintenance' ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {dayEvents.map((event, i) => (
                <div key={i} className="text-xs">
                  <Badge 
                    variant="outline"
                    className={`mr-1 ${
                      event.type === 'check-in' ? 'bg-green-100 text-green-800 border-green-200' :
                      event.type === 'check-out' ? 'bg-red-100 text-red-800 border-red-200' :
                      event.type === 'maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {event.type === 'check-in' ? 'Check-in' : 
                     event.type === 'check-out' ? 'Check-out' : 
                     event.type === 'maintenance' ? 'Maintenance' : 
                     'Lease Expiry'}
                  </Badge>
                  {event.title}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // List of upcoming events
  const upcomingEvents = events.filter(event => event.date >= new Date()).slice(0, 5);
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <Calendar
          className="rounded-md border"
          components={{
            DayContent: (props) => {
              const date = props.date;
              return (
                <div className="relative h-9 w-9 p-0 flex items-center justify-center">
                  {date.getDate()}
                  {renderDayContent(date)}
                </div>
              );
            },
          }}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-base mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg">
              <div className="flex items-center justify-center rounded-full w-10 h-10 bg-white border">
                <span className="font-medium">{event.date.getDate()}</span>
              </div>
              <div>
                <Badge 
                  variant="outline"
                  className={`
                    ${event.type === 'check-in' ? 'bg-green-100 text-green-800 border-green-200' :
                      event.type === 'check-out' ? 'bg-red-100 text-red-800 border-red-200' :
                      event.type === 'maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }
                  `}
                >
                  {event.type === 'check-in' ? 'Check-in' : 
                   event.type === 'check-out' ? 'Check-out' : 
                   event.type === 'maintenance' ? 'Maintenance' : 
                   'Lease Expiry'}
                </Badge>
                <p className="text-sm mt-1">{event.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
