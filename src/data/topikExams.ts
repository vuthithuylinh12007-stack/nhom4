export interface TopikExamType {
  id: string;
  name: string;
  koreanName: string;
  section: 'reading' | 'writing' | 'listening';
  level: 'TOPIK I' | 'TOPIK II' | 'TOPIK I & II';
  questionNumbers: string;
  description: string;
  strategy: string;
  icon: string;
  badgeColor: string;
}

export interface TopikQuestion {
  id: string;
  typeId: string;
  typeName: string;
  section: 'reading' | 'writing' | 'listening';
  level: 'TOPIK I' | 'TOPIK II';
  instruction: string;
  passage?: string;
  passageTranslation?: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  keyVocabulary: { korean: string; vietnamese: string }[];
  tip: string;
}

export const TOPIK_EXAM_TYPES: TopikExamType[] = [
  {
    id: 'reading_blank',
    name: 'Đọc hiểu: Điền vào chỗ trống (빈칸 채우기)',
    koreanName: '빈칸에 들어갈 알맞은 것 고르기',
    section: 'reading',
    level: 'TOPIK I & II',
    questionNumbers: 'Câu 1~4 / 32~34',
    description: 'Xác định từ vựng, trợ từ hoặc cấu trúc liên kết ngữ pháp phù hợp để hoàn chỉnh câu văn hoặc mạch văn logic.',
    strategy: 'Đọc kỹ từ ngữ đứng ngay trước và sau chỗ trống, tìm mối quan hệ nguyên nhân - kết quả, tương phản hoặc điều kiện.',
    icon: '📝',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  },
  {
    id: 'reading_topic',
    name: 'Đọc hiểu: Chọn chủ đề đoạn văn (무엇에 대한 글)',
    koreanName: '무엇에 대한 글인지 고르기',
    section: 'reading',
    level: 'TOPIK I & II',
    questionNumbers: 'Câu 5~8 / 16~18',
    description: 'Xác định nội dung trung tâm của biển báo, thông báo ngắn, quảng cáo, tờ rơi dịch vụ hoặc thông tin công cộng.',
    strategy: 'Chú ý các từ khóa cốt lõi xuất hiện lặp lại hoặc từ đồng nghĩa trong văn cảnh (bệnh viện, du lịch, mua sắm, an toàn).',
    icon: '🎯',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  },
  {
    id: 'reading_match',
    name: 'Đọc hiểu: Chọn nội dung đúng (내용과 같은 것)',
    koreanName: '글의 내용과 같은 것 고르기',
    section: 'reading',
    level: 'TOPIK I & II',
    questionNumbers: 'Câu 9~12 / 19~20',
    description: 'Đọc bài khóa và đối chiếu 4 phương án để tìm nhận định trùng khớp 100% với dữ kiện trong bài đọc.',
    strategy: 'Đọc lướt 4 phương án trước để gạch chân từ khóa, sau đó đối chiếu từng câu vào bài khóa để loại trừ phương án sai lệch số liệu.',
    icon: '🔍',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  },
  {
    id: 'reading_order',
    name: 'Đọc hiểu: Sắp xếp thứ tự đoạn văn (순서 배열)',
    koreanName: '순서대로 맞게 나열한 것 고르기',
    section: 'reading',
    level: 'TOPIK II',
    questionNumbers: 'Câu 13~15',
    description: 'Sắp xếp 4 câu [가], [나], [다], [라] thành một đoạn văn hoàn chỉnh có tính liên kết và mạch lạc cao.',
    strategy: 'Tìm câu mở đầu (thường nêu khái niệm, thực trạng chung, không bắt đầu bằng từ nối 그러나/따라서). Sau đó tìm cặp câu liền kề nhờ từ chỉ định (이/그).',
    icon: '🔀',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  },
  {
    id: 'writing_51_52',
    name: 'Viết: Điền câu thực tế vào chỗ trống (Câu 51 - 52)',
    koreanName: '쓰기 51·52번 빈칸 채우기',
    section: 'writing',
    level: 'TOPIK II',
    questionNumbers: 'Câu 51 - 52',
    description: 'Điền 1 câu hoàn chỉnh vào hai vị trí (㉠) và (㉡) trong bức thư/thông báo (Câu 51) hoặc văn bản giải thích khoa học/đời sống (Câu 52).',
    strategy: 'Câu 51 dùng đuôi kính ngữ trang trọng (습니다/습니까). Câu 52 dùng đuôi trần thuật trung tính (ㄴ/는다, -기 때문이다).',
    icon: '✍️',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  },
  {
    id: 'writing_53',
    name: 'Viết: Phân tích biểu đồ thống kê (Câu 53)',
    koreanName: '쓰기 53번 그래프 분석하기',
    section: 'writing',
    level: 'TOPIK II',
    questionNumbers: 'Câu 53 (200~300 chữ)',
    description: 'Viết bài luận ngắn miêu tả kết quả khảo sát, so sánh đối chiếu số liệu và giải thích nguyên nhân - triển vọng trong tương lai.',
    strategy: 'Thuộc lòng mẫu câu phân tích: ~에 대해 조사한 결과... ~순으로 나타났다... 원인으로는 ~을/를 들 수 있다... 앞으로 ~할 것으로 전망된다.',
    icon: '📊',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
  },
  {
    id: 'listening_action',
    name: 'Nghe hiểu: Chọn hành động tiếp theo (다음에 할 행동)',
    koreanName: '듣기 - 이어질 행동 및 대화 고르기',
    section: 'listening',
    level: 'TOPIK I & II',
    questionNumbers: 'Câu 9~12 / 23~24',
    description: 'Lắng nghe đoạn đàm thoại giữa hai nhân vật và suy luận xem nhân vật nam hoặc nữ sẽ thực hiện hành động nào ngay sau đó.',
    strategy: 'Tập trung cao độ vào câu nói cuối cùng của người phụ nữ hoặc người đàn ông kèm theo các trợ động từ đề nghị (-겠습니까, -(으)ㄹ게요, -(으)세요).',
    icon: '🎧',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
  },
];

