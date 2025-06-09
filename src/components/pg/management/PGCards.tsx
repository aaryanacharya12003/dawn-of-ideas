
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { PG } from '@/types';

interface PGCardsProps {
  pgs: PG[];
  onView: (pg: PG) => void;
  onEdit: (pg: PG) => void;
  onDelete: (pg: PG) => void;
  showDeleteButton?: boolean;
}

const PGCards: React.FC<PGCardsProps> = ({
  pgs,
  onView,
  onEdit,
  onDelete,
  showDeleteButton = true
}) => {
  const getTypeBadge = (type: string) => {
    const colors = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      unisex: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {pgs.map((pg) => (
        <Card key={pg.id} className="overflow-hidden">
          <CardContent className="p-0">
            {pg.images && pg.images.length > 0 ? (
              <img 
                src={pg.images[0]} 
                alt={pg.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <Building className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{pg.name}</h3>
                  <Badge className={getTypeBadge(pg.type)}>
                    {pg.type.charAt(0).toUpperCase() + pg.type.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{pg.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{pg.totalRooms} rooms • {pg.occupancyRate}% occupied</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(pg)}>
                  <Eye className="h-4 w-4 mr-1" />View
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(pg)}>
                  <Edit className="h-4 w-4 mr-1" />Edit
                </Button>
                {showDeleteButton && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive" 
                    onClick={() => onDelete(pg)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PGCards;
