// @/lib/FontDetector.ts

type UnicodeRange = Array<number | number[]>;

export class FontDetector {
  private rangesByLang: {
    [font: string]: UnicodeRange;
  } = {};

  public async detect(
    text: string,
    fonts: string[],
  ): Promise<{
    [lang: string]: string;
  }> {
    await this.load(fonts);

    const result: {
      [lang: string]: string;
    } = {};

    // Iterate over characters (code points) of the text
    // Using a for...of loop on a string iterates over its characters (Unicode code points if handled correctly)
    for (const segment of text) { // Each 'segment' here is a single character
      const lang = this.detectSegment(segment, fonts);
      // If a language is detected for the character, append it to the corresponding language string
      if (lang) {
        result[lang] = (result[lang] || '') + segment;
      } else {
        // Optional: handle characters that don't match any specific font/language
        // For example, assign to a default or 'unknown' language
        const unknownFontKey = 'unknown'; // Or derive from languageFontMap
        result[unknownFontKey] = (result[unknownFontKey] || '') + segment;
      }
    }

    return result;
  }

  private detectSegment(segment: string, fonts: string[]): string | null {
    // Check the character against the Unicode ranges of the provided fonts
    for (const font of fonts) {
      const range = this.rangesByLang[font];
      if (range && checkSegmentInRange(segment, range)) {
        return font; // Return the font name (which acts as a language key here)
      }
    }
    // Also check against generic language keys in languageFontMap if they have ranges
    // This part might need refinement based on how languageFontMap keys relate to rangesByLang keys
    for (const langKey in languageFontMap) {
        const fontOrFonts = languageFontMap[langKey as keyof typeof languageFontMap];
        const fontsToCheck = Array.isArray(fontOrFonts) ? fontOrFonts : [fontOrFonts];
        for (const fontName of fontsToCheck) {
            const range = this.rangesByLang[fontName.replaceAll(' ', '+')]; // Ensure key format matches rangesByLang
            if (range && checkSegmentInRange(segment, range)) {
                return langKey; // Return the broader language key (e.g., 'ja-JP')
            }
        }
    }


    return null;
  }

  private async load(fonts: string[]): Promise<void> {
    let params = '';

    // Filter out fonts whose ranges are already loaded
    const existingLang = Object.keys(this.rangesByLang);
    const langNeedsToLoad = fonts.filter((font) => !existingLang.includes(font.replaceAll(' ', '+')));


    if (langNeedsToLoad.length === 0) {
      return;
    }

    // Construct family parameters for the API URL
    for (const font of langNeedsToLoad) {
      // Ensure font names are correctly formatted for the URL (e.g., 'Noto Sans JP' -> 'Noto+Sans+JP')
      params += `family=${font.replaceAll(' ', '+')}&`;
    }
    params += 'display=swap';

    const API = `https://fonts.googleapis.com/css2?${params}`;

    try {
      const response = await fetch(API, {
        headers: {
          // User-Agent to ensure TTF format is returned, as in original code
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch font data from Google Fonts API. Status: ${response.status}`);
        // Optionally, throw an error or handle specific fonts failing to load
        // For now, we'll just return and try to work with what might have loaded previously
        // or what doesn't need loading.
        langNeedsToLoad.forEach(font => {
            console.warn(`Could not load ranges for font: ${font}. It might not be available or the name is incorrect.`);
        });
        return;
      }

      const fontFace = await response.text();
      this.addDetectors(fontFace);

    } catch (error) {
        console.error("Error fetching or processing font data:", error);
        // Handle network errors or other issues during fetch
    }
  }

  private addDetectors(input: string) {
    const regex = /font-family:\s*'(.+?)';.+?unicode-range:\s*(.+?);/gms;
    // FIX: Convert iterator to array using Array.from()
    const matchesArray = Array.from(input.matchAll(regex));

    for (const match of matchesArray) {
      const [, _lang, rangeString] = match;
      // Normalize the font name extracted from CSS to match the keys used elsewhere (e.g., replace spaces with '+')
      const langKey = _lang.replaceAll(' ', '+');

      if (!this.rangesByLang[langKey]) {
        this.rangesByLang[langKey] = [];
      }
      // The convert function expects a string for the range, e.g., "U+2600-26FF, U+2700-27BF"
      this.rangesByLang[langKey].push(...convert(rangeString));
    }
  }
}

// Converts a CSS unicode-range string to an array of numbers or [start, end] tuples
function convert(input: string): UnicodeRange {
  return input.split(',').map((rangePart) => { // Split by comma, then trim whitespace
    const trimmedRangePart = rangePart.trim().replaceAll('U+', '');
    const [startHex, endHex] = trimmedRangePart.split('-').map((hex) => parseInt(hex, 16));

    if (isNaN(startHex)) { // Should not happen with valid input, but good to check
        console.warn(`Invalid hex value encountered in range: ${rangePart}`);
        return -1; // Or some other way to signify error / skip
    }
    if (isNaN(endHex)) { // This means it's a single code point, not a range
      return startHex;
    }
    return [startHex, endHex];
  }).filter(val => val !== -1); // Filter out any error markers if you added them
}

// Checks if a character (segment) falls within a given UnicodeRange
function checkSegmentInRange(segment: string, range: UnicodeRange): boolean {
  const codePoint = segment.codePointAt(0);

  if (typeof codePoint === 'undefined') return false; // codePointAt can return undefined

  return range.some((val) => {
    if (typeof val === 'number') {
      return codePoint === val;
    } else { // val is [start, end]
      const [start, end] = val;
      return start <= codePoint && codePoint <= end;
    }
  });
}

// Mapping of language codes/names to Google Font family names
// Ensure these font names are compatible with the Google Fonts API (e.g., spaces replaced with '+')
// @TODO: Support font style and weights, and make this option extensible rather
// than built-in.
// @TODO: Cover most languages with Noto Sans.
export const languageFontMap = {
  'ja-JP': 'Noto+Sans+JP',
  'ko-KR': 'Noto+Sans+KR',
  'zh-CN': 'Noto+Sans+SC', // Simplified Chinese
  'zh-TW': 'Noto+Sans+TC', // Traditional Chinese (Taiwan)
  'zh-HK': 'Noto+Sans+HK', // Traditional Chinese (Hong Kong)
  'th-TH': 'Noto+Sans+Thai',
  'bn-IN': 'Noto+Sans+Bengali', // Bengali (India)
  'ar-AR': 'Noto+Sans+Arabic', // Arabic
  'ta-IN': 'Noto+Sans+Tamil',  // Tamil (India)
  'ml-IN': 'Noto+Sans+Malayalam',// Malayalam (India)
  'he-IL': 'Noto+Sans+Hebrew', // Hebrew (Israel)
  'te-IN': 'Noto+Sans+Telugu', // Telugu (India)
  devanagari: 'Noto+Sans+Devanagari', // For Hindi, Marathi, Nepali, etc.
  kannada: 'Noto+Sans+Kannada',
  symbol: ['Noto+Sans+Symbols', 'Noto+Sans+Symbols+2'], // Example of multiple fonts for a category
  math: 'Noto+Sans+Math',
  unknown: 'Noto+Sans', // A general fallback
} as const; // Using 'as const' can help with type inference for keys if needed elsewhere
