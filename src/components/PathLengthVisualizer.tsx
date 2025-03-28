
import React, { useEffect, useRef } from 'react';
import { getTextCenterlinePoints } from '@/utils/textMeasurement';

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
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions with higher DPI for retina displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = 500; // Increased from 400 for better visibility
    const canvasHeight = 250; // Increased from 200 for better visibility
    
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    context.scale(devicePixelRatio, devicePixelRatio);
    
    // Get centerline points
    const { points, length } = getTextCenterlinePoints(text, font, width, height, 72, enableTwoLines);
    
    if (points.length === 0) return;
    
    // Calculate scaling to fit canvas
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    const pathWidth = maxX - minX;
    const pathHeight = maxY - minY;
    
    const scaleX = (canvasWidth - 60) / pathWidth; // Increased padding
    const scaleY = (canvasHeight - 60) / pathHeight; // Increased padding
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (canvasWidth - pathWidth * scale) / 2;
    const offsetY = (canvasHeight - pathHeight * scale) / 2;
    
    // Draw text outline with better visibility
    context.save();
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);
    context.translate(-minX, -minY);
    
    context.font = `72px ${font}`;
    context.fillStyle = 'rgba(0, 0, 255, 0.15)';
    context.fillText(text, 0, 72);
    
    context.strokeStyle = '#4a80fc';
    context.lineWidth = 1 / scale;
    context.strokeText(text, 0, 72);
    
    // Draw centerline path
    context.beginPath();
    context.strokeStyle = '#4CAF50';
    context.lineWidth = 3 / scale; // Thicker line
    context.setLineDash([6 / scale, 3 / scale]);
    
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    
    context.stroke();
    
    // Draw dots at each point
    context.fillStyle = '#4CAF50';
    context.setLineDash([]);
    for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 20))) {
      const { x, y } = points[i];
      context.beginPath();
      context.arc(x, y, 2 / scale, 0, Math.PI * 2);
      context.fill();
    }
    
    context.restore();
    
    // Add text explanation
    context.fillStyle = '#333';
    context.font = '14px Arial'; // Larger font
    context.fillText(`Długość ścieżki (zielona linia): ${length.toFixed(1)} cm`, 10, canvasHeight - 15);
    
  }, [text, font, width, height, enableTwoLines]);
  
  return (
    <div className="mt-6 flex flex-col items-center border border-border rounded-lg p-4 bg-background/50">
      <h3 className="text-base font-medium mb-3">Wizualizacja ścieżki neonu</h3>
      <div className="border border-border rounded-md p-3 bg-background/60 shadow-sm">
        <canvas ref={canvasRef} className="w-full max-w-[500px]" />
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Zielona przerywana linia pokazuje przybliżoną ścieżkę środkową neonowej rurki
      </p>
    </div>
  );
};

export default PathLengthVisualizer;
