/**
 * Utility for measuring text dimensions with Canvas API
 */

// Standard DPI for web is 96 pixels per inch
// 1 inch = 2.54 cm
const PX_PER_CM = 96 / 2.54;

/**
 * Measures text dimensions in pixels using Canvas API with improved accuracy
 * for finding the bounding box of the entire text
 */
export const measureTextInPixels = (
  text: string,
  font: string,
  fontSize: number = 72
): { 
    width: number; 
    height: number; 
    ascent: number; 
    descent: number; 
    boundingBox: { width: number; height: number; }
} => {
  // Create canvas element for measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Canvas context not available');
    return { 
      width: 0, 
      height: 0, 
      ascent: 0, 
      descent: 0, 
      boundingBox: { width: 0, height: 0 } 
    };
  }
  
  // Set font on the canvas context
  context.font = `${fontSize}px ${font}`;
  
  // Measure text width and metrics
  const metrics = context.measureText(text);
  const width = metrics.width;
  
  // Get more accurate height measurements
  let ascent = 0;
  let descent = 0;
  
  // Use advanced text metrics if available
  if (metrics.actualBoundingBoxAscent !== undefined && 
      metrics.actualBoundingBoxDescent !== undefined) {
    ascent = metrics.actualBoundingBoxAscent;
    descent = metrics.actualBoundingBoxDescent;
  } else {
    // Fallback using standard metrics or approximation
    if (metrics.fontBoundingBoxAscent !== undefined && 
        metrics.fontBoundingBoxDescent !== undefined) {
      ascent = metrics.fontBoundingBoxAscent;
      descent = metrics.fontBoundingBoxDescent;
    } else {
      // Last resort approximation based on font size
      ascent = fontSize * 0.7;  // Typical ascent is ~70% of fontSize
      descent = fontSize * 0.3;  // Typical descent is ~30% of fontSize
    }
  }
  
  // Calculate the total height
  const height = ascent + descent;
  
  // Calculate the bounding box, which might be wider than width for some fonts
  // or taller than height for fonts with exaggerated ascenders/descenders
  const boundingBoxWidth = Math.max(
    width,
    metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft || width
  );
  
  const boundingBoxHeight = Math.max(
    height,
    ascent + descent
  );
  
  return { 
    width, 
    height, 
    ascent, 
    descent, 
    boundingBox: { 
      width: boundingBoxWidth, 
      height: boundingBoxHeight 
    } 
  };
};

/**
 * Converts pixel measurements to centimeters
 */
export const pxToCm = (px: number): number => {
  return px / PX_PER_CM;
};

/**
 * Converts centimeters to pixels
 */
export const cmToPx = (cm: number): number => {
  return cm * PX_PER_CM;
};

/**
 * Measures text dimensions in centimeters with improved accuracy
 */
export const measureTextInCm = (
  text: string,
  font: string,
  fontSize: number = 72
): { 
    width: number; 
    height: number; 
    ascent: number; 
    descent: number; 
    boundingBox: { width: number; height: number; }
} => {
  const measurements = measureTextInPixels(text, font, fontSize);
  
  return {
    width: pxToCm(measurements.width),
    height: pxToCm(measurements.height),
    ascent: pxToCm(measurements.ascent),
    descent: pxToCm(measurements.descent),
    boundingBox: {
      width: pxToCm(measurements.boundingBox.width),
      height: pxToCm(measurements.boundingBox.height)
    }
  };
};

/**
 * Calculates the height in cm based on text and width
 */
