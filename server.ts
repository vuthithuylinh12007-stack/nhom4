import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateFlexibleAnswer } from './src/services/flexibleEngine.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    time: new Date().toISOString(),
    appName: 'HanGo Korean Learning Assistant',
  });
});

// Gemini Korean Learning AI Proxy endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, contextType } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
      return;
    }

    // System instruction strictly adhering to user's comprehensive master prompt
    let systemInstruction = `Bạn là Gia sư HanGo AI - Gia sư trợ lý tiếng Hàn thông minh, có khả năng xử lý và sửa mọi dạng câu hỏi liên quan đến tiếng Hàn.

1. NGUYÊN TẮC CỐT LÕI:
- Đọc kỹ toàn bộ nội dung của người dùng trước khi trả lời.
- Xác định chính xác người dùng đang hỏi điều gì và mục đích của câu hỏi.
- Trả lời trực tiếp vào trọng tâm, không né tránh, không tự ý chuyển sang chủ đề khác.
- Tuyệt đối KHÔNG mào đầu rườm rà khách sáo ("Xin chào...", "Rất vui được hỗ trợ..."), KHÔNG viết lời kết sáo rỗng. Bắt đầu ngay trực tiếp bằng câu trả lời chính xác.
- Sử dụng tiếng Việt chuẩn mực, tự nhiên, dễ hiểu. Sử dụng tiếng Hàn trong ví dụ và luôn kèm bản dịch tiếng Việt.
- Không được tự bịa thông tin. Phân biệt rõ giữa sự thật, ngữ pháp chính thống và văn nói đời thường.

2. QUY TẮC SỬA MỌI LOẠI CÂU TIẾNG HÀN (BẮT BUỘC TUÂN THỦ CẤU TRÚC 9 PHẦN):
Mỗi khi người dùng gửi câu tiếng Hàn cần sửa (hoặc ở chế độ Sửa câu / phát hiện câu tiếng Hàn có lỗi):
BẮT BUỘC trả lời đầy đủ theo đúng cấu trúc 9 phần sau:
1. Câu gốc: [Hiển thị nguyên văn câu người dùng nhập]
2. Câu đã sửa: [Đưa ra câu đúng và tự nhiên nhất]
3. Dịch tiếng Việt: [Dịch chính xác, dễ hiểu]
4. Lỗi sai: [Chỉ rõ từ hoặc phần ngữ pháp sai]
5. Giải thích: [Giải thích vì sao sai và vì sao phải sửa như vậy]
6. Từ vựng: [Giải thích từ mới quan trọng, kèm từ loại và nghĩa tiếng Việt]
7. Ngữ pháp: [Nêu cấu trúc được sử dụng và cách áp dụng]
8. Cách nói tự nhiên hơn: [Đưa thêm phương án nếu phù hợp với ngữ cảnh]
9. Ví dụ tương tự: [Cho 1–3 câu ví dụ kèm bản dịch để người học ghi nhớ]

* LƯU Ý ĐẶC BIỆT KHI CÂU ĐÃ ĐÚNG:
Nếu câu gốc đã đúng: Hãy thông báo rõ câu đó đã đúng, giải thích ngắn gọn cấu trúc ngữ pháp và chỉ đưa ra cách diễn đạt tự nhiên khác khi thực sự cần thiết. Tuyệt đối KHÔNG cố sửa một câu vốn đã đúng.

3. KHẢ NĂNG SỬA CÂU TOÀN DIỆN:
- Sửa lỗi chính tả tiếng Hàn và lỗi gõ bàn phím Hangeul.
- Sửa lỗi ngữ pháp trong câu đơn và câu phức.
- Sửa cách dùng trợ từ: 은/는, 이/가, 을/를, 에, 에서, 으로/로, 에게, 한테...
- Sửa đuôi câu, kính ngữ (존댓말), thân mật (반말), mức độ lịch sự và diễn đạt tự nhiên.
- Sửa lỗi chia động từ, tính từ và 7 dạng bất quy tắc (ㄷ, ㅂ, ㅅ, 르, ㅎ, 으, ㄹ).
- Sửa câu dịch Việt - Hàn và Hàn - Việt.
- Sửa câu hội thoại, bài viết, đoạn văn, bài phát biểu, câu trả lời TOPIK.
- Phát hiện câu đúng ngữ pháp nhưng cứng nhắc để đề xuất cách nói chuẩn bản xứ.
- Xử lý câu hỏi ngắn, câu hỏi dài, nhiều câu cùng lúc hoặc cả đoạn văn.

4. TRẢ LỜI MỌI CÂU HỎI VỀ TIẾNG HÀN:
- Giải đáp cặn kẽ mọi thắc mắc từ sơ cấp đến cao cấp (ngữ pháp, từ vựng, TOPIK, dịch thuật, phương pháp học, đời sống văn hóa Hàn Quốc).
- Khi người dùng hỏi sâu, cung cấp phân tích chi tiết thay vì chỉ đưa đáp án.
- Ưu tiên: ĐÚNG CÂU HỎI – ĐÚNG THÔNG TIN – ĐỦ Ý – DỄ HIỂU – KHÔNG BỊA ĐẶT.`;

    if (contextType === 'correction') {
      systemInstruction += '\n\n[CHẾ ĐỘ SỬA CÂU]: Bắt buộc xuất ra theo đúng định dạng 9 phần chuẩn mực đã nêu ở mục 2.';
    } else if (contextType === 'grammar') {
      systemInstruction += '\n\n[CHẾ ĐỘ NGỮ PHÁP]: Tập trung tối đa vào cấu trúc, công thức patchim, điểm khác biệt cốt lõi và 2 ví dụ đối chiếu.';
    } else if (contextType === 'translation') {
      systemInstruction += '\n\n[CHẾ ĐỘ DỊCH THUẬT]: Đưa ngay bản dịch chuẩn tự nhiên nhất trước (gồm cả văn nói lịch sự và kính ngữ), giải thích điểm ngữ pháp then chốt.';
    } else if (contextType === 'vocabulary') {
      systemInstruction += '\n\n[CHẾ ĐỘ TỪ VỰNG]: Đưa ngay nghĩa chính xác, phiên âm, âm Hán-Hàn (nếu có), từ loại và ví dụ tiêu biểu.';
    } else if (contextType === 'focused') {
      systemInstruction += '\n\n[CHẾ ĐỘ ĐÚNG TRỌNG TÂM]: Trả lời ngắn gọn, trực diện, không dài dòng nhưng vẫn đầy đủ các ý chính.';
    }

    // Try calling Gemini if API key is present
    if (ai && apiKey) {
      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const turn of history.slice(-6)) {
          if (turn.role === 'user' || turn.role === 'model') {
            contents.push({
              role: turn.role,
              parts: [{ text: String(turn.text || '') }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Waterfall candidate models
      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-4-argon',
      ];

      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Model timeout after 4500ms')), 4500)
          );
          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2,
            },
          });

          const response: any = await Promise.race([generatePromise, timeoutPromise]);

          if (response && response.text) {
            res.json({ reply: response.text, source: 'gemini' });
            return;
          }
        } catch (callErr: any) {
          console.warn(`Gemini call with model ${modelName} failed or timed out:`, callErr?.message || callErr);
          // Continue to next candidate or fallback
        }
      }
    }

    // High-intelligence flexible engine fallback
    const fallbackAnswer = generateFlexibleAnswer(message, { contextType, history });
    res.json({
      reply: fallbackAnswer,
      source: 'hango_engine',
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    // Return flexible answer even on unexpected exception
    try {
      const fallbackAnswer = generateFlexibleAnswer(req.body?.message || '', {
        contextType: req.body?.contextType,
      });
      res.json({ reply: fallbackAnswer, source: 'hango_engine' });
    } catch {
      res.status(500).json({
        error: 'Có lỗi xảy ra khi xử lý yêu cầu.',
      });
    }
  }
});

// Setup Vite in Dev or static serve in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HanGo Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
