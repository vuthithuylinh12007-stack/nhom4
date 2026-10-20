import React from 'react';
import { VocabularyItem } from '../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  item: VocabularyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Xác nhận xóa từ vựng?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Bạn có chắc chắn muốn xóa từ{' '}
          <strong className="text-slate-900 dark:text-white font-bold">"{item.korean}"</strong> (
          {item.vietnamese}) khỏi danh sách học tập không? Thao tác này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition cursor-pointer"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
};