export const calculateHeightForWidth = (
  text: string,
  font: string,
  widthCm: number,
  enableTwoLines: boolean = false
): number => {
  // Safety check for empty text
  if (!text || text.trim() === '') {
    return widthCm * 0.3; // Safe default proportion
  }
  
  try {
    // If text contains a newline character, force two lines mode
    const containsNewline = text.includes('\n');
    const useMultiline = enableTwoLines || containsNewline;
    
    // Get text lines - either from newline or algorithm
    const lines = useMultiline ? 
      (containsNewline ? text.split('\n') : splitTextIntoLines(text)) : 
      [text];
    
    // Lepsze współczynniki proporcji dla różnych czcionek
    const fontRatios: Record<string, number> = {
      'Arial': 1.0,
      'Times New Roman': 0.8,
      'Courier New': 0.95,
      'Georgia': 0.85,
      'Verdana': 0.95,
      'default': 1.0
    };
    
    // Wybierz współczynnik dla danej czcionki lub użyj domyślnego
    const fontRatio = fontRatios[font] || fontRatios['default'];
    
    // Wysokość zależy od charakteru liter w tekście
    let characterHeightFactor = 1.0;
    
    // Sprawdź czy tekst zawiera litery z wystającymi elementami w górę/dół
    const hasAscenders = /[bdfhijklt]/.test(text.toLowerCase());
    const hasDescenders = /[gjpqy]/.test(text.toLowerCase());
    
    // Sprawdź czy tekst zawiera duże litery
    const hasUppercase = /[A-Z]/.test(text);
    
    // Sprawdź czy tekst zawiera tylko okrągłe litery (o, O, 0 itp.)
    const isRoundCharacters = /^[oO0]+$/.test(text);
    
    // Dostosuj współczynnik wysokości znaków
    if (isRoundCharacters) {
      // Dla okrągłych znaków, wysokość powinna być prawie równa szerokości znaku
      characterHeightFactor = 1.0;
    } else if (hasAscenders && hasDescenders) {
      characterHeightFactor = 1.2; // Większa wysokość dla liter jak "bp"
    } else if (hasAscenders || hasUppercase) {
      characterHeightFactor = 1.1; // Średnia wysokość dla liter jak "bh" lub "AB"
    } else if (hasDescenders) {
      characterHeightFactor = 1.1; // Średnia wysokość dla liter jak "gp"
    }
    
    if (lines.length > 1) {
      // Obliczanie wysokości dla wieloliniowego tekstu
      let totalHeight = 0;
      
      // Dla każdej linii oblicz wysokość i dostosuj
      lines.forEach(line => {
        // Sprawdź długość linii i dostosuj szerokość
        const lineLength = line.length || 1;
        const averageCharWidth = widthCm / lineLength;
        
        // Wysokość linii to x razy szerokość znaku
        const lineHeight = averageCharWidth * characterHeightFactor * fontRatio;
        totalHeight += Math.max(lineHeight, 1); // Minimum 1cm
      });
      
      // Dodaj odstęp między liniami (20%)
      return totalHeight * 1.2;
    } else {
      // Obliczanie dla pojedynczej linii
      
      // Oblicz średnią szerokość znaku
      const lineLength = text.length || 1;
      const averageCharWidth = widthCm / lineLength;
      
      // W przypadku pojedynczych znaków, zapewnij minimalną wysokość
      if (lineLength === 1) {
        // Dla pojedynczych znaków, użyj proporcji specyficznej dla znaku
        if (/[il|I1\-\_\.]/.test(text)) {
          return averageCharWidth * 3.0 * fontRatio; // Wysokie i wąskie znaki
        } else if (/[oO0]/.test(text)) {
          return averageCharWidth * 1.0 * fontRatio; // Okrągłe znaki
        } else {
          return averageCharWidth * 1.5 * fontRatio; // Standardowe znaki
        }
      }
      
      // Dla normalnego tekstu, wysokość jest proporcjonalna do średniej szerokości znaku
      return averageCharWidth * characterHeightFactor * fontRatio * text.length * 0.25;
    }
  } catch (error) {
    console.error('Error calculating height:', error);
    // Safe fallback if anything goes wrong
    return widthCm * 0.3;
  }
};

/**
 * Splits text into two lines for display
 */
