
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { splitTextIntoLines } from '@/utils/textMeasurement';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get text lines from the utility function
  const textLines = splitTextIntoLines(enableTwoLines ? text : text);
  
  // Calculate the scale factor based on the width
  const scaleFactor = width / maxWidth;
  
  // Set the neon color as a CSS variable
  const neonColorVar = {
    '--neon-color': color
  } as React.CSSProperties;
  
  // Debug the selected font
  console.log('Font selected:', font);

  // Use effect to apply font loading check
  useEffect(() => {
    // Log when the component renders with a specific font
    console.log('NeonText rendered with font:', font);
  }, [font]);

  return (
    <div 
      ref={containerRef}
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
            fontFamily: font,
            // Explicitly set the font to ensure it applies
            font: `normal normal 700 5rem/${enableTwoLines ? '1.2' : '1'} "${font}", sans-serif`
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export default NeonText;
