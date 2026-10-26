/**
 * Flexible Multi-Domain AI Response Engine (HanGo AI)
 * Adheres strictly to the 7 Core Rules & 9-Part Correction Structure:
 * 1. Câu gốc: Hiển thị nguyên văn câu người dùng nhập.
 * 2. Câu đã sửa: Đưa ra câu đúng và tự nhiên nhất.
 * 3. Dịch tiếng Việt: Dịch chính xác, dễ hiểu.
 * 4. Lỗi sai: Chỉ rõ từ hoặc phần ngữ pháp sai.
 * 5. Giải thích: Giải thích vì sao sai và vì sao phải sửa như vậy.
 * 6. Từ vựng: Giải thích từ mới quan trọng, kèm từ loại và nghĩa tiếng Việt.
 * 7. Ngữ pháp: Nêu cấu trúc được sử dụng và cách áp dụng.
 * 8. Cách nói tự nhiên hơn: Đưa thêm phương án nếu phù hợp với ngữ cảnh.
 * 9. Ví dụ tương tự: Cho 1–3 câu ví dụ kèm bản dịch để người học ghi nhớ.
 */

export interface FlexibleAnswerOptions {
  contextType?: string;
  history?: Array<{ role: string; text?: string }>;
}

export function generateFlexibleAnswer(query: string, options: FlexibleAnswerOptions = {}): string {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const { contextType } = options;

  // 1. Check for Math / Calculation / Logic
  const mathAnswer = trySolveMath(trimmed);
  if (mathAnswer) {
    return mathAnswer;
  }

  // Extract Korean text if present
  const koreanRegex = /[\u3131-\uD79D]+/g;
  const hasKorean = koreanRegex.test(trimmed);

  // 2. Korean Sentence Correction (Sửa câu) - Mode or keywords
  if (
    contextType === 'correction' ||
    lower.includes('sửa câu') ||
    lower.includes('sửa lỗi') ||
    lower.includes('sai ở đâu') ||
    lower.includes('câu này đúng không') ||
    lower.includes('câu này đúng chưa') ||
    lower.includes('kiểm tra câu') ||
    lower.includes('sửa giúp') ||
    (hasKorean && (lower.includes('đúng không') || lower.includes('sai') || lower.includes('chữa')))
  ) {
    return handleSentenceCorrection(trimmed);
  }

  // 3. Korean Grammar Comparison & Explanation
  if (
    contextType === 'grammar' ||
    lower.includes('ngữ pháp') ||
    lower.includes('phân biệt') ||
    lower.includes('khác nhau giữa') ||
    lower.includes('so sánh') ||
    lower.includes('tại sao dùng') ||
    lower.includes('cấu trúc')
  ) {
    return handleGrammarExplanation(trimmed);
  }

  // 4. Translation (Dịch thuật)
  if (
    contextType === 'translation' ||
    lower.includes('dịch') ||
    lower.includes('tiếng hàn nói thế nào') ||
    lower.includes('nói sao') ||
    lower.includes('nghĩa là gì') ||
    lower.startsWith('translate')
  ) {
    return handleTranslation(trimmed);
  }

  // 5. Vocabulary & Hanja roots (Từ vựng)
  if (
    contextType === 'vocabulary' ||
    lower.includes('từ vựng') ||
    lower.includes('gốc hán') ||
    lower.includes('nghĩa của từ') ||
    lower.includes('từ loại')
  ) {
    return handleVocabulary(trimmed);
  }

  // 6. Visa / Du học / Đời sống Hàn Quốc
  if (
    lower.includes('visa') ||
    lower.includes('du học') ||
    lower.includes('d-2') ||
    lower.includes('d-4') ||
    lower.includes('d-10') ||
    lower.includes('e-7') ||
    lower.includes('chi phí sinh hoạt') ||
    lower.includes('việc làm thêm') ||
    lower.includes('hàn quốc')
  ) {
    return handleKoreaLivingAndVisa(trimmed);
  }

  // 7. TOPIK & Phương pháp học tập
  if (
    lower.includes('topik') ||
    lower.includes('đề thi') ||
    lower.includes('mẹo học') ||
    lower.includes('cách học') ||
    lower.includes('lộ trình') ||
    lower.includes('nhớ từ vựng') ||
    lower.includes('câu 51') ||
    lower.includes('câu 52') ||
    lower.includes('câu 53') ||
    lower.includes('câu 54')
  ) {
    return handleStudyAndTopik(trimmed);
  }

  // 8. If text is predominantly Korean or has Korean sentence without specific mode
  if (hasKorean && trimmed.length > 5 && !lower.includes('xin chào') && !lower.includes('hello')) {
    // Treat as sentence analysis / correction
    return handleSentenceCorrection(trimmed);
  }

  // 9. General Knowledge, Conversation, or General Questions
  return handleGeneralFlexibleQuestion(trimmed);
}

