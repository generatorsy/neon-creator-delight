import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
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
  
  // Get text lines - either from newline character or split by algorithm
  const getTextLines = () => {
    // If text contains newline, use that for splitting
    if (text.includes('\n')) {
      return text.split('\n');
    }
    
    // Otherwise fall back to the algorithm
    if (enableTwoLines && text.length > 20) {
      // Try to find a space to break naturally
      const spaceIndex = text.substring(0, 20).lastIndexOf(' ');
      if (spaceIndex > 0) {
        return [
          text.substring(0, spaceIndex),
          text.substring(spaceIndex + 1)
        ];
      } else {
        // If no space found, just split at 20 chars
        return [
          text.substring(0, 20),
          text.substring(20)
        ];
      }
    }
    
    // Single line
    return [text];
  };
  
  const textLines = getTextLines();
  
  // Calculate the scale factor based on the width
  // Adjust the scale factor based on total text length to fix height scaling
  const textLength = text.length;
  let scaleFactor = width / maxWidth;
  
  // If text is longer, make it proportionally smaller
  if (textLength > 20 && !enableTwoLines) {
    scaleFactor *= 20 / textLength;
  }
  
  // If using two lines, adjust the scale factor differently
  if (textLines.length > 1) {
    const maxLineLength = Math.max(...textLines.map(line => line.length));
    if (maxLineLength > 15) {
      scaleFactor *= 15 / maxLineLength;
    }
  }
  
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
            "text-white tracking-wide transition-all duration-300 text-7xl md:text-8xl lg:text-9xl",
            "text-center py-1"
          )}
          style={{ 
            fontFamily: font,
            // Explicitly set the font to ensure it applies
            font: `normal normal 700 7rem/${textLines.length > 1 ? '1.2' : '1'} "${font}", sans-serif`
          }}
        >
          {renderTextWithLetters(line, lineIndex)}
        </div>
      ))}
    </div>
  );
};

export default NeonText;
