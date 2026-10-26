import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PICTURE_GAME_TOPICS,
  PICTURE_GAME_WORDS,
  PictureGameTopic,
  PictureGameWord,
  getWordsByTopic,
} from '../../data/pictureGameData';
import { HangoMascot } from './HangoMascot';
import { soundEffects } from '../../services/soundEffects';
import { ttsService } from '../../services/tts';
import { storageService } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowLeft,
  Star,
  Award,
  Layers,
  HelpCircle,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';

export type GameLevel = 'easy' | 'medium' | 'hard';

interface TripletCard {
  uniqueId: string;
  wordId: string;
  cardType: 'image' | 'korean' | 'vietnamese';
  word: PictureGameWord;
}

interface PictureMatchingGameProps {
  onBackToMenu?: () => void;
}

export const PictureMatchingGame: React.FC<PictureMatchingGameProps> = ({ onBackToMenu }) => {
  // Game state: 'hub' (topic/level selection) | 'playing' | 'victory'
  const [gameState, setGameState] = useState<'hub' | 'playing' | 'victory'>('hub');

  // Configuration
  const [selectedTopicId, setSelectedTopicId] = useState<string>('fruits');
  const [selectedLevel, setSelectedLevel] = useState<GameLevel>('easy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundEffects.isEnabled());

  // Gameplay state
  const [cards, setCards] = useState<TripletCard[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([]);
  const [targetWordCount, setTargetWordCount] = useState<number>(4);
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isProcessingMismatch, setIsProcessingMismatch] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Stats from storage
  const [highScore, setHighScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [totalCompletedSets, setTotalCompletedSets] = useState<number>(0);

  // Timer Ref
  const timerRef = useRef<any>(null);

  // Level configuration
  const levelConfig = {
    easy: { words: 4, name: 'Dễ', badgeColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', desc: '4 bộ từ (12 thẻ)' },
    medium: { words: 8, name: 'Trung bình', badgeColor: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-400', desc: '8 bộ từ (24 thẻ)' },
    hard: { words: 12, name: 'Khó', badgeColor: 'bg-purple-600', textColor: 'text-purple-600 dark:text-purple-400', desc: '12 bộ từ (36 thẻ)' },
  };

  // Load existing records on mount
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = () => {
    const records = storageService.getGameScores().filter((r) => r.gameType === 'pictureMatch');
    if (records.length > 0) {
      const topScore = Math.max(...records.map((r) => r.score));
      const times = records.filter((r) => r.timeSpentSeconds > 0).map((r) => r.timeSpentSeconds);
      const fastest = times.length > 0 ? Math.min(...times) : null;
      setHighScore(topScore);
      setBestTime(fastest);
      setTotalCompletedSets(records.reduce((acc, r) => acc + Math.floor(r.score / 10), 0));
    }
  };

  // Handle sound toggle
  const toggleSound = () => {
    const next = soundEffects.toggleSound();
    setSoundEnabled(next);
  };

  // Start game round
  const startGame = () => {
    const count = levelConfig[selectedLevel].words;
    setTargetWordCount(count);

    // Pick words from selected topic
    const topicWords = getWordsByTopic(selectedTopicId);
    const pool = topicWords.length >= count ? topicWords : PICTURE_GAME_WORDS;
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const chosenWords = shuffledPool.slice(0, count);

    // Generate 3 cards per word
    const newCards: TripletCard[] = [];
    chosenWords.forEach((word) => {
      newCards.push({
        uniqueId: `${word.id}_img`,
        wordId: word.id,
        cardType: 'image',
        word,
      });
      newCards.push({
        uniqueId: `${word.id}_ko`,
        wordId: word.id,
        cardType: 'korean',
        word,
      });
      newCards.push({
        uniqueId: `${word.id}_vi`,
        wordId: word.id,
        cardType: 'vietnamese',
        word,
      });
    });

    // Shuffle all triplet cards
    setCards(newCards.sort(() => 0.5 - Math.random()));
    setSelectedCardIds([]);
    setMatchedWordIds([]);
    setScore(0);
    setMistakes(0);
    setCombo(0);
    setMaxCombo(0);
    setSeconds(0);
    setFeedbackMessage(null);
    setIsProcessingMismatch(false);
    setGameState('playing');

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle card click
  const handleCardClick = (card: TripletCard) => {
    if (isProcessingMismatch) return;
    if (matchedWordIds.includes(card.wordId)) return;

    // If card is already in current selection, unselect it
    if (selectedCardIds.includes(card.uniqueId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== card.uniqueId));
      soundEffects.playCardClick();
      return;
    }

    // Play tactile click sound
    soundEffects.playCardClick();

    // If card type is already selected (e.g., clicking 2 images), replace that card type in selection
    const currentSelectedCards = cards.filter((c) => selectedCardIds.includes(c.uniqueId));
    const sameTypeIdx = currentSelectedCards.findIndex((c) => c.cardType === card.cardType);

    let nextSelectedIds: string[];
    if (sameTypeIdx !== -1) {
      // Replace existing selection of the same type
      const replacedId = currentSelectedCards[sameTypeIdx].uniqueId;
      nextSelectedIds = selectedCardIds.map((id) => (id === replacedId ? card.uniqueId : id));
    } else {
      nextSelectedIds = [...selectedCardIds, card.uniqueId];
    }

    // If not yet 3 cards, just update selection
    if (nextSelectedIds.length < 3) {
      setSelectedCardIds(nextSelectedIds);
      return;
    }

    // 3 cards selected! Check if all 3 match the same word
    setSelectedCardIds(nextSelectedIds);
    const chosenCards = cards.filter((c) => nextSelectedIds.includes(c.uniqueId));

    const isTripletMatch =
      chosenCards.length === 3 &&
      chosenCards[0].wordId === chosenCards[1].wordId &&
      chosenCards[1].wordId === chosenCards[2].wordId;

    if (isTripletMatch) {
      // MATCH!
      const word = chosenCards[0].word;
      const nextMatched = [...matchedWordIds, word.id];
      setMatchedWordIds(nextMatched);

      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const addedScore = 10;
      setScore((prev) => prev + addedScore);

      // Cheerful feedback & Audio
      soundEffects.playSuccessSound();
      ttsService.speak(word.korean);
      setFeedbackMessage({
        type: 'success',
        text: `🎉 Chính xác! Giỏi lắm! (${word.korean} = ${word.vietnamese}) +10 điểm`,
      });

      // Mini confetti on correct match
      try {
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
      } catch {}

      // Clear selection
      setSelectedCardIds([]);

      // Check if all words completed
      if (nextMatched.length === targetWordCount) {
        finishGame(score + addedScore, mistakes, seconds);
      }
    } else {
      // MISMATCH!
      setIsProcessingMismatch(true);
      setCombo(0);
      setMistakes((prev) => prev + 1);
      soundEffects.playErrorSound();
      setFeedbackMessage({
        type: 'error',
        text: 'Chưa đúng rồi, thử lại nhé! ❌',
      });

      // Clear selection after brief delay so user sees what failed
      setTimeout(() => {
        setSelectedCardIds([]);
        setIsProcessingMismatch(false);
      }, 750);
    }
  };

  // Finish game
  const finishGame = (finalScore: number, finalMistakes: number, totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Save record
    const topic = PICTURE_GAME_TOPICS.find((t) => t.id === selectedTopicId);
    storageService.saveGameScore({
      gameType: 'pictureMatch',
      gameName: `Ghép từ qua hình ảnh - ${topic?.name || 'Chủ đề'}`,
      score: finalScore,
      maxScore: targetWordCount * 10,
      timeSpentSeconds: totalSeconds,
      topicName: topic?.name,
      level: levelConfig[selectedLevel].name,
    });

    loadUserStats();
    soundEffects.playWinFanfare();

    // Big Victory Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    setGameState('victory');
  };

  // Calculate Stars
  const calculateStars = () => {
    if (mistakes === 0) return 3;
    if (mistakes <= Math.floor(targetWordCount / 2)) return 2;
    return 1;
  };

  // Active topic object
  const currentTopic = useMemo(
    () => PICTURE_GAME_TOPICS.find((t) => t.id === selectedTopicId) || PICTURE_GAME_TOPICS[0],
    [selectedTopicId]
  );

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* ================= VIEW 1: GAME HUB / SELECTION SCREEN ================= */}
      {gameState === 'hub' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Menu trò chơi</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                soundEnabled
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Âm thanh: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Âm thanh: Tắt</span>
                </>
              )}
            </button>
          </div>

          {/* Section A: Hero Card with Mascot & Bright Yellow Start Button */}
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Mascot */}
              <div className="relative shrink-0">
                <HangoMascot size="lg" mood="cheering" />
                {/* Floating mini badge */}
                <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] shadow-md animate-pulse">
                  Hango PRO
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trò chơi thị giác tương tác</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Ghép từ qua hình ảnh
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed max-w-md">
                  Học từ vựng tiếng Hàn theo cách thú vị hơn! Chạm 1 hình ảnh + 1 từ tiếng Hàn + 1 nghĩa tiếng Việt để tạo thành bộ 3 hoàn hảo.
                </p>

                {/* Bright Yellow Action Button */}
                <div className="pt-2">
                  <button
                    onClick={startGame}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/30 transition cursor-pointer select-none ring-2 ring-yellow-200/50"
                  >
                    <Gamepad2 className="w-5 h-5 text-slate-950 animate-bounce" />
                    <span>Bắt đầu chơi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Bar */}
            <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-3 gap-2 text-center select-none">
              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
                  Điểm cao nhất
                </p>
                <p className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                  {highScore} đ
                </p>
              </div>

              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
                  Thời gian tốt nhất
                </p>
                <p className="text-base sm:text-lg font-black text-cyan-200 mt-0.5">
                  {bestTime !== null ? `${bestTime}s` : '--'}
                </p>
              </div>

              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
                  Bộ từ hoàn thành
                </p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">
                  {totalCompletedSets}
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Topic Selection (10 Topics with Pastel cards & Cute Icons) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>1. Chọn chủ đề từ vựng</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    10 Chủ đề
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mỗi chủ đề gồm 20 từ vựng kèm hình ảnh minh họa chân thực
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PICTURE_GAME_TOPICS.map((topic) => {
                const isSelected = selectedTopicId === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      soundEffects.playCardClick();
                    }}
                    className={`relative p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer select-none flex flex-col justify-between group ${
                      isSelected
                        ? `bg-white dark:bg-slate-900 ${topic.borderActive} shadow-md shadow-blue-500/10 scale-102 ring-2 ring-blue-500/20`
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow">
                        ✓
                      </span>
                    )}

                    <div>
                      {/* Topic Icon Banner */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-2xl shadow-inner mb-2.5 group-hover:scale-105 transition">
                        {topic.icon}
                      </div>

                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {topic.name}
                      </h3>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {topic.koreanName}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-400">
                        {topic.sampleCount} từ
                      </span>
                      <span className="font-bold text-blue-500 group-hover:translate-x-0.5 transition">
                        {isSelected ? 'Đã chọn' : 'Chọn'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Level Selection (Easy, Medium, Hard) */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>2. Chọn cấp độ thử thách</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Số lượng bộ từ và thẻ ghép tương ứng trong mỗi ván chơi
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Level 1: Dễ - Màu Xanh Lá */}
              <button
                onClick={() => {
                  setSelectedLevel('easy');
                  soundEffects.playCardClick();
                }}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer select-none relative ${
                  selectedLevel === 'easy'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                      🌱
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Dễ
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        4 bộ từ (12 thẻ)
                      </p>
                    </div>
                  </div>
                  {selectedLevel === 'easy' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  Phù hợp với người mới bắt đầu làm quen với từ vựng.
                </p>
              </button>

              {/* Level 2: Trung bình - Màu Xanh Dương */}
              <button
                onClick={() => {
                  setSelectedLevel('medium');
                  soundEffects.playCardClick();
                }}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer select-none relative ${
                  selectedLevel === 'medium'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm">
                      ⚡
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Trung bình
                      </h3>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        8 bộ từ (24 thẻ)
                      </p>
                    </div>
                  </div>
                  {selectedLevel === 'medium' && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  Rèn luyện trí nhớ và phản xạ từ vựng linh hoạt.
                </p>
              </button>

              {/* Level 3: Khó - Màu Tím */}
              <button
                onClick={() => {
                  setSelectedLevel('hard');
                  soundEffects.playCardClick();
                }}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer select-none relative ${
                  selectedLevel === 'hard'
                    ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                      🔥
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Khó
                      </h3>
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        12 bộ từ (36 thẻ)
                      </p>
                    </div>
                  </div>
                  {selectedLevel === 'hard' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  Thử thách đỉnh cao cho trí nhớ thị giác toàn diện.
                </p>
              </button>
            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentTopic.icon}</span>
              <div>
                <p className="text-xs text-slate-400 font-medium">Chủ đề & Cấp độ sẵn sàng:</p>
                <p className="text-sm font-extrabold text-white">
                  {currentTopic.name} • {levelConfig[selectedLevel].name} ({levelConfig[selectedLevel].desc})
                </p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 active:scale-95 transition cursor-pointer select-none"
            >
              Chơi ngay bây giờ →
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: ACTIVE GAMEPLAY SCREEN ================= */}
      {gameState === 'playing' && (
        <div className="space-y-4 animate-in fade-in duration-200 max-w-4xl mx-auto">
          {/* Top HUD Status Bar */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 text-xs">
            {/* Back Button */}
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameState('hub');
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dừng ván</span>
            </button>

            {/* Topic & Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
              <span>{currentTopic.icon}</span>
              <span>{currentTopic.name}</span>
              <span className="text-slate-400">•</span>
              <span className={levelConfig[selectedLevel].textColor}>
                {levelConfig[selectedLevel].name}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-500" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Timer */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
              <Timer className="w-3.5 h-3.5 text-blue-500" />
              <span>{seconds}s</span>
            </div>

            {/* Mistakes */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold">
              <span>Sai: {mistakes}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-black text-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{score} đ</span>
            </div>
          </div>

          {/* Progress Bar & Matched Counter */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>Tiến độ:</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">
                  {matchedWordIds.length}/{targetWordCount} bộ từ
                </span>
              </span>

              {combo > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black animate-bounce flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Combo x{combo}</span>
                </span>
              )}
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.round((matchedWordIds.length / targetWordCount) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* User Feedback Toast Banner */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all animate-in zoom-in-95 duration-150 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-sm animate-shake'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Game Instructions Banner */}
          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium select-none">
            💡 Chạm <span className="text-blue-600 dark:text-blue-400 font-bold">1 Hình ảnh</span> +{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">1 Từ tiếng Hàn</span> +{' '}
            <span className="text-purple-600 dark:text-purple-400 font-bold">1 Nghĩa tiếng Việt</span> để tạo bộ 3 tương ứng!
          </div>

          {/* Cards Grid: 3 or 4 Columns responsive */}
          <div
            className={`grid gap-2.5 sm:gap-3.5 ${
              targetWordCount > 8
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
                : targetWordCount > 4
                ? 'grid-cols-3 sm:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            }`}
          >
            {cards.map((card) => {
              const isMatched = matchedWordIds.includes(card.wordId);
              const isSelected = selectedCardIds.includes(card.uniqueId);

              return (
                <button
                  key={card.uniqueId}
                  disabled={isMatched || isProcessingMismatch}
                  onClick={() => handleCardClick(card)}
                  className={`relative p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[125px] overflow-hidden ${
                    isMatched
                      ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-60 cursor-default'
                      : isSelected
                      ? 'border-amber-400 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-lg scale-102 ring-4 ring-amber-400/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Type Tag */}
                  <span
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      card.cardType === 'image'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : card.cardType === 'korean'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {card.cardType === 'image' ? 'Ảnh' : card.cardType === 'korean' ? 'Tiếng Hàn' : 'Tiếng Việt'}
                  </span>

                  {/* Matched Badge */}
                  {isMatched && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && !isMatched && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black animate-pulse">
                      ●
                    </span>
                  )}

                  {/* CARD TYPE 1: IMAGE */}
                  {card.cardType === 'image' && (
                    <div className="w-full flex flex-col items-center justify-center mt-3">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img
                          src={card.word.imageUrl}
                          alt={card.word.vietnamese}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            // If image fails to load, gracefully hide img and show fallback emoji
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.emoji-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        {/* Fallback emoji */}
                        <div className="emoji-fallback hidden text-3xl">
                          {card.word.fallbackEmoji}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD TYPE 2: KOREAN WORD */}
                  {card.cardType === 'korean' && (
                    <div className="w-full flex flex-col items-center justify-center mt-3">
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {card.word.korean}
                      </p>
                      <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 mt-0.5">
                        [{card.word.pronunciation}]
                      </p>
                      {/* TTS Speak Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          ttsService.speak(card.word.korean);
                        }}
                        className="mt-1.5 p-1 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950 transition"
                        title="Nghe phát âm tiếng Hàn"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* CARD TYPE 3: VIETNAMESE MEANING */}
                  {card.cardType === 'vietnamese' && (
                    <div className="w-full flex flex-col items-center justify-center mt-3 px-1">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                        {card.word.vietnamese}
                      </p>
                      <span className="mt-1 text-[10px] text-slate-400 font-medium">
                        Nghĩa tiếng Việt
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: VICTORY / RESULTS MODAL ================= */}
      {gameState === 'victory' && (
        <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Mascot Celebration */}
          <div className="flex justify-center -mt-2">
            <HangoMascot size="lg" mood="victory" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
              🎉 HOÀN THÀNH XUẤT SẮC!
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white pt-2">
              Bạn đã ghép đúng tất cả các từ!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chủ đề: <strong>{currentTopic.name}</strong> • Cấp độ: <strong>{levelConfig[selectedLevel].name}</strong>
            </p>
          </div>

          {/* Star Rating Banner */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-9 h-9 ${
                  starIdx <= calculateStars()
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md animate-bounce'
                    : 'text-slate-200 dark:text-slate-800 fill-slate-200 dark:fill-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Detailed Match Statistics */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-slate-400 font-semibold">Tổng điểm đạt được</span>
              <p className="text-xl font-black text-amber-500 mt-0.5">+{score} đ</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-slate-400 font-semibold">Thời gian hoàn thành</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{seconds}s</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-slate-400 font-semibold">Số bộ từ ghép đúng</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{targetWordCount}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
              <span className="text-slate-400 font-semibold">Số lần ghép sai</span>
              <p className="text-xl font-black text-rose-500 mt-0.5">{mistakes}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer select-none"
            >
              🔄 Chơi lại ván này
            </button>

            <button
              onClick={() => setGameState('hub')}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/25 active:scale-95 transition cursor-pointer select-none"
            >
              🎨 Chọn chủ đề hoặc cấp độ khác
            </button>

            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className="w-full py-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Về danh sách trò chơi khác
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
