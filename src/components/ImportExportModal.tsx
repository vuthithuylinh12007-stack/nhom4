import React, { useState } from 'react';
import { VOCABULARY_CATEGORIES } from '../data/categories';
import { storageService } from '../services/storage';
import { VocabularyItem } from '../types';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Export states
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import states
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [previewResult, setPreviewResult] = useState<{
    validItems: VocabularyItem[];
    duplicateCount: number;
    invalidCount: number;
    errors: string[];
  } | null>(null);
  const [fileName, setFileName] = useState('');
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAllCategories = () => {
    if (selectedCategoryIds.length === VOCABULARY_CATEGORIES.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(VOCABULARY_CATEGORIES.map((c) => c.id));
    }
  };

  const toggleCategorySelection = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    try {
      storageService.exportData(
        exportFormat,
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e: any) {
      alert('Xuất dữ liệu thất bại: ' + e.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const format = file.name.endsWith('.csv') ? 'csv' : 'json';
    setImportFormat(format);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const preview = storageService.previewImportData(content, format);
      setPreviewResult(preview);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.validItems.length === 0) return;

    const count = storageService.executeImport(previewResult.validItems, overwriteDuplicates);
    setImportStatus(`Đã nhập thành công ${count} từ vựng vào kho dữ liệu!`);
    onImportComplete();
    setTimeout(() => {
      setImportStatus(null);
      setPreviewResult(null);
      setFileName('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Nhập & Xuất từ vựng (CSV / JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Xuất dữ liệu (Export)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Nhập dữ liệu (Import)</span>
          </button>
        </div>

        {/* Tab 1: Export */}
        {activeTab === 'export' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {exportSuccess && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tệp đã được tải xuống máy thành công!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Định dạng xuất
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition cursor-pointer ${
                    exportFormat === 'csv'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-sm font-bold">CSV (.csv)</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Hỗ trợ Excel (UTF-8 BOM Tiếng Hàn & Việt)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition cursor-pointer ${
                    exportFormat === 'json'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-sm font-bold">JSON (.json)</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Sao lưu sao chép chuẩn đầy đủ thuộc tính
                  </span>
                </button>
              </div>
            </div>

            {/* Select Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chọn chủ đề muốn xuất ({selectedCategoryIds.length === 0 ? 'Tất cả 15 chủ đề' : `${selectedCategoryIds.length} chủ đề đã chọn`})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  {selectedCategoryIds.length === VOCABULARY_CATEGORIES.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-2xl">
                {VOCABULARY_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategorySelection(cat.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">
                        {cat.icon} {cat.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-3 px-4 font-bold text-white shadow-lg shadow-blue-600/25 cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp xuất về máy ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import */}
        {activeTab === 'import' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {importStatus && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* File Picker */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Chọn tệp CSV hoặc JSON từ thiết bị
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Tệp phải có ít nhất cột: Tiếng Hàn, Nghĩa tiếng Việt
              </p>

              <label className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow cursor-pointer transition">
                <span>Chọn tệp trên máy</span>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {fileName && (
                <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  📁 {fileName}
                </p>
              )}
            </div>

            {/* Preview Section */}
            {previewResult && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bản xem trước dữ liệu nhập
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    <div className="text-lg">{previewResult.validItems.length}</div>
                    <div className="text-[10px]">Hợp lệ</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                    <div className="text-lg">{previewResult.duplicateCount}</div>
                    <div className="text-[10px]">Bị trùng</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                    <div className="text-lg">{previewResult.invalidCount}</div>
                    <div className="text-[10px]">Lỗi dòng</div>
                  </div>
                </div>

                {/* Duplicates resolution policy */}
                {previewResult.duplicateCount > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Xử lý từ bị trùng lặp:
                    </label>
                    <div className="space-y-1.5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dupPolicy"
                          checked={!overwriteDuplicates}
                          onChange={() => setOverwriteDuplicates(false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Bỏ qua các từ đã tồn tại (Giữ nguyên từ cũ)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dupPolicy"
                          checked={overwriteDuplicates}
                          onChange={() => setOverwriteDuplicates(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Ghi đè / Cập nhật theo dữ liệu mới nhập</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Error log details */}
                {previewResult.errors.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Chi tiết các dòng không hợp lệ:</span>
                    </div>
                    <ul className="text-[11px] text-rose-600/90 list-disc pl-4 max-h-20 overflow-y-auto space-y-0.5">
                      {previewResult.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {previewResult.errors.length > 5 && (
                        <li>và {previewResult.errors.length - 5} lỗi khác...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Confirm import button */}
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={previewResult.validItems.length === 0}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition py-2.5 px-4 font-bold text-white shadow-lg shadow-emerald-600/25 cursor-pointer text-xs disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận nhập {previewResult.validItems.length} từ vào ứng dụng</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
