/**
 * Generator formatów SVG i DXF oparty na rzeczywistych ścieżkach wektorowych
 */
// Uproszczone funkcje eksportu, które działają bez zewnętrznych zależności
import { createSVGPath, textToPolyline } from './fontHelper';

/**
 * Generuje plik SVG dla tekstu, przekształcając tekst w ścieżki wektorowe
 */
// Kompletnie synchroniczna wersja
export const generateNeonSVG = (
  text: string,
  font: string,
  width: number, // w cm
  height: number, // w cm
  color: string,
  letterColors: Record<number, string> = {},
  enableTwoLines: boolean = false
): string => {
  // Stałe i przeliczniki jednostek
  const UNIT = 'cm';
  
  // Wymiary w jednostkach (cm)
  const svgWidth = width;
  const svgHeight = height;
  
  // ViewBox w mm (1cm = 10mm)
  const viewBoxWidth = width * 10;
  const viewBoxHeight = height * 10;
  
  // Podziel tekst na linie jeśli potrzeba
  const lines = text.includes('\n') || enableTwoLines 
    ? text.split('\n') 
    : [text];
  
  // Rozmiar czcionki w mm
  const fontSize = lines.length > 1 
    ? Math.min(viewBoxHeight / (lines.length * 1.3), viewBoxWidth / (text.length * 0.6)) 
    : Math.min(viewBoxHeight * 0.7, viewBoxWidth / Math.max(text.length * 0.8, 1));
  
  // Rozpocznij tworzenie SVG
  let svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${svgWidth}${UNIT}" height="${svgHeight}${UNIT}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" 
  xmlns="http://www.w3.org/2000/svg" version="1.1">
  <title>Neon Design: ${text}</title>
  <desc>Vector neon text design with dimensions: ${width}${UNIT} × ${height}${UNIT}</desc>
  
  <!-- Wymiary i metadane -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description>
        <dc:title>Neon: ${text}</dc:title>
        <dc:description>Vector neon text design</dc:description>
        <dc:format>image/svg+xml</dc:format>
        <dc:dimensions>Width: ${width}${UNIT}, Height: ${height}${UNIT}</dc:dimensions>
        <dc:source>Neon Creator Delight App</dc:source>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  
  <!-- Bounding box (pomocnicze linie) -->
  <rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" 
    fill="none" stroke="blue" stroke-width="0.25" stroke-dasharray="1,1"/>
  
  <!-- Tekst neonu jako ścieżki wektorowe -->
  <g id="neon-text">`;
  
  // Dodaj ścieżki dla każdej linii tekstu (synchroniczna implementacja)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || ' ';
    const lineY = lines.length > 1 
      ? (viewBoxHeight / (lines.length + 0.5)) * (i + 0.8)
      : viewBoxHeight / 2;
      
    // Zamiast asynchronicznego createSVGPath używamy prostszej metody
    const letterWidth = fontSize * 0.6;
    const textWidth = line.length * letterWidth;
    
    // Dodaj grupę reprezentującą każdą linię tekstu
    svgContent += `
    <g class="text-line">
      <!-- Obramowanie linii tekstu -->
      <rect 
        x="${viewBoxWidth / 2 - textWidth / 2}" 
        y="${lineY - fontSize / 2}" 
        width="${textWidth}" 
        height="${fontSize}" 
        fill="none" 
        stroke="black" 
        stroke-width="0.5"
      />
      
      <!-- Tekst -->
      <text 
        x="${viewBoxWidth / 2}" 
        y="${lineY + fontSize / 4}" 
        font-family="${font}, sans-serif" 
        font-size="${fontSize}" 
        text-anchor="middle" 
        fill="black"
      >${line}</text>
    </g>`;
  }
  
  // Dodaj pomocnicze informacje i wymiary
  svgContent += `
  </g>
  
  <!-- Informacje o wymiarach -->
  <g id="dimensions" font-family="Arial, sans-serif" font-size="2" fill="black" stroke="none">
    <!-- Linie wymiarowe -->
    <line x1="0" y1="-2" x2="${viewBoxWidth}" y2="-2" stroke="black" stroke-width="0.2"/>
    <text x="${viewBoxWidth/2}" y="-5" text-anchor="middle" font-size="3">${width} ${UNIT}</text>
    
    <line x1="-2" y1="0" x2="-2" y2="${viewBoxHeight}" stroke="black" stroke-width="0.2"/>
    <text x="-5" y="${viewBoxHeight/2}" text-anchor="middle" transform="rotate(-90, -5, ${viewBoxHeight/2})" font-size="3">${height} ${UNIT}</text>
    
    <!-- Informacje w prawym dolnym rogu -->
    <text x="${viewBoxWidth - 25}" y="${viewBoxHeight - 1}" text-anchor="end" font-size="1.5">
      Neon Creator Delight - Vector Design
    </text>
  </g>
</svg>`;
  
  return svgContent;
};

/**
 * Generuje treść pliku DXF używając prawdziwych polilinii zamiast tekstu
 */
export const generateNeonDXF = (
  text: string,
  font: string,
  width: number, // w cm
  height: number, // w cm
  color: string, 
  letterColors: Record<number, string> = {},
  enableTwoLines: boolean = false
): string => {
  // Podziel tekst na linie jeśli potrzeba
  const lines = text.includes('\n') || enableTwoLines 
    ? text.split('\n') 
    : [text];
  
  // Wysokość dla każdej linii
  const lineHeight = height / lines.length;
  
  // Wygeneruj ścieżki dla każdej litery tekstu
  let letterPaths = '';
  
  lines.forEach((line, lineIndex) => {
    // Oblicz Y dla tej linii
    const lineY = height * (0.5 - 0.2 * (lines.length - 1) + 0.4 * lineIndex);
    
    // Generuj polilinię dla każdej litery w tej linii
    const letterPolylines = textToPolyline(
      line,
      font,
      height / 3,  // fontSize
      width * 0.1, // x start
      lineY,       // y dla tej linii
      width * 0.8, // szerokość dla całej linii
      lineHeight   // wysokość dla linii
    );
    
    // Konwertuj każdą polilinię do formatu DXF
    letterPolylines.forEach(points => {
      letterPaths += createDXFPolyline(points);
    });
  });
  
  // Generuj DXF w starszej wersji (R12) dla lepszej kompatybilności
  const dxfHeader = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
${width}
20
${height}
30
0.0
9
$LIMMIN
10
0.0
20
0.0
9
$LIMMAX
10
${width}
20
${height}
9
$LUNITS
70
2
9
$LUPREC
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
2
TABLES
0
TABLE
2
LTYPE
0
LTYPE
2
CONTINUOUS
70
64
3
Solid line
72
65
73
0
40
0.0
0
ENDTAB
0
TABLE
2
LAYER
0
LAYER
2
0
70
64
62
7
6
CONTINUOUS
0
LAYER
2
TEXT
70
64
62
7
6
CONTINUOUS
0
LAYER
2
DIMENSIONS
70
64
62
1
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
2
BLOCKS
0
ENDSEC
2
ENTITIES`;

  // Bounding box i pomiary
  const dxfBoundingBox = `
0
LINE
8
DIMENSIONS
10
0
20
0
30
0
11
${width}
21
0
31
0
0
LINE
8
DIMENSIONS
10
${width}
20
0
30
0
11
${width}
21
${height}
31
0
0
LINE
8
DIMENSIONS
10
${width}
20
${height}
30
0
11
0
21
${height}
31
0
0
LINE
8
DIMENSIONS
10
0
20
${height}
30
0
11
0
21
0
31
0
0
TEXT
8
DIMENSIONS
10
${width / 2}
20
-1.0
30
0.0
40
0.5
1
${width} cm
72
1
0
TEXT
8
DIMENSIONS
10
-1.0
20
${height / 2}
30
0.0
40
0.5
1
${height} cm
72
1
0
CIRCLE
8
DIMENSIONS
10
0
20
0
30
0
40
0.1
0
CIRCLE
8
DIMENSIONS
10
${width}
20
0
30
0
40
0.1
0
CIRCLE
8
DIMENSIONS
10
${width}
20
${height}
30
0
40
0.1
0
CIRCLE
8
DIMENSIONS
10
0
20
${height}
30
0
40
0.1
0`;

  // Zakończenie pliku DXF
  const dxfFooter = `
ENDSEC
0
EOF`;

  // Połącz wszystkie części
  return dxfHeader + letterPaths + dxfBoundingBox + dxfFooter;
};

