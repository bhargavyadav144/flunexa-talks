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
      Punjabi: 'pa',
      Odia: 'or',
      Urdu: 'ur',
      Assamese: 'as',
      Sanskrit: 'sa',
      Nepali: 'ne',
      Konkani: 'kok',
      Kashmiri: 'ks',
      Sindhi: 'sd',
      Manipuri: 'mni',
      Bodo: 'brx',
      Dogri: 'doi',
      Maithili: 'mai',
      Santali: 'sat',
    };

    const targetLangCode = langCodeMap[targetLanguage] || 'en';

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
