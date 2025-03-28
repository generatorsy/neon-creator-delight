import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadSVG, downloadDXF, generateSVGPreview, generateDXFPreview } from '@/utils/exportFormats';
import { FileDown, Download, Check, AlertTriangle } from 'lucide-react';

type ConfirmProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  font: string;
  color: string;
  letterColors: Record<number, string>;
  width: number;
  height: number;
  price: number;
  enableTwoLines: boolean;
};

const ConfirmProjectDialog = ({
  open,
  onOpenChange,
  text,
  font,
  color,
  letterColors,
  width,
  height,
  price,
  enableTwoLines
}: ConfirmProjectDialogProps) => {
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [showPreview, setShowPreview] = useState<'svg' | 'dxf' | null>(null);
  
  // Funkcje generujące podglądy przeniesione do exportFormats.ts
  
  const handleConfirm = () => {
    setShowExportButtons(true);
  };
  
  const handleDownloadSVG = () => {
    downloadSVG(
      text,
      font,
      width,
      height,
      color,
      letterColors,
      enableTwoLines || text.includes('\n')
    );
  };
  
  const handleDownloadDXF = () => {
    downloadDXF(
      text,
      font,
      width,
      height,
      color,
      letterColors,
      enableTwoLines || text.includes('\n')
    );
  };
  
  const handleClose = () => {
    setShowExportButtons(false);
    setShowPreview(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showExportButtons ? "Projekt zaakceptowany" : "Potwierdzenie projektu"}</DialogTitle>
          <DialogDescription>
            {showExportButtons 
              ? "Możesz teraz pobrać pliki z Twoim neonem w wybranych formatach." 
              : "Sprawdź czy wymiary i wygląd neonu są zgodne z Twoimi oczekiwaniami."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border rounded-md bg-muted/50 space-y-4">
          {/* Podgląd tekstu */}
          <div className="p-6 bg-black rounded-md flex items-center justify-center" style={{ minHeight: '100px' }}>
            <div className="text-center" style={{ 
              fontFamily: font, 
              color: 'white',
              textShadow: `0 0 5px ${color}, 0 0 10px ${color}`,
              fontSize: '2rem',
              whiteSpace: 'pre-line'
            }}>
              {text}
            </div>
          </div>
          
          {/* Wymiary i cena */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wymiary:</span>
              <span className="font-medium">{width} × {height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Czcionka:</span>
              <span className="font-medium" style={{ fontFamily: font }}>{font}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cena:</span>
              <span className="font-medium">{price.toFixed(2)} zł</span>
            </div>
          </div>
          
          {/* Podgląd pliku przed pobraniem */}
          {showPreview && (
            <div className="border p-2 rounded-md">
              <h4 className="text-sm font-medium mb-2">Podgląd pliku {showPreview.toUpperCase()}</h4>
              <div className="bg-white rounded overflow-hidden" style={{ height: '150px' }}>
                <img 
                  src={showPreview === 'svg' 
                    ? generateSVGPreview(text, font, width, height) 
                    : generateDXFPreview(text, font, width, height)} 
                  alt={`Podgląd pliku ${showPreview.toUpperCase()}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute right-2 top-2 text-xs bg-gray-200 rounded px-1">
                  {width} × {height} cm
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> 
                Rzeczywisty plik może się nieznacznie różnić od podglądu
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {showExportButtons ? (
            <>
              <Button variant="outline" onClick={() => setShowPreview('svg')} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Podgląd SVG
              </Button>
              <Button variant="outline" onClick={() => setShowPreview('dxf')} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Podgląd DXF
              </Button>
              <Button onClick={handleDownloadSVG} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Pobierz SVG
              </Button>
              <Button onClick={handleDownloadDXF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Pobierz DXF
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Zamknij
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Anuluj
              </Button>
              <Button onClick={handleConfirm} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Akceptuję projekt
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmProjectDialog;
