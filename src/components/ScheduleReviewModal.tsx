import React, { useState, useEffect } from 'react';
import { VocabularyItem, VocabularyCategory } from '../types';
import { VOCABULARY_CATEGORIES } from '../data/categories';
import { storageService } from './../services/storage';
import { srsService } from './../services/spacedRepetition';
import { Calendar, Clock, Check, X, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  targetWord?: VocabularyItem | null;
  defaultCategoryId?: number;
}

export const ScheduleReviewModal: React.FC<ScheduleReviewModalProps> = ({
  isOpen,
  onClose,
  onScheduled,
  targetWord,
  defaultCategoryId = 1,
}) => {
  const [scheduleScope, setScheduleScope] = useState<'single' | 'batch'>(targetWord ? 'single' : 'batch');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    targetWord?.categoryId || defaultCategoryId
  );
  const [targetDate, setTargetDate] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const today = srsService.formatDate(new Date());

  useEffect(() => {
    if (targetWord) {
      setScheduleScope('single');
      setSelectedCategoryId(targetWord.categoryId);
      setTargetDate(targetWord.customScheduledDate || targetWord.nextReviewDate || today);
    } else {
      setScheduleScope('batch');
      setSelectedCategoryId(defaultCategoryId);
      setTargetDate(srsService.addDays(new Date(), 1));
    }
    setSuccessMsg(null);
  }, [targetWord, defaultCategoryId, isOpen]);

  if (!isOpen) return null;

  const handleApplyShortcut = (days: number) => {
    const nextDate = srsService.addDays(new Date(), days);
    setTargetDate(nextDate);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;

    if (scheduleScope === 'single' && targetWord) {
      storageService.scheduleWordReview(targetWord.id, targetDate);
      setSuccessMsg(`Đã đặt lịch ôn tập từ "${targetWord.korean}" vào ngày ${targetDate}!`);
    } else {
      const count = storageService.scheduleCategoryReview(selectedCategoryId, targetDate);
      const cat = VOCABULARY_CATEGORIES.find((c) => c.id === selectedCategoryId);
      setSuccessMsg(`Đã lên lịch ôn tập cho ${count} từ vựng thuộc chủ đề "${cat?.name}" vào ngày ${targetDate}!`);
    }

    onScheduled();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClearSchedule = () => {
    if (targetWord) {
      storageService.clearWordSchedule(targetWord.id);
      setSuccessMsg(`Đã khôi phục chu kỳ tự động của thuật toán SM-2!`);
      onScheduled();
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Tự đặt lịch ôn tập lặp lại ngắt quãng
              </h2>
              <p className="text-[11px] text-slate-500">
                Chủ động chọn ngày ôn cho từ hoặc cả nhóm từ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Scope Selector: Single Word vs Batch Category */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setScheduleScope('single')}
              className={`py-2 rounded-xl transition cursor-pointer ${
                scheduleScope === 'single'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Đặt lịch từng từ
            </button>

            <button
              type="button"
              onClick={() => setScheduleScope('batch')}
              className={`py-2 rounded-xl transition cursor-pointer ${
                scheduleScope === 'batch'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Đặt lịch theo chủ đề
            </button>
          </div>

          {/* Target Word Info if single */}
          {scheduleScope === 'single' && targetWord && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Từ vựng đang chọn:
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {targetWord.korean}
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {targetWord.vietnamese}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Giai đoạn hiện tại: Level {targetWord.srsStage || 0}/5</span>
                <span>
                  Lịch hiện tại: {targetWord.customScheduledDate || targetWord.nextReviewDate || 'Chưa lên lịch'}
                </span>
              </div>
            </div>
          )}

          {/* Category Selector if batch */}
          {scheduleScope === 'batch' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chọn nhóm chủ đề muốn lên lịch hàng loạt
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {VOCABULARY_CATEGORIES.filter((cat) => cat.id !== 15).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Date Shortcuts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phím tắt thời gian ôn tập
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyShortcut(0)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === today
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Hôm nay
              </button>

              <button
                type="button"
                onClick={() => handleApplyShortcut(1)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === srsService.addDays(new Date(), 1)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +1 ngày (Mai)
              </button>

              <button
                type="button"
                onClick={() => handleApplyShortcut(3)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === srsService.addDays(new Date(), 3)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +3 ngày
              </button>

              <button
                type="button"
                onClick={() => handleApplyShortcut(7)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === srsService.addDays(new Date(), 7)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +1 tuần
              </button>

              <button
                type="button"
                onClick={() => handleApplyShortcut(14)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === srsService.addDays(new Date(), 14)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +2 tuần
              </button>

              <button
                type="button"
                onClick={() => handleApplyShortcut(30)}
                className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                  targetDate === srsService.addDays(new Date(), 30)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                +1 tháng
              </button>
            </div>
          </div>

          {/* Exact Date Picker Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hoặc chọn ngày cụ thể
            </label>
            <input
              type="date"
              required
              min={today}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reset custom schedule button if single */}
          {scheduleScope === 'single' && targetWord?.customScheduledDate && (
            <button
              type="button"
              onClick={handleClearSchedule}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hủy lịch tự đặt (trở về tính toán SM-2 tự động)</span>
            </button>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              Lưu lịch ôn tập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
