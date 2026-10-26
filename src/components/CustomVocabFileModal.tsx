import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import { storageService } from '../services/storage';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomVocabFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAndStartFlashcard: (importedItems: VocabularyItem[]) => void;
}

export const CustomVocabFileModal: React.FC<CustomVocabFileModalProps> = ({
  isOpen,
  onClose,
  onImportAndStartFlashcard,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [parsedWords, setParsedWords] = useState<VocabularyItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Flexible parser for raw lines or file content
  const parseRawText = (content: string, name = 'custom_list'): VocabularyItem[] => {
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const results: VocabularyItem[] = [];

    // Try parsing as JSON first
    if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
      try {
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          return json
            .filter((item) => item.korean && item.vietnamese)
            .map((item, idx) => ({
              id: 'file_' + Date.now() + '_' + idx,
              korean: String(item.korean).trim(),
              vietnamese: String(item.vietnamese).trim(),
              pronunciation: item.pronunciation ? String(item.pronunciation).trim() : '',
              wordType: (item.wordType || 'Danh từ') as any,
              exampleKorean: item.exampleKorean || '',
              exampleVietnamese: item.exampleVietnamese || '',
              categoryId: 16, // Custom category
              level: (item.level || 'Sơ cấp 1') as any,
              isFavorite: false,
              isLearned: false,
              isCustom: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
        }
      } catch {
        // Not JSON, continue to delimiter parsing
      }
    }

    // Line-by-line delimiter parsing (comma, tab, dash, colon, slash)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments or csv headers like "korean,vietnamese"
      if (line.startsWith('#') || line.startsWith('//')) continue;
      if (i === 0 && (line.toLowerCase().includes('korean') || line.toLowerCase().includes('tiếng hàn'))) {
        continue;
      }

      // Delimiter detection: Tab, comma, dash with spaces, colon, semicolon
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(' - ')) {
        parts = line.split(' - ');
      } else if (line.includes(' : ')) {
        parts = line.split(' : ');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes('-')) {
        parts = line.split('-');
      } else if (line.includes(':')) {
        parts = line.split(':');
      }

      parts = parts.map((p) => p.replace(/^["']|["']$/g, '').trim()).filter(Boolean);

      if (parts.length >= 2) {
        const korean = parts[0];
        const vietnamese = parts[1];
        const pronunciation = parts[2] || '';

        results.push({
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          korean,
          vietnamese,
          pronunciation,
          wordType: 'Danh từ',
          exampleKorean: '',
          exampleVietnamese: '',
          categoryId: 16,
          level: 'Sơ cấp 1',
          isFavorite: false,
          isLearned: false,
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return results;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const words = parseRawText(content, file.name);
        if (words.length === 0) {
          setParseError('Không tìm thấy từ vựng hợp lệ. Hãy kiểm tra định dạng tệp (Ví dụ: Từ tiếng Hàn - Nghĩa tiếng Việt).');
          setParsedWords([]);
        } else {
          setParsedWords(words);
        }
      } catch (err: any) {
        setParseError('Lỗi khi đọc tệp: ' + err.message);
        setParsedWords([]);
      }
    };
    reader.readAsText(file);
  };

  const handleParsePasted = () => {
    if (!pastedText.trim()) return;
    setParseError(null);
    const words = parseRawText(pastedText, 'pasted_text');
    if (words.length === 0) {
      setParseError('Không phân tích được từ nào. Vui lòng nhập mỗi dòng gồm: Từ tiếng Hàn - Nghĩa tiếng Việt.');
      setParsedWords([]);
    } else {
      setParsedWords(words);
    }
  };

  const handleConfirmAndStartFlashcard = () => {
    if (parsedWords.length === 0) return;

    // Save to storage
    storageService.executeImport(parsedWords, false);

    // Trigger celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onImportAndStartFlashcard(parsedWords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-6 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Thêm tệp tạo danh sách Flashcard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập danh sách từ vựng riêng để học Flashcard ngay lập tức
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 px-5 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải lên tệp (.txt, .csv, .json)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dán văn bản trực tiếp</span>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'upload' ? (
            <div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/20">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {fileName ? fileName : 'Bấm để chọn tệp từ máy tính / điện thoại'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Hỗ trợ định dạng .txt, .csv, .tsv, .json
                </span>
                <input
                  type="file"
                  accept=".txt,.csv,.json,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Format Hint */}
              <div className="mt-3 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-bold text-blue-700 dark:text-blue-300">Định dạng mẫu trong tệp:</span>
                <p className="mt-1 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                  안녕하세요 - Xin chào - an-nyeong-ha-se-yo<br />
                  감사합니다 - Cảm ơn - kam-sa-ham-ni-da<br />
                  학교 - Trường học
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Dán danh sách từ của bạn vào đây (mỗi dòng một từ, phân tách bằng dấu gạch ngang "-", dấu phẩy hoặc hai chấm):
              </p>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="학교 - Trường học&#10;선생님 - Thầy cô giáo&#10;학생 - Học sinh&#10;공부하다 - Học tập"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleParsePasted}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Nhận diện danh sách từ
              </button>
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview of Parsed Words */}
          {parsedWords.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/80 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã nhận diện thành công {parsedWords.length} từ vựng
                </span>
                <span className="text-[10px] text-slate-400">Xem trước 5 từ đầu</span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden text-xs">
                {parsedWords.slice(0, 5).map((w, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{w.korean}</span>
                      {w.pronunciation && (
                        <span className="text-[10px] text-slate-400 ml-1.5">[{w.pronunciation}]</span>
                      )}
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{w.vietnamese}</span>
                  </div>
                ))}
                {parsedWords.length > 5 && (
                  <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                    ...và {parsedWords.length - 5} từ vựng khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={parsedWords.length === 0}
            onClick={handleConfirmAndStartFlashcard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Thêm & Học Flashcard ngay ({parsedWords.length} từ)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
