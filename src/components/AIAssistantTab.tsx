import React, { useState, useRef, useEffect } from 'react';
import { ttsService } from '../services/tts';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

// Built-in offline demo responses if API key isn't set or offline (Đúng trọng tâm, súc tích)
const DEMO_RESPONSES: Record<string, string> = {
  'từ vựng': `**대학교** [dae-hak-gyo] : Trường đại học

• **Gốc Hán-Hàn:** 大學校 (Đại học hiệu: Cơ sở giáo dục bậc cao)
  - 大 (Đại: to lớn) | 學 (Học: học tập) | 校 (Hiệu: trường học)
• **Cụm từ thông dụng:**
  - 대학생: Sinh viên đại học
  - 대학교수: Giáo sư đại học
• **Ví dụ thực tế:**
  - 저는 하노이 대학교에서 한국어를 전공하고 있습니다.
  *(Tôi đang học chuyên ngành tiếng Hàn tại Đại học Hà Nội.)*`,

  'ngữ pháp': `**Phân biệt: -아/어서 vs -(으)니까 (Vì... nên...)**

• **Khác biệt cốt lõi:**
  - **-아/어서:** Lý do tự nhiên/khách quan. **Tuyệt đối KHÔNG** đi cùng mệnh lệnh -(으)세요 hay rủ rê -(으)ㅂ시다. Thường dùng trong lời xin lỗi, cảm ơn.
  - **-(으)니까:** Lý do chủ quan/nhấn mạnh căn cứ. **Thoải mái đi cùng** câu mệnh lệnh, rủ rê, khuyên nhủ.

• **Ví dụ so sánh đối chiếu:**
  - ❌ *Sai:* 늦으니까 죄송합니다.
  - ✅ *Đúng:* 늦어서 죄송합니다. *(Xin lỗi vì tôi đến muộn)*
  - ✅ *Đúng:* 날씨가 추우니까 따뜻하게 입으세요. *(Vì trời lạnh nên hãy mặc ấm vào nhé)*`,

  'sửa câu': `**Sửa câu tiếng Hàn:**

• **Câu sửa chuẩn:** "제가 어제 친구를 만났어요." (hoặc "친구하고 만났어요.")
• **Chỉ rõ lỗi sai:**
  1. **저가 ➔ 제가:** Đại từ "저" khi gắn với trợ từ chủ ngữ "가" bắt buộc biến đổi thành "제가".
  2. **친구에게 ➔ 친구를:** Động từ "만나다" (gặp gỡ) là ngoại động từ chỉ đối tượng tiếp nhận hành động, cần trợ từ tân ngữ "를" (hoặc liên từ "하고" cùng với). "에게" chỉ dùng cho đối tượng nhận hướng đến như "전화하다" (gọi điện).`,

  'dịch': `**Bản dịch chuẩn Việt - Hàn:**

• **Thân mật, lịch sự:** 
  "이번 주말에 시간 있으면 우리 같이 삼겹살 먹으러 가요!"
• **Trang trọng, kính ngữ:** 
  "이번 주말에 시간이 있으시면 함께 삼겹살을 드시러 가시겠습니까?"

• **Điểm ngữ pháp then chốt:**
  - -(으)면: Giả định "Nếu có thời gian"
  - -(으)러 가다: Cấu trúc mục đích "Đi để làm gì"`,

  'hội thoại': `**Hội thoại nhanh tại quán cà phê Seoul:**

• **Barista:** 어서 오세요! 주문하시겠어요? *(Xin chào quý khách! Quý khách dùng gì ạ?)*
• **Khách:** 아이스 아메리카노 한 잔이랑 따뜻한 라떼 한 잔 주세요. *(Cho tôi 1 Americano đá và 1 Latte nóng nhé.)*
• **Barista:** 매장에서 드시고 가시나요? *(Quý khách dùng tại quán hay mang đi ạ?)*
• **Khách:** 마시고 갈게요. 영수증도 챙겨 주세요! *(Tôi uống tại quán. Cho tôi xin cả hóa đơn nhé!)*`,
};