export const splitTextIntoLines = (text: string): string[] => {
  // Handle text that already contains a newline
  if (text.includes('\n')) {
    const lines = text.split('\n');
    return [lines[0] || '', lines[1] || ''];
  }
  
  // For short text, keep as single line
  if (text.length <= 20) {
    return [text];
  }
  
  // For longer text, try to find natural break points
  const midPoint = Math.floor(text.length / 2);
  const searchStart = Math.max(midPoint - 10, 0);
  const searchEnd = Math.min(midPoint + 10, text.length);
  
  // Look for spaces around the midpoint of the text
  let spaceIndex = -1;
  
  // Try to find space around the middle for most balanced split
  for (let i = 0; i < 10; i++) {
    // Look alternately further right and left from midpoint
    const rightIndex = midPoint + i;
    const leftIndex = midPoint - i;
    
    if (rightIndex < text.length && text[rightIndex] === ' ') {
      spaceIndex = rightIndex;
      break;
    }
    
    if (leftIndex >= 0 && text[leftIndex] === ' ') {
      spaceIndex = leftIndex;
      break;
    }
  }
  
  // If we found a good split point
  if (spaceIndex > 0) {
    return [
      text.substring(0, spaceIndex).trim(),
      text.substring(spaceIndex + 1).trim()
    ];
  }
  
  // If no space found anywhere reasonable, split at midpoint
  return [
    text.substring(0, midPoint).trim(),
    text.substring(midPoint).trim()
  ];
};

/**
 * Checks if height exceeds maximum allowed height
 */
export const exceedsMaxHeight = (height: number, maxHeight: number = 60): boolean => {
  return height > maxHeight;
};

/**
 * Calculates approximate path length of text in centimeters based on centerline approach
 * This estimates the length of the middle line that would be used for neon tube bending
 */
export const calculateTextPathLength = (
  text: string,
  font: string,
  fontSize: number = 72
): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Canvas context not available');
    return 0;
  }
  
  // Set font on the canvas context
  context.font = `${fontSize}px ${font}`;
  
  let totalPathLength = 0;
  
  // Character complexity factors - how much extra path length each character requires
  const complexityFactors: Record<string, number> = {
    // Straight characters
    'I': 1.0, 'i': 1.0, 'l': 1.0, '|': 1.0, '1': 1.0, 'T': 1.2, 'L': 1.2, 'H': 1.3, 'E': 1.4, 'F': 1.3,
    // Slightly curved
    'J': 1.3, '7': 1.2, 'Y': 1.3, 'V': 1.3, 'A': 1.4, 'K': 1.4, 'X': 1.6, 'Z': 1.5, 'N': 1.5, 'M': 1.8,
    // Medium complexity curves
    'U': 1.5, 'C': 1.7, 'D': 1.6, 'P': 1.6, 'R': 1.7, 'B': 1.8, '2': 1.7, '3': 1.8, '5': 1.8,
    // Very curved characters
    'O': 2.0, 'Q': 2.1, 'G': 2.0, '0': 2.0, '6': 2.0, '8': 2.1, '9': 2.0, 'S': 2.3,
    // Default for other characters
    'default': 1.5
  };
  
  // For each character, measure its width and apply complexity factor
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = context.measureText(char).width;
    
    // Get complexity factor for this character or use default
    const factor = complexityFactors[char] || complexityFactors['default'];
    
    // Apply complexity factor to account for the centerline path length
    totalPathLength += charWidth * factor;
  }
  
  // Convert to centimeters
  return pxToCm(totalPathLength);
};

/**
 * Get path points to visualize the centerline path
 * Returns points that can be used to draw the path
 */
