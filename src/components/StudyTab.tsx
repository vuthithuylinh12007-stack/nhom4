import React, { useState, useMemo } from 'react';
import {
  VocabularyCategory,
  VocabularyItem,
  GrammarItem,
  WordLevel,
  ConversationItem,
} from '../types';
import { VOCABULARY_CATEGORIES } from '../data/categories';
import { INITIAL_CONVERSATIONS } from '../data/initialConversations';
import { storageService } from '../services/storage';
import { ttsService } from '../services/tts';
import { srsService, ReviewGrade } from '../services/spacedRepetition';
import { AddEditVocabularyModal } from './AddEditVocabularyModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ScheduleReviewModal } from './ScheduleReviewModal';
import { TopikExamModal } from './TopikExamModal';
import { speechRecognitionService, SpeechEvaluationResult } from '../services/speechRecognition';
import { CustomVocabFileModal } from './CustomVocabFileModal';
import confetti from 'canvas-confetti';
import { HangoMascot } from './games/HangoMascot';
import { soundEffects } from '../services/soundEffects';
import {
  Search,
  Plus,
  Star,
  CheckCircle,
  Volume2,
  Edit2,
  Trash2,
  RotateCw,
  BookMarked,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Mic,
  RotateCcw,
  Clock,
  Award,
  Calendar,
  Zap,
  BrainCircuit,
  History,
  Layers,
} from 'lucide-react';

interface StudyTabProps {
  initialSubTab?: string;
  onOpenImportExport: () => void;
}