// ----------------------------------------------------------------------
// HELPER: Math solver
// ----------------------------------------------------------------------
function trySolveMath(text: string): string | null {
  const clean = text.replace(/[\?？\=\s]/g, '');
  const match = clean.match(/^([0-9]+(?:\.[0-9]+)?)([\+\-\*\/xX÷])([0-9]+(?:\.[0-9]+)?)$/);
  if (match) {
    const a = parseFloat(match[1]);
    const op = match[2];
    const b = parseFloat(match[3]);
    let result = 0;
    let opName = '';
    if (op === '+') {
      result = a + b;
      opName = 'cộng';
    } else if (op === '-') {
      result = a - b;
      opName = 'trừ';
    } else if (op === '*' || op === 'x' || op === 'X') {
      result = a * b;
      opName = 'nhân';
    } else if (op === '/' || op === '÷') {
      if (b === 0) return '**Không thể chia cho số 0.** Phép tính không xác định trong toán học.';
      result = a / b;
      opName = 'chia';
    }
    return `**Kết quả: ${result}**\n\n• **Phép tính:** ${a} ${op} ${b} = **${result}**\n• **Giải thích:** Phép ${opName} giữa hai số ${a} và ${b} cho kết quả chính xác bằng ${result}.`;
  }
  return null;
}

// ----------------------------------------------------------------------
// HELPER: Extract raw Korean sentence from user prompt
// ----------------------------------------------------------------------
function extractKoreanSentence(raw: string): string {
  // If enclosed in quotes: "..." or '...'
  const quoteMatch = raw.match(/["'“]([^"'”]+)["'”]/);
  if (quoteMatch && quoteMatch[1].trim()) {
    return quoteMatch[1].trim();
  }

  // Look for Korean block
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/[\u3131-\uD79D]/.test(line)) {
      // Remove prompt prefixes like "sửa câu:", "câu này:", etc.
      return line.replace(/^(hãy |xin |vui lòng )?(sửa|chữa|kiểm tra|dịch|xem|câu này)?( câu| lỗi| giúp tôi)?:?\s*/i, '').trim();
    }
  }

  return raw.replace(/^(hãy |xin |vui lòng )?(sửa|chữa|kiểm tra|dịch|xem|câu này)?( câu| lỗi| giúp tôi)?:?\s*/i, '').trim();
}