export const TOPIK_QUESTIONS: TopikQuestion[] = [
  // 1. reading_blank
  {
    id: 'tq_1',
    typeId: 'reading_blank',
    typeName: 'Đọc hiểu: Điền vào chỗ trống',
    section: 'reading',
    level: 'TOPIK I',
    instruction: '[1~2] 다음 ( )에 들어갈 가장 알맞은 것을 고르십시오.',
    questionText: '내일 친구와 같이 영화를 ( ). 극장에 갈 겁니다.',
    options: ['봤습니다', '봅니다', '볼 겁니다', '보십시오'],
    correctAnswer: 2,
    explanation: 'Từ chỉ thời gian là "내일" (ngày mai) nên câu văn diễn tả kế hoạch/dự định trong tương lai. Cấu trúc ngữ pháp đúng là "-(으)ㄹ 겁니다" (sẽ xem). Đáp án đúng là 3.',
    keyVocabulary: [
      { korean: '내일', vietnamese: 'Ngày mai' },
      { korean: '영화', vietnamese: 'Bộ phim' },
      { korean: '극장', vietnamese: 'Rạp chiếu phim' },
    ],
    tip: 'Luôn chú ý trạng từ chỉ thời gian: 어제 (quá khứ -았/었), 지금 (hiện tại -아/어), 내일/다음 주 (tương lai -(으)ㄹ 것).',
  },
  {
    id: 'tq_2',
    typeId: 'reading_blank',
    typeName: 'Đọc hiểu: Điền vào chỗ trống',
    section: 'reading',
    level: 'TOPIK II',
    instruction: '[3~4] 다음 밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.',
    questionText: '경제가 어려워짐에 따라 일자리를 구하기가 [하늘의 별 따기]이다.',
    options: ['매우 쉽다', '매우 어렵다', '조금 늦다', '아주 빠르다'],
    correctAnswer: 1,
    explanation: 'Quán ngữ "하늘의 별 따기" dịch nghĩa đen là "hái sao trên trời", nghĩa bóng chỉ một việc vô cùng khó khăn, gần như bất khả thi. Tương đương với "매우 어렵다".',
    keyVocabulary: [
      { korean: '일자리', vietnamese: 'Việc làm / Cơ hội việc làm' },
      { korean: '하늘의 별 따기', vietnamese: 'Khó như hái sao trên trời' },
      { korean: '구하다', vietnamese: 'Tìm kiếm' },
    ],
    tip: 'Đề thi TOPIK II thường có 2-3 câu hỏi về thành ngữ (속담) và quán ngữ (관용구). Hãy ghi nhớ các cụm từ ẩn dụ phổ biến.',
  },

  // 2. reading_topic
  {
    id: 'tq_3',
    typeId: 'reading_topic',
    typeName: 'Đọc hiểu: Chọn chủ đề đoạn văn',
    section: 'reading',
    level: 'TOPIK I',
    instruction: '[5~8] 다음은 무엇에 대한 글인지 고르십시오.',
    passage: '비빔밥이 맛있습니다. 불고기도 인기가 많습니다.',
    passageTranslation: 'Cơm trộn rất ngon. Thịt bò xào cũng được nhiều người yêu thích.',
    questionText: '이 글은 무엇에 대한 글입니까?',
    options: ['음식', '계절', '운동', '교통'],
    correctAnswer: 0,
    explanation: '"비빔밥" (cơm trộn) và "불고기" (thịt bò xào) là các món ăn truyền thống Hàn Quốc. Vì vậy chủ đề chính là "음식" (Món ăn / Đồ ăn).',
    keyVocabulary: [
      { korean: '비빔밥', vietnamese: 'Cơm trộn' },
      { korean: '불고기', vietnamese: 'Thịt bò xào bulgogi' },
      { korean: '인기', vietnamese: 'Sự nổi tiếng, hâm mộ' },
    ],
    tip: 'Nhận diện danh từ thuộc nhóm trường từ vựng đã học để chọn đáp án ngay trong 10 giây đầu tiên.',
  },
  {
    id: 'tq_4',
    typeId: 'reading_topic',
    typeName: 'Đọc hiểu: Chọn chủ đề đoạn văn',
    section: 'reading',
    level: 'TOPIK II',
    instruction: '[16~18] 다음은 무엇에 대한 안내문인지 고르십시오.',
    passage: '‘전기 절약, 지구를 살리는 첫걸음입니다. 쓰지 않는 플러그는 뽑고, 에어컨 적정 온도를 지켜 주세요.’',
    passageTranslation: '‘Tiết kiệm điện, bước đi đầu tiên để cứu lấy Trái Đất. Hãy rút các phích cắm không sử dụng và giữ nhiệt độ điều hòa hợp lý.’',
    questionText: '위 안내문의 주제로 가장 알맞은 것을 고르십시오.',
    options: ['건강 관리', '에너지 절약', '교통안전', '재활용 분리수거'],
    correctAnswer: 1,
    explanation: 'Nội dung nhắc đến "전기 절약" (tiết kiệm điện), "플러그" (phích cắm), "에어컨" (điều hòa) thuộc chủ đề "에너지 절약" (Tiết kiệm năng lượng).',
    keyVocabulary: [
      { korean: '절약', vietnamese: 'Tiết kiệm' },
      { korean: '적정 온도', vietnamese: 'Nhiệt độ thích hợp / tiêu chuẩn' },
      { korean: '첫걸음', vietnamese: 'Bước đi đầu tiên' },
    ],
    tip: 'Khẩu hiệu TOPIK II thường gắn liền với bảo vệ môi trường, văn hóa ứng xử nơi công cộng và tiết kiệm tài nguyên.',
  },

  // 3. reading_match
  {
    id: 'tq_5',
    typeId: 'reading_match',
    typeName: 'Đọc hiểu: Chọn nội dung đúng',
    section: 'reading',
    level: 'TOPIK II',
    instruction: '[9~12] 다음 글의 내용과 같은 것을 고르십시오.',
    passage: '한국어 말하기 대회가 다음 주 금요일 오후 2시에 대강당에서 열립니다. 참가 신청은 이번 주 수요일까지 외국인 지원 센터에 직접 방문하거나 이메일로 접수할 수 있습니다. 1등 수상자에게는 상장과 함께 한국 여행 상품권이 주어집니다.',
    passageTranslation: 'Cuộc thi nói tiếng Hàn sẽ diễn ra vào lúc 2 giờ chiều thứ Sáu tuần sau tại đại giảng đường. Đăng ký tham gia có thể nộp trực tiếp tại Trung tâm hỗ trợ người nước ngoài hoặc gửi qua email đến hết thứ Tư tuần này. Người đạt giải nhất sẽ nhận được giấy khen kèm phiếu du lịch Hàn Quốc.',
    questionText: '글의 내용과 일치하는 것을 고르십시오.',
    options: [
      '대회는 이번 주 수요일에 열린다.',
      '신청은 오직 이메일로만 가능하다.',
      '1등에게는 한국 여행 상품권을 준다.',
      '대회는 외국인 지원 센터에서 진행된다.',
    ],
    correctAnswer: 2,
    explanation: 'Câu 3 đúng vì bài nêu rõ "1등 수상자에게는... 한국 여행 상품권이 주어집니다". Câu 1 sai vì cuộc thi tổ chức vào thứ Sáu tuần sau. Câu 2 sai vì có thể đến nộp trực tiếp hoặc qua email. Câu 4 sai vì thi ở "대강당" (đại giảng đường), không phải ở trung tâm.',
    keyVocabulary: [
      { korean: '대회', vietnamese: 'Cuộc thi, đại hội' },
      { korean: '접수하다', vietnamese: 'Tiếp nhận đăng ký' },
      { korean: '상품권', vietnamese: 'Phiếu quà tặng / voucher' },
    ],
    tip: 'Cảnh giác với các từ mang tính tuyệt đối trong các đáp án sai như "오직" (duy nhất), "반드시" (nhất định), "누구나" (bất kỳ ai).',
  },

  // 4. reading_order
  {
    id: 'tq_6',
    typeId: 'reading_order',
    typeName: 'Đọc hiểu: Sắp xếp thứ tự đoạn văn',
    section: 'reading',
    level: 'TOPIK II',
    instruction: '[13~15] 다음 문장을 논리적 순서대로 맞게 나열한 것을 고르십시오.',
    passage: `(가) 하지만 꾸준히 연습하면 누구나 유창하게 말할 수 있게 된다.
(나) 외국어를 배울 때 처음에는 발음과 문법이 낯설어 어렵게 느껴진다.
(다) 그러므로 두려워하지 말고 매일 조금씩 말해보는 습관이 중요하다.
(라) 이 어려움을 극복하려면 실수를 두려워하지 않는 용기가 필요하다.`,
    passageTranslation: `(ga) Nhưng nếu luyện tập kiên trì thì bất kỳ ai cũng có thể nói trôi chảy.
(na) Khi học ngoại ngữ, ban đầu phát âm và ngữ pháp còn xa lạ nên cảm thấy rất khó.
(da) Do đó, điều quan trọng là đừng sợ hãi mà hãy duy trì thói quen nói một chút mỗi ngày.
(ra) Để vượt qua sự khó khăn này, cần có lòng dũng cảm không sợ mắc lỗi.`,
    questionText: '가장 알맞은 순서는 무엇입니까?',
    options: [
      '(나) - (라) - (가) - (다)',
      '(나) - (가) - (라) - (다)',
      '(라) - (나) - (다) - (가)',
      '(가) - (나) - (라) - (다)',
    ],
    correctAnswer: 0,
    explanation: 'Câu (나) đặt tiền đề chung về khó khăn khi mới học ngoại ngữ. Câu (라) dùng "이 어려움" (sự khó khăn này) để liên kết trực tiếp với (나). Câu (가) chuyển ý bằng "하지만" khẳng định nếu kiên trì sẽ thành công. Câu (다) kết luận bằng liên từ "그러므로" đưa ra lời khuyên thực tiễn.',
    keyVocabulary: [
      { korean: '낯설다', vietnamese: 'Xa lạ, bỡ ngỡ' },
      { korean: '극복하다', vietnamese: 'Khắc phục, vượt qua' },
      { korean: '유창하다', vietnamese: 'Lưu loát, trôi chảy' },
    ],
    tip: 'Công thức sắp xếp: Hiện tượng ban đầu -> Khó khăn phát sinh -> Giải pháp vượt qua -> Kết luận / Khuyên nhủ.',
  },

  // 5. writing_51_52
  {
    id: 'tq_7',
    typeId: 'writing_51_52',
    typeName: 'Viết: Điền câu thực tế (Câu 51)',
    section: 'writing',
    level: 'TOPIK II',
    instruction: '[쓰기 51번] 다음 글을 읽고 ( ㉠ )에 들어갈 가장 알맞은 표현을 고르십시오.',
    passage: `제목: 교재를 무료로 나눔합니다.
한국어 능력시험 준비를 위해 샀던 책인데 합격하여 더 이상 필요 없게 되었습니다. 책 상태는 깨끗합니다. 필요하신 분은 저에게 이메일을 ( ㉠ ).`,
    passageTranslation: `Tiêu đề: Tặng giáo trình miễn phí.
Đây là sách mình mua để ôn thi TOPIK, nay đã đỗ nên không cần dùng nữa. Sách còn rất mới sạch. Ai có nhu cầu xin vui lòng ( ㉠ ) cho mình.`,
    questionText: '( ㉠ )에 들어갈 표현으로 가장 알맞은 것은?',
    options: [
      '보내 주시기 바랍니다',
      '받으려고 합니다',
      '쓰지 않겠습니다',
      '읽어 보겠습니다',
    ],
    correctAnswer: 0,
    explanation: 'Trong thông báo nhắn nhủ người có nhu cầu liên hệ qua email, mẫu câu lịch sự chuẩn mực văn viết công cộng là "-기 바랍니다" (Xin vui lòng / Mong hãy gửi email cho tôi). Đáp án đúng là 1.',
    keyVocabulary: [
      { korean: '나눔하다', vietnamese: 'Chia sẻ, tặng lại' },
      { korean: '상태', vietnamese: 'Trạng thái, tình trạng' },
      { korean: '바라다', vietnamese: 'Mong muốn, kính mong' },
    ],
    tip: 'Câu 51 luôn yêu cầu đuôi câu lịch sự cao nhất: -기 바랍니다, -(으)시기 바랍니다, -아/어 주십시오.',
  },

  // 6. writing_53
  {
    id: 'tq_8',
    typeId: 'writing_53',
    typeName: 'Viết: Phân tích biểu đồ (Câu 53)',
    section: 'writing',
    level: 'TOPIK II',
    instruction: '[쓰기 53번] 다음 그래프 분석 글에서 빈칸에 들어갈 알맞은 어휘를 고르십시오.',
    passage: `외국인 유학생 수를 조사한 결과, 2015년 10만 명에서 2023년 20만 명으로 약 2배 ( ㉠ ). 반면 귀국을 희망하는 비율은 크게 ( ㉡ ).`,
    passageTranslation: `Kết quả khảo sát số lượng du học sinh nước ngoài cho thấy, từ 100.000 người vào năm 2015 đã tăng gấp khoảng 2 lần lên 200.000 người vào năm 2023. Ngược lại, tỷ lệ mong muốn về nước lại giảm mạnh.`,
    questionText: '( ㉠ )과 ( ㉡ )에 들어갈 표현의 짝으로 올바른 것은?',
    options: [
      '증가했다 - 감소했다',
      '감소했다 - 증가했다',
      '유지했다 - 올랐다',
      '줄어들었다 - 낮아졌다',
    ],
    correctAnswer: 0,
    explanation: 'Số lượng từ 10 vạn lên 20 vạn là "증가했다" (đã tăng). Từ nối đối lập "반면" (ngược lại) đi kèm biểu hiện suy giảm là "감소했다" (đã giảm).',
    keyVocabulary: [
      { korean: '증가하다', vietnamese: 'Gia tăng' },
      { korean: '감소하다', vietnamese: 'Giảm sút' },
      { korean: '반면', vietnamese: 'Mặt khác, ngược lại' },
    ],
    tip: 'Từ vựng biểu đồ câu 53 cốt lõi: 증가하다/늘어나다 (tăng), 감소하다/줄어들다 (giảm), 차지하다 (chiếm tỷ lệ), 나타났다 (xuất hiện kết quả).',
  },

  // 7. listening_action
  {
    id: 'tq_9',
    typeId: 'listening_action',
    typeName: 'Nghe hiểu: Chọn hành động tiếp theo',
    section: 'listening',
    level: 'TOPIK II',
    instruction: '[듣기 9~12] 다음 대화를 듣고 남자가 이어서 할 행동으로 가장 알맞은 것을 고르십시오.',
    passage: `여자: 민수 씨, 내일 회의 때 쓸 발표 자료 인쇄 다 했어요?
남자: 아, 아직 못 했습니다. 지금 바로 복사실 가서 30부 출력해 올게요.
여자: 네, 부탁해요. 저는 회의실 정리하고 있을게요.`,
    passageTranslation: `Nữ: Anh Min-su, tài liệu thuyết trình dùng cho cuộc họp ngày mai anh đã in xong chưa?
Nam: À, tôi vẫn chưa kịp in. Bây giờ tôi sẽ đến phòng photo in ra 30 bản mang về ngay đây ạ.
Nữ: Vâng, nhờ anh nhé. Tôi sẽ đi sắp xếp phòng họp.`,
    questionText: '남자가 이어서 할 행동은 무엇입니까?',
    options: [
      '회의실을 정리한다.',
      '발표 자료를 복사하러 간다.',
      '내일 회의를 취소한다.',
      '여자에게 발표 자료를 이메일로 보낸다.',
    ],
    correctAnswer: 1,
    explanation: 'Người nam nói rõ "지금 바로 복사실 가서 30부 출력해 올게요" (Bây giờ tôi sẽ đến phòng photo in 30 bản mang về ngay). Vì vậy hành động tiếp theo của người nam là đi in/photo tài liệu thuyết trình. Đáp án 2 đúng.',
    keyVocabulary: [
      { korean: '인쇄하다', vietnamese: 'In ấn' },
      { korean: '출력하다', vietnamese: 'In xuất ra giấy' },
      { korean: '복사실', vietnamese: 'Phòng photocopy' },
    ],
    tip: 'Nghe kỹ câu trả lời cuối của nhân vật được hỏi (nam hoặc nữ) và chú ý đuôi câu hứa hẹn/hành động: -(으)ㄹ게요, -(으)러 가다.',
  },
];
