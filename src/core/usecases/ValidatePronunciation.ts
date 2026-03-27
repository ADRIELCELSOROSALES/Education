import { normalizeText } from '../../shared/utils/textNormalizer';

export function validatePronunciation(spoken: string, expected: string): boolean {
  return normalizeText(spoken) === normalizeText(expected);
}
