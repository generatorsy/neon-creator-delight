
import React from 'react';
import { cn } from '@/lib/utils';

type NeonTextProps = {
  text: string;
  font: string;
  color: string;
  isGlowing: boolean;
  width: number;
  maxWidth: number;
  enableTwoLines: boolean;
};

const NeonText = ({ text, font, color, isGlowing, width, maxWidth, enableTwoLines }: NeonTextProps) => {
  // Split text into two lines if enabled
  const getTextLines = () => {
    if (!enableTwoLines || text.length <= 20) {
      return [text];
    }
    
    // Try to find a space to break naturally
    const spaceIndex = text.substring(0, 20).lastIndexOf(' ');
    if (spaceIndex > 0) {
      return [
        text.substring(0, spaceIndex),
        text.substring(spaceIndex + 1, Math.min(text.length, spaceIndex + 21))
      ];
    } else {
      // If no space found, just split at 20 chars
      return [
        text.substring(0, 20),
        text.substring(20, Math.min(text.length, 40))
      ];
    }
  };

  const textLines = getTextLines();
  
  // Calculate the scale factor based on the width
  const scaleFactor = width / maxWidth;
  
  // Set the neon color as a CSS variable
  const neonColorVar = {
    '--neon-color': color
  } as React.CSSProperties;
  
  // Debug the selected font
  console.log('Font selected:', font);

  return (
    <div 
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ transform: `scale(${scaleFactor})`, ...neonColorVar }}
    >
      {textLines.map((line, index) => (
        <div 
          key={index}
          className={cn(
            "text-white tracking-wide transition-all duration-300 text-5xl md:text-6xl lg:text-7xl",
            isGlowing ? "neon-text animate-flicker" : "",
            "text-center py-1"
          )}
          style={{ 
            fontFamily: font
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export default NeonText;
