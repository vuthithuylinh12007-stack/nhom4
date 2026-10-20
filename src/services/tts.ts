/**
 * Text-to-Speech service for Korean language using Web Speech API
 */

class TTSService {
  private isSpeaking = false;

  public speak(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this browser.');
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const cleanText = text.trim();
      if (!cleanText) return false;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85; // Slightly slower for language learners
      utterance.pitch = 1.0;

      // Find Korean voice if available
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((v) => v.lang.startsWith('ko') || v.name.toLowerCase().includes('korean'));
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error('Failed to trigger TTS:', err);
      return false;
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getStatus(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
