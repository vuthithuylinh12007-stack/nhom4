import React from 'react';
import { User, VocabularyItem } from '../types';
import { storageService } from '../services/storage';
import { ttsService } from '../services/tts';
import {
  BookOpen,
  Volume2,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  Gamepad2,
} from 'lucide-react';

interface HomeTabProps {
  user: User;
  onNavigate: (tab: 'study' | 'games' | 'ai' | 'profile', subTab?: string) => void;
  onOpenAddModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ user, onNavigate, onOpenAddModal }) => {
  const stats = storageService.getDashboardStats();
  const vocabs = storageService.getVocabularies();

  // Word of the day (deterministic based on date)
  const todayIdx = new Date().getDate() % (vocabs.length || 1);
  const wordOfTheDay: VocabularyItem | undefined = vocabs[todayIdx] || vocabs[0];

  const dailyProgressPercent = Math.min(
    100,
    Math.round((stats.learnedWords / Math.max(1, stats.dailyGoal)) * 100)
  );

  const handleSpeak = (text: string) => {
    ttsService.speak(text);
  };

  return (
    <div className="space-y-6 pb-20 pt-2 animate-in fade-in duration-200">
      {/* 1. Greeting & Daily Motivation Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/15 overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.avatar || '🧑‍🎓'}</span>
              <div>
                <h1 className="text-lg font-bold leading-tight">
                  Xin chào, {user.name}! 👋
                </h1>
                <p className="text-xs text-blue-100 font-medium">
                  {user.isGuest ? 'Đang ở chế độ học thử' : 'Sẵn sàng chinh phục tiếng Hàn hôm nay!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold shadow-inner">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{stats.streakDays} Ngày học</span>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="mt-4 rounded-2xl bg-white/15 backdrop-blur-md p-4 border border-white/20">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-blue-50 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-pink-300" />
                Mục tiêu hôm nay ({stats.learnedWords}/{stats.dailyGoal} từ)
              </span>
              <span className="font-bold text-white">{dailyProgressPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-amber-300 transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-blue-100/90">
              <span>
                {stats.learnedWords >= stats.dailyGoal
                  ? '🎉 Bạn đã hoàn thành mục tiêu ngày xuất sắc!'
                  : `Còn ${Math.max(0, stats.dailyGoal - stats.learnedWords)} từ nữa để đạt mục tiêu.`}
              </span>
              <button
                onClick={() => onNavigate('study', 'vocab')}
                className="font-bold text-white underline hover:text-pink-200 transition"
              >
                Học ngay →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Word of the Day (Từ vựng của ngày) */}
      {wordOfTheDay && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Từ vựng hôm nay
              </h2>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {wordOfTheDay.level}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {wordOfTheDay.korean}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {wordOfTheDay.pronunciation}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {wordOfTheDay.vietnamese}
              </p>
            </div>

            <button
              onClick={() => handleSpeak(wordOfTheDay.korean)}
              className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 transition active:scale-95 shadow-sm cursor-pointer"
              title="Nghe phát âm chuẩn tiếng Hàn"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Example Sentence */}
          {wordOfTheDay.exampleKorean && (
            <div className="mt-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {wordOfTheDay.exampleKorean}
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {wordOfTheDay.exampleVietnamese}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Real Dashboard Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Tiến độ học tập thực tế
          </h2>
          <span className="text-[11px] text-slate-500">Cập nhật theo tài khoản</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Từ đã học */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
                ĐÃ THUỘC
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.learnedWords}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              / {stats.totalWords} tổng số từ
            </div>
          </div>

          {/* Card 2: Cần ôn tập */}
          <div
            onClick={() => onNavigate('study', 'flashcard')}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <RotateCcw className="w-5 h-5" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950">
                CẦN ÔN
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.needReviewWords}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Từ vựng chờ ôn tập
            </div>
          </div>

          {/* Card 3: Ngữ pháp */}
          <div
            onClick={() => onNavigate('study', 'grammar')}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950">
                NGỮ PHÁP
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.completedGrammars}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              / {stats.totalGrammars} bài đã xong
            </div>
          </div>

          {/* Card 4: Điểm kiểm tra */}
          <div
            onClick={() => onNavigate('study', 'quiz')}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:border-pink-300 dark:hover:border-pink-700 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-pink-500 mb-2">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-50 dark:bg-pink-950">
                BÀI TEST
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.latestQuizScore !== null ? `${stats.latestQuizScore}%` : 'Chưa thi'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Điểm gần nhất
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions / Navigation Hub */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 px-1">
          Lối tắt học tập nhanh
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Action 1: Kho 15 chủ đề từ vựng */}
          <button
            onClick={() => onNavigate('study', 'vocab')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-200/70 dark:border-slate-700 text-left hover:shadow-md transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                📚
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Kho từ vựng 15 chủ đề
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  15 danh mục • Mục tiêu 1.000 từ mỗi loại
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Action 2: Flashcard ngắt quãng */}
          <button
            onClick={() => onNavigate('study', 'flashcard')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/60 border border-pink-200/70 dark:border-slate-700 text-left hover:shadow-md transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-pink-500/20 group-hover:scale-105 transition">
                🃏
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Luyện Flashcard 3D
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lật thẻ Hàn-Việt • Spaced Repetition
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Action 3: Minigames tương tác */}
          <button
            onClick={() => onNavigate('games')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-purple-200/70 dark:border-slate-700 text-left hover:shadow-md transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition">
                🎮
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  4 Trò chơi tiếng Hàn
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Trắc nghiệm, Ghép từ, Điền từ, 60 Giây
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Action 4: Trợ lý AI Gemini */}
          <button
            onClick={() => onNavigate('ai')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-200/70 dark:border-slate-700 text-left hover:shadow-md transition active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Gia sư AI HanGo thông minh
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sửa mọi loại câu 9 phần • Ngữ pháp • Dịch thuật
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* 5. Direct Vocabulary Add Floating Trigger */}
      <div className="rounded-3xl bg-slate-900 text-white p-5 flex items-center justify-between shadow-lg">
        <div>
          <h3 className="text-sm font-bold">Bạn muốn bổ sung từ vựng mới?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Thêm từ tự học vào kho dữ liệu cá nhân ngay lập tức.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white transition shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
        >
          + Thêm từ vựng
        </button>
      </div>
    </div>
  );
};
