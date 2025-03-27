
import React, { useState, useEffect } from 'react';
import NeonForm from '@/components/NeonForm';
import NeonPreview from '@/components/NeonPreview';
import { calculateHeightForWidth } from '@/utils/textMeasurement';

const Index = () => {
  const [text, setText] = useState('Twój tekst');
  const [font, setFont] = useState('Arial');
  const [neonColor, setNeonColor] = useState('#fff6e0'); // Warm white by default
  const [width, setWidth] = useState(60); // Default width in cm
  const [height, setHeight] = useState(20); // Will be calculated based on font and text
  const [isGlowing, setIsGlowing] = useState(true);
  const [background, setBackground] = useState('dark');
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [enableTwoLines, setEnableTwoLines] = useState(false);

  // Calculate height based on the text, font and width using Canvas API
  useEffect(() => {
    try {
      // Use the new utility to calculate height based on text measurements
      const calculatedHeight = calculateHeightForWidth(
        text || 'Twój tekst',
        font,
        width,
        enableTwoLines
      );
      
      // Set a minimum height
      setHeight(Math.max(10, Math.round(calculatedHeight)));
      
      console.log('Calculated dimensions:', {
        text,
        font,
        width: `${width}cm`,
        height: `${Math.round(calculatedHeight)}cm`,
        twoLines: enableTwoLines
      });
    } catch (error) {
      console.error('Error calculating height:', error);
      // Fallback to simple calculation if canvas measurement fails
      const ratio = 0.5;
      const baseHeight = width * ratio;
      const calculatedHeight = enableTwoLines ? baseHeight * 1.5 : baseHeight;
      setHeight(Math.max(10, Math.round(calculatedHeight)));
    }
  }, [text, font, width, enableTwoLines]);

  // Calculate price based on width
  useEffect(() => {
    const pricePerCm = 20; // 20zł per cm
    setPrice(width * pricePerCm);
  }, [width]);

  // Debug font changes
  useEffect(() => {
    console.log('Font changed to:', font);
  }, [font]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto py-10 px-4 md:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col gap-8">
          {/* Preview Section - Larger and on top */}
          <div className="w-full">
            <NeonPreview
              text={text}
              font={font}
              color={neonColor}
              isGlowing={isGlowing}
              width={width}
              height={height}
              background={background}
              customBackgroundUrl={customBackgroundUrl}
              onSelectBackground={setBackground}
              onCustomBackgroundChange={setCustomBackgroundUrl}
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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
