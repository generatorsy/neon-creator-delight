
import React, { useState, useEffect, useRef } from 'react';
import { 
  calculateHeightForWidth, 
  exceedsMaxHeight, 
  calculatePathLengthForText,
  measureTextInCm
} from '@/utils/textMeasurement';
import CustomQuoteDialog from '@/components/CustomQuoteDialog';
import NeonDesigner from '@/components/NeonDesigner';

const Index = () => {
  // State variables
  const [text, setText] = useState('Twój tekst');
  const [font, setFont] = useState('Arial');
  const [neonColor, setNeonColor] = useState('#fff6e0'); // Warm white by default
  const [letterColors, setLetterColors] = useState<Record<number, string>>({}); // State for letter colors
  const [width, setWidth] = useState(60); // Default width in cm
  const [height, setHeight] = useState(20); // Will be calculated based on font and text
  const [isGlowing, setIsGlowing] = useState(true);
  const [background, setBackground] = useState('dark');
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [enableTwoLines, setEnableTwoLines] = useState(false);
  const [pathLength, setPathLength] = useState(0); // State for path length
  
  // Dialog state
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Referencja do komponentu dla wymuszenia przerenderowania miar
  const forceUpdateRef = useRef(0);

  // Calculate height based on the text, font and width using SVG/Canvas API
  useEffect(() => {
    try {
      // Check if text contains newline to enable two lines mode
      const containsNewline = text.includes('\n');
      if (containsNewline && !enableTwoLines) {
        setEnableTwoLines(true);
      }
      
      // Pobierz rzeczywisty bounding box tekstu (najmniejszy prostokąt zawierający tekst)
      const fontSize = 72; // Duży rozmiar dla dokładnych pomiarów
      
      // Użyj ulepszonej funkcji pomiarowej, która zwraca dokładne wymiary
      const measurements = measureTextInCm(
        text || 'Twój tekst',
        font,
        fontSize
      );
      
      // Pobierz naturalne proporcje tekstu (stosunek wysokości do szerokości)
      const naturalWidth = measurements.boundingBox.width;
      const naturalHeight = measurements.boundingBox.height;
      
      // Oblicz współczynnik proporcji (stosunek wysokości do szerokości)
      const aspectRatio = naturalHeight / naturalWidth;
      
      // Oblicz wysokość na podstawie szerokości i współczynnika proporcji
      // To jest kluczowa zmiana - wysokość jest proporcjonalna do szerokości
      let calculatedHeight = width * aspectRatio;
      
      // Dostosuj współczynnik proporcji dla różnych czcionek
      const fontFactors = {
        'Arial': 1.0,
        'Times New Roman': 0.9,
        'Courier New': 1.0,
        'Georgia': 0.95,
        'Verdana': 1.05,
        'default': 1.0
      };
      
      const fontFactor = fontFactors[font] || fontFactors['default'];
      calculatedHeight *= fontFactor;
      
      // Uwzględnij specjalne przypadki
      if (enableTwoLines || containsNewline) {
        // Dla dwóch linii zwiększ wysokość o 50-100% w zależności od tekstu
        calculatedHeight *= 1.7;
      }
      
      // Dla krótkich tekstów (1-2 znaki) dodatkowe dostosowanie
      if (text.length <= 2) {
        if (/^[Il|1\-]+$/.test(text)) {
          // Dla wąskich, wysokich znaków
          calculatedHeight = width * 0.8 * fontFactor;
        } else if (/^[oO0]+$/.test(text)) {
          // Dla okrągłych znaków - prawie kwadratowy kształt
          calculatedHeight = width * 0.9 * fontFactor;
        }
      }
      
      // Ustaw wysokość bez arbitralnego minimum (minimalna wysokość proporcjonalna do szerokości)
      const minimumHeight = width * 0.05; // 5% szerokości jako absolutne minimum
      const newHeight = Math.max(minimumHeight, calculatedHeight);
      
      setHeight(newHeight);
      
      // Check if exceeds maximum height
      const isExceeding = exceedsMaxHeight(newHeight);
      setExceedsLimit(isExceeding);
      
      // Calculate path length with the updated function to consider actual dimensions
      const textPathLength = calculatePathLengthForText(
        text || 'Twój tekst',
        font,
        enableTwoLines || containsNewline,
        width,
        newHeight
      );
      setPathLength(textPathLength);
      
      // Wymuszenie przerenderowania linii pomiarowych
      forceUpdateRef.current += 1;
      
      console.log('Calculated dimensions:', {
        text,
        font,
        width: `${width}cm`,
        height: `${newHeight.toFixed(2)}cm`,
        pathLength: `${textPathLength.toFixed(1)}cm`,
        twoLines: enableTwoLines || containsNewline,
        exceedsLimit: isExceeding
      });
    } catch (error) {
      console.error('Error calculating dimensions:', error);
      // Fallback to simple calculation if canvas measurement fails
      const ratio = 0.5;
      const baseHeight = width * ratio;
      const calculatedHeight = enableTwoLines || text.includes('\n') ? baseHeight * 1.5 : baseHeight;
      setHeight(Math.max(10, calculatedHeight));
      // Estimate path length as 1.5x the width (rough approximation)
      setPathLength(width * 1.5);
    }
  }, [text, font, width, enableTwoLines]);

  // Calculate price based on width
  useEffect(() => {
    const pricePerCm = 20; // 20zł per cm
    setPrice(width * pricePerCm);
  }, [width]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto py-10 px-4 md:px-6 lg:px-8 max-w-6xl">
        <NeonDesigner 
          text={text}
          setText={setText}
          font={font}
          setFont={setFont}
          neonColor={neonColor}
          setNeonColor={setNeonColor}
          letterColors={letterColors}
          setLetterColors={setLetterColors}
          width={width}
          setWidth={setWidth}
          height={height}
          isGlowing={isGlowing}
          setIsGlowing={setIsGlowing}
          background={background}
          setBackground={setBackground}
          customBackgroundUrl={customBackgroundUrl}
          setCustomBackgroundUrl={setCustomBackgroundUrl}
          price={price}
          enableTwoLines={enableTwoLines}
          setEnableTwoLines={setEnableTwoLines}
          exceedsLimit={exceedsLimit}
          onCustomQuoteRequest={() => setShowContactDialog(true)}
          pathLength={pathLength}
        />
      </main>
      
      {/* Custom Quote Dialog */}
      <CustomQuoteDialog 
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        text={text}
        font={font}
        neonColor={neonColor}
        letterColors={letterColors}
        width={width}
        height={height}
        enableTwoLines={enableTwoLines}
      />
    </div>
  );
};

export default Index;
