
import React from 'react';
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
  setLetterColors: (colors: Record<number, string>) => void;
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
  // Handle letter color change
  const handleLetterColorChange = (index: number, color: string) => {
    setLetterColors(prev => ({
      ...prev,
      [index]: color
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Preview Section - Larger and on top */}
      <div className="w-full">
        <NeonPreview
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
        />
      </div>
    </div>
  );
};

export default NeonDesigner;
