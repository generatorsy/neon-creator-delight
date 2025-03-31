
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Image, Upload } from 'lucide-react';

// Updated backgrounds with URLs instead of colors
const backgrounds = [
  { 
    id: 'living', 
    label: 'Salon', 
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    id: 'bedroom', 
    label: 'Sypialnia', 
    imageUrl: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    id: 'office', 
    label: 'Biuro', 
    imageUrl: 'https://images.unsplash.com/photo-1498409785966-ab341407de6e?q=80&w=2069&auto=format&fit=crop' 
  },
  { 
    id: 'brick', 
    label: 'Cegła', 
    imageUrl: 'https://images.unsplash.com/photo-1595514535215-9a5e0e8e04be?q=80&w=1974&auto=format&fit=crop' 
  },
  { 
    id: 'dark', 
    label: 'Ciemna Ściana', 
    imageUrl: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop' 
  },
];

type BackgroundSelectorProps = {
  selectedBackground: string;
  onSelectBackground: (bgId: string) => void;
  customBackgroundUrl: string | null;
  onCustomBackgroundChange: (url: string | null) => void;
};

const BackgroundSelector = ({ 
  selectedBackground, 
  onSelectBackground, 
  customBackgroundUrl, 
  onCustomBackgroundChange 
}: BackgroundSelectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onCustomBackgroundChange(e.target.result as string);
          onSelectBackground('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-3">
      <div className="text-sm font-medium mb-2">Wybierz tło</div>
      <div className="flex flex-wrap gap-2">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelectBackground(bg.id)}
            className={cn(
              'w-10 h-10 rounded-md transition-all duration-200 hover:scale-105 overflow-hidden',
              selectedBackground === bg.id ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
            )}
            aria-label={bg.label}
            title={bg.label}
            style={{
              backgroundImage: `url(${bg.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        
        {/* Custom background button */}
        <button
          onClick={handleUploadClick}
          className={cn(
            'w-10 h-10 rounded-md bg-muted flex items-center justify-center',
            'transition-all duration-200 hover:scale-105',
            selectedBackground === 'custom' ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
          )}
          aria-label="Własne tło"
          title="Własne tło"
          style={
            selectedBackground === 'custom' && customBackgroundUrl
              ? {
                  backgroundImage: `url(${customBackgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          {!(selectedBackground === 'custom' && customBackgroundUrl) && <Upload size={16} />}
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default BackgroundSelector;