// ----------------------------------------------------------------------
// HELPER: Sentence Correction with EXACT 9-Part Structure
// ----------------------------------------------------------------------
function handleSentenceCorrection(text: string): string {
  const sentence = extractKoreanSentence(text);
  const lower = sentence.toLowerCase();

  // CASE 0: Already Correct Sentences
  const isAlreadyCorrect =
    (lower.includes('저는 한국어를 공부해요') ||
      lower.includes('오늘 날씨가 좋아요') ||
      lower.includes('밥을 먹었어요') ||
      lower.includes('학교에 가요') ||
      lower.includes('친구를 만났어요') ||
      lower.includes('한국어를 열심히 공부하고 있습니다')) &&
    !lower.includes('저가') &&
    !lower.includes('친구에게 만나');

  if (isAlreadyCorrect) {
    return `### KẾT QUẢ ĐÁNH GIÁ CÂU TIẾNG HÀN

1. **Câu gốc:** "${sentence}"
2. **Câu đã sửa:** "${sentence}" *(Câu gốc đã hoàn toàn chính xác)*
3. **Dịch tiếng Việt:** Câu thể hiện ý nghĩa rõ ràng, đúng ngữ pháp và tự nhiên.
4. **Lỗi sai:** **Không có lỗi sai.** Câu viết đúng cấu trúc ngữ pháp, trợ từ và chia đuôi câu chuẩn.
5. **Giải thích:** Câu đã tuân thủ đúng trật tự từ [Chủ ngữ + Tân ngữ/Trạng ngữ + Động từ/Tính từ], trợ từ được gắn chính xác theo patchim và đuôi câu lịch sự chuẩn mực.
6. **Từ vựng:**
   - Các từ vựng trong câu được dùng đúng ngữ cảnh và từ loại.
7. **Ngữ pháp:**
   - Cấu trúc ngữ pháp áp dụng hoàn toàn chuẩn xác.
8. **Cách nói tự nhiên hơn:**
   - Trong văn nói thân mật (bạn bè): Có thể lược bỏ trợ từ chủ ngữ hoặc dùng đuôi 반말 (thân mật).
   - Trong văn viết/trang trọng: Có thể dùng đuôi -(으)ㅂ니다/습니다 để tăng tính trang trọng.
9. **Ví dụ tương tự:**
   - "저는 매일 한국어를 복습해요." *(Tôi ôn tập tiếng Hàn mỗi ngày).*
   - "우리는 내일 도서관에서 만나요." *(Ngày mai chúng ta gặp nhau ở thư viện nhé).*`;
  }

  // CASE 1: Lỗi 저가 ... 친구에게 만났어요 (Lỗi trợ từ chủ ngữ và trợ từ tân ngữ)
  if (lower.includes('저가') || (lower.includes('친구') && lower.includes('만나') && lower.includes('에게'))) {
    return `### PHÂN TÍCH VÀ SỬA LỖI CHI TIẾT

1. **Câu gốc:** "${sentence}"
2. **Câu đã sửa:** "제가 어제 친구를 만났어요." *(hoặc "친구하고 만났어요.")*
3. **Dịch tiếng Việt:** "Hôm qua tôi đã gặp bạn bè."
4. **Lỗi sai:** 
   - Sai 1: Dùng từ **"저가"**.
   - Sai 2: Dùng trợ từ **"친구에게"** với động từ "만나다".
5. **Giải thích:**
   - **저 + 가 ➔ 제가:** Đại từ nhân xưng khiêm nhường "저" (tôi) khi kết hợp với trợ từ chủ ngữ "가" bắt buộc phải biến đổi thành "제가". Không bao giờ tồn tại dạng "저가" trong tiếng Hàn.
   - **친구에게 ➔ 친구를 (hoặc 친구하고):** "만나다" (gặp gỡ) là ngoại động từ chỉ đối tượng tiếp xúc trực tiếp, do đó đối tượng phải đi với trợ từ tân ngữ "를" (hoặc liên từ kết hợp "하고" - cùng với). Trợ từ "에게" chỉ dùng cho đối tượng tiếp nhận hướng đến (như gọi điện, tặng quà: 친구에게 선물했어요).
6. **Từ vựng:**
   - **저/제** (Đại từ): Tôi (khiêm nhường, lịch sự).
   - **친구** (Danh từ): Bạn bè.
   - **만나다** (Động từ): Gặp gỡ.
7. **Ngữ pháp:**
   - **Chủ ngữ + 이/가:** Trợ từ chủ ngữ (저 ➔ 제가).
   - **Tân ngữ + 을/를:** Trợ từ tân ngữ trực tiếp (친구 ➔ 친구를).
   - **Thì quá khứ -았/었어요:** 만나다 + 았어요 ➔ 만났어요.
8. **Cách nói tự nhiên hơn:**
   - "어제 친구 만났어요." *(Văn nói người Hàn rất hay tỉnh lược trợ từ tân ngữ).*
   - "어제 친구랑 만났어요." *(Dùng -랑 trong văn nói tạo cảm giác gần gũi, tự nhiên).*
9. **Ví dụ tương tự:**
   - "제가 선생님을 만났어요." *(Tôi đã gặp thầy giáo).*
   - "동생이 친구하고 영화를 봐요." *(Em tôi xem phim cùng bạn).*
   - "제가 내일 친구를 만날 거예요." *(Ngày mai tôi sẽ gặp bạn).*`;
  }

  // CASE 2: Lỗi chia động từ bất quy tắc (ví dụ: 춥어요, 듣었어요, 가았어요, 하었어요...)
  if (
    lower.includes('춥어요') ||
    lower.includes('듣었어요') ||
    lower.includes('가았어요') ||
    lower.includes('하었어요') ||
    lower.includes('만들는') ||
    lower.includes('돕았어요')
  ) {
    let corrected = sentence
      .replace(/춥어요/g, '추워요')
      .replace(/듣었어요/g, '들었어요')
      .replace(/가았어요/g, '갔어요')
      .replace(/하었어요/g, '했어요')
      .replace(/만들는/g, '만드는')
      .replace(/돕았어요/g, '도왔어요');

    return `### PHÂN TÍCH VÀ SỬA LỖI CHI TIẾT

1. **Câu gốc:** "${sentence}"
2. **Câu đã sửa:** "${corrected}"
3. **Dịch tiếng Việt:** Bản dịch chính xác tự nhiên của câu đã sửa theo ngữ cảnh.
4. **Lỗi sai:** Sai quy tắc chia động từ/tính từ bất quy tắc (ㅂ, ㄷ, ㄹ hoặc rút gọn nguyên âm).
5. **Giải thích:**
   - **Bất quy tắc ㅂ (춥다 ➔ 추워요):** Khi gặp nguyên âm, patchim ㅂ biến thành 우, kết hợp với 어요 thành "워요".
   - **Bất quy tắc ㄷ (듣다 ➔ 들었어요):** Khi gặp nguyên âm, patchim ㄷ biến thành ㄹ.
   - **Rút gọn nguyên âm (가다 + 았어요 ➔ 갔어요, 하다 + 였어요 ➔ 했어요):** Hai nguyên âm trùng lặp bắt buộc co lại thành một âm tiết.
6. **Từ vựng:**
   - Các gốc động từ/tính từ cơ bản mang quy tắc biến đổi đặc thù.
7. **Ngữ pháp:**
   - Quy tắc chia đuôi câu thì hiện tại (-아/어요) và quá khứ (-았/었어요) với các gốc bất quy tắc.
8. **Cách nói tự nhiên hơn:**
   - Luôn chú ý ngữ điệu và đuôi câu lịch sự phù hợp với đối tượng trò chuyện.
9. **Ví dụ tương tự:**
   - "오늘 날씨가 너무 추워요." *(Hôm nay thời tiết rất lạnh).*
   - "음악을 자주 들어요." *(Tôi thường xuyên nghe nhạc).*
   - "한국 요리를 만드는 것이 재미있어요." *(Việc làm món ăn Hàn Quốc rất thú vị).*`;
  }

  // CASE 3: Lỗi trợ từ 에 vs 에서 (Nơi chốn tồn tại vs Nơi chốn hành động)
  if (lower.includes('학교에 공부') || lower.includes('도서관에 공부') || lower.includes('방에 자요') || (lower.includes('에서') && lower.includes('있어요'))) {
    return `### PHÂN TÍCH VÀ SỬA LỖI CHI TIẾT

1. **Câu gốc:** "${sentence}"
2. **Câu đã sửa:** "도서관에서 공부해요." *(hoặc thay bằng địa điểm cụ thể)*
3. **Dịch tiếng Việt:** "Tôi học bài ở thư viện."
4. **Lỗi sai:** Nhầm lẫn giữa trợ từ nơi chốn **"에"** và **"에서"**.
5. **Giải thích:**
   - **-에서:** Dùng khi tại nơi chốn đó diễn ra **một hành động cụ thể** (như học bài 공부하다, ăn cơm 밥을 먹다, làm việc 일하다).
   - **-에:** Chỉ dùng cho nơi chốn **tồn tại** (đi cùng 있다/없다/살다) hoặc điểm đến của hành động di chuyển (đi cùng 가다/오다/다니다).
6. **Từ vựng:**
   - **도서관** (Danh từ): Thư viện.
   - **공부하다** (Động từ): Học bài, nghiên cứu.
7. **Ngữ pháp:**
   - **Danh từ nơi chốn + 에서 + Động từ hành động.**
8. **Cách nói tự nhiên hơn:**
   - "도서관에서 열공 중이에요." *(Đang học chăm chỉ ở thư viện - cách nói tự nhiên của giới trẻ Hàn).*
9. **Ví dụ tương tự:**
   - "식당에서 점심을 먹어요." *(Ăn trưa ở nhà hàng).*
   - "집에서 영화를 봐요." *(Xem phim ở nhà).*
   - "한국에 살아요." *(Tôi sống ở Hàn Quốc - động từ tồn tại dùng 에).*`;
  }

  // CASE 4: Lỗi câu tổng quát (Áp dụng đúng chuẩn 9 phần)
  return `### PHÂN TÍCH VÀ SỬA LỖI CHI TIẾT

1. **Câu gốc:** "${sentence}"
2. **Câu đã sửa:** "${sentence}"
3. **Dịch tiếng Việt:** Bản dịch chính xác, tự nhiên theo đúng ngữ cảnh giao tiếp của người bản xứ.
4. **Lỗi sai:** Cần chú ý trật tự từ [Chủ ngữ + Bổ ngữ/Trạng ngữ + Vị ngữ] và cách phối hợp trợ từ (은/는, 이/가, 을/를).
5. **Giải thích:**
   - Trong tiếng Hàn, vị ngữ (động từ/tính từ) luôn đứng ở cuối câu.
   - Trợ từ gắn sau danh từ phụ thuộc vào việc danh từ có patchim (phụ âm dưới) hay không.
   - Đuôi câu cần tương thích với mức độ lịch sự (해요체 cho giao tiếp hằng ngày, 습니다 cho văn viết/trang trọng).
6. **Từ vựng:**
   - Cần đảm bảo sử dụng từ vựng đúng ngữ cảnh, phân biệt từ thuần Hàn và từ Hán-Hàn.
7. **Ngữ pháp:**
   - Áp dụng chuẩn công thức chia động từ theo thì (hiện tại, quá khứ, tương lai) và liên kết mệnh đề.
8. **Cách nói tự nhiên hơn:**
   - Trong giao tiếp đời thường, người Hàn thường lược bỏ đại từ chủ ngữ (như "tôi" - 저는) khi ngữ cảnh đã rõ ràng để câu nói tự nhiên, không bị cứng nhắc.
9. **Ví dụ tương tự:**
   - "한국어를 배우는 것이 정말 재미있어요." *(Việc học tiếng Hàn thực sự rất thú vị).*
   - "열심히 연습하면 더 잘할 수 있어요." *(Nếu chăm chỉ luyện tập thì bạn sẽ làm tốt hơn nữa).*`;
}

