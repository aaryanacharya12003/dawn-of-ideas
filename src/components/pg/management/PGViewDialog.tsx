
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Users, Building, Phone } from 'lucide-react';
import { PG } from '@/types';

interface PGViewDialogProps {
  selectedPG: PG;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (pg: PG) => void;
}

const PGViewDialog: React.FC<PGViewDialogProps> = ({
  selectedPG,
  open,
  onOpenChange,
  onEdit
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{selectedPG.name}</DialogTitle>
              <Badge className={`${getTypeBadge(selectedPG.type)} mt-2`}>
                {selectedPG.type.charAt(0).toUpperCase() + selectedPG.type.slice(1)} PG
              </Badge>
            </div>
            <Button onClick={() => onEdit(selectedPG)}>
              <Edit className="h-4 w-4 mr-2" />Edit PG
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Images */}
          {selectedPG.images && selectedPG.images.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedPG.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${selectedPG.name} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-sm text-muted-foreground">{selectedPG.location}</p>
                </div>
              </div>
              
              {selectedPG.contactInfo && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Contact:</span>
                    <span className="text-sm text-muted-foreground ml-2">{selectedPG.contactInfo}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Floors:</span>
                  <span className="text-sm text-muted-foreground ml-2">{selectedPG.floors}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Capacity & Occupancy */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Capacity & Occupancy</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Total Rooms:</span>
                  <span className="text-sm text-muted-foreground ml-2">{selectedPG.totalRooms}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Total Beds:</span>
                  <span className="text-sm text-muted-foreground ml-2">{selectedPG.totalBeds}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Occupancy Rate:</span>
                  <span className="text-sm text-muted-foreground ml-2">{selectedPG.occupancyRate}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Amenities */}
          {selectedPG.amenities && selectedPG.amenities.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPG.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Financial Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Monthly Rent:</span>
                <p className="text-sm text-muted-foreground">₹{selectedPG.monthlyRent}</p>
              </div>
              <div>
                <span className="font-medium">Total Revenue:</span>
                <p className="text-sm text-muted-foreground">₹{selectedPG.revenue}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PGViewDialog;
