/**
 * Acoustic Echo Cancellation & Self-Voice Filtering Service for Flunexa Talk
 * Prevents the AI from listening to, transcribing, or responding to its own voice
 * while allowing natural human barge-in and conversational interruption.
 */

export class EchoCancellationService {
  /**
   * Cleans text for robust phonetic / lexical comparison
   */
  public static normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Computes token overlap ratio between transcript and candidate AI text
   */
  public static calculateOverlapRatio(transcript: string, referenceText: string): number {
    const cleanTrans = this.normalize(transcript);
    const cleanRef = this.normalize(referenceText);

    if (!cleanTrans || !cleanRef) return 0;

    // Direct containment (substring)
    if (cleanRef.includes(cleanTrans)) return 1.0;
    if (cleanTrans.length > 8 && cleanTrans.includes(cleanRef)) return 0.9;

    const transWords = cleanTrans.split(' ').filter((w) => w.length > 1);
    if (transWords.length === 0) return 0;

    const refWordsSet = new Set(cleanRef.split(' '));
    const matchingWords = transWords.filter((w) => refWordsSet.has(w));

    return matchingWords.length / transWords.length;
  }

  /**
   * Determines if recognized text is an echo of active or recent AI speech
   */
  public static isEchoOfAI(
    transcript: string,
    activeAIText: string = '',
    recentAIMessages: string[] = [],
    lastSpokenTimestamp: number = 0
  ): { isEcho: boolean; reason?: string } {
    if (!transcript || !transcript.trim()) {
      return { isEcho: true, reason: 'Empty transcript' };
    }

    const cleanTrans = this.normalize(transcript);

    // 1. Check against actively playing AI audio
    if (activeAIText && activeAIText.trim()) {
      const activeOverlap = this.calculateOverlapRatio(transcript, activeAIText);
      if (activeOverlap >= 0.55) {
        return {
          isEcho: true,
          reason: `Matches active AI speech (${Math.round(activeOverlap * 100)}% overlap)`,
        };
      }
    }

    // 2. Check room reverberation window (within 1000ms after AI playback ended)
    const timeSincePlayback = Date.now() - lastSpokenTimestamp;
    const isInsideReverbWindow = lastSpokenTimestamp > 0 && timeSincePlayback < 1000;

    // 3. Check against recent AI messages
    for (let i = 0; i < recentAIMessages.length; i++) {
      const aiMsg = recentAIMessages[i];
      if (!aiMsg) continue;

      const overlap = this.calculateOverlapRatio(transcript, aiMsg);

      // If inside reverberation tail, be stricter
      const threshold = isInsideReverbWindow ? 0.45 : 0.65;

      if (overlap >= threshold) {
        return {
          isEcho: true,
          reason: `Matches recent AI message #${i + 1} (${Math.round(overlap * 100)}% overlap, ${timeSincePlayback}ms after playback)`,
        };
      }
    }

    return { isEcho: false };
  }
}
