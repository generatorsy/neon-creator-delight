
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { splitTextIntoLines } from '@/utils/textMeasurement';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type NeonTextProps = {
  text: string;
  font: string;
  color: string;
  letterColors?: Record<number, string>;
  isGlowing: boolean;
  width: number;
  maxWidth: number;
  enableTwoLines: boolean;
  onLetterColorChange?: (index: number, color: string) => void;
};

const NEON_COLORS = [
  { name: 'Biały', value: '#fff6e0' },
  { name: 'Czerwony', value: '#ea384c' },
  { name: 'Niebieski', value: '#0EA5E9' },
  { name: 'Zielony', value: '#4CAF50' },
  { name: 'Różowy', value: '#D946EF' },
  { name: 'Pomarańczowy', value: '#F97316' },
  { name: 'Fioletowy', value: '#8B5CF6' },
  { name: 'Żółty', value: '#FACC15' },
];

const NeonText = ({ 
  text, 
  font, 
  color, 
  letterColors = {}, 
  isGlowing, 
  width, 
  maxWidth, 
  enableTwoLines,
  onLetterColorChange 
}: NeonTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get text lines from the utility function
  const textLines = splitTextIntoLines(enableTwoLines ? text : text);
  
  // Calculate the scale factor based on the width - increased size by reducing maxWidth
  const scaleFactor = width / maxWidth;
  
  // Use effect to apply font loading check
  useEffect(() => {
    // Log when the component renders with a specific font
    console.log('NeonText rendered with font:', font);
  }, [font]);

  // Function to render individual letters as separate elements
  const renderTextWithLetters = (line: string, lineIndex: number) => {
    return [...line].map((letter, index) => {
      // Calculate the global index of the letter
      const globalIndex = lineIndex === 0 
        ? index 
        : textLines[0].length + index;
      
      // Get the specific color for this letter or fallback to the global color
      const letterColor = letterColors[globalIndex] || color;
      
      // Set the neon color as a CSS variable
      const neonColorVar = {
        '--neon-color': letterColor
      } as React.CSSProperties;

      return (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <span 
              className={cn(
                "inline-block transition-all duration-300 cursor-pointer hover:scale-110",
                isGlowing ? "neon-text animate-flicker" : ""
              )}
              style={neonColorVar}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </DropdownMenuTrigger>
          {onLetterColorChange && (
            <DropdownMenuContent>
              {NEON_COLORS.map((neonColor) => (
                <DropdownMenuItem
                  key={neonColor.value}
                  onClick={() => onLetterColorChange(globalIndex, neonColor.value)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: neonColor.value }}
                  />
                  {neonColor.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ transform: `scale(${scaleFactor})` }}
    >
      {textLines.map((line, lineIndex) => (
        <div 
          key={lineIndex}
          className={cn(
            "text-white tracking-wide transition-all duration-300 text-6xl md:text-7xl lg:text-8xl",
            "text-center py-1"
          )}
          style={{ 
            fontFamily: font,
            // Explicitly set the font to ensure it applies
            font: `normal normal 700 6rem/${enableTwoLines ? '1.2' : '1'} "${font}", sans-serif`
          }}
        >
          {renderTextWithLetters(line, lineIndex)}
        </div>
      ))}
    </div>
  );
};

export default NeonText;
