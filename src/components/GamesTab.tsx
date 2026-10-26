import React, { useState, useEffect, useRef } from 'react';
import { VocabularyItem, GameScoreRecord } from '../types';
import { storageService } from '../services/storage';
import { ttsService } from '../services/tts';
import { PictureMatchingGame } from './games/PictureMatchingGame';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  Timer,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Volume2,
  Layers,
} from 'lucide-react';

export const GamesTab: React.FC = () => {
  // Default to the flagship 'picture' matching game mode requested by user
  const [gameMode, setGameMode] = useState<'picture' | 'miniGames'>('picture');
  const [activeGame, setActiveGame] = useState<'menu' | 'quiz' | 'matching' | 'fill' | 'blitz'>('menu');
  const [vocabs, setVocabs] = useState<VocabularyItem[]>(() => storageService.getVocabularies());
  const [gameHistory, setGameHistory] = useState<GameScoreRecord[]>(() => storageService.getGameScores());

  // Prevent double click fraud
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);

  // ================= GAME 1: TRẮC NGHIỆM ABCD =================
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState<string | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);

  // ================= GAME 2: GHÉP TỪ (MATCHING) =================
  const [matchingCards, setMatchingCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [matchingScore, setMatchingScore] = useState(0);
  const [matchingTimer, setMatchingTimer] = useState(0);
  const matchingIntervalRef = useRef<any>(null);

  // ================= GAME 3: ĐIỀN TỪ CÒN THIẾU =================
  const [fillQuestion, setFillQuestion] = useState<any>(null);
  const [fillScore, setFillScore] = useState(0);
  const [fillSelectedOption, setFillSelectedOption] = useState<string | null>(null);
  const [fillExplanation, setFillExplanation] = useState<string | null>(null);

  // ================= GAME 4: THỬ THÁCH 60 GIÂY (BLITZ) =================
  const [blitzTime, setBlitzTime] = useState(60);
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzCombo, setBlitzCombo] = useState(0);
  const [blitzQuestion, setBlitzQuestion] = useState<any>(null);
  const [isBlitzFinished, setIsBlitzFinished] = useState(false);
  const blitzTimerRef = useRef<any>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
      if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    };
  }, []);

  const refreshHistory = () => {
    setGameHistory(storageService.getGameScores());
  };

  // --- START GAME 1: QUIZ ---
  const initQuizRound = () => {
    if (vocabs.length < 4) return;
    setHasAnsweredCurrent(false);
    setQuizSelectedOption(null);
    setQuizExplanation(null);

    const randomWord = vocabs[Math.floor(Math.random() * vocabs.length)];
    const otherWords = vocabs
      .filter((v) => v.id !== randomWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const isKoreanPrompt = Math.random() > 0.5;
    const correctAns = isKoreanPrompt ? randomWord.vietnamese : randomWord.korean;
    const wrongAns = otherWords.map((w) => (isKoreanPrompt ? w.vietnamese : w.korean));
    const options = [correctAns, ...wrongAns].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      word: randomWord,
      isKoreanPrompt,
      prompt: isKoreanPrompt ? randomWord.korean : randomWord.vietnamese,
      pronunciation: isKoreanPrompt ? randomWord.pronunciation : '',
      options,
      correctAnswer: correctAns,
    });
  };

  const handleQuizAnswer = (option: string, optIdx: number) => {
    if (hasAnsweredCurrent) return; // Anti-spam
    setHasAnsweredCurrent(true);
    setQuizSelectedOption(optIdx);

    const isRight = option === quizQuestion.correctAnswer;
    if (isRight) {
      const nextScore = quizScore + 10 + quizStreak * 2;
      setQuizScore(nextScore);
      setQuizStreak((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 45 });
      setQuizExplanation(`🎉 Chính xác! +${10 + quizStreak * 2} điểm.`);
    } else {
      setQuizStreak(0);
      setQuizExplanation(
        `❌ Chưa đúng. Đáp án chuẩn là "${quizQuestion.correctAnswer}". (${quizQuestion.word.korean} = ${quizQuestion.word.vietnamese})`
      );
    }
  };

  // --- START GAME 2: MATCHING ---
  const initMatchingGame = () => {
    if (vocabs.length < 4) return;
    const chosenWords = [...vocabs].sort(() => 0.5 - Math.random()).slice(0, 4);

    const cards: any[] = [];
    chosenWords.forEach((word) => {
      // Korean card
      cards.push({
        id: `ko_${word.id}`,
        pairId: word.id,
        text: word.korean,
        type: 'ko',
        pronunciation: word.pronunciation,
      });
      // Vietnamese card
      cards.push({
        id: `vi_${word.id}`,
        pairId: word.id,
        text: word.vietnamese,
        type: 'vi',
      });
    });

    setMatchingCards(cards.sort(() => 0.5 - Math.random()));
    setSelectedCardId(null);
    setMatchedCardIds([]);
    setMatchingScore(0);
    setMatchingTimer(0);

    if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
    matchingIntervalRef.current = setInterval(() => {
      setMatchingTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleCardClick = (card: any) => {
    if (matchedCardIds.includes(card.id)) return;
    if (selectedCardId === card.id) return;

    if (!selectedCardId) {
      setSelectedCardId(card.id);
      return;
    }

    // Second card clicked
    const firstCard = matchingCards.find((c) => c.id === selectedCardId);
    if (!firstCard) {
      setSelectedCardId(null);
      return;
    }

    if (firstCard.pairId === card.pairId && firstCard.type !== card.type) {
      // Match found!
      const newMatched = [...matchedCardIds, firstCard.id, card.id];
      setMatchedCardIds(newMatched);
      setMatchingScore((prev) => prev + 25);
      setSelectedCardId(null);

      if (newMatched.length === matchingCards.length) {
        // Complete!
        clearInterval(matchingIntervalRef.current);
        confetti({ particleCount: 70, spread: 60 });
        storageService.saveGameScore({
          gameType: 'matching',
          gameName: 'Ghép từ Hàn - Việt',
          score: matchingScore + 25,
          maxScore: 100,
          timeSpentSeconds: matchingTimer,
        });
        refreshHistory();
      }
    } else {
      // Mismatch
      setSelectedCardId(card.id);
    }
  };

  // --- START GAME 3: FILL IN THE BLANK ---
  const initFillRound = () => {
    const pool = vocabs.filter((v) => v.exampleKorean && v.exampleKorean.includes(v.korean));
    if (pool.length === 0) {
      alert('Chưa có đủ câu ví dụ trong kho từ để chơi Điền từ. Hãy dùng Trắc nghiệm hoặc Thử thách 60s.');
      setActiveGame('menu');
      return;
    }

    setHasAnsweredCurrent(false);
    setFillSelectedOption(null);
    setFillExplanation(null);

    const targetWord = pool[Math.floor(Math.random() * pool.length)];
    const sentenceWithBlank = targetWord.exampleKorean.replace(targetWord.korean, '_____');

    const wrongWords = vocabs
      .filter((v) => v.id !== targetWord.id && v.wordType === targetWord.wordType)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w) => w.korean);

    // Fallback if not enough matching word types
    while (wrongWords.length < 3) {
      const extra = vocabs[Math.floor(Math.random() * vocabs.length)].korean;
      if (!wrongWords.includes(extra) && extra !== targetWord.korean) {
        wrongWords.push(extra);
      }
    }

    const options = [targetWord.korean, ...wrongWords].sort(() => 0.5 - Math.random());

    setFillQuestion({
      word: targetWord,
      sentenceWithBlank,
      fullSentence: targetWord.exampleKorean,
      vietnameseTranslation: targetWord.exampleVietnamese,
      correctWord: targetWord.korean,
      options,
    });
  };

  const handleFillAnswer = (option: string) => {
    if (hasAnsweredCurrent) return;
    setHasAnsweredCurrent(true);
    setFillSelectedOption(option);

    if (option === fillQuestion.correctWord) {
      setFillScore((prev) => prev + 15);
      confetti({ particleCount: 30, spread: 45 });
      setFillExplanation('🎉 Chính xác! Bạn đã điền đúng từ ngữ cảnh.');
    } else {
      setFillExplanation(`❌ Sai rồi. Từ đúng là "${fillQuestion.correctWord}".`);
    }
  };

  // --- START GAME 4: 60 SECONDS BLITZ ---
  const initBlitzGame = () => {
    setBlitzTime(60);
    setBlitzScore(0);
    setBlitzCombo(0);
    setIsBlitzFinished(false);
    nextBlitzQuestion();

    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    blitzTimerRef.current = setInterval(() => {
      setBlitzTime((prev) => {
        if (prev <= 1) {
          clearInterval(blitzTimerRef.current);
          setIsBlitzFinished(true);
          confetti({ particleCount: 80, spread: 70 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextBlitzQuestion = () => {
    if (vocabs.length < 2) return;
    setHasAnsweredCurrent(false);

    const randomWord = vocabs[Math.floor(Math.random() * vocabs.length)];
    const isTrue = Math.random() > 0.5;

    let displayedMeaning = randomWord.vietnamese;
    if (!isTrue) {
      const wrong = vocabs.filter((v) => v.id !== randomWord.id);
      if (wrong.length > 0) {
        displayedMeaning = wrong[Math.floor(Math.random() * wrong.length)].vietnamese;
      }
    }

    setBlitzQuestion({
      korean: randomWord.korean,
      pronunciation: randomWord.pronunciation,
      displayedMeaning,
      isTrue,
    });
  };

  const handleBlitzChoice = (choiceIsTrue: boolean) => {
    if (hasAnsweredCurrent || isBlitzFinished) return;
    setHasAnsweredCurrent(true);

    const isCorrect = choiceIsTrue === blitzQuestion.isTrue;
    if (isCorrect) {
      const addedPoints = 10 + blitzCombo * 2;
      setBlitzScore((prev) => prev + addedPoints);
      setBlitzCombo((prev) => prev + 1);
    } else {
      setBlitzCombo(0);
    }

    setTimeout(nextBlitzQuestion, 150);
  };

  // Save blitz high score when finished
  useEffect(() => {
    if (isBlitzFinished && blitzScore > 0) {
      storageService.saveGameScore({
        gameType: 'blitz',
        gameName: 'Thử thách 60 Giây',
        score: blitzScore,
        maxScore: blitzScore,
        timeSpentSeconds: 60,
      });
      refreshHistory();
    }
  }, [isBlitzFinished]);

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Game Mode Segmented Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 max-w-md mx-auto">
        <button
          onClick={() => {
            setGameMode('picture');
            setActiveGame('menu');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer select-none ${
            gameMode === 'picture'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🖼️</span>
          <span>Ghép từ qua hình ảnh</span>
        </button>

        <button
          onClick={() => setGameMode('miniGames')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer select-none ${
            gameMode === 'miniGames'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🎮</span>
          <span>Mini-game khác</span>
        </button>
      </div>

      {/* MODE 1: PICTURE MATCHING GAME */}
      {gameMode === 'picture' && (
        <PictureMatchingGame onBackToMenu={() => setGameMode('miniGames')} />
      )}

      {/* MODE 2: CLASSIC MINI GAMES */}
      {gameMode === 'miniGames' && (
        <div className="space-y-4">
          {/* Menu / Game Hub */}
          {activeGame === 'menu' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-6 text-white shadow-xl shadow-blue-500/15">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-2xl">🎮</span>
                    <div>
                      <h2 className="text-lg font-bold">Đấu trường trò chơi HanGo</h2>
                      <p className="text-xs text-blue-100">
                        Luyện phản xạ từ vựng, ghi nhớ lâu và tích lũy điểm thưởng!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Banner to Switch back to Picture Matching Game */}
              <div
                onClick={() => setGameMode('picture')}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🖼️</span>
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-black text-[9px] uppercase tracking-wider">
                      Mới & Nổi bật
                    </span>
                    <h3 className="font-black text-sm sm:text-base text-slate-950 mt-0.5">
                      Ghép từ qua hình ảnh (10 Chủ đề)
                    </h3>
                    <p className="text-xs text-slate-800 font-medium">
                      Chạm bộ 3: Hình ảnh + Từ tiếng Hàn + Nghĩa tiếng Việt
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-black text-xs text-slate-950 bg-white/40 px-3 py-1.5 rounded-xl shrink-0">
                  <span>Chơi ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* 4 Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Game 1 */}
            <div
              onClick={() => {
                setActiveGame('quiz');
                setQuizScore(0);
                setQuizStreak(0);
                initQuizRound();
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition active:scale-98 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-3 group-hover:scale-105 transition">
                  🅰️
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Trắc nghiệm ABCD
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chọn nghĩa tiếng Việt hoặc từ tiếng Hàn tương ứng với 4 lựa chọn, tính combo chuỗi đúng.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Chơi ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Game 2 */}
            <div
              onClick={() => {
                setActiveGame('matching');
                initMatchingGame();
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition active:scale-98 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-3 group-hover:scale-105 transition">
                  🧩
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Ghép cặp từ vựng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chạm ghép nối 4 thẻ tiếng Hàn với 4 thẻ nghĩa tiếng Việt tương ứng theo thời gian thực.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Chơi ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Game 3 */}
            <div
              onClick={() => {
                setActiveGame('fill');
                setFillScore(0);
                initFillRound();
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition active:scale-98 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl mb-3 group-hover:scale-105 transition">
                  ✍️
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  3. Điền từ còn thiếu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đọc câu ví dụ tiếng Hàn có chỗ trống và chọn từ vựng chính xác để hoàn chỉnh câu văn.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Chơi ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Game 4 */}
            <div
              onClick={() => {
                setActiveGame('blitz');
                initBlitzGame();
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition active:scale-98 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl mb-3 group-hover:scale-105 transition">
                  ⚡
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  4. Thử thách 60 giây
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đồng hồ đếm ngược 60s! Trả lời Đúng hay Sai với tốc độ chớp nhoáng để lập kỷ lục điểm.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                <span>Chơi ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>

          {/* Leaderboard / Game History */}
          {gameHistory.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Lịch sử điểm cao gần nhất
                </h3>
                <span className="text-[10px] text-slate-400">Đã lưu trữ</span>
              </div>

              <div className="space-y-2">
                {gameHistory.slice(0, 5).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {rec.gameName}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(rec.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {rec.score} điểm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= ACTIVE GAME 1: TRẮC NGHIỆM ABCD ================= */}
      {activeGame === 'quiz' && quizQuestion && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Header Score & Back */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <button
              onClick={() => setActiveGame('menu')}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              ← Thoát trò chơi
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Flame className="w-3.5 h-3.5" />
                <span>Combo: {quizStreak}</span>
              </span>
              <span className="font-black text-blue-600 text-sm">Điểm: {quizScore}</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 text-center space-y-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {quizQuestion.isKoreanPrompt ? 'Từ tiếng Hàn này có nghĩa là gì?' : 'Tìm từ tiếng Hàn tương ứng:'}
            </span>

            <div className="py-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                {quizQuestion.prompt}
              </h2>
              {quizQuestion.pronunciation && (
                <p className="text-xs text-slate-500 mt-1">{quizQuestion.pronunciation}</p>
              )}
            </div>

            {/* 4 Choices */}
            <div className="space-y-2">
              {quizQuestion.options.map((opt: string, idx: number) => {
                let btnStyle =
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-400';

                if (hasAnsweredCurrent) {
                  if (opt === quizQuestion.correctAnswer) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (idx === quizSelectedOption) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleQuizAnswer(opt, idx)}
                    className={`w-full p-3.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasAnsweredCurrent && opt === quizQuestion.correctAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation banner */}
            {quizExplanation && (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-xs text-slate-800 dark:text-slate-200 border border-blue-200">
                <p className="font-semibold">{quizExplanation}</p>
              </div>
            )}

            {/* Next question */}
            {hasAnsweredCurrent && (
              <button
                onClick={initQuizRound}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                Câu hỏi tiếp theo →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= ACTIVE GAME 2: GHÉP TỪ VỰNG ================= */}
      {activeGame === 'matching' && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <button
              onClick={() => {
                if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
                setActiveGame('menu');
              }}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              ← Thoát
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
                <Timer className="w-3.5 h-3.5 text-blue-500" />
                <span>{matchingTimer}s</span>
              </span>
              <span className="font-black text-emerald-600 text-sm">Điểm: {matchingScore}</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Chạm 1 thẻ tiếng Hàn và 1 thẻ nghĩa tiếng Việt để ghép đôi!
          </div>

          {/* Cards 4x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {matchingCards.map((card) => {
              const isMatched = matchedCardIds.includes(card.id);
              const isSelected = selectedCardId === card.id;

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleCardClick(card)}
                  className={`h-24 p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                    isMatched
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 opacity-50 cursor-default'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 shadow-md scale-102 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-black">{card.text}</span>
                  {card.pronunciation && (
                    <span className="text-[10px] text-slate-400 mt-1">{card.pronunciation}</span>
                  )}
                  {isMatched && <span className="text-[10px] font-bold text-emerald-600">✓ Đã ghép</span>}
                </button>
              );
            })}
          </div>

          {matchedCardIds.length === matchingCards.length && matchingCards.length > 0 && (
            <div className="rounded-3xl bg-emerald-500 text-white p-6 text-center space-y-3 shadow-lg">
              <span className="text-3xl">🎉</span>
              <h3 className="text-lg font-black">Xuất sắc! Đã hoàn thành trong {matchingTimer} giây</h3>
              <p className="text-xs text-emerald-100">Bạn được thưởng +{matchingScore} điểm</p>
              <button
                onClick={initMatchingGame}
                className="px-5 py-2.5 rounded-2xl bg-white text-emerald-700 text-xs font-bold shadow hover:bg-emerald-50 transition cursor-pointer"
              >
                Chơi ván mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= ACTIVE GAME 3: ĐIỀN TỪ CÒN THIẾU ================= */}
      {activeGame === 'fill' && fillQuestion && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <button
              onClick={() => setActiveGame('menu')}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              ← Thoát trò chơi
            </button>
            <span className="font-black text-amber-600 text-sm">Điểm: {fillScore}</span>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 text-center space-y-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Chọn từ vựng đúng để điền vào chỗ trống:
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-relaxed">
                {fillQuestion.sentenceWithBlank}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                Dịch: "{fillQuestion.vietnameseTranslation}"
              </p>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-2 gap-2.5">
              {fillQuestion.options.map((opt: string, idx: number) => {
                let optStyle =
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (hasAnsweredCurrent) {
                  if (opt === fillQuestion.correctWord) {
                    optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 font-bold';
                  } else if (opt === fillSelectedOption) {
                    optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleFillAnswer(opt)}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${optStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {fillExplanation && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-xs text-slate-800 dark:text-slate-200 border border-amber-200">
                <p className="font-semibold">{fillExplanation}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">{fillQuestion.fullSentence}</p>
              </div>
            )}

            {hasAnsweredCurrent && (
              <button
                onClick={initFillRound}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Câu tiếp theo →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= ACTIVE GAME 4: THỬ THÁCH 60 GIÂY ================= */}
      {activeGame === 'blitz' && blitzQuestion && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <button
              onClick={() => {
                if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
                setActiveGame('menu');
              }}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              ← Thoát
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-rose-600 font-bold animate-pulse text-sm">
                <Timer className="w-4 h-4" />
                <span>{blitzTime}s</span>
              </span>
              <span className="font-black text-rose-600 text-sm">Điểm: {blitzScore}</span>
            </div>
          </div>

          {!isBlitzFinished ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Nghĩa này Đúng hay Sai?</span>
                <span className="font-bold text-amber-500">Combo x{blitzCombo}</span>
              </div>

              <div className="py-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                  {blitzQuestion.korean}
                </h2>
                {blitzQuestion.pronunciation && (
                  <p className="text-xs text-slate-400 mt-1">{blitzQuestion.pronunciation}</p>
                )}
                <div className="mt-4 text-sm text-slate-500">có nghĩa là:</div>
                <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  "{blitzQuestion.displayedMeaning}"
                </h3>
              </div>

              {/* Big Binary Choices */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleBlitzChoice(false)}
                  className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-rose-600/25 transition cursor-pointer"
                >
                  SAI ❌
                </button>

                <button
                  onClick={() => handleBlitzChoice(true)}
                  className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  ĐÚNG ✅
                </button>
              </div>
            </div>
          ) : (
            /* Blitz finished */
            <div className="rounded-3xl bg-gradient-to-br from-rose-600 to-pink-700 text-white p-8 text-center space-y-4 shadow-xl">
              <span className="text-4xl">⏱️</span>
              <h3 className="text-xl font-black">Hết giờ!</h3>
              <div className="text-4xl font-black">{blitzScore} Điểm</div>
              <p className="text-xs text-rose-100">
                Thành tích phản xạ tiếng Hàn tốc độ cao đã được ghi vào bảng xếp hạng!
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={initBlitzGame}
                  className="px-5 py-2.5 rounded-2xl bg-white text-rose-700 text-xs font-bold shadow hover:bg-rose-50 transition cursor-pointer"
                >
                  Thử lại 60s
                </button>
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-5 py-2.5 rounded-2xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition cursor-pointer"
                >
                  Về menu trò chơi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};
