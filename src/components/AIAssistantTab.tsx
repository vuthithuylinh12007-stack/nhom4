import React, { useState, useRef, useEffect } from 'react';
import { ttsService } from '../services/tts';
import { generateFlexibleAnswer } from '../services/flexibleEngine';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  Languages,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  contextMode?: string;
  correctedSentence?: string;
  translationText?: string;
  isError?: boolean;
}

export const AIAssistantTab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'focused' | 'correction' | 'grammar' | 'translation' | 'vocabulary'>('focused');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      role: 'model',
      text: `Xin chào! Tôi là **Gia sư HanGo AI** – Trợ lý tiếng Hàn thông minh và tận tâm của bạn.\n\nTôi sẵn sàng hỗ trợ bạn:\n• **✏️ Sửa mọi loại câu tiếng Hàn:** Chính tả, trợ từ (은/는, 이/가, 을/를, 에/에서...), chia động từ, kính ngữ và văn phong chuẩn bản ngữ theo **cấu trúc 9 phần chi tiết**.\n• **⚖️ Giải thích & So sánh ngữ pháp:** Phân tích cặn kẽ công thức patchim, ý nghĩa và ví dụ đối chiếu.\n• **🗣️ Dịch thuật 2 chiều Việt - Hàn:** Văn nói tự nhiên và kính ngữ công sở.\n• **📖 Tra cứu từ vựng:** Phân tích gốc Hán-Hàn và cách đặt câu thực tế.\n\nHãy nhập câu tiếng Hàn hoặc bất kỳ câu hỏi nào của bạn bên dưới!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts = [
    { label: '✏️ Sửa câu: 저가 친구에게 만났어요', query: 'Sửa câu này giúp tôi: "저가 어제 친구에게 만났어요"', mode: 'correction' as const },
    { label: '⚖️ Phân biệt: -아/어서 vs -(으)니까', query: 'Phân biệt sự khác nhau giữa ngữ pháp -아/어서 và -(으)니까', mode: 'grammar' as const },
    { label: '🔍 은/는 khác 이/가 thế nào?', query: 'Tại sao dùng 은/는 mà không dùng 이/가? Giải thích chi tiết giúp tôi', mode: 'grammar' as const },
    { label: '🗣️ Dịch câu rủ đi ăn thịt nướng', query: 'Dịch câu này sang tiếng Hàn tự nhiên: Cuối tuần này nếu rảnh thì chúng mình cùng đi ăn thịt nướng nhé', mode: 'translation' as const },
    { label: '📖 Gốc Hán từ vựng 대학교', query: 'Giải nghĩa từ vựng 대학교 và phân tích gốc Hán-Hàn, ví dụ câu', mode: 'vocabulary' as const },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea based on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputPrompt]);

  // Helper to extract corrected sentence and translation for quick-copy buttons
  const parseSpecialSections = (text: string) => {
    let corrected: string | undefined;
    let translation: string | undefined;

    const correctedMatch = text.match(/(?:Câu đã sửa|2\.\s*\*\*Câu đã sửa\*\*):\s*["'“]?([^"'\n\r]+)["'”]?/i);
    if (correctedMatch && correctedMatch[1]) {
      corrected = correctedMatch[1].trim();
    }

    const translationMatch = text.match(/(?:Dịch tiếng Việt|3\.\s*\*\*Dịch tiếng Việt\*\*):\s*["'“]?([^"'\n\r]+)["'”]?/i);
    if (translationMatch && translationMatch[1]) {
      translation = translationMatch[1].trim();
    }

    return { corrected, translation };
  };

  const handleSend = async (textToSend?: string, modeOverride?: typeof activeMode) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    const currentMode = modeOverride || activeMode;
    setLastFailedText(null);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      contextMode: currentMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          contextType: currentMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || '';
        const { corrected, translation } = parseSpecialSections(replyText);

        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          contextMode: currentMode,
          correctedSentence: corrected,
          translationText: translation,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback to local intelligent flexible engine
        const fallbackText = generateFlexibleAnswer(text, { contextType: currentMode });
        const { corrected, translation } = parseSpecialSections(fallbackText);

        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          role: 'model',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          contextMode: currentMode,
          correctedSentence: corrected,
          translationText: translation,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      // Local engine fallback on network disconnection
      const fallbackText = generateFlexibleAnswer(text, { contextType: currentMode });
      const { corrected, translation } = parseSpecialSections(fallbackText);

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        role: 'model',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        contextMode: currentMode,
        correctedSentence: corrected,
        translationText: translation,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text: string) => {
    // Extract Korean characters for TTS
    const koreanRegex = /[\u3131-\uD79D]+/g;
    const matches = text.match(koreanRegex);
    if (matches && matches.length > 0) {
      ttsService.speak(matches.slice(0, 8).join(' '));
    } else {
      ttsService.speak(text.slice(0, 60));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top AI status banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">Gia sư HanGo AI</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded-full border border-blue-500/20">
                ✨ Trợ lý thông minh
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Sửa mọi câu tiếng Hàn • Phân tích 9 phần • Trả lời đúng trọng tâm
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'rst_' + Date.now(),
                role: 'model',
                text: 'Đã làm mới cuộc hội thoại. Hãy gửi câu tiếng Hàn bạn muốn sửa hoặc bất kỳ câu hỏi nào để tôi giải đáp ngay nhé!',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Làm mới cuộc trò chuyện"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 text-xs">
        {[
          { id: 'focused', label: '🎯 Đúng trọng tâm', desc: 'Ngắn gọn, súc tích' },
          { id: 'correction', label: '✏️ Sửa lỗi câu', desc: 'Chuẩn 9 phần chi tiết' },
          { id: 'grammar', label: '⚖️ Ngữ pháp', desc: 'Cấu trúc & Đối chiếu' },
          { id: 'translation', label: '🗣️ Dịch thuật', desc: 'Việt ➔ Hàn & Hàn ➔ Việt' },
          { id: 'vocabulary', label: '📖 Từ vựng', desc: 'Gốc Hán & Ví dụ' },
        ].map((tab) => {
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 px-1 pr-1.5 scrollbar-none">
        {messages.map((msg) => {
          const isAI = msg.role === 'model';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                  한
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed transition ${
                  isAI
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-xs'
                    : 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/15'
                }`}
              >
                {/* Content formatted */}
                <div className="whitespace-pre-wrap font-sans break-words">{msg.text}</div>

                {/* Footer Controls for AI message */}
                {isAI && (
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Button: Speak Korean audio */}
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-600 flex items-center gap-1 transition"
                        title="Nghe phát âm tiếng Hàn"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Nghe</span>
                      </button>

                      {/* Button: Copy corrected sentence specifically */}
                      {msg.correctedSentence && (
                        <button
                          onClick={() => handleCopyText(msg.correctedSentence!, `${msg.id}_corr`)}
                          className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                          title="Sao chép câu đã sửa"
                        >
                          <FileCheck className="w-3 h-3" />
                          <span>
                            {copiedId === `${msg.id}_corr` ? 'Đã chép câu sửa' : 'Chép câu sửa'}
                          </span>
                        </button>
                      )}

                      {/* Button: Copy translation specifically */}
                      {msg.translationText && (
                        <button
                          onClick={() => handleCopyText(msg.translationText!, `${msg.id}_trans`)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                          title="Sao chép bản dịch"
                        >
                          <Languages className="w-3 h-3" />
                          <span>
                            {copiedId === `${msg.id}_trans` ? 'Đã chép bản dịch' : 'Chép bản dịch'}
                          </span>
                        </button>
                      )}

                      {/* Button: Copy entire explanation */}
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-600 flex items-center gap-1 transition"
                        title="Sao chép toàn bộ nội dung"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-2.5 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
              한
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs shadow-xs flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span>Gia sư HanGo đang phân tích và chuẩn bị câu trả lời...</span>
            </div>
          </div>
        )}

        {/* Retry Failed state if any */}
        {lastFailedText && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Gặp sự cố khi gửi tin nhắn.</span>
            </div>
            <button
              onClick={() => handleSend(lastFailedText)}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition"
            >
              Thử lại
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(qp.mode);
              handleSend(qp.query, qp.mode);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600 whitespace-nowrap transition cursor-pointer shadow-2xs active:scale-95"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Multiline Input Bar supporting questions, single sentences, and paragraphs */}
      <div className="relative flex items-end gap-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm focus-within:border-blue-500 transition">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu tiếng Hàn cần sửa, ngữ pháp hoặc câu hỏi (Enter để gửi, Shift+Enter xuống dòng)..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white resize-none max-h-40 min-h-[38px] leading-relaxed"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || loading}
          className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white transition shadow-sm cursor-pointer shrink-0 mb-0.5"
          title="Gửi câu hỏi cho Gia sư HanGo"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
