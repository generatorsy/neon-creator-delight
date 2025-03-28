/**
 * Pomocnicze funkcje do obsługi czcionek i konwersji tekstu na ścieżki
 */
import { cmToPx } from './textMeasurement';

// Domyślne czcionki dostępne w przeglądarce
const DEFAULT_FONTS = ['Arial', 'Helvetica', 'sans-serif'];

/**
 * Tworzy element SVG path dla danego tekstu
 * 
 * Tworzymy uproszczoną implementację, która nie wymaga zewnętrznej biblioteki 
 * text-to-svg, aby uniknąć błędów ładowania w czasie kompilacji
 */
export const createSVGPath = async (
  text: string,
  font: string,
  fontSize: number,
  x: number,
  y: number,
  options?: {
    anchor?: 'left' | 'center' | 'right';
    attributes?: Record<string, string>;
  }
): Promise<string> => {
  try {
    // Używamy prostego fallbacka zamiast biblioteki text-to-svg
    return createFallbackRectPath(text, font, fontSize, x, y);
  } catch (error) {
    console.error('Błąd generowania ścieżki SVG:', error);
    // Fallback - prostokąt zamiast tekstu
    return createFallbackRectPath(text, font, fontSize, x, y);
  }
};

/**
 * Tworzy zapasowy prostokąt dla tekstu
 */
const createFallbackRectPath = (
  text: string,
  font: string,
  fontSize: number,
  x: number,
  y: number
): string => {
  // Estymacja szerokości tekstu na podstawie długości i rozmiaru czcionki
  const letterWidth = fontSize * 0.6;
  const width = text.length * letterWidth;
  const height = fontSize;
  
  // Generuj prostokąt i tekst zapasowy
  const rect = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" fill="none" stroke="black" stroke-width="0.5" />`;
  const textEl = `<text x="${x}" y="${y + fontSize/4}" font-family="${font}, sans-serif" font-size="${fontSize}" text-anchor="middle" fill="black">${text}</text>`;
  
  return rect + textEl;
};

/**
 * Tworzy zestaw punktów dla DXF z tekstu
 */
export const textToPolyline = (
  text: string,
  font: string,
  fontSize: number,
  x: number,
  y: number,
  width: number,
  height: number
): {x: number, y: number}[][] => {
  // Ta funkcja powinna generować punkty dla każdej litery
  // W prostej implementacji używamy prostokątów dla każdej litery

  const result: {x: number, y: number}[][] = [];
  const letterWidth = width / Math.max(text.length, 1);
  const letterHeight = height * 0.8;
  
  for (let i = 0; i < text.length; i++) {
    const letterX = x + i * letterWidth;
    
    // Dla każdej litery tworzymy prostokąt z 5 punktami (zamknięty)
    const points = [
      { x: letterX, y: y - letterHeight/2 },
      { x: letterX + letterWidth * 0.8, y: y - letterHeight/2 },
      { x: letterX + letterWidth * 0.8, y: y + letterHeight/2 },
      { x: letterX, y: y + letterHeight/2 },
      { x: letterX, y: y - letterHeight/2 },  // Zamknięcie ścieżki
    ];
    
    result.push(points);
  }
  
  return result;
};
