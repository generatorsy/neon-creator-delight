
import React, { useState, useEffect } from 'react';
import NeonForm from '@/components/NeonForm';
import NeonPreview from '@/components/NeonPreview';
import { 
  calculateHeightForWidth, 
  exceedsMaxHeight, 
  calculatePathLengthForText 
} from '@/utils/textMeasurement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const [pathLength, setPathLength] = useState(0); // New state for path length
  
  // Dialog state
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const { toast } = useToast();

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
      const newHeight = Math.max(10, Math.round(calculatedHeight));
      setHeight(newHeight);
      
      // Check if exceeds maximum height
      const isExceeding = exceedsMaxHeight(newHeight);
      setExceedsLimit(isExceeding);
      
      // Calculate path length
      const textPathLength = calculatePathLengthForText(
        text || 'Twój tekst',
        font,
        enableTwoLines
      );
      setPathLength(textPathLength);
      
      console.log('Calculated dimensions:', {
        text,
        font,
        width: `${width}cm`,
        height: `${Math.round(calculatedHeight)}cm`,
        pathLength: `${textPathLength.toFixed(1)}cm`,
        twoLines: enableTwoLines,
        exceedsLimit: isExceeding
      });
    } catch (error) {
      console.error('Error calculating dimensions:', error);
      // Fallback to simple calculation if canvas measurement fails
      const ratio = 0.5;
      const baseHeight = width * ratio;
      const calculatedHeight = enableTwoLines ? baseHeight * 1.5 : baseHeight;
      setHeight(Math.max(10, Math.round(calculatedHeight)));
      // Estimate path length as 1.5x the width (rough approximation)
      setPathLength(width * 1.5);
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
  
  const handleCustomQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Błąd",
        description: "Adres email jest wymagany.",
        variant: "destructive"
      });
      return;
    }
    
    // Here we would send the data to a backend
    console.log("Custom quote request:", {
      email,
      phone,
      message,
      neonDetails: {
        text,
        font,
        color: neonColor,
        width,
        height,
        enableTwoLines
      }
    });
    
    // Show success message
    toast({
      title: "Dziękujemy!",
      description: "Twoje zapytanie zostało wysłane. Skontaktujemy się z Tobą w ciągu 24 godzin.",
    });
    
    // Reset form and close dialog
    setEmail('');
    setPhone('');
    setMessage('');
    setShowContactDialog(false);
  };

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
              exceedsLimit={exceedsLimit}
              onCustomQuoteRequest={() => setShowContactDialog(true)}
              pathLength={pathLength}
            />
          </div>
        </div>
      </main>
      
      {/* Custom Quote Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Indywidualna wycena</DialogTitle>
            <DialogDescription>
              Twój projekt wymaga indywidualnej wyceny. Zostaw swoje dane, a odpowiemy w ciągu 24 godzin.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCustomQuoteSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="required">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="twoj@email.pl" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+48 123 456 789" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Dodatkowe informacje (opcjonalnie)</Label>
              <Input 
                id="message" 
                placeholder="Dodatkowe informacje lub pytania..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">Wyślij zapytanie</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
