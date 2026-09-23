import { ShoeColorway } from '../types';

export interface ColorFilterOption {
  name: string;
  label?: string;
  hex: string;
  border?: boolean;
}

export const COLOR_KEYWORDS: Record<string, string[]> = {
  'Black': ['black', 'carbon', 'obsidian', 'dark', 'stealth', 'noir'],
  'White': ['white', 'chalk', 'optic', 'pristine', 'crystal', 'pure', 'cloud'],
  'Cream / Gum': [
    'cream',
    'gum',
    'brown',
    'tobacco',
    'wheat',
    'sand',
    'beige',
    'tan',
    'biscuit',
    'amber',
    'caramel',
    'khaki',
    'strata',
    'off-white',
    'off white',
    'wonder white',
  ],
  'Green': ['green', 'olive', 'moss', 'forest', 'collegiate green'],
  'Blue': ['blue', 'royal', 'cyan', 'navy', 'sky', 'indigo'],
  'Red': ['red', 'scarlet', 'maroon', 'port', 'crimson', 'ruby', 'pink', 'solar red', 'lava orange', 'orange'],
  'Grey': ['grey', 'gray', 'silver', 'aluminium', 'ash', 'halo silver'],
};

/**
 * Calculates a match score (0 = no match, 50 = secondary match, 100 = primary color match)
 * for a specific shoe colorway against a selected color filter.
 */
export function scoreColorwayForFilter(colorwayName: string, filterName: string): number {
  const keywords = COLOR_KEYWORDS[filterName] || [filterName.toLowerCase()];
  const lowerName = colorwayName.toLowerCase();
  const parts = lowerName.split('/').map((p) => p.trim());
  const primaryPart = parts[0] || '';
  const secondaryParts = parts.slice(1).join(' ');

  // 1. Check primary segment (highest priority)
  for (const kw of keywords) {
    if (primaryPart.includes(kw)) {
      return 100;
    }
  }

  // 2. Check secondary segments (accent colors)
  for (const kw of keywords) {
    if (secondaryParts.includes(kw)) {
      return 50;
    }
  }

  // 3. Fallback: check full string
  for (const kw of keywords) {
    if (lowerName.includes(kw)) {
      return 40;
    }
  }

  return 0;
}

/**
 * Determines whether a shoe matches any of the active selected color filters.
 */
export function shoeMatchesColorFilters(
  shoeColors: ShoeColorway[],
  selectedFilterColors: string[]
): boolean {
  if (!selectedFilterColors || selectedFilterColors.length === 0) return true;
  return shoeColors.some((color) =>
    selectedFilterColors.some((fc) => scoreColorwayForFilter(color.name, fc) > 0)
  );
}

/**
 * Finds the index of the colorway that best matches the active selected color filters.
 * Returns 0 if none match or if no filters are selected.
 */
export function getBestMatchingColorIndex(
  shoeColors: ShoeColorway[],
  selectedFilterColors: string[]
): number {
  if (!selectedFilterColors || selectedFilterColors.length === 0 || !shoeColors || shoeColors.length === 0) {
    return 0;
  }

  let bestIndex = 0;
  let highestScore = 0;

  shoeColors.forEach((color, index) => {
    let bestScoreForThisColor = 0;
    for (const filterColor of selectedFilterColors) {
      const score = scoreColorwayForFilter(color.name, filterColor);
      if (score > bestScoreForThisColor) {
        bestScoreForThisColor = score;
      }
    }

    if (bestScoreForThisColor > highestScore) {
      highestScore = bestScoreForThisColor;
      bestIndex = index;
    }
  });

  return bestIndex;
}
