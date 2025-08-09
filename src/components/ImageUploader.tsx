import { useState } from 'react';
import { Upload, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageLoad: (imageData: ImageData) => void;
  className?: string;
}

export function ImageUploader({ onImageLoad, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setError(null);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      onImageLoad(imageData);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <Card className={cn("relative", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop an image here, or click to select
        </p>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
        
        <Button asChild className="cursor-pointer">
          <label htmlFor="image-upload">
            Select Image
          </label>
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Images will be automatically resized to 64×64 pixels
        </p>
      </div>
      
      {error && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm flex items-center gap-2">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}