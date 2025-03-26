
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
    return {};
  };

  const getBackgroundClass = () => {
    if (background === 'custom') return '';
    
    const backgroundMap: Record<string, string> = {
      dark: 'bg-black',
      brick: 'bg-[#2c1e1e]',
      concrete: 'bg-[#343434]',
      wood: 'bg-[#3b2a1a]',
      blue: 'bg-[#121826]',
    };
    
    return backgroundMap[background] || 'bg-black';
  };

  // Calculate the aspect ratio for the preview
  const calculatedRatio = height / width;
  const previewHeight = Math.min(300, 800 * calculatedRatio);

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
              maxHeight: '300px',
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
