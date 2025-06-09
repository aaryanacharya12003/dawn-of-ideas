
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, Building, User, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface QuickActionPanelProps {
  onAddRoomClick?: () => void;
}

const QuickActionPanel: React.FC<QuickActionPanelProps> = ({ onAddRoomClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is not a manager
  const isAdmin = user?.role === 'admin';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onAddRoomClick}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add Room
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate('/students/add')}
        >
          <User className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate('/payments')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
        
        {/* Only show Add PG option for admin users */}
        {isAdmin && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/pg-management')}
          >
            <Building className="mr-2 h-4 w-4" />
            Add PG
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionPanel;
