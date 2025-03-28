import React, { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { splitTextIntoLines } from '@/utils/textMeasurement';

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
  // Dodanie referencji do kontenera tekstu
  containerRef?: React.RefObject<HTMLDivElement>;
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

// Maksymalna długość linii dla bezpieczeństwa
const MAX_LINE_LENGTH = 30;

const NeonText = ({ 
  text, 
  font, 
  color, 
  letterColors = {}, 
  isGlowing, 
  width, 
  maxWidth, 
  enableTwoLines,
  onLetterColorChange,
  containerRef: externalRef
}: NeonTextProps) => {
  // Użyj zewnętrznej referencji lub utwórz własną wewnętrzną
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || internalRef;
  
  // Bezpieczny tekst - obsługa null, undefined, i ograniczenie długości
  const safeText = useMemo(() => {
    if (!text) return 'Twój tekst';
    return text.substring(0, 40); // Zapewnienie maksymalnej długości
  }, [text]);
  
  // Uzyskaj linie tekstu z funkcji pomocniczej - używamy memo dla wydajności
  const textLines = useMemo(() => {
    // Jeśli tekst zawiera znak nowej linii, użyj tego do podziału
    if (safeText.includes('\n')) {
      const lines = safeText.split('\n');
      // Ogranicz długość każdej linii
      return [
        lines[0]?.substring(0, MAX_LINE_LENGTH) || '',
        lines[1]?.substring(0, MAX_LINE_LENGTH) || ''
      ];
    }
    
    // W przeciwnym razie, jeśli tryb dwóch linii jest włączony, użyj funkcji pomocniczej
    if (enableTwoLines) {
      return splitTextIntoLines(safeText).map(line => 
        line.substring(0, MAX_LINE_LENGTH)
      );
    }
    
    // Jedna linia
    return [safeText];
  }, [safeText, enableTwoLines]);
  
  // Oblicz współczynnik skali na podstawie wymiarów i fontów
  const scaleFactor = useMemo(() => {
    try {
      // Bazowy współczynnik skali
      let factor = width / maxWidth;
      
      // Dostosuj w zależności od czcionki
      const fontAdjustments: Record<string, number> = {
        'Arial': 0.95,
        'Georgia': 0.9,
        'Verdana': 0.85,
        'Times New Roman': 0.92,
        'Courier New': 0.88
      };
      
      // Zastosuj dostosowanie specyficzne dla czcionki
      const fontAdjustment = fontAdjustments[font] || 1.0;
      factor *= fontAdjustment;
      
      // Dostosuj współczynnik w zależności od trybu linii i długości tekstu
      const totalLength = textLines.reduce((sum, line) => sum + line.length, 0);
      
      // Dostosuj współczynnik dla długich tekstów
      if (totalLength > 20 && textLines.length === 1) {
        // Liniowo zmniejszaj współczynnik dla dłuższych tekstów
        const lengthAdjustment = Math.max(0.7, 1 - (totalLength - 20) * 0.02);
        factor *= lengthAdjustment;
      }
      
      // Dodatkowe dostosowanie dla trybu dwóch linii
      if (textLines.length > 1) {
        // Jeśli mamy dwie linie, zmniejsz skalę, aby wszystko się zmieściło
        factor *= 0.85;
        
        // Dostosuj skalę w zależności od najdłuższej linii
        const maxLineLength = Math.max(...textLines.map(line => line.length));
        if (maxLineLength > 15) {
          // Liniowo zmniejszaj współczynnik dla dłuższych linii
          factor *= Math.max(0.75, 1 - (maxLineLength - 15) * 0.015);
        }
      }
      
      // Ogranicz współczynnik skali do rozsądnego zakresu
      return Math.min(Math.max(factor, 0.3), 2.0);
    } catch (error) {
      console.error('Błąd obliczania współczynnika skali:', error);
      return width / maxWidth; // Bezpieczna wartość domyślna
    }
  }, [width, maxWidth, font, textLines]);
  
  // Log do debugowania
  useEffect(() => {
    console.log('NeonText renderowany z czcionką:', font);
    console.log('Współczynnik skali:', scaleFactor, 'dla tekstu:', safeText);
  }, [font, scaleFactor, safeText]);
  
  // Funkcja do renderowania pojedynczych liter jako oddzielnych elementów
  const renderTextWithLetters = (line: string, lineIndex: number) => {
    // Zabezpieczenie przed błędami - użyj bezpiecznej wersji linii
    const safeLine = line || '';
    
    // Ogranicz liczbę renderowanych liter dla wydajności
    return [...safeLine].map((letter, index) => {
      try {
        // Oblicz globalny indeks litery
        const globalIndex = lineIndex === 0 
          ? index 
          : (textLines[0]?.length || 0) + index;
        
        // Pobierz określony kolor dla tej litery lub domyślny kolor globalny
        const letterColor = letterColors[globalIndex] || color;
        
        // Ustaw kolor neonu jako zmienną CSS
        const neonColorVar = {
          '--neon-color': letterColor
        } as React.CSSProperties;

        return (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger asChild>
              <span 
                className={cn(
                  "inline-block transition-all duration-300 cursor-pointer hover:scale-110",
                  isGlowing ? "neon-text-effect" : "no-glow"
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
      } catch (error) {
        // Obsługa błędów renderowania pojedynczych liter
        console.error('Błąd renderowania litery:', error);
        return <span key={index}>{letter === ' ' ? '\u00A0' : letter}</span>;
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center relative"
      style={{ 
        // Używamy width i height zamiast transform: scale() dla przewidywalnego układu
        width: 'fit-content',
        minWidth: '40px'
      }}
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
            // Jawnie ustaw czcionkę, aby zapewnić jej zastosowanie
            font: `normal normal 700 7rem/${textLines.length > 1 ? '1.2' : '1'} "${font}", sans-serif`,
            // Dodaj opcje zawijania tekstu i obsługi przepełnienia
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}
        >
          {renderTextWithLetters(line, lineIndex)}
        </div>
      ))}
    </div>
  );
};

export default NeonText;
