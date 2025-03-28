
import React, { useEffect, useRef } from 'react';
import NeonForm from '@/components/NeonForm';
import NeonPreview from '@/components/NeonPreview';

interface NeonDesignerProps {
  text: string;
  setText: (text: string) => void;
  font: string;
  setFont: (font: string) => void;
  neonColor: string;
  setNeonColor: (color: string) => void;
  letterColors: Record<number, string>;
  setLetterColors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  isGlowing: boolean;
  setIsGlowing: (isGlowing: boolean) => void;
  background: string;
  setBackground: (background: string) => void;
  customBackgroundUrl: string | null;
  setCustomBackgroundUrl: (url: string | null) => void;
  price: number;
  enableTwoLines: boolean;
  setEnableTwoLines: (enable: boolean) => void;
  exceedsLimit: boolean;
  onCustomQuoteRequest: () => void;
  pathLength: number;
}

const NeonDesigner = ({
  text,
  setText,
  font,
  setFont,
  neonColor,
  setNeonColor,
  letterColors,
  setLetterColors,
  width,
  setWidth,
  height,
  isGlowing,
  setIsGlowing,
  background,
  setBackground,
  customBackgroundUrl,
  setCustomBackgroundUrl,
  price,
  enableTwoLines,
  setEnableTwoLines,
  exceedsLimit,
  onCustomQuoteRequest,
  pathLength
}: NeonDesignerProps) => {
  // Referencja do triggera ponownego renderowania
  const updateCounter = useRef(0);
  
  // Wymuszenie rerenderowania preview przy zmianie szerokości lub wysokości
  useEffect(() => {
    updateCounter.current += 1;
  }, [width, height, text, font]);
  
  // Handle letter color change - fixed TypeScript error
  const handleLetterColorChange = (index: number, color: string) => {
    setLetterColors((prev: Record<number, string>) => ({
      ...prev,
      [index]: color
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Preview Section - Larger and on top */}
      <div className="w-full">
        <NeonPreview
          key={`preview-${updateCounter.current}`}
          text={text}
          font={font}
          color={neonColor}
          letterColors={letterColors}
          isGlowing={isGlowing}
          width={width}
          height={height}
          background={background}
          customBackgroundUrl={customBackgroundUrl}
          onSelectBackground={setBackground}
          onCustomBackgroundChange={setCustomBackgroundUrl}
          onToggleGlow={() => setIsGlowing(!isGlowing)}
          onLetterColorChange={handleLetterColorChange}
          enableTwoLines={enableTwoLines}
        />
      </div>
      
      {/* Form Section - Below the preview */}
      <div className="w-full">
        <NeonForm
          text={text}
          setText={setText}
          font={font}
          setFont={setFont}
          neonColor={neonColor}
          setNeonColor={setNeonColor}
          width={width}
          setWidth={setWidth}
          height={height}
          isGlowing={isGlowing}
          setIsGlowing={setIsGlowing}
          price={price}
          enableTwoLines={enableTwoLines}
          setEnableTwoLines={setEnableTwoLines}
          exceedsLimit={exceedsLimit}
          onCustomQuoteRequest={onCustomQuoteRequest}
          pathLength={pathLength}
          letterColors={letterColors}
        />
      </div>
    </div>
  );
};

export default NeonDesigner;
