export type WordType = 'Danh từ' | 'Động từ' | 'Tính từ' | 'Phó từ' | 'Trợ từ' | 'Đại từ' | 'Số từ' | 'Cụm từ' | 'Khác';

export type WordLevel = 'Sơ cấp 1' | 'Sơ cấp 2' | 'Trung cấp' | 'Nâng cao';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  dailyGoal: number; // e.g. 10 words per day
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
  isGuest?: boolean;
}

export interface VocabularyCategory {
  id: number;
  name: string;
  koreanName: string;
  description: string;
  icon: string;
  targetCount: number; // 1,000 as required
}

export interface VocabularyItem {
  id: string;
  korean: string;
  vietnamese: string;
  meaning?: string; // alias for vietnamese
  pronunciation: string;
  wordType: WordType;
  exampleKorean: string;
  example?: string; // alias for exampleKorean
  exampleVietnamese: string;
  exampleMeaning?: string; // alias for exampleVietnamese
  categoryId: number;
  topic?: string; // topic name string
  level: WordLevel;
  note?: string;
  imageUrl?: string;
  fallbackEmoji?: string;
  isFavorite: boolean;
  isLearned: boolean;
  isCustom?: boolean; // user created
  createdAt: string;
  updatedAt: string;
  reviewCount?: number;
  lastReviewedAt?: string;
  lastReviewResult?: 'correct' | 'incorrect';
  correctCount?: number;
  incorrectCount?: number;
  // Spaced Repetition (SM-2) fields
  srsStage?: number; // 0 to 5
  srsEaseFactor?: number; // default 2.5
  srsIntervalDays?: number; // days until next review
  srsRepetitions?: number; // consecutive correct reviews
  nextReviewDate?: string; // YYYY-MM-DD
  customScheduledDate?: string; // YYYY-MM-DD manual schedule
  srsReason?: string; // reason why word is suggested
}

export interface GrammarItem {
  id: string;
  title: string;
  meaning: string;
  formula: string;
  conditions: string;
  examples: {
    korean: string;
    vietnamese: string;
  }[];
  commonMistakes: string;
  practiceQuestion: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  level: 'Sơ cấp' | 'Trung cấp' | 'Nâng cao';
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface ConversationTurn {
  speaker: 'A' | 'B';
  speakerName?: string;
  korean: string;
  pronunciation: string;
  vietnamese: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  koreanTitle: string;
  situation: string;
  level: string;
  dialog: ConversationTurn[];
}

export interface GameScoreRecord {
  id: string;
  gameType: 'pictureMatch' | 'quiz' | 'matching' | 'fillBlank' | 'blitz';
  gameName: string;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  date: string;
  topicName?: string;
  level?: string;
}

export interface QuizResultRecord {
  id: string;
  topicName: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  weakTopics: string[];
}

export interface FlashcardHistory {
  date: string;
  correct: number;
  incorrect: number;
  total: number;
}
