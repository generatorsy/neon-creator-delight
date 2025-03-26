
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Image, Upload } from 'lucide-react';

const backgrounds = [
  { id: 'dark', label: 'Ciemna Ściana', color: 'bg-black' },
  { id: 'brick', label: 'Cegła', color: 'bg-[#2c1e1e]' },
  { id: 'concrete', label: 'Beton', color: 'bg-[#343434]' },
  { id: 'wood', label: 'Drewno', color: 'bg-[#3b2a1a]' },
  { id: 'blue', label: 'Niebieski', color: 'bg-[#121826]' },
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
              'w-10 h-10 rounded-md transition-all duration-200 hover:scale-105',
              bg.color,
              selectedBackground === bg.id ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
            )}
            aria-label={bg.label}
            title={bg.label}
          />
        ))}
        
        <button
          onClick={handleUploadClick}
          className={cn(
            'w-10 h-10 rounded-md bg-muted flex items-center justify-center',
            'transition-all duration-200 hover:scale-105',
            selectedBackground === 'custom' ? 'ring-2 ring-white' : 'ring-1 ring-white/20'
          )}
          aria-label="Własne tło"
          title="Własne tło"
        >
          <Upload size={16} />
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