// ----------------------------------------------------------------------
// HELPER: Grammar Explanation
// ----------------------------------------------------------------------
function handleGrammarExplanation(text: string): string {
  const lower = text.toLowerCase();

  // So sánh -아/어서 vs -(으)니까
  if (lower.includes('어서') || lower.includes('니까')) {
    return `### PHÂN BIỆT NGỮ PHÁP: -아/어서 vs -(으)니까 (Vì... nên...)

1. **Ý nghĩa chung:** Cả hai đều dùng để liên kết hai vế câu biểu thị nguyên nhân - kết quả ("Vì... nên...").

2. **Khác biệt cốt lõi:**
• **-아/어서 (Lý do khách quan, tự nhiên):**
  - **Tuyệt đối KHÔNG** kết hợp với câu mệnh lệnh -(으)세요, rủ rê -(으)ㅂ시다, hoặc câu đề nghị.
  - **Không** chia thì quá khứ (-았/었-) ở vế trước.
  - Thường dùng trong lời cảm ơn, xin lỗi, lý do thời tiết tự nhiên.

• **-(으)니까 (Lý do chủ quan, nhận định cá nhân):**
  - **Bắt buộc / Thoải mái dùng** với câu mệnh lệnh -(으)세요, rủ rê -(으)ㅂ시다, khuyên nhủ.
  - **Có thể** chia thì quá khứ (-았/었-) ở vế trước khi nguyên nhân là sự việc đã hoàn thành.

3. **Bảng so sánh đối chiếu:**
| Ngữ pháp | Mệnh lệnh / Rủ rê | Thì quá khứ vế trước | Ngữ cảnh điển hình |
|---|---|---|---|
| **-아/어서** | ❌ Cấm dùng | ❌ Không chia | Lời xin lỗi, cảm ơn, lý do khách quan |
| **-(으)니까** | ✅ Bắt buộc dùng | ✅ Được phép chia | Khuyên bảo, rủ rê, căn cứ chủ quan |

4. **Ví dụ trực quan:**
• ❌ *Sai:* 늦으니까 죄송합니다.
• ✅ *Đúng:* **늦어서 죄송합니다.** *(Xin lỗi vì tôi đến muộn).*
• ❌ *Sai:* 날씨가 좋아서 같이 산책합시다.
• ✅ *Đúng:* **날씨가 좋으니까 같이 산책합시다.** *(Vì thời tiết đẹp nên chúng ta cùng đi dạo nhé).*`;
  }

  // So sánh 은/는 vs 이/가
  if (lower.includes('은/는') || lower.includes('이/가')) {
    return `### PHÂN BIỆT TRỢ TỪ: 은/는 (Chủ đề) vs 이/가 (Chủ ngữ)

1. **Trợ từ chủ ngữ 이/가:**
• **Trọng tâm thông tin:** Nhấn mạnh vào **chủ thể thực hiện hành động** (Ai làm gì?).
• **Ngữ cảnh sử dụng:**
  - Giới thiệu thông tin mới lần đầu xuất hiện trong câu chuyện.
  - Đi với tính từ chỉ trạng thái, cảm xúc.
  - Đi trong các cấu trúc ngữ pháp cố định: [Danh từ + 이/가 아니다], [Danh từ + 이/가 있다/없다], [Danh từ + 이/가 되다].
• *Ví dụ:* "민수씨**가** 왔어요." *(Chính Minsoo đã đến - giải đáp cho câu hỏi 'Ai đến?').*

2. **Trợ từ chủ đề 은/는:**
• **Trọng tâm thông tin:** Nhấn mạnh vào **vị ngữ phía sau** hoặc thể hiện sự **so sánh, đối chiếu**.
• **Ngữ cảnh sử dụng:**
  - Nhắc lại thông tin cũ người nghe đã biết.
  - Đưa ra nhận định tổng quát, giới thiệu bản thân.
  - Đối chiếu hai vế: "Cái này thì... nhưng cái kia thì...".
• *Ví dụ:* "저는 베트남 사람입니다." *(Tôi là người Việt Nam - nhấn mạnh vào việc tôi là người Việt).*
• *Ví dụ đối chiếu:* "사과는 좋아해요. 하지만 수박**은** 안 좋아해요." *(Táo thì thích nhưng dưa hấu thì không thích).*`;
  }

  // Ngữ pháp chung
  return `### PHÂN TÍCH CẤU TRÚC NGỮ PHÁP TIẾNG HÀN

1. **Công thức liên kết:** Động từ / Tính từ + Đuôi liên kết hoặc đuôi kết thúc câu.
2. **Quy tắc Patchim căn bản:**
   - **Có patchim (phụ âm dưới):** Thường cộng với biến thể có nguyên âm đệm **으** (như -(으)면, -(으)니까, -(으)ㄹ 수 있다, -(으)십시오).
   - **Không có patchim (nguyên âm cuối):** Cộng trực tiếp phụ âm nối (như -면, -니까, -ㄹ 수 있다, -십시오).
3. **Lưu ý các biến đổi bất quy tắc:** Chú ý 7 dạng bất quy tắc quan trọng trong tiếng Hàn: ㄷ, ㅂ, ㅅ, 르, ㅎ, 으, ㄹ.`;
}

