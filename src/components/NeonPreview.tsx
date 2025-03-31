
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NeonText from './NeonText';
import BackgroundSelector from './BackgroundSelector';
import InfoPopup from './InfoPopup';
import { Card } from '@/components/ui/card';
import { Ruler, LightbulbOff, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define background image URLs in a central place to ensure consistency
export const backgroundImages: Record<string, string> = {
  living: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop',
  bedroom: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?q=80&w=2070&auto=format&fit=crop',
  office: 'https://images.unsplash.com/photo-1498409785966-ab341407de6e?q=80&w=2069&auto=format&fit=crop',
  brick: 'https://images.unsplash.com/photo-1595514535215-9a5e0e8e04be?q=80&w=1974&auto=format&fit=crop',
  dark: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=1932&auto=format&fit=crop',
};

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
  // Stan do kontroli, czy popup został już pokazany
  const [showedPopup, setShowedPopup] = useState<boolean>(false);
  
  // Sprawdź z localStorage, czy popup został już kiedyś pokazany
  useEffect(() => {
    const popupShown = localStorage.getItem('neonLetterColorPopupShown');
    if (popupShown) {
      setShowedPopup(true);
    } else {
      // Jeśli pokazujemy popup po raz pierwszy, zapisz to w localStorage
      setTimeout(() => {
        localStorage.setItem('neonLetterColorPopupShown', 'true');
      }, 7000); // Zapisz po czasie dłuższym niż czas wyświetlania popupu
    }
  }, []);
  
  // Referencja do tekstu do debugowania
  const textRef = useRef<HTMLDivElement>(null);
  const getBackgroundStyle = () => {
    if (background === 'custom' && customBackgroundUrl) {
      return {
        backgroundImage: `url(${customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
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
    if (background === 'custom' || Object.keys(backgroundImages).includes(background)) return '';
    
    const backgroundMap: Record<string, string> = {
      blue: 'bg-[#121826]',
    };
    
    return backgroundMap[background] || 'bg-black';
  };

  // Bezpieczne wartości dla height i width
  const safeHeight = useMemo(() => {
    // Ograniczamy wysokość do rozsądnego maksimum dla wizualizacji
    return Math.min(Math.max(height, 1), 100);
  }, [height]);
  
  const safeWidth = useMemo(() => {
    // Upewniamy się, że szerokość jest zawsze dodatnia i nie przekracza maksimum
    return Math.min(Math.max(width, 20), 120);
  }, [width]);
  
  // Oblicz wysokość podglądu, która zachowuje proporcje
  const previewHeight = useMemo(() => {
    // Bazowa wysokość
    const baseHeight = 400;
    
    // Dostosuj wysokość, jeśli neon ma nietypowe proporcje
    if (safeHeight > safeWidth * 0.8) {
      // Dla wysokich neonów zwiększamy wysokość podglądu
      return Math.min(500, baseHeight * (safeHeight / (safeWidth * 0.8)));
    }
    
    return baseHeight;
  }, [safeHeight, safeWidth]);
  
  // Oblicz wysokość dla miar (oś Y)
  const measureHeight = useMemo(() => {
    // Proporcjonalna do wysokości podglądu
    return previewHeight * 0.75;
  }, [previewHeight]);
  
  // Konwertuj na cale dla wyświetlania
  const widthInches = (safeWidth / 2.54).toFixed(1);
  const heightInches = (safeHeight / 2.54).toFixed(1);
  
  // Zaokrąglanie wymiarów dla czytelności
  const displayHeight = useMemo(() => {
    // Jeśli wysokość ma więcej niż 2 cyfry po przecinku, zaokrąglij do 1
    return safeHeight >= 10 ? safeHeight.toFixed(1) : safeHeight.toFixed(2);
  }, [safeHeight]);
  
  const displayWidth = useMemo(() => {
    // Zaokrąglij szerokość do 1 miejsca po przecinku
    return safeWidth.toFixed(1);
  }, [safeWidth]);

  // Obliczanie dokładnych wymiarów bez świecenia
  const realHeight = useMemo(() => {
    // Około 87% wysokości z efektem świecenia
    const realH = safeHeight * 0.87;
    return realH.toFixed(1);
  }, [safeHeight]);

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
            {/* InfoPopup - pokazujemy tylko jeśli użytkownik jeszcze go nie widział */}
            {!showedPopup && <InfoPopup />}
            
            {/* Przycisk Toggle Glow przesunięty do głównego kontenera poniżej */}
            
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Dokładny kontener dla tekstu i linii pomiarowych */}
              <div className="relative flex items-center justify-center">
                {/* Oblicz proporcjonalny rozmiar na podstawie szerokości */}
                <div className="relative" style={{ fontSize: `calc(${safeWidth}px / 8)` }}>
                  
                  {/* Główna zawartość - neon (z wysokim z-index, aby być na wierzchu) */}
                  <div className="z-20 relative flex flex-col justify-center items-center" 
                    style={{ height: `${safeHeight}px` }}>
                    <NeonText
                      text={text || 'Twój tekst'}
                      font={font}
                      color={color}
                      letterColors={letterColors}
                      isGlowing={isGlowing}
                      width={safeWidth}
                      maxWidth={90}
                      onLetterColorChange={onLetterColorChange}
                      enableTwoLines={enableTwoLines}
                      containerRef={textRef}
                    />
                  </div>
                  
                  {/* Usunięto nakładkę z pomiarami */}
                </div>
              </div>
              
              {/* Button for toggling glow - przenieśliśmy go poza główny kontener */}
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm" 
                onClick={onToggleGlow}
                title={isGlowing ? "Wyłącz świecenie" : "Włącz świecenie"}
              >
                {isGlowing ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="text-xs text-center text-white">
            <span>Wymiar rzeczywisty: {displayWidth} × {realHeight} cm</span>
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
