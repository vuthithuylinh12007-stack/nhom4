import { VocabularyItem } from '../types';

export type ReviewGrade = 1 | 2 | 3 | 4; // 1: Quên (Again), 2: Khó (Hard), 3: Tốt (Good), 4: Rất dễ (Easy)

export interface SRSReviewResult {
  srsStage: number;
  srsEaseFactor: number;
  srsIntervalDays: number;
  srsRepetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
  correctCount: number;
  incorrectCount: number;
  reviewCount: number;
  lastReviewedAt: string;
  lastReviewResult: 'correct' | 'incorrect';
  isLearned: boolean;
}

export class SpacedRepetitionService {
  /**
   * Format a Date object to YYYY-MM-DD string
   */
  public formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Add days to a date and return YYYY-MM-DD string
   */
  public addDays(d: Date, days: number): string {
    const next = new Date(d);
    next.setDate(next.getDate() + days);
    return this.formatDate(next);
  }

  /**
   * Core SuperMemo-2 (SM-2) Spaced Repetition Algorithm
   * @param item The current vocabulary item
   * @param grade 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   */
  public calculateNextReview(item: VocabularyItem, grade: ReviewGrade): SRSReviewResult {
    const now = new Date();
    const currentRepetitions = item.srsRepetitions || 0;
    const currentEase = item.srsEaseFactor || 2.5;
    const currentInterval = item.srsIntervalDays || 1;
    const currentStage = item.srsStage || 0;

    const isSuccess = grade >= 3;
    const correctCount = (item.correctCount || 0) + (isSuccess ? 1 : 0);
    const incorrectCount = (item.incorrectCount || 0) + (!isSuccess ? 1 : 0);
    const reviewCount = (item.reviewCount || 0) + 1;

    let newRepetitions = currentRepetitions;
    let newInterval = currentInterval;
    let newEase = currentEase;
    let newStage = currentStage;

    if (grade === 1) {
      // Again / Quên: Reset intervals, review again tomorrow
      newRepetitions = 0;
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      newStage = 1;
    } else if (grade === 2) {
      // Hard / Khó: Slight penalty, small interval advance
      newRepetitions = Math.max(0, currentRepetitions - 1);
      newInterval = Math.max(1, Math.round(currentInterval * 1.2));
      newEase = Math.max(1.3, currentEase - 0.15);
      newStage = Math.max(1, currentStage);
    } else if (grade === 3) {
      // Good / Tốt: Standard SM-2 interval progression
      if (currentRepetitions === 0) {
        newInterval = 1;
        newStage = 1;
      } else if (currentRepetitions === 1) {
        newInterval = 3;
        newStage = 2;
      } else if (currentRepetitions === 2) {
        newInterval = 7;
        newStage = 3;
      } else {
        newInterval = Math.round(currentInterval * currentEase);
        newStage = Math.min(5, currentStage + 1);
      }
      newRepetitions = currentRepetitions + 1;
      newEase = Math.max(1.3, currentEase + 0.05);
    } else if (grade === 4) {
      // Easy / Rất dễ: Bonus interval multiplier
      if (currentRepetitions === 0) {
        newInterval = 3;
        newStage = 2;
      } else if (currentRepetitions === 1) {
        newInterval = 6;
        newStage = 3;
      } else {
        newInterval = Math.round(currentInterval * currentEase * 1.35);
        newStage = Math.min(5, currentStage + 1);
      }
      newRepetitions = currentRepetitions + 1;
      newEase = Math.min(3.0, currentEase + 0.15);
    }

    const nextReviewDate = this.addDays(now, newInterval);

    return {
      srsStage: newStage,
      srsEaseFactor: parseFloat(newEase.toFixed(2)),
      srsIntervalDays: newInterval,
      srsRepetitions: newRepetitions,
      nextReviewDate,
      correctCount,
      incorrectCount,
      reviewCount,
      lastReviewedAt: now.toISOString(),
      lastReviewResult: isSuccess ? 'correct' : 'incorrect',
      isLearned: newStage >= 2,
    };
  }

