
import React from 'react';
import { cn } from '@/lib/utils';
import NeonText from './NeonText';
import BackgroundSelector from './BackgroundSelector';
import { Card } from '@/components/ui/card';
import { Ruler, LightbulbOff, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NeonPreviewProps = {
  text: string;
  font: string;
  color: string;
  letterColors: Record<number, string>;
  isGlowing: boolean;
  width: number;
  height: number;
  background: string;
  customBackgroundUrl: string | null;
  onSelectBackground: (bgId: string) => void;
  onCustomBackgroundChange: (url: string | null) => void;
  onToggleGlow: () => void;
  onLetterColorChange?: (index: number, color: string) => void;
  enableTwoLines: boolean;
};

const NeonPreview = ({
  text,
  font,
  color,
  letterColors,
  isGlowing,
  width,
  height,
  background,
  customBackgroundUrl,
  onSelectBackground,
  onCustomBackgroundChange,
  onToggleGlow,
  onLetterColorChange,
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
  
  // Convert to inches for display
  const widthInches = (width / 2.54).toFixed(1);
  const heightInches = (height / 2.54).toFixed(1);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <Card className="p-6 neo-blur overflow-hidden">
        <div className="flex flex-col space-y-4">
          <div 
            className={cn(
              "w-full rounded-lg overflow-hidden transition-all duration-300 flex items-center justify-center relative", 
              getBackgroundClass()
            )}
            style={{
              ...getBackgroundStyle(),
              height: `${previewHeight}px`,
            }}
          >
            {/* Toggle Glow Button in the top right corner */}
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm" 
              onClick={onToggleGlow}
              title={isGlowing ? "Wyłącz świecenie" : "Włącz świecenie"}
            >
              {isGlowing ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
            </Button>
            
            <div className="p-6 w-full h-full flex items-center justify-center relative">
              {/* Height measurement on the left - styled like the reference image */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center h-3/4">
                <div className="flex flex-col items-center">
                  {/* Vertical line */}
                  <div className="w-px h-full bg-white/60 relative">
                    {/* Top cap */}
                    <div className="absolute -top-2 left-0 w-4 h-px bg-white/60 -translate-x-1/2"></div>
                    {/* Bottom cap */}
                    <div className="absolute -bottom-2 left-0 w-4 h-px bg-white/60 -translate-x-1/2"></div>
                  </div>
                  {/* Height text */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 transform -rotate-90 whitespace-nowrap">
                    <span className="text-xs text-white bg-black/70 px-1 py-0.5 rounded">
                      {height.toFixed(2)}cm / {heightInches}in
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Width measurement at the bottom - styled like the reference image */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center w-3/4">
                <div className="flex flex-col items-center">
                  {/* Horizontal line */}
                  <div className="h-px w-full bg-white/60 relative">
                    {/* Left cap */}
                    <div className="absolute top-0 -left-2 h-4 w-px bg-white/60 -translate-y-1/2"></div>
                    {/* Right cap */}
                    <div className="absolute top-0 -right-2 h-4 w-px bg-white/60 -translate-y-1/2"></div>
                  </div>
                  {/* Width text */}
                  <span className="text-xs text-white bg-black/70 px-1 py-0.5 rounded mt-1">
                    {width.toFixed(2)}cm / {widthInches}in
                  </span>
                </div>
              </div>
              
              <NeonText 
                text={text || 'Twój tekst'}
                font={font}
                color={color}
                letterColors={letterColors}
                isGlowing={isGlowing}
                width={width}
                maxWidth={90} // Reduced to make text larger
                onLetterColorChange={onLetterColorChange}
                enableTwoLines={enableTwoLines}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Szerokość: {width.toFixed(2)} cm</span>
            <span>Wysokość: {height.toFixed(2)} cm</span>
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