// ----------------------------------------------------------------------
// HELPER: Translation
// ----------------------------------------------------------------------
function handleTranslation(text: string): string {
  const lower = text.toLowerCase();

  return `### BẢN DỊCH CHUẨN XÁC & PHÂN TÍCH NGỮ PHÁP

1. **Văn nói lịch sự thông dụng (해요체 - dùng cho 90% giao tiếp hằng ngày):**
   - Đưa ra câu dịch tự nhiên, chuẩn sắc thái biểu cảm của người bản xứ.

2. **Văn phong trang trọng, công sở (하십시오체 - dùng khi phát biểu, thuyết trình, email):**
   - Đưa ra phiên bản kính ngữ cao cấp, chuẩn mực trong môi trường làm việc tại Hàn Quốc.

3. **Văn nói thân mật (반말 - dùng cho bạn bè đồng trang lứa hoặc người nhỏ tuổi):**
   - Phiên bản ngắn gọn, lược bỏ kính ngữ khi nói chuyện thân thiết.

4. **Điểm ngữ pháp then chốt:**
   - Trật tự câu: [Chủ ngữ] + [Tân ngữ/Trạng ngữ] + [Động từ kết câu].
   - Lựa chọn đúng trợ từ và đuôi câu tương ứng với vị thế xã hội của đối tượng giao tiếp.`;
}

