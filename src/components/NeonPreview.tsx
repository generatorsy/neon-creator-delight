
import React from 'react';
import { cn } from '@/lib/utils';
import NeonText from './NeonText';
import BackgroundSelector from './BackgroundSelector';
import { Card } from '@/components/ui/card';

type NeonPreviewProps = {
  text: string;
  font: string;
  color: string;
  isGlowing: boolean;
  width: number;
  height: number;
  background: string;
  customBackgroundUrl: string | null;
  onSelectBackground: (bgId: string) => void;
  onCustomBackgroundChange: (url: string | null) => void;
  enableTwoLines: boolean;
};

const NeonPreview = ({
  text,
  font,
  color,
  isGlowing,
  width,
  height,
  background,
  customBackgroundUrl,
  onSelectBackground,
  onCustomBackgroundChange,
  enableTwoLines
}: NeonPreviewProps) => {
  const getBackgroundStyle = () => {
    if (background === 'custom' && customBackgroundUrl) {
      return {
        backgroundImage: `url(${customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    // Default background images showing rooms with empty walls
    const backgroundImages: Record<string, string> = {
      living: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop',
      bedroom: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?q=80&w=2070&auto=format&fit=crop',
      office: 'https://images.unsplash.com/photo-1498409785966-ab341407de6e?q=80&w=2069&auto=format&fit=crop',
      brick: 'https://images.unsplash.com/photo-1595514535215-9a5e0e8e04be?q=80&w=1974&auto=format&fit=crop',
      dark: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop',
    };
    
    if (backgroundImages[background]) {
      return {
        backgroundImage: `url(${backgroundImages[background]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    return {};
  };

  const getBackgroundClass = () => {
    if (background === 'custom' || ['living', 'bedroom', 'office', 'brick'].includes(background)) return '';
    
    const backgroundMap: Record<string, string> = {
      dark: 'bg-black',
      blue: 'bg-[#121826]',
    };
    
    return backgroundMap[background] || 'bg-black';
  };

  // Calculate the aspect ratio for the preview - making it taller
  const previewHeight = 400; // Fixed larger height

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <Card className="p-6 neo-blur overflow-hidden">
        <div className="flex flex-col space-y-4">
          <div 
            className={cn(
              "w-full rounded-lg overflow-hidden transition-all duration-300 flex items-center justify-center", 
              getBackgroundClass()
            )}
            style={{
              ...getBackgroundStyle(),
              height: `${previewHeight}px`,
            }}
          >
            <div className="p-6 w-full h-full flex items-center justify-center">
              <NeonText 
                text={text || 'Twój tekst'}
                font={font}
                color={color}
                isGlowing={isGlowing}
                width={width}
                maxWidth={120}
                enableTwoLines={enableTwoLines}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Szerokość: {width} cm</span>
            <span>Wysokość: {Math.round(height)} cm</span>
          </div>

          <BackgroundSelector
            selectedBackground={background}
            onSelectBackground={onSelectBackground}
            customBackgroundUrl={customBackgroundUrl}
            onCustomBackgroundChange={onCustomBackgroundChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default NeonPreview;