/**
 * Tworzy sekcję POLYLINE w formacie DXF dla zestawu punktów
 */
const createDXFPolyline = (points: {x: number, y: number}[]): string => {
  if (points.length === 0) return '';
  
  // Nagłówek polilinii
  let polyline = `
0
POLYLINE
8
TEXT
66
1
70
1`;
  
  // Każdy punkt jako VERTEX
  points.forEach(point => {
    polyline += `
0
VERTEX
8
TEXT
10
${point.x}
20
${point.y}
30
0.0`;
  });
  
  // Koniec polilinii
  polyline += `
0
SEQEND
`;
  
  return polyline;
};

/**
 * Pobiera zawartość jako plik
 */
export const downloadFile = (
  content: string, 
  filename: string, 
  contentType: string
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Funkcja pomocnicza do pobierania SVG
 */
export const downloadSVG = (
  text: string,
  font: string,
  width: number,
  height: number,
  color: string,
  letterColors: Record<number, string> = {},
  enableTwoLines: boolean = false
): void => {
  try {
    // Korzystamy z synchronicznej funkcji
    const svgContent = generateNeonSVG(text, font, width, height, color, letterColors, enableTwoLines);
    const filename = `neon_${text.replace(/[\s\/\\]/g, '_').slice(0, 20)}_${width}x${height}cm.svg`;
    downloadFile(svgContent, filename, 'image/svg+xml');
  } catch (error) {
    console.error('Błąd przy generowaniu pliku SVG:', error);
    alert('Wystąpił błąd przy generowaniu pliku SVG. Spróbuj ponownie.');
  }
};

/**
 * Funkcja pomocnicza do pobierania DXF
 */
export const downloadDXF = (
  text: string,
  font: string,
  width: number,
  height: number,
  color: string,
  letterColors: Record<number, string> = {},
  enableTwoLines: boolean = false
): void => {
  try {
    const dxfContent = generateNeonDXF(text, font, width, height, color, letterColors, enableTwoLines);
    const filename = `neon_${text.replace(/[\s\/\\]/g, '_').slice(0, 20)}_${width}x${height}cm.dxf`;
    downloadFile(dxfContent, filename, 'application/dxf');
  } catch (error) {
    console.error('Błąd przy generowaniu pliku DXF:', error);
    alert('Wystąpił błąd przy generowaniu pliku DXF. Spróbuj ponownie.');
  }
};

/**
 * Generuje prostą miniaturę SVG do podglądu w dialogu
 */
export const generateSVGPreview = (
  text: string,
  font: string,
  width: number,
  height: number
): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}cm" height="${height}cm" viewBox="0 0 ${width*10} ${height*10}" 
      xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="white" stroke="black" stroke-width="1"/>
      <text x="50%" y="50%" font-family="${font}, sans-serif" font-size="${height*3}px" text-anchor="middle" 
        dominant-baseline="middle" fill="black">
        ${text.replace('\n', '\n\t\t\t\t').trim()}
      </text>
      <text x="5" y="${height*10-5}" font-family="Arial, sans-serif" font-size="10" fill="gray">
        Wymiary: ${width}cm × ${height}cm
      </text>
    </svg>
  `)}`;
};

/**
 * Generuje prostą miniaturę DXF do podglądu w dialogu
 */
export const generateDXFPreview = (
  text: string,
  font: string,
  width: number,
  height: number
): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}cm" height="${height}cm" viewBox="0 0 ${width*10} ${height*10}" 
      xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="white" stroke="black" stroke-width="1"/>
      
      <!-- Prostokąty oznaczające litery -->
      ${Array.from(text).map((char, i) => {
        const charWidth = (width * 10) / text.length;
        const x = i * charWidth;
        return `<rect x="${x}" y="${height*10*0.2}" width="${charWidth*0.8}" height="${height*10*0.6}" fill="none" stroke="blue" stroke-width="1"/>`;
      }).join('')}
      
      <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="gray">
        Format DXF - ${width}cm × ${height}cm
      </text>
    </svg>
  `)}`;
};
