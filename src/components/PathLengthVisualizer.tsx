
import React, { useEffect, useRef, useMemo } from 'react';

import { getTextCenterlinePoints, splitTextIntoLines } from '@/utils/textMeasurement';

type PathLengthVisualizerProps = {
  text: string;
  font: string;
  width: number;
  height: number;
  enableTwoLines: boolean;
};

const PathLengthVisualizer = ({
  text,
  font,
  width,
  height,
  enableTwoLines
}: PathLengthVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Bezpieczna wersja tekstu
  const safeText = useMemo(() => {
    if (!text || text.trim() === '') return 'Twój tekst';
    return text.substring(0, 40); // Ograniczenie długości tekstu
  }, [text]);
  
  // Obsługa trybu dwóch linii
  const processedText = useMemo(() => {
    if (safeText.includes('\n')) {
      return safeText; // Zachowaj znaki nowej linii
    } else if (enableTwoLines && safeText.length > 15) {
      const lines = splitTextIntoLines(safeText);
      return lines.join('\n');
    }
    return safeText;
  }, [safeText, enableTwoLines]);
  
  // Bezpieczne wartości wymiarów
  const safeWidth = useMemo(() => Math.max(width, 20), [width]);
  const safeHeight = useMemo(() => Math.max(height, 5), [height]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    try {
      // Wyczyść płótno
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ustaw wymiary płótna z wyższym DPI dla wyświetlaczy retina
      const devicePixelRatio = window.devicePixelRatio || 1;
      const canvasWidth = 500; // Zwiększono z 400 dla lepszej widoczności
      const canvasHeight = 250; // Zwiększono z 200 dla lepszej widoczności
      
      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      context.scale(devicePixelRatio, devicePixelRatio);
      
      // Pobierz punkty linii środkowej z obsługą błędów
      const textForPoints = processedText || 'Twój tekst';
      const { points, length } = getTextCenterlinePoints(
        textForPoints, 
        font, 
        safeWidth, 
        safeHeight, 
        72, 
        textForPoints.includes('\n') || enableTwoLines
      );
      
      if (points.length === 0) {
        // Narysuj komunikat, jeśli nie ma punktów
        context.fillStyle = '#333';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('Nie można wygenerować ścieżki dla tego tekstu', canvasWidth / 2, canvasHeight / 2);
        return;
      }
      
      // Oblicz skalowanie, aby zmieścić się na płótnie
      const minX = Math.min(...points.map(p => p.x)) - 10; // Dodaj margines
      const maxX = Math.max(...points.map(p => p.x)) + 10;
      const minY = Math.min(...points.map(p => p.y)) - 10;
      const maxY = Math.max(...points.map(p => p.y)) + 10;
      
      const pathWidth = Math.max(maxX - minX, 1);
      const pathHeight = Math.max(maxY - minY, 1);
      
      const scaleX = (canvasWidth - 80) / pathWidth; // Zwiększono margines
      const scaleY = (canvasHeight - 80) / pathHeight;
      const scale = Math.min(scaleX, scaleY, 10); // Ogranicz maksymalną skalę
      
      const offsetX = (canvasWidth - pathWidth * scale) / 2;
      const offsetY = (canvasHeight - pathHeight * scale) / 2;
      
      // Narysuj kontur tekstu z lepszą widocznością
      context.save();
      context.translate(offsetX, offsetY);
      context.scale(scale, scale);
      context.translate(-minX, -minY);
      
      // Narysuj tło tekstu dla lepszego kontrastu
      const textLines = textForPoints.split('\n');
      let yPos = 72;
      
      for (const line of textLines) {
        // Jaśniejsze niebieskie tło dla tekstu
        context.font = `72px ${font}`;
        context.fillStyle = 'rgba(0, 0, 255, 0.1)';
        context.fillText(line, 0, yPos);
        
        // Kontur tekstu
        context.strokeStyle = 'rgba(74, 128, 252, 0.5)';
        context.lineWidth = 0.5 / scale;
        context.strokeText(line, 0, yPos);
        
        yPos += 80; // Odstęp między liniami
      }
      
      // Narysuj ścieżkę linii środkowej
      context.beginPath();
      context.strokeStyle = '#4CAF50';
      context.lineWidth = 2.5 / scale; // Grubsza linia
      context.setLineDash([6 / scale, 3 / scale]);
      
      let isFirstPoint = true;
      for (let i = 0; i < points.length; i++) {
        const { x, y } = points[i];
        if (isFirstPoint) {
          context.moveTo(x, y);
          isFirstPoint = false;
        } else {
          context.lineTo(x, y);
        }
      }
      
      context.stroke();
      
      // Narysuj punkty na ścieżce
      context.fillStyle = '#4CAF50';
      context.setLineDash([]);
      
      // Ogranicz liczbę punktów dla długich tekstów
      const pointCount = Math.min(points.length, 100);
      const step = Math.max(1, Math.floor(points.length / pointCount));
      
      for (let i = 0; i < points.length; i += step) {
        const { x, y } = points[i];
        context.beginPath();
        context.arc(x, y, 2 / scale, 0, Math.PI * 2);
        context.fill();
      }
      
      context.restore();
      
      // Dodaj tekst objaśniający
      context.fillStyle = '#333';
      context.font = '14px Arial';
      context.textAlign = 'left';
      
      // Dodaj tło dla tekstu, aby był czytelniejszy
      const lengthText = `Długość ścieżki (zielona linia): ${length.toFixed(1)} cm`;
      const textWidth = context.measureText(lengthText).width;
      context.fillStyle = 'rgba(255, 255, 255, 0.7)';
      context.fillRect(10, canvasHeight - 30, textWidth + 20, 20);
      
      // Dodaj tekst
      context.fillStyle = '#333';
      context.fillText(lengthText, 15, canvasHeight - 15);
      
    } catch (error) {
      console.error('Błąd podczas renderowania wizualizacji ścieżki:', error);
      
      // Wyczyść płótno i wyświetl komunikat o błędzie
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const canvasWidth = parseInt(canvas.style.width, 10);
      const canvasHeight = parseInt(canvas.style.height, 10);
      
      context.fillStyle = '#555';
      context.font = '14px Arial';
      context.textAlign = 'center';
      context.fillText(
        'Wystąpił problem z wizualizacją ścieżki. Spróbuj zmienić tekst lub wymiary.',
        canvasWidth / 2,
        canvasHeight / 2
      );
    }
    
  }, [processedText, font, safeWidth, safeHeight, enableTwoLines]);
  
  return (
    <div className="mt-6 flex flex-col items-center border border-border rounded-lg p-4 bg-background/50">
      <h3 className="text-base font-medium mb-3">Wizualizacja ścieżki neonu</h3>
      <div className="border border-border rounded-md p-3 bg-background/60 shadow-sm w-full">
        <canvas ref={canvasRef} className="w-full max-w-[500px] mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Zielona przerywana linia pokazuje przybliżoną ścieżkę środkową neonowej rurki
      </p>
    </div>
  );
};

export default PathLengthVisualizer;
