import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Check, LightbulbOff, LightbulbIcon, AlertTriangle, Ruler, ThumbsUp } from 'lucide-react';
import ConfirmProjectDialog from './ConfirmProjectDialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PathLengthVisualizer from './PathLengthVisualizer';
import { Textarea } from '@/components/ui/textarea';

// Updated simple fonts that are more likely to work
const FONTS = ['Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New'];

const COLORS = [
  { name: 'Biały ciepły', value: '#fff6e0' },
  { name: 'Biały neutralny', value: '#f5f5f5' },
  { name: 'Biały zimny', value: '#f0f8ff' },
  { name: 'Czerwony', value: '#ea384c' },
  { name: 'Pomarańczowy', value: '#ff7b00' },
  { name: 'Błękitny', value: '#33c3f0' },
  { name: 'Granatowy', value: '#0a1172' },
  { name: 'Zielony', value: '#39d353' },
  { name: 'Cytrynowy', value: '#dfff4f' },
  { name: 'Różowy', value: '#ff6ac1' },
  { name: 'Fioletowy', value: '#8b5cf6' },
];

type NeonFormProps = {
  text: string;
  setText: (text: string) => void;
  font: string;
  setFont: (font: string) => void;
  neonColor: string;
  setNeonColor: (color: string) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  isGlowing: boolean;
  setIsGlowing: (isGlowing: boolean) => void;
  price: number;
  enableTwoLines: boolean;
  setEnableTwoLines: (enableTwoLines: boolean) => void;
  exceedsLimit: boolean;
  onCustomQuoteRequest: () => void;
  pathLength: number;
  letterColors: Record<number, string>;
};

const NeonForm = ({
  text,
  setText,
  font,
  setFont,
  neonColor,
  setNeonColor,
  width,
  setWidth,
  height,
  isGlowing,
  setIsGlowing,
  price,
  enableTwoLines,
  setEnableTwoLines,
  exceedsLimit,
  onCustomQuoteRequest,
  pathLength,
  letterColors,
}: NeonFormProps) => {
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const maxLength = 40; // Same max length regardless of lines
    let newText = e.target.value.slice(0, maxLength);
    
    // If text contains newline, enable two lines
    if (newText.includes('\n') && !enableTwoLines) {
      setEnableTwoLines(true);
    }
    
    // Ensure there's only one newline character max
    const lines = newText.split('\n');
    if (lines.length > 2) {
      newText = lines.slice(0, 2).join('\n');
    }
    
    setText(newText);
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const handleFontChange = (selectedFont: string) => {
    console.log('Changing font to:', selectedFont);
    setFont(selectedFont);
  };
  
  const handleAcceptProject = () => {
    setShowConfirmDialog(true);
  };
  
  return (
    <Card className="neo-blur overflow-hidden animate-scale-in">
      <CardContent className="p-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="text">Twój napis</TabsTrigger>
            <TabsTrigger value="font">Czcionka</TabsTrigger>
            <TabsTrigger value="color">Kolor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="neon-text">Twój tekst (maksymalnie 40 znaków)</Label>
              <Textarea 
                id="neon-text"
                value={text} 
                onChange={handleTextChange} 
                placeholder="Wpisz swój tekst..."
                className="bg-secondary/50 resize-none"
                maxLength={40}
                rows={2}
              />
              <div className="text-sm text-muted-foreground">
                Naciśnij Enter, aby podzielić tekst na dwie linie
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="two-lines" 
                checked={enableTwoLines || text.includes('\n')}
                onCheckedChange={(checked) => {
                  setEnableTwoLines(checked);
                  // If disabling two lines, remove any newline characters
                  if (!checked && text.includes('\n')) {
                    setText(text.replace('\n', ' '));
                  }
                }}
              />
              <Label htmlFor="two-lines">Tekst w dwóch liniach</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="font" className="space-y-4">
            <div className="space-y-2">
              <Label>Wybierz czcionkę</Label>
              <div className="grid grid-cols-1 gap-2">
                {FONTS.map((fontName) => (
                  <Button
                    key={fontName}
                    variant={font === fontName ? "default" : "outline"}
                    className="h-auto py-4 relative justify-start"
                    onClick={() => handleFontChange(fontName)}
                    style={{ fontFamily: fontName }}
                  >
                    <span className="text-lg">{fontName}</span>
                    {font === fontName && (
                      <Check className="absolute right-4 w-4 h-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <Label>Wybierz kolor neonu</Label>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    className={cn(
                      "h-16 rounded-md flex flex-col items-center justify-center p-1",
                      "transition-all duration-200",
                      neonColor === color.value ? "ring-2 ring-white" : "ring-1 ring-white/10 hover:ring-white/30"
                    )}
                    onClick={() => setNeonColor(color.value)}
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      boxShadow: neonColor === color.value ? `0 0 10px ${color.value}` : 'none' 
                    }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full mb-1"
                      style={{ 
                        backgroundColor: color.value,
                        boxShadow: `0 0 5px ${color.value}`
                      }}
                    />
                    <span className="text-xs text-center">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="size-slider">Rozmiar (szerokość: {width} cm)</Label>
              <div className="flex items-center space-x-2">
                <button 
                  className={cn(
                    "p-1.5 rounded-md text-sm",
                    isGlowing ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
                  )}
                  onClick={() => setIsGlowing(!isGlowing)}
                >
                  {isGlowing ? <LightbulbIcon size={16} /> : <LightbulbOff size={16} />}
                </button>
                <span className="text-xs">{isGlowing ? "Włączone" : "Wyłączone"}</span>
              </div>
            </div>
            <Slider
              id="size-slider"
              min={20}
              max={120}
              step={1}
              value={[width]}
              onValueChange={(value) => setWidth(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 20cm</span>
              <span>Max: 120cm</span>
            </div>
          </div>
          
          {exceedsLimit && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Przekroczono limit wysokości</AlertTitle>
              <AlertDescription>
                Wysokość Twojego neonu ({height} cm) przekracza maksymalny dozwolony limit 60 cm.
                Potrzebna jest indywidualna wycena.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="p-4 bg-secondary/30 rounded-md mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Cena:</span>
              {exceedsLimit ? (
                <span className="text-2xl font-bold">Wycena indywidualna</span>
              ) : (
                <span className="text-2xl font-bold">{price.toFixed(2)} zł</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {exceedsLimit ? (
                "Ze względu na niestandardowy rozmiar, potrzebna jest indywidualna wycena."
              ) : (
                "Cena obliczana jest na podstawie szerokości neonu (1cm = 20zł)"
              )}
            </div>
            
            {/* Path length information */}
            <div className="flex items-center mt-2 pt-2 border-t border-border/30">
              <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Długość ścieżki: <span className="font-medium">{pathLength.toFixed(1)} cm</span>
              </span>
            </div>
          </div>
          
          <PathLengthVisualizer 
            text={text || "Twój tekst"}
            font={font}
            width={width}
            height={height}
            enableTwoLines={enableTwoLines}
          />
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={exceedsLimit ? onCustomQuoteRequest : handleAcceptProject}
            disabled={!text.trim()}
          >
            {exceedsLimit ? (
              "Poproś o indywidualną wycenę" 
            ) : (
              <span className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Akceptuję projekt
              </span>
            )}
          </Button>
          
          {/* Dialog potwierdzenia projektu */}
          <ConfirmProjectDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            text={text || "Twój tekst"}
            font={font}
            color={neonColor}
            letterColors={letterColors}
            width={width}
            height={height}
            price={price}
            enableTwoLines={enableTwoLines || text.includes('\n')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NeonForm;
