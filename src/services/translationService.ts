import { NativeLanguage } from '../types';

export class TranslationService {
  // Translate text to target native language using Google Cloud Translate API with fallback
  static async translateText(
    text: string,
    targetLanguage: NativeLanguage
  ): Promise<string> {
    if (targetLanguage === 'English') return text;

    const langCodeMap: Record<NativeLanguage, string> = {
      Telugu: 'te',
      Hindi: 'hi',
      Tamil: 'ta',
      Kannada: 'kn',
      Malayalam: 'ml',
      Bengali: 'bn',
      Marathi: 'mr',
      Gujarati: 'gu',
      English: 'en',
    };

    const targetLangCode = langCodeMap[targetLanguage] || 'te';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLangCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (err) {
      console.warn('[TranslationService] Google Translate API error, returning original text:', err);
    }

    return text;
  }
}
