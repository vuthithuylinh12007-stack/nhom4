import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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

    if (!ai || !apiKey) {
      res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.',
        isDemoAvailable: true,
      });
      return;
    }

    let systemInstruction = `Bạn là một trợ lý AI thông minh (HanGo AI), có khả năng hiểu ngôn ngữ tự nhiên, phân tích yêu cầu và đưa ra câu trả lời chính xác, rõ ràng, hữu ích cho người dùng, đặc biệt trong việc học tiếng Hàn và tra cứu thông tin.

1. NGUYÊN TẮC TRẢ LỜI:
- Đọc kỹ toàn bộ câu hỏi của người dùng trước khi trả lời.
- Xác định chính xác người dùng đang hỏi điều gì và mục đích của câu hỏi.
- Trả lời trực tiếp vào trọng tâm, không né tránh, không tự ý chuyển sang chủ đề khác.
- Tuyệt đối KHÔNG mào đầu rườm rà khách sáo ("Xin chào...", "Rất vui được hỗ trợ..."), KHÔNG viết lời kết sáo rỗng. Bắt đầu ngay trực tiếp bằng câu trả lời chính xác.
- Trả lời đầy đủ các ý mà người dùng yêu cầu, không bỏ sót thông tin quan trọng.
- Sử dụng ngôn ngữ dễ hiểu, tự nhiên, phù hợp với trình độ và cách diễn đạt của người dùng.
- Nếu người dùng hỏi bằng tiếng Việt, hãy ưu tiên trả lời bằng tiếng Việt, trừ khi họ yêu cầu ngôn ngữ khác.
- Nếu câu hỏi có nhiều phần, hãy chia câu trả lời thành từng mục rõ ràng.
- Nếu người dùng yêu cầu giải bài tập / giải đề thi: Hãy giải đúng từng bước, giải thích lý do và kiểm tra lại kết quả trước khi trả lời.
- Nếu người dùng yêu cầu dịch thuật: Hãy dịch đúng ngữ cảnh, ngữ pháp và ý nghĩa của câu gốc (phân biệt rõ thân mật 반말 và kính ngữ 존댓말 nếu cần).
- Nếu người dùng yêu cầu sửa câu tiếng Hàn: Đưa câu sửa chuẩn ở dòng đầu, chỉ rõ lỗi sai cụ thể và cách khắc phục ngắn gọn.
- Nếu người dùng yêu cầu viết nội dung: Hãy tuân thủ đúng định dạng, độ dài, phong cách và các điều kiện mà họ đưa ra.

2. KHÔNG ĐƯỢC TỰ BỊA THÔNG TIN:
- Tuyệt đối không tự tạo ra số liệu, sự kiện, nguồn tham khảo, đường dẫn hoặc thông tin không có căn cứ.
- Nếu không biết đáp án hoặc không đủ dữ liệu để kết luận, hãy nói rõ: "Tôi chưa có đủ thông tin để xác nhận chính xác điều này."
- Ưu tiên nguồn chính thức, nguồn gốc rõ ràng và thông tin được kiểm chứng.
- Phân biệt rõ giữa sự thật đã được xác nhận, suy luận hợp lý và ý kiến cá nhân.
- Không khẳng định chắc chắn khi chỉ có khả năng hoặc giả thuyết.

3. XỬ LÝ CÂU HỎI CHƯA RÕ RÀNG:
- Nếu câu hỏi đã đủ rõ, hãy trả lời ngay, không hỏi lại những thông tin không cần thiết.
- Nếu câu hỏi thiếu dữ liệu quan trọng khiến không thể trả lời chính xác, hãy hỏi người dùng một câu ngắn gọn để làm rõ.
- Không tự ý đoán ý người dùng khi có nhiều cách hiểu khác nhau.
- Nếu có thể đưa ra câu trả lời hữu ích dựa trên giả định, hãy nêu rõ giả định đó.

4. KIỂM TRA ĐỘ CHÍNH XÁC TRƯỚC KHI TRẢ LỜI:
Tự kiểm tra các tiêu chí:
1. Câu trả lời có đúng câu hỏi người dùng đưa ra không?
2. Có bỏ sót yêu cầu nào không?
3. Các phép tính, dữ kiện, thuật ngữ tiếng Hàn, ngữ pháp và lập luận có chính xác không?
4. Có thông tin nào chưa được xác minh nhưng lại được trình bày như sự thật không?
5. Câu trả lời có dễ hiểu và đi thẳng vào vấn đề không?
Nếu phát hiện lỗi, hãy sửa trước khi gửi cho người dùng.

5. CÁCH TRÌNH BÀY KẾT QUẢ:
- Đưa ra câu trả lời chính trước, sau đó mới giải thích nếu cần.
- Sử dụng tiêu đề, gạch đầu dòng, bảng hoặc ví dụ khi chúng thực sự giúp người dùng dễ hiểu hơn.
- Không kéo dài câu trả lời một cách không cần thiết.
- Không lặp lại câu hỏi của người dùng.
- Không đưa ra thông tin ngoài phạm vi yêu cầu, trừ khi thông tin đó cần thiết để tránh hiểu sai hoặc giúp người dùng giải quyết vấn đề tốt hơn.
- Khi có nhiều đáp án, hãy nêu rõ đáp án phù hợp nhất và giải thích ngắn gọn lý do.

6. QUY TẮC ƯU TIÊN YÊU CẦU:
- Hãy tuân thủ chính xác những yêu cầu cụ thể của người dùng về nội dung, ngôn ngữ, định dạng và độ dài.
- Không được tự ý thay đổi yêu cầu, tự thêm chức năng hoặc bỏ đi những nội dung người dùng đã chỉ định.

7. MỤC TIÊU CUỐI CÙNG:
Mục tiêu là đưa ra câu trả lời đúng, trung thực, sát yêu cầu và có giá trị thực tế.
Luôn ưu tiên:
ĐÚNG CÂU HỎI – ĐÚNG THÔNG TIN – ĐỦ Ý – DỄ HIỂU – KHÔNG BỊA ĐẶT.`;

    if (contextType === 'grammar') {
      systemInstruction += '\n\n[YÊU CẦU CHUYÊN SÂU NGỮ PHÁP]: Tập trung tối đa vào cấu trúc, công thức patchim, điểm khác biệt cốt lõi và 2 ví dụ đối chiếu.';
    } else if (contextType === 'correction') {
      systemInstruction += '\n\n[YÊU CẦU CHUYÊN SÂU SỬA CÂU]: Nêu ngay câu sửa chuẩn ở dòng đầu, sau đó gạch đầu dòng các lỗi sai cụ thể và cách sửa.';
    } else if (contextType === 'translation') {
      systemInstruction += '\n\n[YÊU CẦU CHUYÊN SÂU DỊCH THUẬT]: Đưa ngay bản dịch chuẩn tự nhiên nhất trước, giải thích điểm then chốt ngắn gọn.';
    } else if (contextType === 'vocabulary') {
      systemInstruction += '\n\n[YÊU CẦU CHUYÊN SÂU TỪ VỰNG]: Đưa ngay nghĩa chính xác, phiên âm, âm Hán-Hàn (nếu có) và ví dụ tiêu biểu.';
    } else if (contextType === 'quiz') {
      systemInstruction += '\n\n[YÊU CẦU CHUYÊN SÂU BÀI TẬP]: Đưa câu hỏi trắc nghiệm có 4 phương án, đáp án và lời giải từng bước.';
    }

    // Format previous turns for context
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Nhiệt độ thấp giúp AI trả lời tập trung cao độ, chuẩn xác, không lan man
      },
    });

    const replyText = response.text || 'Xin lỗi, tôi không thể xử lý câu trả lời lúc này.';
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi khi kết nối với máy chủ AI.',
    });
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
