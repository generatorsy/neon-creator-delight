
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
 * Calculates approximate path length of text in centimeters
 * This estimates the centerline length of each glyph
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
  
  // For each character, measure its width and add to total
  // This is an approximation as we can't directly measure the exact centerline path
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = context.measureText(char).width;
    
    // Add character width to total path length
    totalPathLength += charWidth;
    
    // For complex characters (like m, w, etc.), add a small correction factor
    // based on the character complexity
    if (/[mwMW]/.test(char)) {
      totalPathLength += charWidth * 0.3; // 30% extra for complex characters
    } else if (/[BDOPQRSbdopqrs]/.test(char)) {
      totalPathLength += charWidth * 0.2; // 20% extra for curved characters
    }
  }
  
  // Convert to centimeters
  return pxToCm(totalPathLength);
};

/**
 * Calculates approximate path length for text that may span multiple lines
 */
export const calculatePathLengthForText = (
  text: string,
  font: string,
  enableTwoLines: boolean = false
): number => {
  if (enableTwoLines && text.length > 20) {
    const lines = splitTextIntoLines(text);
    // Sum the path length of each line
    return lines.reduce((sum, line) => {
      return sum + calculateTextPathLength(line, font);
    }, 0);
  } else {
    return calculateTextPathLength(text, font);
  }
};