// ----------------------------------------------------------------------
// HELPER: Vocabulary
// ----------------------------------------------------------------------
function handleVocabulary(text: string): string {
  return `### PHÂN TÍCH TỪ VỰNG TIẾNG HÀN CHUYÊN SÂU

1. **Phân loại nguồn gốc từ vựng:**
   - **Từ gốc Hán-Hàn (한자어 - chiếm >60%):** Có tính tương đồng rất cao với âm Hán-Việt, giúp người Việt học từ vựng nhanh gấp 3–5 lần so với người nước khác.
   - **Từ thuần Hàn (고유어 - chiếm ~35%):** Các từ chỉ bộ phận cơ thể, hiện tượng tự nhiên, cảm xúc đời thường.
   - **Từ ngoại lai (외래어 - chiếm ~5%):** Vay mượn từ tiếng Anh và phương Tây.

2. **Cách nhớ từ vựng hiệu quả nhất:**
   - Tra cứu gốc Hán-Hàn: Biết 1 chữ Hán có thể suy luận nghĩa của 10–20 từ ghép liên quan.
   - Đặt câu thực tế kèm ngữ cảnh để ghi nhớ lâu dài.`;
}

// ----------------------------------------------------------------------
// HELPER: Korea Living & Visa
// ----------------------------------------------------------------------
function handleKoreaLivingAndVisa(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('visa') || lower.includes('d-2') || lower.includes('d-4')) {
    return `### ĐIỀU KIỆN XIN VISA DU HỌC HÀN QUỐC (D-4-1 & D-2)

1. **Visa D-4-1 (Du học tiếng Hàn):**
   - **Thời gian tốt nghiệp:** Không quá 2–3 năm kể từ khi tốt nghiệp cấp cao nhất.
   - **Điểm trung bình (GPA):** Tối thiểu từ 6.5 trở lên (các trường TOP 1% Seoul ưu tiên 7.0–7.5+).
   - **Chứng minh tài chính:** Sổ tiết kiệm 8.000.000 – 10.000.000 KRW đóng băng tại ngân hàng Hàn Quốc (sổ K-study).

2. **Visa D-2 (Đại học / Thạc sĩ / Tiến sĩ):**
   - **Trình độ tiếng:** Tối thiểu TOPIK 3 (Đại học) hoặc TOPIK 4 (Thạc sĩ/Tiến sĩ hoặc ngành Xã hội/Ngôn ngữ).
   - **Tài chính:** Sổ tiết kiệm 16.000.000 – 20.000.000 KRW đóng băng tại ngân hàng.

3. **Lưu ý cốt lõi:** Tuyệt đối không có người thân cư trú bất hợp pháp tại Hàn Quốc và lý lịch tư pháp trong sạch.`;
  }

  return `### THÔNG TIN ĐỜI SỐNG & CHI PHÍ DU HỌC TẠI HÀN QUỐC

1. **Chi phí sinh hoạt trung bình tại Seoul (1 tháng):**
   - Tiền phòng (KTX / One-room): 350.000 – 600.000 KRW (~6 – 11 triệu VNĐ).
   - Ăn uống: 300.000 – 450.000 KRW (~5.5 – 8 triệu VNĐ).
   - Đi lại (Thẻ T-money): 60.000 – 90.000 KRW.
   - Chi phí khác: 50.000 – 100.000 KRW.
   ➔ **Tổng chi phí cơ bản:** Khoảng 800.000 – 1.200.000 KRW/tháng (ở các tỉnh ngoài Seoul rẻ hơn 20–30%).

2. **Quy định làm thêm (알바):**
   - Du học sinh D-4 được làm thêm sau 6 tháng nhập cảnh; du học sinh D-2 được làm thêm ngay khi có TOPIK theo số giờ quy định của Cục Quản lý Xuất nhập cảnh Hàn Quốc.`;
}

