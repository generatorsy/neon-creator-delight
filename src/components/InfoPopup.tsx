
import React, { useEffect, useState } from 'react';
import { Info, MousePointer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoPopupProps {
  autoHide?: boolean;
  hideDelay?: number;
}

const InfoPopup = ({ autoHide = true, hideDelay = 6000 }: InfoPopupProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, hideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, visible]);

  if (!visible) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full border shadow-sm z-10 hover:bg-background/95 transition-all"
              onClick={() => setVisible(true)}
            >
              <Info className="h-4 w-4 text-foreground/80" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pokaż wskazówkę</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="absolute bottom-2 right-2 p-2 bg-background/80 backdrop-blur-sm shadow-md animate-fade-in z-10 max-w-[200px]">
      <div className="flex items-start gap-2">
        <MousePointer className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-medium">Wskazówka:</p>
          <p className="text-muted-foreground">Kliknij na literkę, aby zmienić jej kolor</p>
        </div>
        <button 
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1"
          onClick={() => setVisible(false)}
        >
          <span className="text-xs">×</span>
        </button>
      </div>
    </Card>
  );
};

export default InfoPopup;