export const getTextCenterlinePoints = (
  text: string,
  font: string,
  width: number,
  height: number,
  fontSize: number = 72,
  enableTwoLines: boolean = false
): { points: {x: number, y: number}[]; length: number } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Canvas context not available');
    return { points: [], length: 0 };
  }
  
  // Set canvas size
  canvas.width = 1000;
  canvas.height = 300;
  
  // Get lines of text
  const lines = enableTwoLines && text.length > 20 ? splitTextIntoLines(text) : [text];
  
  // Measure natural dimensions
  const { width: naturalWidth } = measureTextInCm(text, font, fontSize);
  
  // Calculate scale factor
  const scaleFactor = width / naturalWidth;
  
  let points: {x: number, y: number}[] = [];
  let totalLength = 0;
  
  // Process each line
  let lineY = 0;
  const lineHeight = height / lines.length;
  
  lines.forEach((line, lineIndex) => {
    const lineCenterY = lineHeight * (lineIndex + 0.5);
    let xPos = 0;
    
    // For each character, generate points for visualization
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const charMetrics = context.measureText(char);
      const charWidth = charMetrics.width;
      
      // Complexity factor determines how many points to generate
      const complexityKey = char.toUpperCase() in {S:1, O:1, G:1, C:1, Q:1, '8':1, '6':1, '9':1, '0':1} 
        ? char.toUpperCase() : 'default';
      const complexity = complexityKey === 'S' ? 2.3 : (complexityKey === 'default' ? 1.5 : 2.0);
      
      // For straight characters, just generate start and end points
      if (/[Il|1]/.test(char)) {
        points.push({ x: xPos, y: lineCenterY - lineHeight/3 });
        points.push({ x: xPos, y: lineCenterY + lineHeight/3 });
        totalLength += lineHeight * 2/3;
      } 
      // For curved characters like S, O, etc. generate curve points
      else if (/[SOCGQocsq80693]/.test(char)) {
        // Generate curve points
        const steps = 8;
        const radius = charWidth / 2;
        
        for (let j = 0; j <= steps; j++) {
          const angle = complexity === 2.3 
            ? (j / steps) * Math.PI * 2 - Math.PI/2 // S-like curve
            : (j / steps) * Math.PI * 2; // O-like curve
          
          const xOffset = complexity === 2.3 
            ? Math.sin(angle) * radius * (j < steps/2 ? 1 : -1) // S-curve
            : Math.cos(angle) * radius; // O-curve
          
          const yOffset = Math.sin(angle) * radius/2;
          
          points.push({ 
            x: xPos + radius + xOffset, 
            y: lineCenterY + yOffset 
          });
        }
        
        totalLength += charWidth * complexity;
      } 
      // For other characters, approximate with simple lines
      else {
        points.push({ x: xPos, y: lineCenterY });
        points.push({ x: xPos + charWidth, y: lineCenterY });
        totalLength += charWidth * (complexity || 1.5);
      }
      
      xPos += charWidth;
    }
  });
  
  // Apply scale factor to points
  points = points.map(point => ({
    x: point.x * scaleFactor,
    y: point.y * (height / (fontSize * 0.7)) // Scale height proportionally
  }));
  
  return { 
    points, 
    length: pxToCm(totalLength) * scaleFactor 
  };
};

/**
 * Calculates approximate path length for text that may span multiple lines
 * and scales it according to the user-specified dimensions
 */
export const calculatePathLengthForText = (
  text: string,
  font: string,
  enableTwoLines: boolean = false,
  width: number,
  height: number
): number => {
  if (!text || text.trim() === '') {
    return 0;
  }
  
  // Handle special case for very simple characters like "I"
  const simpleCharRegex = /^[Ii\|1]+$/;
  if (simpleCharRegex.test(text)) {
    // For simple vertical characters, path length is directly proportional to character count and height
    return text.length * height * 0.8; // 80% of height is the typical visible height
  }
  
  let lines = enableTwoLines && text.length > 20 ? splitTextIntoLines(text) : [text];
  
  // Get the natural dimensions of the text
  let totalNaturalWidth = 0;
  lines.forEach(line => {
    const { width: lineWidth } = measureTextInCm(line, font);
    totalNaturalWidth = Math.max(totalNaturalWidth, lineWidth);
  });
  
  // Calculate the scale factor based on user-specified width
  const scaleFactor = width / totalNaturalWidth;
  
  // Calculate path length for each line and apply the scale factor
  let totalPathLength = 0;
  
  lines.forEach(line => {
    // Characters with complex shapes need more calculation
    let lineLength = 0;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const { width: charWidth } = measureTextInCm(char, font);
      
      // Apply character-specific complexity factors
      let complexityFactor = 1.5; // Default factor
      
      if (/[Il|1]/.test(char)) {
        // Straight lines are proportional to height
        lineLength += height * 0.8;
        continue;
      } else if (/[SOCGQ80]/.test(char)) {
        // Highly curved characters (like S, O, etc.)
        complexityFactor = 2.2;
      } else if (/[BDPR36]/.test(char)) {
        // Moderately curved characters
        complexityFactor = 1.8;
      } else if (/[AEFHJKLMNTVXYZ2457]/.test(char)) {
        // Angular or slightly curved characters
        complexityFactor = 1.4;
      }
      
      lineLength += charWidth * complexityFactor;
    }
    
    totalPathLength += lineLength;
  });
  
  // Apply scale factor
  totalPathLength *= scaleFactor;
  
  // Round to one decimal place for better readability
  return Math.round(totalPathLength * 10) / 10;
};