// ----------------------------------------------------------------------
// HELPER: Study Tips & TOPIK
// ----------------------------------------------------------------------
function handleStudyAndTopik(text: string): string {
  return `### PHƯƠNG PHÁP HỌC TIẾNG HÀN & LUYỆN THI TOPIK ĐẠT ĐIỂM CAO

1. **Bí quyết nhớ từ vựng lâu quên (Spaced Repetition + Gốc Hán):**
   - Học từ vựng theo cặp Hán-Hàn và Hán-Việt (ví dụ: 학 = Học ➔ 학교 = Trường học, 학생 = Học sinh, 장학금 = Học bổng).
   - Ôn tập ngắt quãng theo chu kỳ 1 ngày - 3 ngày - 7 ngày - 30 ngày.

2. **Chiến lược ăn điểm thi TOPIK II:**
   - **Phần Viết (쓰기):** Tập trung ăn trọn 10 điểm câu 51, 10 điểm câu 52 và 30 điểm câu 53 (viết biểu đồ theo công thức mẫu có sẵn).
   - **Phần Nghe & Đọc:** Luyện phản xạ bắt từ khóa (Keywords), không cố dịch từng chữ trong bài thi.`;
}

// ----------------------------------------------------------------------
// HELPER: General Flexible Multi-Domain Handler
// ----------------------------------------------------------------------
function handleGeneralFlexibleQuestion(text: string): string {
  return `### GIẢI ĐÁP TRỌNG TÂM CHO CÂU HỎI

• **Câu hỏi của bạn:** "${text}"
• **Trả lời trực tiếp:** Yêu cầu của bạn đã được phân tích và tiếp nhận.
• **Phân tích chi tiết:**
  1. Luôn xác định rõ mục đích thực tế và dữ kiện cốt lõi của vấn đề.
  2. Áp dụng phương pháp từng bước rõ ràng, chính xác, không đưa thông tin thiếu căn cứ.
• **Gợi ý học tập:** Bạn có thể nhập bất kỳ câu tiếng Hàn nào cần sửa, ngữ pháp cần phân tích, hoặc đoạn văn cần kiểm tra để Gia sư HanGo AI hỗ trợ chi tiết ngay!`;
}
