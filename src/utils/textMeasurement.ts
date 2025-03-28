/**
 * Utility for measuring text dimensions with Canvas API
 */

// Standard DPI for web is 96 pixels per inch
// 1 inch = 2.54 cm
const PX_PER_CM = 96 / 2.54;

/**
 * Measures text dimensions in pixels using Canvas API
 */
export const measureTextInPixels = (
  text: string,
  font: string,
  fontSize: number = 72
): { width: number; height: number } => {
  // Create canvas element for measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Canvas context not available');
    return { width: 0, height: 0 };
  }
  
  // Set font on the canvas context
  context.font = `${fontSize}px ${font}`;
  
  // Measure text width
  const metrics = context.measureText(text);
  const width = metrics.width;
  
  // Calculate height (approximate based on font metrics)
  // TextMetrics doesn't provide direct height, so we estimate from font size
  // and available metrics like actualBoundingBoxAscent and actualBoundingBoxDescent
  let height = fontSize;
  
  if (metrics.actualBoundingBoxAscent !== undefined && 
      metrics.actualBoundingBoxDescent !== undefined) {
    height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  }
  
  return { width, height };
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
 * Measures text dimensions in centimeters
 */
export const measureTextInCm = (
  text: string,
  font: string,
  fontSize: number = 72
): { width: number; height: number } => {
  const { width: widthPx, height: heightPx } = measureTextInPixels(text, font, fontSize);
  
  return {
    width: pxToCm(widthPx),
    height: pxToCm(heightPx)
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
  // If two lines are enabled, split the text
  if (enableTwoLines && text.length > 20) {
    const lines = splitTextIntoLines(text);
    
    // Measure each line and use the maximum height
    const heights = lines.map(line => {
      const { width, height } = measureTextInCm(line, font);
      // Scale height proportionally to desired width
      const originalWidthCm = width;
      const scaleFactor = widthCm / originalWidthCm;
      return height * scaleFactor;
    });
    
    // For two lines, add the heights and some spacing
    return heights.reduce((sum, h) => sum + h, 0) * 1.2;
  } else {
    // Single line calculation
    const { width, height } = measureTextInCm(text, font);
    
    // Scale height proportionally to desired width
    const originalWidthCm = width;
    const scaleFactor = widthCm / originalWidthCm;
    return height * scaleFactor;
  }
};

/**
 * Splits text into two lines for display
 */
export const splitTextIntoLines = (text: string): string[] => {
  if (text.length <= 20) {
    return [text];
  }
  
  // Try to find a space to break naturally
  const spaceIndex = text.substring(0, 20).lastIndexOf(' ');
  if (spaceIndex > 0) {
    return [
      text.substring(0, spaceIndex),
      text.substring(spaceIndex + 1, Math.min(text.length, spaceIndex + 21))
    ];
  } else {
    // If no space found, just split at 20 chars
    return [
      text.substring(0, 20),
      text.substring(20, Math.min(text.length, 40))
    ];
  }
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
