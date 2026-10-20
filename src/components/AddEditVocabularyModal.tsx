import React, { useState, useEffect } from 'react';
import { VocabularyItem, WordType, WordLevel } from '../types';
import { VOCABULARY_CATEGORIES } from '../data/categories';
import { storageService } from '../services/storage';
import { X, AlertCircle, Check } from 'lucide-react';

interface AddEditVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingItem?: VocabularyItem | null;
  defaultCategoryId?: number;
}

export const AddEditVocabularyModal: React.FC<AddEditVocabularyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingItem,
  defaultCategoryId = 1,
}) => {
  const [korean, setKorean] = useState('');
  const [vietnamese, setVietnamese] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [wordType, setWordType] = useState<WordType>('Danh từ');
  const [exampleKorean, setExampleKorean] = useState('');
  const [exampleVietnamese, setExampleVietnamese] = useState('');
  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId);
  const [level, setLevel] = useState<WordLevel>('Sơ cấp 1');
  const [note, setNote] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setKorean(editingItem.korean);
      setVietnamese(editingItem.vietnamese);
      setPronunciation(editingItem.pronunciation || '');
      setWordType(editingItem.wordType);
      setExampleKorean(editingItem.exampleKorean || '');
      setExampleVietnamese(editingItem.exampleVietnamese || '');
      setCategoryId(editingItem.categoryId);
      setLevel(editingItem.level);
      setNote(editingItem.note || '');
      setIsFavorite(editingItem.isFavorite);
      setIsLearned(editingItem.isLearned);
    } else {
      setKorean('');
      setVietnamese('');
      setPronunciation('');
      setWordType('Danh từ');
      setExampleKorean('');
      setExampleVietnamese('');
      setCategoryId(defaultCategoryId);
      setLevel('Sơ cấp 1');
      setNote('');
      setIsFavorite(false);
      setIsLearned(false);
    }
    setError(null);
  }, [editingItem, defaultCategoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedKorean = korean.trim();
    const trimmedVietnamese = vietnamese.trim();

    if (!trimmedKorean) {
      setError('Vui lòng nhập từ tiếng Hàn (Hangul).');
      return;
    }
    if (!trimmedVietnamese) {
      setError('Vui lòng nhập nghĩa tiếng Việt.');
      return;
    }

    if (editingItem) {
      const res = storageService.updateVocabulary(editingItem.id, {
        korean: trimmedKorean,
        vietnamese: trimmedVietnamese,
        pronunciation: pronunciation.trim(),
        wordType,
        exampleKorean: exampleKorean.trim(),
        exampleVietnamese: exampleVietnamese.trim(),
        categoryId,
        level,
        note: note.trim(),
        isFavorite,
        isLearned,
      });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || 'Cập nhật từ vựng thất bại.');
      }
    } else {
      const res = storageService.addVocabulary({
        korean: trimmedKorean,
        vietnamese: trimmedVietnamese,
        pronunciation: pronunciation.trim(),
        wordType,
        exampleKorean: exampleKorean.trim(),
        exampleVietnamese: exampleVietnamese.trim(),
        categoryId,
        level,
        note: note.trim(),
        isFavorite,
        isLearned,
      });

      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || 'Không thể lưu từ vựng.');
      }
    }
  };

  const wordTypes: WordType[] = [
    'Danh từ',
    'Động từ',
    'Tính từ',
    'Phó từ',
    'Trợ từ',
    'Đại từ',
    'Cụm từ',
    'Khác',
  ];

  const levels: WordLevel[] = ['Sơ cấp 1', 'Sơ cấp 2', 'Trung cấp', 'Nâng cao'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingItem ? 'Chỉnh sửa từ vựng' : '+ Thêm từ vựng mới'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingItem ? 'Cập nhật thông tin chi tiết của từ' : 'Lưu trữ bền vững vào cơ sở dữ liệu cá nhân'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Korean & Vietnamese */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Từ tiếng Hàn (Hangul) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={korean}
                onChange={(e) => setKorean(e.target.value)}
                placeholder="Ví dụ: 대학교"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nghĩa tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vietnamese}
                onChange={(e) => setVietnamese(e.target.value)}
                placeholder="Ví dụ: Trường đại học"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Row 2: Pronunciation & Word Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cách đọc / Phiên âm
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="[dae-hak-gyo] / te-hắc-ki-ô"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Loại từ
              </label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value as WordType)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {wordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Category & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chủ đề (15 danh mục)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {VOCABULARY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cấp độ
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as WordLevel)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Example sentence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ví dụ câu tiếng Hàn
            </label>
            <input
              type="text"
              value={exampleKorean}
              onChange={(e) => setExampleKorean(e.target.value)}
              placeholder="저는 하노이 대학교 학생입니다."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dịch nghĩa câu ví dụ
            </label>
            <input
              type="text"
              value={exampleVietnamese}
              onChange={(e) => setExampleVietnamese(e.target.value)}
              placeholder="Tôi là sinh viên trường Đại học Hà Nội."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Row 5: Personal Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú cá nhân (Nguồn gốc Hán-Hàn, mẹo nhớ...)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Gốc Hán: 大學校. Nhớ kèm từ: 대학생 (sinh viên)."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Row 6: Checkboxes */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Đánh dấu Yêu thích ⭐</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={isLearned}
                onChange={(e) => setIsLearned(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Đã thuộc từ này ✅</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingItem ? 'Lưu thay đổi' : 'Lưu từ vựng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