export const StudyTab: React.FC<StudyTabProps> = ({ initialSubTab = 'vocab', onOpenImportExport }) => {
  const [subTab, setSubTab] = useState<'vocab' | 'grammar' | 'dialogue' | 'flashcard' | 'quiz'>(
    (initialSubTab as any) || 'vocab'
  );

  // Vocabulary list states
  const [vocabs, setVocabs] = useState<VocabularyItem[]>(() => storageService.getVocabularies());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learned' | 'unlearned' | 'favorite'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'newest'>('default');

  // Modals for Vocab
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VocabularyItem | null>(null);

  // Grammar states
  const [grammars, setGrammars] = useState<GrammarItem[]>(() => storageService.getGrammars());
  const [grammarSearch, setGrammarSearch] = useState('');
  const [grammarLevel, setGrammarLevel] = useState<string>('all');
  const [grammarSelectedQuizAnswers, setGrammarSelectedQuizAnswers] = useState<Record<string, number>>({});

  // Conversation states
  const [conversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [showTranslations, setShowTranslations] = useState(true);
  const [roleplayMode, setRoleplayMode] = useState<'all' | 'A' | 'B'>('all');

  // Flashcard states
  const [flashcardMode, setFlashcardMode] = useState<'ko-vi' | 'vi-ko' | '3d'>('3d');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardResults, setFlashcardResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0,
  });

  // TOPIK Exam Modal states
  const [isTopikExamModalOpen, setIsTopikExamModalOpen] = useState(false);
  const [topikExamInitialType, setTopikExamInitialType] = useState<string | undefined>(undefined);

  // Custom Scheduling Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingWord, setSchedulingWord] = useState<VocabularyItem | null>(null);
  const [schedulingCategoryId, setSchedulingCategoryId] = useState<number | undefined>(undefined);

  // Quiz states
  const [quizState, setQuizState] = useState<'setup' | 'running' | 'summary'>('setup');
  const [quizCategoryId, setQuizCategoryId] = useState<number | 'all'>('all');
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState<number[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(300);

  // Custom Vocab File Modal state
  const [isCustomVocabFileModalOpen, setIsCustomVocabFileModalOpen] = useState(false);

  // Speech Recognition Pronunciation Check states
  const [activeRecordingWordId, setActiveRecordingWordId] = useState<string | null>(null);
  const [evalResults, setEvalResults] = useState<Record<string, SpeechEvaluationResult>>({});
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleStartSpeechCheck = (koreanWord: string, wordId: string) => {
    if (activeRecordingWordId === wordId) {
      speechRecognitionService.stopListening();
      setActiveRecordingWordId(null);
      return;
    }

    setSpeechError(null);
    setActiveRecordingWordId(wordId);

    speechRecognitionService.startListening(
      koreanWord,
      (result) => {
        setActiveRecordingWordId(null);
        setEvalResults((prev) => ({ ...prev, [wordId]: result }));
        if (result.score >= 85) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } catch {
            // ignore
          }
        }
      },
      (err) => {
        setActiveRecordingWordId(null);
        setSpeechError(err);
        setTimeout(() => setSpeechError(null), 5000);
      },
      (isListening) => {
        if (!isListening) setActiveRecordingWordId(null);
      }
    );
  };

  const handleStopSpeechCheck = () => {
    speechRecognitionService.stopListening();
    setActiveRecordingWordId(null);
  };

  const refreshVocabs = () => {
    setVocabs(storageService.getVocabularies());
  };

  const refreshGrammars = () => {
    setGrammars(storageService.getGrammars());
  };

  // Filtered vocabulary list
  const filteredVocabularies = useMemo(() => {
    let list = [...vocabs];

    if (selectedCategoryId !== null) {
      list = list.filter((v) => v.categoryId === selectedCategoryId);
    }

    if (levelFilter !== 'all') {
      list = list.filter((v) => v.level === levelFilter);
    }

    if (statusFilter === 'learned') {
      list = list.filter((v) => v.isLearned);
    } else if (statusFilter === 'unlearned') {
      list = list.filter((v) => !v.isLearned);
    } else if (statusFilter === 'favorite') {
      list = list.filter((v) => v.isFavorite);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.korean.toLowerCase().includes(q) ||
          v.vietnamese.toLowerCase().includes(q) ||
          (v.pronunciation && v.pronunciation.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'az') {
      list.sort((a, b) => a.korean.localeCompare(b.korean, 'ko'));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [vocabs, selectedCategoryId, levelFilter, statusFilter, searchQuery, sortBy]);

  // Flashcard items with Spaced Repetition Priority Queue
  const flashcardDeck = useMemo(() => {
    return srsService.getSuggestedQueue(vocabs, {
      categoryId: selectedCategoryId !== null ? selectedCategoryId : undefined,
    });
  }, [vocabs, selectedCategoryId]);

  // Audio trigger
  const handleSpeak = (text: string) => {
    ttsService.speak(text);
  };

  // Toggle Favorite Vocab
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playCardClick();
    storageService.toggleVocabularyFavorite(id);
    refreshVocabs();
  };

  // Toggle Learned Vocab
  const handleToggleLearned = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = vocabs.find((v) => v.id === id);
    if (!item?.isLearned) {
      soundEffects.playSuccessSound();
    } else {
      soundEffects.playCardClick();
    }
    storageService.toggleVocabularyLearned(id);
    refreshVocabs();
  };

  // Open schedule modal for word
  const handleOpenScheduleWord = (item: VocabularyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSchedulingWord(item);
    setSchedulingCategoryId(item.categoryId);
    setIsScheduleModalOpen(true);
  };

  // Open batch schedule modal for category
  const handleOpenScheduleCategory = (catId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSchedulingWord(null);
    setSchedulingCategoryId(catId);
    setIsScheduleModalOpen(true);
  };

  // Flashcard SM-2 Graded Answer
  const handleFlashcardGrade = (grade: ReviewGrade) => {
    const currentWord = flashcardDeck[flashcardIndex];
    if (currentWord) {
      const isCorrect = grade >= 3;
      storageService.recordReviewResult(currentWord.id, isCorrect, grade);
      refreshVocabs();

      setFlashcardResults((prev) => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      }));
    }

    setIsCardFlipped(false);
    if (flashcardIndex + 1 < flashcardDeck.length) {
      setFlashcardIndex((prev) => prev + 1);
    } else {
      // Completed deck!
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  // Start Quiz generator
  const startQuiz = () => {
    let pool = [...vocabs];
    if (quizCategoryId !== 'all') {
      pool = pool.filter((v) => v.categoryId === quizCategoryId);
    }

    if (pool.length < 4) {
      alert('Chủ đề này cần ít nhất 4 từ để tạo bài kiểm tra. Vui lòng chọn "Tất cả chủ đề" hoặc thêm từ mới.');
      return;
    }

    // Shuffle and pick questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(quizQuestionCount, pool.length));

    const questions = selected.map((item) => {
      // Pick 3 wrong options from pool
      const otherVocabs = pool.filter((v) => v.id !== item.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const isKoreanQuestion = Math.random() > 0.4;

      const correctOption = isKoreanQuestion ? item.vietnamese : item.korean;
      const wrongOptions = otherVocabs.map((v) => (isKoreanQuestion ? v.vietnamese : v.korean));
      const options = [correctOption, ...wrongOptions].sort(() => 0.5 - Math.random());
      const answerIndex = options.indexOf(correctOption);

      return {
        item,
        isKoreanQuestion,
        prompt: isKoreanQuestion ? item.korean : item.vietnamese,
        pronunciation: isKoreanQuestion ? item.pronunciation : '',
        options,
        answerIndex,
        explanation: `${item.korean} = ${item.vietnamese} (${item.pronunciation || ''}) - Thuộc cấp độ ${item.level}`,
      };
    });

    setQuizQuestions(questions);
    setQuizCurrentIdx(0);
    setQuizUserAnswers(new Array(questions.length).fill(-1));
    setQuizTimeLeft(questions.length * 20); // 20s per question
    setQuizState('running');
  };

  // Finish Quiz
  const finishQuiz = () => {
    let correctCount = 0;
    const weakTopicsMap: Record<string, number> = {};

    quizQuestions.forEach((q, idx) => {
      if (quizUserAnswers[idx] === q.answerIndex) {
        correctCount++;
      } else {
        const cat = VOCABULARY_CATEGORIES.find((c) => c.id === q.item.categoryId);
        const name = cat ? cat.name : 'Chung';
        weakTopicsMap[name] = (weakTopicsMap[name] || 0) + 1;
      }
    });

    const weakTopics = Object.keys(weakTopicsMap);

    const topicName =
      quizCategoryId === 'all'
        ? 'Tổng hợp tất cả chủ đề'
        : VOCABULARY_CATEGORIES.find((c) => c.id === quizCategoryId)?.name || 'Chủ đề đã chọn';

    storageService.saveQuizResult({
      topicName,
      score: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100),
      weakTopics,
    });

    setQuizState('summary');
    confetti({ particleCount: 80, spread: 70 });
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Subtab Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 max-w-2xl mx-auto overflow-x-auto text-xs font-black scrollbar-none shadow-2xs">
        <button
          onClick={() => setSubTab('vocab')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
            subTab === 'vocab'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>📚</span>
          <span>15 Chủ đề</span>
        </button>

        <button
          onClick={() => setSubTab('flashcard')}
          className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl transition text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
            subTab === 'flashcard'
              ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>🃏</span>
          <span>Flashcard</span>
        </button>

        <button
          onClick={() => setSubTab('grammar')}
          className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl transition text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
            subTab === 'grammar'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>📖</span>
          <span>Ngữ pháp</span>
        </button>

        <button
          onClick={() => setSubTab('dialogue')}
          className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl transition text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
            subTab === 'dialogue'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>💬</span>
          <span>Hội thoại</span>
        </button>

        <button
          onClick={() => setSubTab('quiz')}
          className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl transition text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
            subTab === 'quiz'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>🏆</span>
          <span>Kiểm tra</span>
        </button>
      </div>

      {/* ================= SECTION 1: 15 CHỦ ĐỀ TỪ VỰNG ================= */}
      {subTab === 'vocab' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Speech Error Banner */}
          {speechError && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Controls Bar: Search & Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ tiếng Hàn, nghĩa tiếng Việt, cách đọc..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomVocabFileModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title="Tải tệp từ vựng (.txt, .csv, .json) để tạo list học Flashcard"
              >
                <Layers className="w-4 h-4" />
                <span>+ Thêm tệp Flashcard</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddEditOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm từ</span>
              </button>

              <button
                onClick={onOpenImportExport}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition"
                title="Nhập xuất file CSV / JSON"
              >
                <span>CSV/JSON</span>
              </button>
            </div>
          </div>

          {/* 15 Categories Horizontal Carousel / Filter */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                15 Danh mục chủ đề (Mục tiêu: 1.000 từ / chủ đề)
              </span>
              {selectedCategoryId !== null && (
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Xem tất cả
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategoryId === null
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>🌟 Tất cả ({vocabs.length} từ)</span>
              </button>

              {VOCABULARY_CATEGORIES.map((cat) => {
                const count = vocabs.filter((v) => v.categoryId === cat.id).length;
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {count}/1.000
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Category Banner if selected */}
          {selectedCategoryId !== null && (
            <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 p-4">
              {(() => {
                const cat = VOCABULARY_CATEGORIES.find((c) => c.id === selectedCategoryId)!;
                const actualCount = vocabs.filter((v) => v.categoryId === cat.id).length;
                const progressPercent = Math.min(100, Math.round((actualCount / 1000) * 100));

                return (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {cat.name} ({cat.koreanName})
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {actualCount} / 1.000 từ ({progressPercent}%)
                      </span>
                    </div>

                    {/* Accurate Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-blue-200/60 dark:bg-blue-900/60 mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${Math.max(2, progressPercent)}%` }}
                      />
                    </div>

                    {/* If TOPIK category (cat.id === 15): Replace batch scheduling with Các dạng đề thi TOPIK */}
                    {cat.id === 15 ? (
                      <div className="mt-4 pt-3.5 border-t border-blue-200/60 dark:border-blue-900/40 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 dark:text-blue-200">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>Các dạng đề thi TOPIK trọng điểm (TOPIK I & II)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Cấu trúc chuẩn theo Viện Giáo dục Quốc tế NIIED Hàn Quốc: Đọc hiểu, Viết luận & Nghe hiểu
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTopikExamInitialType(undefined);
                              setIsTopikExamModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Mở cẩm nang & Luyện đề</span>
                          </button>
                        </div>

                        {/* Interactive Exam Format Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setTopikExamInitialType('reading_blank');
                              setIsTopikExamModalOpen(true);
                            }}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer shadow-xs group"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                              <span>📖 Đọc hiểu (읽기)</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-blue-500">Câu 1~34</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                              Điền chỗ trống, chọn chủ đề, nội dung đúng
                            </p>
                            <span className="text-[10px] font-bold text-blue-500 mt-1 inline-block">
                              Luyện dạng này →
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTopikExamInitialType('writing_53');
                              setIsTopikExamModalOpen(true);
                            }}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-slate-800 text-left hover:border-rose-500 dark:hover:border-rose-500 transition cursor-pointer shadow-xs group"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                              <span>✍️ Viết luận (쓰기)</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-rose-500">Câu 51~54</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                              Điền câu 51-52, Biểu đồ câu 53, Bài luận 54
                            </p>
                            <span className="text-[10px] font-bold text-rose-500 mt-1 inline-block">
                              Luyện dạng này →
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTopikExamInitialType('listening_action');
                              setIsTopikExamModalOpen(true);
                            }}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 text-left hover:border-cyan-500 dark:hover:border-cyan-500 transition cursor-pointer shadow-xs group"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-300">
                              <span>🎧 Nghe hiểu (듣기)</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-cyan-500">Câu 1~30</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                              Hành động tiếp theo, bắt ý chính người nói
                            </p>
                            <span className="text-[10px] font-bold text-cyan-500 mt-1 inline-block">
                              Luyện dạng này →
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Batch schedule for other categories */
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-blue-200/50 dark:border-blue-900/40 text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Lên lịch ngắt quãng cho toàn bộ từ trong chủ đề này:
                        </span>
                        <button
                          onClick={(e) => handleOpenScheduleCategory(cat.id, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Đặt lịch cả chủ đề</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tất cả ({filteredVocabularies.length})
              </button>
              <button
                onClick={() => setStatusFilter('learned')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'learned'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Đã học
              </button>
              <button
                onClick={() => setStatusFilter('unlearned')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'unlearned'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Chưa học
              </button>
              <button
                onClick={() => setStatusFilter('favorite')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === 'favorite'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ⭐ Yêu thích
              </button>
            </div>

            {/* Level & Sort dropdowns */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Mọi cấp độ</option>
                <option value="Sơ cấp 1">Sơ cấp 1</option>
                <option value="Sơ cấp 2">Sơ cấp 2</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="default">Sắp xếp mặc định</option>
                <option value="az">Theo chữ cái (A-Z)</option>
                <option value="newest">Mới thêm gần đây</option>
              </select>
            </div>
          </div>

          {/* Vocabulary Card Grid */}
          {filteredVocabularies.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center my-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 mx-auto flex items-center justify-center text-2xl mb-3">
                🔍
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Không tìm thấy từ vựng nào
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Hãy thử đổi từ khóa tìm kiếm, bỏ bộ lọc hoặc bấm nút "+ Thêm từ vựng" để bổ sung từ mới.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredVocabularies.map((item) => {
                const getLevelBadgeClass = (lvl: string) => {
                  switch (lvl) {
                    case 'Sơ cấp 1':
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                    case 'Sơ cấp 2':
                      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
                    case 'Trung cấp':
                      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
                    default:
                      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                  }
                };

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border-2 p-4.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                      item.isLearned
                        ? 'bg-linear-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div>
                      {/* Header: Badges & Action Buttons */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(item.level)}`}>
                            {item.level}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                            {item.wordType}
                          </span>
                          {item.isLearned && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <span>✓ Đã thuộc</span>
                            </span>
                          )}
                          {item.isCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                              Cá nhân
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Favorite button */}
                          <button
                            onClick={(e) => handleToggleFavorite(item.id, e)}
                            className={`p-1.5 rounded-xl transition cursor-pointer active:scale-90 ${
                              item.isFavorite
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                                : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={item.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                          >
                            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                          </button>

                          {/* Learned button */}
                          <button
                            onClick={(e) => handleToggleLearned(item.id, e)}
                            className={`p-1.5 rounded-xl transition cursor-pointer active:scale-90 ${
                              item.isLearned
                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100'
                                : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={item.isLearned ? 'Đã thuộc từ này' : 'Chưa thuộc'}
                          >
                            <CheckCircle className={`w-4 h-4 ${item.isLearned ? 'fill-emerald-100 dark:fill-emerald-950' : ''}`} />
                          </button>

                          {/* Schedule Review button */}
                          <button
                            onClick={(e) => handleOpenScheduleWord(item, e)}
                            className={`p-1.5 rounded-xl transition cursor-pointer active:scale-90 ${
                              item.customScheduledDate
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40'
                                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                            }`}
                            title={item.customScheduledDate ? `Lịch đã đặt: ${item.customScheduledDate}` : 'Tự đặt lịch ôn tập cho từ này'}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddEditOpen(true);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer active:scale-90"
                            title="Chỉnh sửa từ vựng"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer active:scale-90"
                            title="Xóa từ vựng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Word Main Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Emoji / Illustration Badge */}
                          <div className="w-11 h-11 rounded-2xl bg-blue-50/80 dark:bg-slate-800 border border-blue-100 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-2xl shadow-inner select-none mt-0.5">
                            {item.fallbackEmoji || '🇰🇷'}
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.korean}
                              </h3>
                              {item.pronunciation && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  [{item.pronunciation}]
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                              {item.meaning || item.vietnamese}
                            </p>
                          </div>
                        </div>

                        {/* Audio & Mic Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* TTS Speak button */}
                          <button
                            onClick={() => handleSpeak(item.korean)}
                            className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-90 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition cursor-pointer shadow-2xs hover:shadow-xs"
                            title="Nghe phát âm chuẩn"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Mic Voice Pronunciation Check */}
                          <button
                            onClick={() => handleStartSpeechCheck(item.korean, item.id)}
                            className={`p-2.5 rounded-2xl transition active:scale-90 cursor-pointer shadow-2xs ${
                              activeRecordingWordId === item.id
                                ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
                            }`}
                            title={
                              activeRecordingWordId === item.id
                                ? 'Đang lắng nghe... bấm để dừng'
                                : 'Thu âm kiểm tra phát âm tiếng Hàn'
                            }
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Speech Recognition Feedback on Vocab Card */}
                      {activeRecordingWordId === item.id && (
                        <div className="mt-2.5 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span>Đang lắng nghe... Hãy nói: "{item.korean}"</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStopSpeechCheck()}
                            className="text-[10px] underline font-bold cursor-pointer"
                          >
                            Dừng
                          </button>
                        </div>
                      )}

                      {evalResults[item.id] && activeRecordingWordId !== item.id && (
                        <div
                          className={`mt-2.5 p-2.5 rounded-2xl text-[11px] border transition ${
                            evalResults[item.id].isMatch
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>Độ chuẩn xác: {evalResults[item.id].score}%</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/70 font-black">
                              {evalResults[item.id].score >= 85 ? '🌟 Chuẩn bản ngữ!' : 'Cần luyện thêm'}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] opacity-90">
                            {evalResults[item.id].feedback}
                          </p>
                        </div>
                      )}

                      {/* Example Sentence */}
                      {item.exampleKorean && (
                        <div className="mt-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-800 dark:text-slate-100">
                              💬 {item.exampleKorean}
                            </p>
                            <button
                              onClick={() => handleSpeak(item.exampleKorean)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                              title="Nghe câu ví dụ"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.exampleVietnamese && (
                            <p className="text-slate-500 dark:text-slate-400 mt-1 pl-4">
                              {item.exampleVietnamese}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Personal Note */}
                      {item.note && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-2.5 flex items-center gap-1">
                          <span>💡</span> <span>{item.note}</span>
                        </p>
                      )}

                      {/* Next Review & Stage info */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>
                            {item.customScheduledDate
                              ? `Lịch hẹn: ${item.customScheduledDate}`
                              : item.nextReviewDate
                              ? `Ôn tiếp: ${item.nextReviewDate}`
                              : 'Chưa lên lịch'}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                          SRS Level {item.srsStage || 0}/5
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: FLASHCARD 3D & ÔN TẬP ================= */}
      {subTab === 'flashcard' && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Deck Controls & Schedule Shortcut */}
          {/* Deck Controls & Status */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    {selectedCategoryId !== null
                      ? `Thẻ ghi nhớ: ${VOCABULARY_CATEGORIES.find((c) => c.id === selectedCategoryId)?.name}`
                      : 'Thẻ ghi nhớ thông minh SRS'}
                  </span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                  {flashcardDeck.length} thẻ
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-xs shrink-0">
                <span className="text-emerald-600">✓ {flashcardResults.correct}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-rose-500">✗ {flashcardResults.incorrect}</span>
              </div>
            </div>

            {/* Sub info & Add File Shortcut */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setIsCustomVocabFileModalOpen(true)}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ Thêm tệp Flashcard</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenScheduleCategory(selectedCategoryId && selectedCategoryId !== 15 ? selectedCategoryId : 1)}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                <Calendar className="w-3 h-3" />
                <span>Đặt lịch cho nhóm từ</span>
              </button>
            </div>
          </div>

          {flashcardDeck.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center my-6">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Không có thẻ nào cần ôn tập lúc này!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tất cả các từ vựng đã được ôn tập đúng hạn theo thuật toán lặp lại ngắt quãng.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setFlashcardIndex(0);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Tải lại danh sách thẻ
              </button>
            </div>
          ) : flashcardIndex >= flashcardDeck.length ? (
            /* Finished Card */
            <div className="rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white text-center shadow-xl relative overflow-hidden">
              <div className="flex justify-center mb-2">
                <HangoMascot mood="victory" size="md" className="drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-black mt-2">Hoàn thành lượt ôn tập! 🎉</h3>
              <p className="text-xs text-blue-100 mt-1 max-w-xs mx-auto">
                Tuyệt vời lắm! Bạn đã ôn xong toàn bộ {flashcardDeck.length} thẻ ghi nhớ theo thuật toán lặp lại ngắt quãng SM-2.
              </p>
              <div className="my-4 py-3 px-5 rounded-2xl bg-white/15 backdrop-blur-md inline-flex items-center gap-4 text-xs font-bold">
                <span className="text-emerald-300">🌟 Đã nhớ tốt: {flashcardResults.correct}</span>
                <span className="text-pink-300">💪 Cần củng cố: {flashcardResults.incorrect}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    soundEffects.playCardClick();
                    setFlashcardIndex(0);
                    setIsCardFlipped(false);
                    setFlashcardResults({ correct: 0, incorrect: 0 });
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 text-xs font-black shadow-lg shadow-amber-400/30 transition cursor-pointer"
                >
                  🔄 Ôn tập lại từ đầu
                </button>
                <button
                  onClick={() => {
                    soundEffects.playCardClick();
                    handleOpenScheduleCategory(selectedCategoryId || 1);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
                >
                  📅 Lên lịch ngày mai
                </button>
              </div>
            </div>
          ) : (
            /* Active 3D Flashcard */
            (() => {
              const currentWord = flashcardDeck[flashcardIndex];

              return (
                <div className="space-y-3.5">
                  {/* Progress & Custom Schedule Shortcut */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>🃏</span>
                      <span>Thẻ {flashcardIndex + 1} / {flashcardDeck.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleWord(currentWord)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{currentWord.customScheduledDate ? `Lịch tự đặt: ${currentWord.customScheduledDate}` : 'Tự đặt lịch ôn'}</span>
                    </button>
                  </div>

                  {/* SRS Smart Reason & Learning History Banner */}
                  <div className="rounded-2xl p-3 bg-linear-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/60 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {currentWord.srsReason || 'Lặp lại ngắt quãng gợi ý'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        Cấp độ SRS {currentWord.srsStage || 0}/5
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        Lịch sử ôn: <strong className="text-emerald-600 font-bold">{currentWord.correctCount || 0} đúng</strong> / <strong className="text-rose-500 font-bold">{currentWord.incorrectCount || 0} sai</strong>
                      </span>
                      <span>
                        Gần nhất: <strong>{currentWord.lastReviewedAt ? new Date(currentWord.lastReviewedAt).toLocaleDateString('vi-VN') : 'Mới'}</strong>
                      </span>
                      <span>
                        Chu kỳ: <strong>{currentWord.srsIntervalDays || 1} ngày</strong>
                      </span>
                    </div>
                  </div>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => {
                      soundEffects.playCardClick();
                      setIsCardFlipped(!isCardFlipped);
                    }}
                    className="relative w-full h-76 rounded-3xl cursor-pointer perspective-1000 select-none"
                  >
                    <div
                      className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-md hover:shadow-xl border-2 border-slate-200/80 dark:border-slate-800 ${
                        isCardFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* FRONT FACE (Tiếng Hàn) */}
                      <div className="absolute inset-0 w-full h-full rounded-3xl bg-linear-to-b from-white via-white to-blue-50/40 dark:from-slate-900 dark:to-slate-900 p-6 flex flex-col justify-between backface-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {currentWord.level}
                          </span>
                          <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                            <span>✨ Chạm thẻ để lật</span>
                          </span>
                        </div>

                        <div className="text-center my-auto">
                          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-wide">
                            {currentWord.korean}
                          </h2>
                          {currentWord.pronunciation && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                              [{currentWord.pronunciation}]
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpeak(currentWord.korean);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-95 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe phát âm</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartSpeechCheck(currentWord.korean, currentWord.id);
                              }}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer ${
                                activeRecordingWordId === currentWord.id
                                  ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>{activeRecordingWordId === currentWord.id ? 'Đang nghe...' : 'Luyện nói'}</span>
                            </button>
                          </div>

                          {/* Speech feedback in flashcard */}
                          {evalResults[currentWord.id] && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`mt-3 p-2.5 rounded-2xl text-xs text-left max-w-xs mx-auto border transition ${
                                evalResults[currentWord.id].isMatch
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>Độ chuẩn xác: {evalResults[currentWord.id].score}%</span>
                                <span className="text-[10px] font-semibold">
                                  {evalResults[currentWord.id].score >= 85 ? '⭐ Chuẩn' : 'Luyện thêm'}
                                </span>
                              </div>
                              <p className="text-[11px] mt-0.5">{evalResults[currentWord.id].feedback}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 text-blue-500" />
                          <span>Chạm vào bất cứ đâu để xem nghĩa tiếng Việt</span>
                        </div>
                      </div>

                      {/* BACK FACE (Nghĩa Tiếng Việt & Ví dụ) */}
                      <div className="absolute inset-0 w-full h-full rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 flex flex-col justify-between backface-hidden rotate-y-180">
                        <div className="flex items-center justify-between text-blue-200 text-xs">
                          <span className="font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{currentWord.wordType}</span>
                          <span className="font-medium">Nghĩa tiếng Việt</span>
                        </div>

                        <div className="text-center my-auto">
                          <h3 className="text-3xl font-black text-amber-300 drop-shadow-sm">{currentWord.vietnamese}</h3>
                          {currentWord.exampleKorean && (
                            <div className="mt-3.5 p-3 rounded-2xl bg-white/15 text-left text-xs backdrop-blur-md border border-white/10">
                              <p className="font-bold text-white">
                                {currentWord.exampleKorean}
                              </p>
                              <p className="text-blue-100 mt-1">
                                {currentWord.exampleVietnamese}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-center text-xs text-blue-200">
                          {currentWord.note ? `💡 ${currentWord.note}` : '🔄 Chạm để lật lại mặt tiếng Hàn'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 SuperMemo-2 Spaced Repetition Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                      <span>Đánh giá mức độ nhớ từ vựng:</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playErrorSound();
                          handleFlashcardGrade(1);
                        }}
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border-2 border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <span className="text-xs font-black">💭 Quên</span>
                        <span className="text-[10px] font-medium text-rose-500">1 ngày</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playCardClick();
                          handleFlashcardGrade(2);
                        }}
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <span className="text-xs font-black">🤔 Khó</span>
                        <span className="text-[10px] font-medium text-amber-600">1-2 ngày</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playCardClick();
                          handleFlashcardGrade(3);
                        }}
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <span className="text-xs font-black">😊 Nhớ tốt</span>
                        <span className="text-[10px] font-medium text-blue-500">3-7 ngày</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playSuccessSound();
                          handleFlashcardGrade(4);
                        }}
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        <span className="text-xs font-black">🌟 Rất dễ</span>
                        <span className="text-[10px] font-medium text-emerald-100">&gt;2 tuần</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ================= SECTION 3: NGỮ PHÁP TIẾNG HÀN ================= */}
      {subTab === 'grammar' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls: Search & Level Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={grammarSearch}
                onChange={(e) => setGrammarSearch(e.target.value)}
                placeholder="Tìm ngữ pháp: 은/는, 이/가, -아/어서, -(으)니까..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            <select
              value={grammarLevel}
              onChange={(e) => setGrammarLevel(e.target.value)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="Sơ cấp">Sơ cấp</option>
              <option value="Trung cấp">Trung cấp</option>
            </select>
          </div>

          {/* Grammar list cards */}
          <div className="space-y-4">
            {grammars
              .filter((g) => {
                const matchSearch =
                  g.title.toLowerCase().includes(grammarSearch.toLowerCase()) ||
                  g.meaning.toLowerCase().includes(grammarSearch.toLowerCase());
                const matchLevel = grammarLevel === 'all' || g.level === grammarLevel;
                return matchSearch && matchLevel;
              })
              .map((grammar) => {
                const selectedQuizAns = grammarSelectedQuizAnswers[grammar.id];
                const isAnswered = selectedQuizAns !== undefined;
                const isCorrect = isAnswered && selectedQuizAns === grammar.practiceQuestion.answerIndex;

                return (
                  <div
                    key={grammar.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5"
                  >
                    {/* Header: Title, Level, Completed */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                          {grammar.title}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100/70 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900">
                          {grammar.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            soundEffects.playCardClick();
                            storageService.toggleGrammarFavorite(grammar.id);
                            refreshGrammars();
                          }}
                          className={`p-2 rounded-xl transition cursor-pointer active:scale-90 ${
                            grammar.isFavorite
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 fill-amber-400'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${grammar.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            if (!grammar.isCompleted) {
                              soundEffects.playSuccessSound();
                            } else {
                              soundEffects.playCardClick();
                            }
                            storageService.toggleGrammarCompleted(grammar.id);
                            refreshGrammars();
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
                            grammar.isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{grammar.isCompleted ? '✓ Đã nắm vững' : 'Chưa học'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      📖 {grammar.meaning}
                    </p>

                    {/* Formula box */}
                    <div className="rounded-2xl bg-linear-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/60 dark:from-slate-800 dark:to-slate-800/80 p-3.5 text-xs border border-blue-200/70 dark:border-blue-900/50">
                      <div className="flex items-center gap-1.5 font-black text-blue-700 dark:text-blue-300 mb-1">
                        <span>✨ Công thức cấu trúc:</span>
                      </div>
                      <div className="inline-block px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-sm font-black text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs my-1">
                        {grammar.formula}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">
                        💡 {grammar.conditions}
                      </p>
                    </div>

                    {/* Examples */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <span>💬</span> Ví dụ câu thực tế:
                      </span>
                      {grammar.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-2 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/70 text-xs border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {ex.korean}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                              {ex.vietnamese}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSpeak(ex.korean)}
                            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer active:scale-90"
                            title="Nghe ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Common Mistakes */}
                    {grammar.commonMistakes && (
                      <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 p-3 text-[11px] text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60">
                        <span className="font-bold">⚠️ Lưu ý lỗi sai phổ biến: </span>
                        <span>{grammar.commonMistakes}</span>
                      </div>
                    )}

                    {/* Practice Quiz */}
                    <div className="rounded-2xl border-2 border-slate-200/80 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Bài tập nhanh: {grammar.practiceQuestion.question}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {grammar.practiceQuestion.options.map((opt, optIdx) => {
                          let optStyle =
                            'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/30';

                          if (isAnswered) {
                            if (optIdx === grammar.practiceQuestion.answerIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black shadow-2xs';
                            } else if (optIdx === selectedQuizAns) {
                              optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => {
                                setGrammarSelectedQuizAnswers((prev) => ({
                                  ...prev,
                                  [grammar.id]: optIdx,
                                }));
                                if (optIdx === grammar.practiceQuestion.answerIndex) {
                                  soundEffects.playSuccessSound();
                                  confetti({ particleCount: 35, spread: 50 });
                                } else {
                                  soundEffects.playErrorSound();
                                }
                              }}
                              className={`p-2.5 rounded-2xl border-2 text-xs font-bold text-left transition cursor-pointer active:scale-95 ${optStyle}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {isAnswered && (
                        <div
                          className={`p-3 rounded-2xl text-xs ${
                            isCorrect
                              ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
                              : 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200'
                          }`}
                        >
                          <span className="font-bold">
                            {isCorrect ? '🎉 Chính xác! ' : '❌ Chưa chính xác. '}
                          </span>
                          <span>{grammar.practiceQuestion.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: HỘI THOẠI GIAO TIẾP ================= */}
      {subTab === 'dialogue' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Situation selector tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {conversations.map((c, idx) => {
              const icons = ['👋', '🏫', '🍲', '🛍️', '💬', '✈️', '💼', '☕'];
              const icon = icons[idx % icons.length];
              const isSelected = selectedConversationId === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundEffects.playCardClick();
                    setSelectedConversationId(c.id);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs ${
                    isSelected
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-102'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active conversation details */}
          {(() => {
            const activeConv = conversations.find((c) => c.id === selectedConversationId)!;

            return (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
                      💬
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {activeConv.title} ({activeConv.koreanTitle})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tình huống: {activeConv.situation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Roleplay Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
                      <button
                        onClick={() => {
                          soundEffects.playCardClick();
                          setRoleplayMode('all');
                        }}
                        className={`px-2.5 py-1 rounded-xl transition ${
                          roleplayMode === 'all'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => {
                          soundEffects.playCardClick();
                          setRoleplayMode('A');
                        }}
                        className={`px-2.5 py-1 rounded-xl transition ${
                          roleplayMode === 'A'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Vai A
                      </button>
                      <button
                        onClick={() => {
                          soundEffects.playCardClick();
                          setRoleplayMode('B');
                        }}
                        className={`px-2.5 py-1 rounded-xl transition ${
                          roleplayMode === 'B'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Vai B
                      </button>
                    </div>

                    {/* Toggle translations */}
                    <button
                      onClick={() => {
                        soundEffects.playCardClick();
                        setShowTranslations(!showTranslations);
                      }}
                      className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      title={showTranslations ? 'Ẩn bản dịch tiếng Việt' : 'Hiện bản dịch'}
                    >
                      {showTranslations ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Dialog Turns formatted as cute chat bubbles */}
                <div className="space-y-4 pt-1">
                  {activeConv.dialog.map((turn, i) => {
                    const isMyRole =
                      roleplayMode === 'all' ||
                      (roleplayMode === 'A' && turn.speaker === 'A') ||
                      (roleplayMode === 'B' && turn.speaker === 'B');

                    const isSpeakerA = turn.speaker === 'A';

                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 transition-opacity ${
                          isSpeakerA ? 'justify-start mr-4' : 'justify-start sm:justify-end ml-4 flex-row-reverse'
                        } ${!isMyRole ? 'opacity-35' : 'opacity-100'}`}
                      >
                        {/* Cute Avatar Badge */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 shadow-2xs border-2 ${
                            isSpeakerA
                              ? 'bg-linear-to-tr from-blue-400 to-indigo-500 text-white border-blue-200'
                              : 'bg-linear-to-tr from-emerald-400 to-teal-500 text-white border-emerald-200'
                          }`}
                        >
                          {isSpeakerA ? '👦' : '👧'}
                        </div>

                        {/* Cute Chat Bubble */}
                        <div
                          className={`p-4 rounded-3xl transition max-w-md border-2 shadow-2xs ${
                            isSpeakerA
                              ? 'rounded-tl-xs bg-linear-to-br from-blue-50 via-sky-50 to-indigo-50/40 dark:from-slate-800 dark:to-slate-800 border-blue-200/80 dark:border-blue-900/60'
                              : 'rounded-tr-xs bg-linear-to-br from-emerald-50 via-teal-50 to-mint-50/40 dark:from-slate-800 dark:to-slate-800 border-emerald-200/80 dark:border-emerald-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5 gap-3">
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                isSpeakerA
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {turn.speakerName || `Người nói ${turn.speaker}`}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSpeak(turn.korean)}
                                className="p-1.5 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition cursor-pointer shadow-2xs active:scale-90"
                                title="Nghe câu này"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-base font-black text-slate-900 dark:text-white leading-relaxed">
                            {turn.korean}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                            [{turn.pronunciation}]
                          </p>

                          {showTranslations && (
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                              {turn.vietnamese}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= SECTION 5: BÀI KIỂM TRA (QUIZ) ================= */}
      {subTab === 'quiz' && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          {quizState === 'setup' && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm text-center">
              <div className="flex justify-center mb-1">
                <HangoMascot mood="cheering" size="md" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Bài kiểm tra năng lực từ vựng
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Đánh giá tốc độ phản xạ và củng cố kiến thức từ vựng tiếng Hàn theo chủ đề.
                </p>
              </div>

              {/* Choose Category */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chủ đề kiểm tra
                </label>
                <select
                  value={quizCategoryId}
                  onChange={(e) =>
                    setQuizCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="all">🌟 Tất cả 15 chủ đề tổng hợp</option>
                  {VOCABULARY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Count Selection */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Số lượng câu hỏi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        soundEffects.playCardClick();
                        setQuizQuestionCount(num);
                      }}
                      className={`py-2.5 rounded-2xl border-2 text-xs font-black transition cursor-pointer ${
                        quizQuestionCount === num
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playCardClick();
                  startQuiz();
                }}
                className="w-full mt-2 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-black text-sm shadow-lg shadow-amber-400/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>Bắt đầu làm bài thi</span>
              </button>
            </div>
          )}

          {/* Quiz Running */}
          {quizState === 'running' && quizQuestions.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
              {/* Header: Progress & Timer */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-blue-600 dark:text-blue-400">
                  Câu hỏi {quizCurrentIdx + 1} / {quizQuestions.length}
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{quizQuestions.length - quizCurrentIdx} còn lại</span>
                </span>
              </div>

              {/* Question Box */}
              {(() => {
                const q = quizQuestions[quizCurrentIdx];
                const selectedOpt = quizUserAnswers[quizCurrentIdx];

                return (
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {q.isKoreanQuestion ? 'Chọn nghĩa tiếng Việt của từ:' : 'Chọn từ tiếng Hàn tương ứng:'}
                      </span>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {q.prompt}
                      </h3>
                      {q.pronunciation && (
                        <p className="text-xs text-slate-500 mt-1 font-medium">[{q.pronunciation}]</p>
                      )}
                    </div>

                    {/* 4 Choices */}
                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedOpt === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              soundEffects.playCardClick();
                              const updated = [...quizUserAnswers];
                              updated[quizCurrentIdx] = optIdx;
                              setQuizUserAnswers(updated);
                            }}
                            className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-bold transition flex items-center justify-between cursor-pointer active:scale-98 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-3">
                      <button
                        disabled={quizCurrentIdx === 0}
                        onClick={() => {
                          soundEffects.playCardClick();
                          setQuizCurrentIdx((prev) => prev - 1);
                        }}
                        className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-30 cursor-pointer"
                      >
                        ← Câu trước
                      </button>

                      {quizCurrentIdx + 1 < quizQuestions.length ? (
                        <button
                          onClick={() => {
                            soundEffects.playCardClick();
                            setQuizCurrentIdx((prev) => prev + 1);
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
                        >
                          Câu tiếp theo →
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundEffects.playWinFanfare();
                            finishQuiz();
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                        >
                          Nộp bài thi ✓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quiz Summary Result */}
          {quizState === 'summary' && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm text-center">
              {(() => {
                let correct = 0;
                quizQuestions.forEach((q, idx) => {
                  if (quizUserAnswers[idx] === q.answerIndex) correct++;
                });
                const percent = Math.round((correct / quizQuestions.length) * 100);

                return (
                  <div>
                    <div className="flex justify-center mb-2">
                      <HangoMascot mood={percent >= 70 ? 'victory' : 'thinking'} size="md" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                      Kết quả bài kiểm tra
                    </h3>
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">
                      {percent}%
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Đúng {correct} / {quizQuestions.length} câu hỏi
                    </p>

                    <div className="my-4 py-2.5 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      {percent >= 80 ? '🎉 Xuất sắc! Bạn ghi nhớ rất tốt!' : percent >= 50 ? '👏 Khá tốt! Hãy ôn thêm một số từ chưa vững nhé.' : '💪 Đừng nản lòng! Hãy ôn lại thẻ flashcard nhé.'}
                    </div>

                    {/* Review Answers Accordion */}
                    <div className="mt-4 text-left max-h-56 overflow-y-auto space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Chi tiết lời giải:
                      </span>
                      {quizQuestions.map((q, i) => {
                        const userChoice = quizUserAnswers[i];
                        const isRight = userChoice === q.answerIndex;

                        return (
                          <div
                            key={i}
                            className={`p-2.5 rounded-2xl text-xs border ${
                              isRight
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>Câu {i + 1}: {q.prompt}</span>
                              <span className={isRight ? 'text-emerald-600' : 'text-rose-600'}>{isRight ? '✓ Đúng' : '✗ Sai'}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => {
                          soundEffects.playCardClick();
                          setQuizState('setup');
                        }}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        Làm bài kiểm tra mới
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Vocabulary Modal */}
      <AddEditVocabularyModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingItem(null);
        }}
        onSaved={refreshVocabs}
        editingItem={editingItem}
        defaultCategoryId={selectedCategoryId || 1}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            storageService.deleteVocabulary(deletingItem.id);
            setDeletingItem(null);
            refreshVocabs();
          }
        }}
      />

      {/* Custom Schedule Review Modal */}
      <ScheduleReviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={refreshVocabs}
        targetWord={schedulingWord}
        defaultCategoryId={schedulingCategoryId || selectedCategoryId || 1}
      />

      {/* TOPIK Exam Format Directory & Practice Modal */}
      <TopikExamModal
        isOpen={isTopikExamModalOpen}
        onClose={() => setIsTopikExamModalOpen(false)}
        initialTypeId={topikExamInitialType}
      />

      {/* Custom Vocab File Import Modal for Flashcard Study */}
      <CustomVocabFileModal
        isOpen={isCustomVocabFileModalOpen}
        onClose={() => setIsCustomVocabFileModalOpen(false)}
        onImportAndStartFlashcard={(_importedItems) => {
          refreshVocabs();
          setSelectedCategoryId(16);
          setSubTab('flashcard');
          setFlashcardIndex(0);
          setIsCardFlipped(false);
        }}
      />
    </div>
  );
};