export const AIAssistantTab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'focused' | 'grammar' | 'correction' | 'translation' | 'vocabulary'>('focused');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'model',
      text: `Xin chào! Tôi là **HanGo AI** – Trợ lý gia sư tiếng Hàn.\n\n🎯 **Chế độ kích hoạt:** Trả lời đúng trọng tâm, ngắn gọn, súc tích và giải quyết trực diện câu hỏi của bạn.\n\nBạn có thể hỏi từ vựng, ngữ pháp, nhờ sửa câu hoặc dịch văn phong ngay bên dưới!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '📖 Từ vựng 대학교', query: 'Giải nghĩa từ vựng 대학교 và phân tích gốc Hán-Hàn, ví dụ câu', mode: 'vocabulary' as const },
    { label: '⚖️ -아/어서 vs -(으)니까', query: 'Phân biệt sự khác nhau giữa ngữ pháp -아/어서 và -(으)니까', mode: 'grammar' as const },
    { label: '✏️ Sửa câu: 저가 친구에게 만났어요', query: 'Hãy sửa câu tiếng Hàn sau và giải thích lỗi: "저가 어제 친구에게 만났어요"', mode: 'correction' as const },
    { label: '🗣️ Dịch câu rủ ăn thịt nướng', query: 'Dịch câu này sang tiếng Hàn tự nhiên: Cuối tuần này nếu rảnh thì chúng mình cùng đi ăn thịt nướng nhé', mode: 'translation' as const },
    { label: '☕ Hội thoại quán Cafe', query: 'Tạo đoạn hội thoại tiếng Hàn mẫu khi đi gọi đồ uống tại quán cà phê Seoul', mode: 'focused' as const },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string, modeOverride?: typeof activeMode) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    const currentMode = modeOverride || activeMode;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Call server-side Gemini API proxy with contextType
      const historyPayload = messages.slice(-4).map((m) => ({
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
        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback: Smart concise direct answers
        const lower = text.toLowerCase();
        let fallbackKey = 'từ vựng';
        if (lower.includes('ngữ pháp') || lower.includes('니까') || lower.includes('어서')) {
          fallbackKey = 'ngữ pháp';
        } else if (lower.includes('sửa') || lower.includes('lỗi')) {
          fallbackKey = 'sửa câu';
        } else if (lower.includes('dịch') || lower.includes('thịt nướng')) {
          fallbackKey = 'dịch';
        } else if (lower.includes('hội thoại') || lower.includes('cafe') || lower.includes('cà phê')) {
          fallbackKey = 'hội thoại';
        }

        const fallbackContent =
          DEMO_RESPONSES[fallbackKey] ||
          `**Giải đáp trọng tâm cho câu hỏi:** "${text}"\n\n` +
          `• **Trọng tâm tiếng Hàn:** Trật tự chuẩn là **Chủ ngữ (S) + Tân ngữ (O) + Động từ (V)**.\n` +
          `• **Lưu ý cốt lõi:** Xác định patchim cuối của danh từ để gắn trợ từ chuẩn xác (은/는, 이/가, 을/를). Đuôi câu lịch sự phổ biến nhất là -아/어요.`;

        const aiMsg: ChatMessage = {
          id: 'ai_' + Date.now(),
          role: 'model',
          text: fallbackContent,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      // Offline fallback
      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        role: 'model',
        text: `Hiện đang ở chế độ ngoại tuyến. Bạn có thể tra cứu nhanh ngữ pháp và từ vựng trong kho học tập hoặc kiểm tra lại kết nối mạng.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text: string) => {
    // Extract Korean characters for TTS
    const koreanRegex = /[\u3131-\uD79D]+/g;
    const matches = text.match(koreanRegex);
    if (matches && matches.length > 0) {
      ttsService.speak(matches.slice(0, 5).join(' '));
    } else {
      ttsService.speak(text.slice(0, 50));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top AI status banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">Gia sư HanGo AI</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                🎯 Đúng trọng tâm
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Phản hồi súc tích, đi thẳng vào vấn đề</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'rst_' + Date.now(),
                role: 'model',
                text: 'Đã làm mới cuộc trò chuyện. HanGo AI luôn sẵn sàng trả lời trực diện câu hỏi của bạn!',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 text-xs">
        {[
          { id: 'focused', label: '🎯 Đúng trọng tâm' },
          { id: 'correction', label: '✏️ Sửa lỗi câu' },
          { id: 'grammar', label: '⚖️ Ngữ pháp' },
          { id: 'translation', label: '🗣️ Dịch thuật' },
          { id: 'vocabulary', label: '📖 Từ vựng' },
        ].map((tab) => {
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as any)}
              className={`px-2.5 py-1 rounded-xl font-medium text-[11px] whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2 scrollbar-none">
        {messages.map((msg) => {
          const isAI = msg.role === 'model';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
                  한
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed transition ${
                  isAI
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-xs'
                    : 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/15'
                }`}
              >
                {/* Content formatted */}
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Footer Controls for AI message */}
                {isAI && (
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2.5 pt-2 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="hover:text-blue-600 flex items-center gap-0.5 transition"
                        title="Nghe câu tiếng Hàn trong đoạn văn"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Nghe</span>
                      </button>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-blue-600 flex items-center gap-0.5 transition"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Đã sao chép</span>
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
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
              한
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs shadow-xs flex items-center gap-2 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Gia sư HanGo đang suy nghĩ câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(qp.mode);
              handleSend(qp.query, qp.mode);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600 whitespace-nowrap transition cursor-pointer shadow-2xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Hỏi từ vựng, ngữ pháp, nhờ sửa câu tiếng Hàn..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white transition shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
