import React from 'react';
import { User, VocabularyItem } from '../types';
import { storageService } from '../services/storage';
import { ttsService } from '../services/tts';
import { HangoMascot } from './games/HangoMascot';
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
  onNavigate: (tab: 'study' | 'games' | 'profile', subTab?: string) => void;
  onOpenAddModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ user, onNavigate, onOpenAddModal }) => {
  const stats = storageService.getDashboardStats();
  const vocabs = storageService.getVocabularies();

  // Word of the day: ensure strictly valid Korean entry
  const validVocabs = vocabs.filter((v) => v && v.korean && /[\uac00-\ud7af]/.test(v.korean));
  const candidateList = validVocabs.length > 0 ? validVocabs : vocabs;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const todayIdx = Math.abs(dayOfYear) % (candidateList.length || 1);
  const wordOfTheDay: VocabularyItem = candidateList[todayIdx] || candidateList[0];

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
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-pink-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{user.avatar || '🧑‍🎓'}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  Học viên Hango
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">
                Xin chào, {user.name}! 👋
              </h1>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {user.isGuest ? 'Đang ở chế độ học thử miễn phí' : 'Hôm nay bạn học tiếng Hàn siêu chăm chỉ nha!'}
              </p>
            </div>

            {/* Mascot in Hero Card */}
            <div className="relative shrink-0 -my-2">
              <HangoMascot size="md" mood="happy" />
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur-md p-4 border border-white/25 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-blue-50 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-300" />
                <span>Mục tiêu hôm nay ({stats.learnedWords}/{stats.dailyGoal} từ)</span>
              </span>
              <span className="font-black text-amber-300 text-sm">{dailyProgressPercent}%</span>
            </div>

            {/* Multi-color gradient progress bar */}
            <div className="w-full h-3 rounded-full bg-black/25 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-pink-400 transition-all duration-500 shadow-sm"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-blue-100/90 font-medium">
              <span>
                {stats.learnedWords >= stats.dailyGoal
                  ? '🎉 Xuất sắc! Bạn đã vượt mục tiêu hôm nay rồi!'
                  : `Cố lên! Còn ${Math.max(0, stats.dailyGoal - stats.learnedWords)} từ nữa thôi!`}
              </span>
              <button
                onClick={() => onNavigate('study', 'vocab')}
                className="font-black text-amber-300 underline hover:text-white transition cursor-pointer"
              >
                Học ngay →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Word of the Day (Từ vựng của ngày) */}
      {wordOfTheDay && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-200/80 dark:border-amber-900/50 p-5 shadow-sm relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-bold text-sm shadow-2xs">
                🌟
              </span>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Từ vựng hôm nay
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Ghi nhớ 1 từ mỗi ngày</p>
              </div>
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900">
              {wordOfTheDay.level}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3.5">
              {/* Illustration / Emoji Avatar */}
              <div className="relative w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                <span className="text-3xl select-none">{wordOfTheDay.fallbackEmoji || '🇰🇷'}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {wordOfTheDay.korean}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg">
                    [{wordOfTheDay.pronunciation}]
                  </span>
                </div>
                <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {wordOfTheDay.meaning || wordOfTheDay.vietnamese}
                </p>
                {wordOfTheDay.topic && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Chủ đề: {wordOfTheDay.topic}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleSpeak(wordOfTheDay.korean)}
              className="p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 transition shadow-md shadow-amber-400/25 cursor-pointer font-bold shrink-0"
              title="Nghe phát âm chuẩn tiếng Hàn"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Example Sentence with speech bubble style */}
          {wordOfTheDay.exampleKorean && (
            <div className="mt-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 p-3.5 text-xs border border-amber-200/60 dark:border-slate-800 shadow-2xs space-y-1">
              <p className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>💬</span>
                <span>{wordOfTheDay.exampleKorean}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] font-medium">
                Dịch: {wordOfTheDay.exampleVietnamese}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Real Dashboard Statistics Grid with Cute Pastel Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tiến độ học tập thực tế</span>
          </h2>
          <span className="text-[11px] font-bold text-slate-500">Gắn theo tài khoản</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Từ đã học - Xanh Mint */}
          <div className="rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-200/90 dark:border-emerald-900/60 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                ĐÃ THUỘC
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.learnedWords}
            </div>
            <div className="text-[11px] text-emerald-700/90 dark:text-emerald-400 font-semibold mt-0.5">
              / {stats.totalWords} từ vựng
            </div>
          </div>

          {/* Card 2: Cần ôn tập - Vàng Cam */}
          <div
            onClick={() => onNavigate('study', 'flashcard')}
            className="rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-200/90 dark:border-amber-900/60 p-4 shadow-sm hover:border-amber-400 transition cursor-pointer select-none"
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700">
                <RotateCcw className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                CẦN ÔN
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.needReviewWords}
            </div>
            <div className="text-[11px] text-amber-700/90 dark:text-amber-400 font-semibold mt-0.5">
              Từ chờ ngắt quãng
            </div>
          </div>

          {/* Card 3: Ngữ pháp - Tím Pastel */}
          <div
            onClick={() => onNavigate('study', 'grammar')}
            className="rounded-3xl bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-200/90 dark:border-purple-900/60 p-4 shadow-sm hover:border-purple-400 transition cursor-pointer select-none"
          >
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                NGỮ PHÁP
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.completedGrammars}
            </div>
            <div className="text-[11px] text-purple-700/90 dark:text-purple-400 font-semibold mt-0.5">
              / {stats.totalGrammars} bài đã học
            </div>
          </div>

          {/* Card 4: Điểm kiểm tra - Hồng Pastel */}
          <div
            onClick={() => onNavigate('study', 'quiz')}
            className="rounded-3xl bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-200/90 dark:border-rose-900/60 p-4 shadow-sm hover:border-rose-400 transition cursor-pointer select-none"
          >
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300">
                BÀI TEST
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.latestQuizScore !== null ? `${stats.latestQuizScore}%` : 'Chưa thi'}
            </div>
            <div className="text-[11px] text-rose-700/90 dark:text-rose-400 font-semibold mt-0.5">
              Điểm thi gần nhất
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions / Navigation Hub */}
      <div>
        <h2 className="text-sm font-black text-slate-900 dark:text-white mb-3 px-1 flex items-center gap-1.5">
          <span>🚀</span>
          <span>Lối tắt học tập thông minh</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Action 1: Kho 15 chủ đề từ vựng */}
          <button
            onClick={() => onNavigate('study', 'vocab')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50/80 dark:from-slate-900 dark:to-blue-950/30 border-2 border-blue-200/80 dark:border-blue-900/60 text-left hover:shadow-md transition active:scale-98 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
                📚
              </div>
              <div>
                <span className="px-2 py-0.2 rounded-md bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-black text-[9px] uppercase tracking-wider">
                  Cơ bản & Nâng cao
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  Kho từ vựng 15 chủ đề
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Phân loại thông minh • Mục tiêu 1.000 từ
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition shrink-0" />
          </button>

          {/* Action 2: Flashcard ngắt quãng */}
          <button
            onClick={() => onNavigate('study', 'flashcard')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-pink-50 to-rose-50/80 dark:from-slate-900 dark:to-pink-950/30 border-2 border-pink-200/80 dark:border-pink-900/60 text-left hover:shadow-md transition active:scale-98 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-pink-500/25 group-hover:scale-105 transition">
                🃏
              </div>
              <div>
                <span className="px-2 py-0.2 rounded-md bg-pink-200/70 dark:bg-pink-900 text-pink-800 dark:text-pink-300 font-black text-[9px] uppercase tracking-wider">
                  Thuật toán SM-2
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  Luyện Flashcard 3D
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lật thẻ Hàn-Việt • Nhớ sâu nhớ lâu
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition shrink-0" />
          </button>

          {/* Action 3: Ghép từ qua hình ảnh */}
          <button
            onClick={() => onNavigate('games')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-yellow-50/80 dark:from-slate-900 dark:to-amber-950/30 border-2 border-amber-200/80 dark:border-amber-900/60 text-left hover:shadow-md transition active:scale-98 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center font-bold text-xl shadow-md shadow-amber-400/25 group-hover:scale-105 transition">
                🎮
              </div>
              <div>
                <span className="px-2 py-0.2 rounded-md bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-300 font-black text-[9px] uppercase tracking-wider">
                  Trò chơi cực vui
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  Ghép từ qua hình ảnh
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  10 Chủ đề sinh động • Thưởng điểm xịn
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition shrink-0" />
          </button>

          {/* Action 4: Luyện phát âm giọng nói */}
          <button
            onClick={() => onNavigate('study', 'vocab')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50/80 dark:from-slate-900 dark:to-emerald-950/30 border-2 border-emerald-200/80 dark:border-emerald-900/60 text-left hover:shadow-md transition active:scale-98 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/25 group-hover:scale-105 transition">
                🎙️
              </div>
              <div>
                <span className="px-2 py-0.2 rounded-md bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-black text-[9px] uppercase tracking-wider">
                  Web Speech API
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  Luyện phát âm giọng nói
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Thu âm chấm điểm phát âm tiếng Hàn
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition shrink-0" />
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
