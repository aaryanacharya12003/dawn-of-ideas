
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PGFormImageGalleryProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const PGFormImageGallery: React.FC<PGFormImageGalleryProps> = ({ images, setImages }) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const files = Array.from(e.target.files);
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    
    files.forEach(file => {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 2MB size limit`,
          variant: "destructive"
        });
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.onerror = () => {
          toast({
            title: "Error reading file",
            description: `Failed to process ${file.name}`,
            variant: "destructive"
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        toast({
          title: "Error",
          description: `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    });

    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Images</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img 
              src={image} 
              alt={`PG Image ${index+1}`} 
              className="w-full h-24 object-cover rounded-md"
            />
            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemoveImage(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="border border-dashed border-gray-300 rounded-md flex items-center justify-center h-24">
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
            <Plus className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add Image</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              multiple
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default PGFormImageGallery;
