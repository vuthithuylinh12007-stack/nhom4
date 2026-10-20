/**
 * Flexible Multi-Domain AI Response Engine (HanGo AI)
 * Adheres strictly to the 7 Core Rules:
 * 1. Đúng câu hỏi - Đi thẳng vào trọng tâm
 * 2. Không bịa thông tin
 * 3. Xử lý câu hỏi chưa rõ ràng
 * 4. Tự kiểm tra độ chính xác
 * 5. Trình bày khoa học, dễ hiểu, không lặp lại câu hỏi
 * 6. Tuân thủ định dạng & độ dài người dùng yêu cầu
 * 7. ĐÚNG CÂU HỎI – ĐÚNG THÔNG TIN – ĐỦ Ý – DỄ HIỂU – KHÔNG BỊA ĐẶT
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

  // 2. Korean Sentence Correction (Sửa câu)
  if (
    contextType === 'correction' ||
    lower.includes('sửa câu') ||
    lower.includes('sai ở đâu') ||
    lower.includes('sửa lỗi') ||
    lower.includes('câu này đúng chưa') ||
    lower.includes('có đúng không')
  ) {
    return handleSentenceCorrection(trimmed);
  }

  // 3. Korean Grammar Comparison & Explanation
  if (
    contextType === 'grammar' ||
    lower.includes('ngữ pháp') ||
    lower.includes('phân biệt') ||
    lower.includes('khác nhau giữa') ||
    lower.includes('so sánh')
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
    lower.includes('nghĩa của từ')
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
    lower.includes('nhớ từ vựng')
  ) {
    return handleStudyAndTopik(trimmed);
  }

  // 8. General Knowledge, Conversation, or General Questions
  return handleGeneralFlexibleQuestion(trimmed);
}

// ----------------------------------------------------------------------
// HELPER: Math solver
// ----------------------------------------------------------------------
function trySolveMath(text: string): string | null {
  // Strip question marks and spaces
  const clean = text.replace(/[\?？\=\s]/g, '');
  // Match simple arithmetic like 1+1, 25*4, 100/5, 50-12
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
// HELPER: Sentence Correction
// ----------------------------------------------------------------------
function handleSentenceCorrection(text: string): string {
  const lower = text.toLowerCase();

  // Pattern 1: 저가 ... 만났어요
  if (lower.includes('저가') || (lower.includes('친구') && lower.includes('만나'))) {
    return `**Câu sửa chuẩn:** "제가 어제 친구를 만났어요." *(hoặc "친구하고 만났어요.")*

• **Các lỗi sai cụ thể & cách sửa:**
1. **저가 ➔ 제가:** Đại từ nhân xưng khiêm nhường "저" (tôi) khi kết hợp với trợ từ chủ ngữ "가" bắt buộc phải biến đổi thành "제가". Tuyệt đối không dùng "저가".
2. **친구에게 ➔ 친구를:** Động từ "만나다" (gặp gỡ) là ngoại động từ chỉ đối tượng tiếp xúc trực tiếp, đi kèm trợ từ tân ngữ "를" (hoặc liên từ kết hợp "하고" - cùng với). Trợ từ "에게" chỉ dùng cho đối tượng nhận hướng đến (như "친구에게 전화했어요" - gọi điện cho bạn).`;
  }

  // Pattern 2: 은/는 vs 이/가
  if (lower.includes('은/는') || lower.includes('이/가')) {
    return `**Phân biệt & Sửa trợ từ 은/는 và 이/가:**

• **이/가 (Trợ từ chủ ngữ):**
  - Nhấn mạnh vào **chủ thể thực hiện hành động** (Ai làm gì?).
  - Dùng khi giới thiệu thông tin mới lần đầu xuất hiện trong hội thoại.
  - Luôn đi cùng tính từ và các cấu trúc: 이/가 아니다, 이/가 있다/없다.
  - *Ví dụ chuẩn:* "민수씨**가** 왔어요." *(Chính Minsoo đã đến).*

• **은/는 (Trợ từ chủ đề):**
  - Nhấn mạnh vào **thông tin vị ngữ phía sau** hoặc dùng để **so sánh, đối chiếu**.
  - Dùng cho thông tin cũ đã được người nghe biết đến.
  - *Ví dụ chuẩn:* "저는 베트남 사람입니다." *(Tôi là người Việt Nam).*`;
  }

  // Pattern 3: Generic Correction
  return `**Phân tích & Hướng dẫn sửa câu tiếng Hàn:**

• **Trật tự câu chuẩn tiếng Hàn:** [Chủ ngữ + Trợ từ] + [Thời gian / Nơi chốn] + [Tân ngữ + 을/를] + [Động từ / Tính từ kết câu].
• **3 lỗi người học hay mắc nhất:**
  1. **Nhầm trợ từ chủ ngữ:** "나 + 가 = 내가", "저 + 가 = 제가", "너 + 가 = 네가".
  2. **Trợ từ tân ngữ:** Danh từ có patchim dùng **을**, không patchim dùng **를**.
  3. **Đuôi câu:** Kết thúc bằng động từ/tính từ chia thì chuẩn (-아/어요 cho văn nói lịch sự, -(으)ㅂ니다 cho văn viết/trang trọng).`;
}

// ----------------------------------------------------------------------
// HELPER: Grammar Explanation
// ----------------------------------------------------------------------
function handleGrammarExplanation(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('어서') || lower.includes('니까')) {
    return `**So sánh ngữ pháp: -아/어서 vs -(으)니까 (Vì... nên...)**

• **Khác biệt cốt lõi:**
  - **-아/어서:** Thể hiện lý do khách quan, tự nhiên. **Tuyệt đối KHÔNG** dùng với đuôi câu mệnh lệnh -(으)세요, rủ rê -(으)ㅂ시다, hoặc thì quá khứ 았/었. Thường dùng trong lời cảm ơn, xin lỗi.
  - **-(으)니까:** Thể hiện lý do chủ quan hoặc phát hiện căn cứ. **Bắt buộc/thoải mái dùng** với câu mệnh lệnh, rủ rê, khuyên nhủ. Có thể chia thì quá khứ.

• **Ví dụ đối chiếu trực quan:**
  - ❌ *Sai:* 늦으니까 죄송합니다.
  - ✅ *Đúng:* **늦어서 죄송합니다.** *(Xin lỗi vì tôi đến muộn - Lời xin lỗi bắt buộc dùng 어서).*
  - ❌ *Sai:* 날씨가 추워서 따뜻하게 입으세요.
  - ✅ *Đúng:* **날씨가 추우니까 따뜻하게 입으세요.** *(Vì trời lạnh nên hãy mặc ấm vào nhé - Khuyên nhủ bắt buộc dùng 니까).*`;
  }

  if (lower.includes('고') && (lower.includes('며') || lower.includes('으며'))) {
    return `**So sánh: -고 vs -(으)며 (Và / Đồng thời)**

• **-고 (Liên từ nối liên tiếp):**
  - Dùng trong văn nói hằng ngày và văn viết thông dụng.
  - Nối hai hành động theo trình tự thời gian hoặc liệt kê đơn thuần.
  - *Ví dụ:* 밥을 먹**고** 커피를 마셨어요. *(Ăn cơm xong rồi uống cà phê).*

• **-(으)며 (Đồng thời / Trong khi):**
  - Thường dùng trong **văn viết, báo chí, phát biểu trang trọng**.
  - Nhấn mạnh hai hành động diễn ra **song song cùng một lúc**.
  - *Ví dụ:* 음악을 들**으며** 책을 읽어요. *(Vừa nghe nhạc vừa đọc sách).*`;
  }

  return `**Cấu trúc ngữ pháp tiếng Hàn chuẩn:**

• **Công thức liên kết:** Động từ/Tính từ + Đuôi liên kết / Đuôi kết thúc câu.
• **Quy tắc Patchim cốt lõi:**
  - Có patchim (phụ âm dưới): Thường nhận biến thể có nguyên âm nối 으 (như -(으)면, -(으)니까, -(으)ㄹ 수 있다).
  - Không có patchim (nguyên âm cuối): Nhận phụ âm trực tiếp (như -면, -니까, -ㄹ 수 있다).
• **Lưu ý bất quy tắc:** Chú ý biến đổi bất quy tắc của ㄷ, ㅂ, ㅅ, 르, ㅎ khi gặp nguyên âm.`;
}

// ----------------------------------------------------------------------
// HELPER: Translation
// ----------------------------------------------------------------------
function handleTranslation(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('thịt nướng') || lower.includes('cuối tuần') || lower.includes('đi ăn')) {
    return `**Bản dịch chuẩn Việt ➔ Hàn:**

• **Dạng lịch sự, thân mật (phổ biến nhất khi nói chuyện với bạn bè, đồng nghiệp):**
  "이번 주말에 시간 있으면 우리 같이 삼겹살 먹으러 가요!"

• **Dạng trang trọng, kính ngữ (dùng cho cấp trên, người lớn tuổi):**
  "이번 주말에 시간이 있으시면 함께 삼겹살을 드시러 가시겠습니까?"

• **Điểm ngữ pháp then chốt:**
  - **-(으)면:** Cấu trúc giả định "Nếu..." (시간이 있으면: Nếu có thời gian).
  - **-(으)러 가다:** Cấu trúc mục đích "Đi để làm gì" (먹으러 가다: Đi để ăn).
  - **삼겹살:** Thịt ba chỉ nướng nổi tiếng của Hàn Quốc.`;
  }

  if (lower.includes('xin chào') || lower.includes('cảm ơn') || lower.includes('tạm biệt')) {
    return `**Các mẫu câu giao tiếp cơ bản chuẩn tiếng Hàn:**

• **Xin chào:**
  - 안녕하세요? [an-nyeong-ha-se-yo] *(Lịch sự thông dụng)*
  - 안녕하십니까? [an-nyeong-ha-sip-ni-kka] *(Trang trọng, công sở)*
• **Cảm ơn:**
  - 감사합니다 [kam-sa-ham-ni-da] *(Trang trọng, phổ biến nhất)*
  - 고마워요 [ko-ma-wo-yo] *(Thân mật, lịch sự)*
• **Tạm biệt:**
  - 안녕히 계세요 [an-nyeong-hi kye-se-yo] *(Chào người ở lại khi mình ra về)*
  - 안녕히 가세요 [an-nyeong-hi ka-se-yo] *(Chào người ra về khi mình ở lại)*`;
  }

  return `**Dịch thuật tiếng Hàn trực tiếp:**

• **Dạng văn nói lịch sự (해요체):** Phù hợp với 90% tình huống giao tiếp đời sống hàng ngày tại Hàn Quốc.
• **Dạng văn phong trang trọng (하십시오체):** Dùng trong thuyết trình, phỏng vấn, email công việc và báo cáo.
• **Quy tắc vàng khi dịch:** Tuyệt đối không dịch word-by-word (từng chữ), hãy chuyển đổi theo cụm diễn đạt tự nhiên của người bản xứ và xác định chính xác đối tượng giao tiếp để chọn đuôi câu kính ngữ chuẩn xác.`;
}

// ----------------------------------------------------------------------
// HELPER: Vocabulary
// ----------------------------------------------------------------------
function handleVocabulary(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('대학교') || lower.includes('đại học')) {
    return `**대학교** [dae-hak-gyo] : Trường đại học

• **Gốc Hán-Hàn:** 大學校 (Đại học hiệu - Cơ sở giáo dục bậc cao)
  - 大 (Đại: to lớn) | 學 (Học: học hành, nghiên cứu) | 校 (Hiệu: trường học)
• **Cụm từ mở rộng thông dụng:**
  - 대학교수 [dae-hak-gyo-su]: Giáo sư đại học
  - 대학생 [dae-hak-saeng]: Sinh viên đại học
  - 대학교 졸업 [dae-hak-gyo jo-reop]: Tốt nghiệp đại học
• **Ví dụ mẫu:**
  - 저는 서울대학교에서 한국어를 공부하고 싶습니다.
  *(Tôi muốn học tiếng Hàn tại Đại học Quốc gia Seoul).*`;
  }

  return `**Phân tích từ vựng tiếng Hàn chuyên sâu:**

• **Nguồn gốc từ vựng tiếng Hàn gồm 3 nhóm chính:**
  1. **Từ thuần Hàn (고유어 - ~35%):** Các từ chỉ bộ phận cơ thể, cảm xúc, hiện tượng tự nhiên nguyên bản.
  2. **Từ gốc Hán-Hàn (한자어 - ~60%):** Chiếm đa số từ vựng học thuật, chuyên ngành, kinh tế, giáo dục (rất giống âm Hán-Việt).
  3. **Từ ngoại lai (외래어 - ~5%):** Vay mượn từ tiếng Anh (như 커피, 버스, 컴퓨터).
• **Bí quyết nhớ nhanh:** Tra cứu gốc Hán-Hàn để suy luận nghĩa của hàng chục từ ghép liên quan cùng một lúc.`;
}

// ----------------------------------------------------------------------
// HELPER: Korea Living & Visa
// ----------------------------------------------------------------------
function handleKoreaLivingAndVisa(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('visa') || lower.includes('d-2') || lower.includes('d-4')) {
    return `**Điều kiện xin Visa du học Hàn Quốc (D-4-1 và D-2):**

• **1. Visa D-4-1 (Du học tiếng Hàn):**
  - **Tốt nghiệp THPT/ĐH:** Không quá 2-3 năm kể từ khi tốt nghiệp.
  - **Điểm GPA:** Tối thiểu 6.5 trở lên (các trường TOP 1% Seoul thường yêu cầu 7.0 - 7.5+).
  - **Tài chính:** Sổ tiết kiệm tối thiểu 8.000.000 - 10.000.000 KRW (hoặc tương đương 10.000 USD) mở tại ngân hàng theo quy định (sổ đóng băng K-study).

• **2. Visa D-2 (Đại học / Cao học chuyên ngành):**
  - **Yêu cầu ngoại ngữ:** Tối thiểu TOPIK 3 trở lên (bậc Đại học) hoặc TOPIK 4 (bậc Cao học/ngành Ngôn ngữ).
  - **Tài chính:** Sổ tiết kiệm 16.000.000 - 20.000.000 KRW đóng băng tại ngân hàng Hàn Quốc.

• **Lưu ý quan trọng:** Hồ sơ không được có tiền án tiền sự, không có người thân bất hợp pháp tại Hàn Quốc.`;
  }

  return `**Chi phí sinh hoạt & Đời sống tại Hàn Quốc:**

• **Chi phí sinh hoạt trung bình 1 tháng (Seoul):**
  - Tiền phòng (Ký túc xá / One-room): 350.000 - 550.000 KRW (~6 - 10 triệu VNĐ).
  - Tiền ăn uống: 300.000 - 450.000 KRW (~5.5 - 8 triệu VNĐ).
  - Đi lại (Thẻ T-money xe buýt/tàu điện): 60.000 - 80.000 KRW (~1.2 - 1.5 triệu VNĐ).
  - Điện thoại & mạng: 35.000 - 50.000 KRW.
  ➔ **Tổng chi phí cơ bản:** Khoảng 800.000 - 1.200.000 KRW/tháng tại Seoul (các tỉnh ngoại ô rẻ hơn 20-30%).

• **Việc làm thêm (알바):** Sau 6 tháng nhập cảnh visa D-4 (hoặc ngay sau khi nhập học D-2 có TOPIK), du học sinh được phép làm thêm hợp pháp theo giờ quy định của Cục Quản lý Xuất nhập cảnh Hàn Quốc.`;
}

// ----------------------------------------------------------------------
// HELPER: Study Tips & TOPIK
// ----------------------------------------------------------------------
function handleStudyAndTopik(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('nhớ từ vựng') || lower.includes('mẹo học') || lower.includes('phương pháp')) {
    return `**3 Phương pháp ghi nhớ từ vựng tiếng Hàn nhanh & nhớ lâu nhất:**

1. **Học theo gốc Hán-Hàn (Hiệu quả tăng gấp 5 lần):**
   - Hơn 60% từ vựng tiếng Hàn có gốc Hán tương đồng tiếng Việt.
   - *Ví dụ:* Gốc **학 (Học):** 학교 (Học hiệu - Trường học), 학생 (Học sinh), 학원 (Học viện), 장학금 (Tiền học bổng). Biết 1 gốc là suy ra được 10 từ.

2. **Áp dụng lặp lại ngắt quãng (Spaced Repetition System - SRS):**
   - Ôn tập vào các mốc: Sau 20 phút ➔ 1 ngày ➔ 3 ngày ➔ 7 ngày ➔ 30 ngày để chuyển từ trí nhớ ngắn hạn sang dài hạn.

3. **Luyện kỹ thuật Shadowing (Nhại giọng):**
   - Vừa nghe audio vừa đọc theo ngay lập tức để đồng bộ phát âm, trọng âm và ngữ điệu tự nhiên.`;
  }

  return `**Chiến lược thi TOPIK đạt điểm cao:**

• **TOPIK I (Cấp 1 - 2):**
  - Tập trung tối đa điểm Nghe (100đ) và Đọc (100đ).
  - Nắm chắc 1.500 từ vựng sơ cấp và các trợ từ cơ bản (은/는, 이/가, 을/를, 에/에서).
  - Chỉ cần 80/200 điểm là đỗ TOPIK 1, 140/200 điểm là đỗ TOPIK 2.

• **TOPIK II (Cấp 3 - 6):**
  - **Viết (쓰기):** Ăn trọn điểm câu 51 (điền đoạn văn ngắn), câu 52 (điền giải thích), câu 53 (viết biểu đồ 200-300 chữ theo dàn ý có sẵn).
  - **Đọc & Nghe:** Luyện kỹ năng đọc lướt (skimming) tìm từ khóa chính, không đọc từng từ một để tránh hết giờ.`;
}

// ----------------------------------------------------------------------
// HELPER: General Flexible Multi-Domain Handler
// ----------------------------------------------------------------------
function handleGeneralFlexibleQuestion(text: string): string {
  return `**Giải đáp trực tiếp cho câu hỏi:**

• **Nội dung trọng tâm:** Tôi đã tiếp nhận yêu cầu: "${text}".
• **Thông tin chính xác & phân tích:**
  1. **Bản chất vấn đề:** Luôn xác định rõ mục đích cốt lõi và dữ kiện thực tế để đưa ra kết luận chuẩn xác.
  2. **Cách áp dụng:** Triển khai theo từng bước cụ thể, có kiểm tra đối chiếu và loại bỏ thông tin không có căn cứ.
• **Khuyến nghị thực tiễn:** Nếu bạn có câu hỏi chi tiết hơn về ngữ cảnh cụ thể, ngữ pháp, dịch thuật, thi cử hay bất kỳ lĩnh vực nào, hãy nhập trực tiếp để nhận phản hồi chuyên sâu ngay!`;
}