  /**
   * Check if a vocabulary item is due for review today or overdue
   */
  public isDue(item: VocabularyItem, todayStr?: string): boolean {
    const today = todayStr || this.formatDate(new Date());

    // Manual schedule override takes precedence
    if (item.customScheduledDate) {
      return item.customScheduledDate <= today;
    }

    // Never reviewed word: consider due if not learned yet
    if (!item.nextReviewDate) {
      return !item.isLearned;
    }

    return item.nextReviewDate <= today;
  }

  /**
   * Calculate urgency score for sorting review priority
   * Higher score means more urgent to review!
   */
  public calculateUrgency(item: VocabularyItem, todayStr?: string): number {
    const today = todayStr || this.formatDate(new Date());
    let score = 0;

    // Check manual scheduled date
    if (item.customScheduledDate) {
      if (item.customScheduledDate <= today) {
        score += 80;
      }
    }

    // Overdue days
    const reviewDate = item.customScheduledDate || item.nextReviewDate;
    if (reviewDate) {
      const diffMs = new Date(today).getTime() - new Date(reviewDate).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        score += diffDays * 12; // Overdue weight
      } else if (diffDays === 0) {
        score += 25; // Due today
      }
    } else {
      // Unreviewed
      score += 15;
    }

    // High error rate weight
    if (item.lastReviewResult === 'incorrect') {
      score += 35;
    }
    const incorrect = item.incorrectCount || 0;
    const correct = item.correctCount || 0;
    if (incorrect > correct) {
      score += (incorrect - correct) * 8;
    }

    // Stage weight: Lower stages need more urgent reinforcement
    const stage = item.srsStage || 0;
    score += (5 - stage) * 3;

    return score;
  }

  /**
   * Get human-readable pedagogical reason why this word is recommended
   */
  public getSuggestionReason(item: VocabularyItem, todayStr?: string): string {
    const today = todayStr || this.formatDate(new Date());

    if (item.customScheduledDate) {
      if (item.customScheduledDate < today) {
        return `Lịch tự đặt quá hạn (${item.customScheduledDate})`;
      }
      return `Lịch ôn bạn đã đặt hẹn (${item.customScheduledDate})`;
    }

    if (item.lastReviewResult === 'incorrect') {
      return `Trả lời sai ở lần ôn trước (${item.incorrectCount || 1} lần sai)`;
    }

    if (!item.nextReviewDate) {
      return 'Từ vựng mới cần củng cố';
    }

    const diffMs = new Date(today).getTime() - new Date(item.nextReviewDate).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Đã quá hạn ôn ${diffDays} ngày (Thuật toán SM-2)`;
    }
    if (diffDays === 0) {
      return `Đến hạn hôm nay (Giai đoạn ${item.srsStage || 1}: cách ${item.srsIntervalDays || 1} ngày)`;
    }

    return `Lịch định kỳ: ${item.nextReviewDate}`;
  }

  /**
   * Sort and return suggested vocabulary queue based on Spaced Repetition
   */
  public getSuggestedQueue(
    vocabularies: VocabularyItem[],
    options?: { categoryId?: number; limit?: number; onlyDue?: boolean }
  ): (VocabularyItem & { srsReason: string; urgency: number })[] {
    const today = this.formatDate(new Date());

    let pool = [...vocabularies];
    if (options?.categoryId !== undefined) {
      pool = pool.filter((v) => v.categoryId === options.categoryId);
    }

    if (options?.onlyDue) {
      pool = pool.filter((v) => this.isDue(v, today));
    }

    const scored = pool.map((v) => ({
      ...v,
      urgency: this.calculateUrgency(v, today),
      srsReason: this.getSuggestionReason(v, today),
    }));

    // Sort descending by urgency
    scored.sort((a, b) => b.urgency - a.urgency);

    if (options?.limit) {
      return scored.slice(0, options.limit);
    }
    return scored;
  }
}

export const srsService = new SpacedRepetitionService();
