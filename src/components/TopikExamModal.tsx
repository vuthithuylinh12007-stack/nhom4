import React, { useState } from 'react';
import {
  TOPIK_EXAM_TYPES,
  TOPIK_QUESTIONS,
  TopikExamType,
  TopikQuestion,
} from '../data/topikExams';
import { ttsService } from '../services/tts';
import confetti from 'canvas-confetti';
import {
  X,
  Award,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronRight,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface TopikExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTypeId?: string;
}

export const TopikExamModal: React.FC<TopikExamModalProps> = ({
  isOpen,
  onClose,
  initialTypeId,
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'practice'>('types');
  const [selectedSection, setSelectedSection] = useState<'all' | 'reading' | 'writing' | 'listening'>('all');
  const [selectedType, setSelectedType] = useState<TopikExamType | null>(null);

  // Practice session state
  const [practiceQuestions, setPracticeQuestions] = useState<TopikQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const filteredTypes = TOPIK_EXAM_TYPES.filter(
    (t) => selectedSection === 'all' || t.section === selectedSection
  );

  const startPractice = (typeId?: string) => {
    let pool = [...TOPIK_QUESTIONS];
    if (typeId) {
      pool = pool.filter((q) => q.typeId === typeId);
    } else if (selectedSection !== 'all') {
      pool = pool.filter((q) => q.section === selectedSection);
    }

    if (pool.length === 0) {
      pool = [...TOPIK_QUESTIONS];
    }

    // Shuffle questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setPracticeQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setActiveTab('practice');
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const currentQ = practiceQuestions[currentIndex];
    if (selectedAnswer === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < practiceQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 80, spread: 70 });
    }
  };

  const currentQ = practiceQuestions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Các dạng đề thi TOPIK</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black">
                  TOPIK I & II
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Phân tích cấu trúc câu hỏi, chiến thuật làm bài & luyện đề thực chiến
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Overview of Types vs Interactive Practice */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('types')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'types'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cẩm nang các dạng đề ({TOPIK_EXAM_TYPES.length})
            </button>
            <button
              onClick={() => startPractice()}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Luyện đề thi thử
            </button>
          </div>

          {activeTab === 'types' && (
            <div className="flex items-center gap-1">
              {(['all', 'reading', 'writing', 'listening'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {sec === 'all'
                    ? 'Tất cả'
                    : sec === 'reading'
                    ? 'Đọc (읽기)'
                    : sec === 'writing'
                    ? 'Viết (쓰기)'
                    : 'Nghe (듣기)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: EXAM TYPES DIRECTORY */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Luyện thi TOPIK thông minh với HanGo
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Nắm chắc ma trận đề thi từ Sơ cấp đến Cao cấp (Level 1~6).
                  </span>
                </div>
                <button
                  onClick={() => startPractice()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer shrink-0"
                >
                  Thi thử tổng hợp
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                              {type.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {type.koreanName}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${type.badgeColor} shrink-0`}>
                          {type.questionNumbers}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                        {type.description}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Chiến thuật ghi điểm:</span>
                        </div>
                        <p>{type.strategy}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        Phù hợp: {type.level}
                      </span>
                      <button
                        onClick={() => startPractice(type.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-xs transition cursor-pointer"
                      >
                        <span>Luyện dạng này</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRACTICE SESSION */}
          {activeTab === 'practice' && (
            <div>
              {isFinished ? (
                /* Finished Exam Report */
                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center shadow-xl space-y-4">
                  <span className="text-5xl">🏆</span>
                  <h3 className="text-xl font-black">Kết quả bài thi thử TOPIK</h3>
                  <p className="text-xs text-blue-100">
                    Bạn đã hoàn thành bài thi với {practiceQuestions.length} câu hỏi chuẩn cấu trúc.
                  </p>

                  <div className="py-4 px-6 rounded-2xl bg-white/15 backdrop-blur-md inline-flex items-center gap-6 text-sm font-bold">
                    <div>
                      <span className="text-xs text-blue-200 block">Số câu đúng</span>
                      <span className="text-2xl text-emerald-300">{score} / {practiceQuestions.length}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <span className="text-xs text-blue-200 block">Tỷ lệ chính xác</span>
                      <span className="text-2xl text-amber-300">
                        {Math.round((score / Math.max(1, practiceQuestions.length)) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => startPractice()}
                      className="px-6 py-2.5 rounded-2xl bg-white text-blue-600 text-xs font-bold shadow-md hover:bg-blue-50 transition cursor-pointer"
                    >
                      Làm lại đề thi khác
                    </button>
                  </div>
                </div>
              ) : currentQ ? (
                /* Question card */
                <div className="space-y-4">
                  {/* Progress bar and Type badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl">
                      {currentQ.typeName} ({currentQ.level})
                    </span>
                    <span className="text-slate-500 font-semibold">
                      Câu {currentIndex + 1} / {practiceQuestions.length}
                    </span>
                  </div>

                  {/* Instruction */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentQ.instruction}
                  </div>

                  {/* Passage if present */}
                  {currentQ.passage && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Đoạn văn bài thi:
                        </span>
                        <button
                          type="button"
                          onClick={() => ttsService.speak(currentQ.passage || '')}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe đọc bài văn</span>
                        </button>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed text-sm">
                        {currentQ.passage}
                      </p>
                      {isAnswerSubmitted && currentQ.passageTranslation && (
                        <div className="pt-2 border-t border-amber-200/40 text-slate-600 dark:text-slate-300 text-[11px] italic">
                          Dịch nghĩa: {currentQ.passageTranslation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{currentQ.questionText}</span>
                    <button
                      type="button"
                      onClick={() => ttsService.speak(currentQ.questionText)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition"
                      title="Nghe câu hỏi"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = currentQ.correctAnswer === idx;

                      let btnStyle =
                        'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold';
                        } else {
                          btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerSubmitted}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <span>{option}</span>
                          </div>

                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrect && (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback & Explanation after answer */}
                  {isAnswerSubmitted && (
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                        <Sparkles className="w-4 h-4" />
                        <span>Giải thích đáp án & Mẹo TOPIK:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {currentQ.explanation}
                      </p>

                      {currentQ.tip && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                          💡 <strong>Mẹo làm bài:</strong> {currentQ.tip}
                        </div>
                      )}

                      {currentQ.keyVocabulary && currentQ.keyVocabulary.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Từ vựng trọng tâm trong câu:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentQ.keyVocabulary.map((v, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200 font-medium"
                              >
                                <strong>{v.korean}</strong>: {v.vietnamese}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {!isAnswerSubmitted ? (
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
                          selectedAnswer !== null
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 active:scale-95'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Kiểm tra đáp án
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{currentIndex + 1 < practiceQuestions.length ? 'Câu tiếp theo' : 'Xem tổng kết điểm'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
