/**
 * Web Speech API Speech Recognition service for Korean pronunciation checking
 */

export interface SpeechEvaluationResult {
  transcript: string;
  expected: string;
  score: number; // 0 - 100
  isMatch: boolean; // >= 75%
  grade: 'excellent' | 'good' | 'retry';
  feedback: string;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ko-KR';
        this.recognition.maxAlternatives = 3;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    expectedKorean: string,
    onResult: (evalResult: SpeechEvaluationResult) => void,
    onError: (errorMessage: string) => void,
    onStatusChange?: (listening: boolean) => void
  ): void {
    if (!this.recognition) {
      onError('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Web Speech API). Hãy thử trên Google Chrome hoặc Safari.');
      return;
    }

    try {
      if (this.isListening) {
        this.recognition.abort();
      }

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStatusChange) onStatusChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onStatusChange) onStatusChange(false);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onStatusChange) onStatusChange(false);
        let msg = 'Không thể thu âm giọng nói.';
        if (event.error === 'not-allowed') {
          msg = 'Vui lòng cho phép quyền truy cập micro trong trình duyệt để luyện phát âm.';
        } else if (event.error === 'no-speech') {
          msg = 'Chưa nghe thấy giọng nói. Hãy nhấn micro và phát âm lại rõ ràng nhé!';
        } else if (event.error === 'network') {
          msg = 'Lỗi kết nối mạng khi nhận diện giọng nói.';
        }
        onError(msg);
      };

      this.recognition.onresult = (event: any) => {
        const results = event.results;
        if (!results || results.length === 0) {
          onError('Không nhận diện được giọng nói. Vui lòng thử lại.');
          return;
        }

        // Check best alternative
        let bestTranscript = '';
        let highestScore = -1;

        for (let i = 0; i < results[0].length; i++) {
          const candidate = results[0][i].transcript.trim();
          const score = this.calculateSimilarity(candidate, expectedKorean);
          if (score > highestScore) {
            highestScore = score;
            bestTranscript = candidate;
          }
        }

        const evalResult = this.evaluatePronunciation(bestTranscript, expectedKorean, highestScore);
        onResult(evalResult);
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
      onError(err?.message || 'Không thể khởi động micro.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Calculate string similarity score (0 to 100)
   */
  public calculateSimilarity(spoken: string, expected: string): number {
    const s1 = spoken.replace(/[\s\.\,\?\!]/g, '').toLowerCase();
    const s2 = expected.replace(/[\s\.\,\?\!]/g, '').toLowerCase();

    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;

    // Check substring inclusion
    if (s1.includes(s2) || s2.includes(s1)) {
      const ratio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
      return Math.round(Math.max(80, ratio * 100));
    }

    // Levenshtein distance
    const track = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const distance = track[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    const similarity = Math.max(0, Math.round((1 - distance / maxLen) * 100));
    return similarity;
  }

  private evaluatePronunciation(spoken: string, expected: string, score: number): SpeechEvaluationResult {
    const cleanScore = Math.min(100, Math.max(0, score));
    let grade: 'excellent' | 'good' | 'retry' = 'retry';
    let feedback = '';

    if (cleanScore >= 85) {
      grade = 'excellent';
      feedback = `Xuất sắc! Bạn phát âm "${spoken}" chuẩn xác ${cleanScore}% so với từ chuẩn "${expected}".`;
    } else if (cleanScore >= 60) {
      grade = 'good';
      feedback = `Khá tốt (${cleanScore}%)! Bạn nói "${spoken}". Hãy chú ý phát âm rõ hơn để đạt 100% chuẩn "${expected}".`;
    } else {
      grade = 'retry';
      feedback = `Cần cố gắng: Hệ thống nghe được "${spoken || '(chưa rõ)'}" (${cleanScore}%). Từ chuẩn là "${expected}". Nhấn micro để thử lại nhé!`;
    }

    return {
      transcript: spoken,
      expected,
      score: cleanScore,
      isMatch: cleanScore >= 75,
      grade,
      feedback,
    };
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
