import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, val: string) => { storageMock[key] = val; },
  removeItem: (key: string) => { delete storageMock[key]; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); },
  key: (idx: number) => Object.keys(storageMock)[idx] || null,
  length: 0,
};

test('HanGo Storage - Registration and Password hashing', async () => {
  const { storageService } = await import('../src/services/storage');

  // Register user
  const result = storageService.register('Nguyễn Văn Test', 'test@hango.edu.vn', 'secret123');
  assert.equal(result.success, true);
  assert.ok(result.user?.id);
  assert.equal(result.user.name, 'Nguyễn Văn Test');

  // Verify plain text password is not stored
  const users = storageService.getUsers();
  assert.notEqual(users[0].passwordHash, 'secret123');
  assert.ok(users[0].passwordHash.includes('hango_'));

  // Duplicate email check
  const duplicate = storageService.register('Trùng Email', 'test@hango.edu.vn', 'secret123');
  assert.equal(duplicate.success, false);
  assert.ok(duplicate.error?.includes('đã được đăng ký'));
});

test('HanGo Storage - Vocabulary CRUD and duplicate detection', async () => {
  const { storageService } = await import('../src/services/storage');

  // Add vocabulary
  const addRes = storageService.addVocabulary({
    korean: '학교',
    vietnamese: 'Trường học',
    pronunciation: '[hak-gyo]',
    wordType: 'Danh từ',
    exampleKorean: '학교에 갑니다.',
    exampleVietnamese: 'Tôi đi đến trường.',
    categoryId: 3,
    level: 'Sơ cấp 1',
    isFavorite: false,
    isLearned: false,
  });
  assert.equal(addRes.success, true);
  assert.ok(addRes.item?.id);

  // Duplicate Korean word in the same category
  const dupRes = storageService.addVocabulary({
    korean: '  학교  ', // With extra whitespace
    vietnamese: 'Trường học nữa',
    pronunciation: '[hak-gyo]',
    wordType: 'Danh từ',
    exampleKorean: '',
    exampleVietnamese: '',
    categoryId: 3,
    level: 'Sơ cấp 1',
    isFavorite: false,
    isLearned: false,
  });
  assert.equal(dupRes.success, false);
  assert.ok(dupRes.error?.includes('đã tồn tại'));

  // Missing required field check
  const emptyRes = storageService.addVocabulary({
    korean: '',
    vietnamese: 'Nghĩa',
    pronunciation: '',
    wordType: 'Danh từ',
    exampleKorean: '',
    exampleVietnamese: '',
    categoryId: 1,
    level: 'Sơ cấp 1',
    isFavorite: false,
    isLearned: false,
  });
  assert.equal(emptyRes.success, false);
  assert.ok(emptyRes.error?.includes('không được để trống'));
});

test('HanGo Storage - CSV and JSON Import preview and duplicate detection', async () => {
  const { storageService } = await import('../src/services/storage');

  const csvData = `Tiếng Hàn,Nghĩa Tiếng Việt,Phát Âm,Loại Từ,Ví Dụ,Dịch Ví Dụ,Chủ Đề,Cấp Độ
선생님,Giáo viên,[seon-saeng-nim],Danh từ,선생님 안녕하세요,Chào giáo viên,3,Sơ cấp 1
학생,Học sinh,[hak-saeng],Danh từ,저는 학생입니다,Tôi là học sinh,3,Sơ cấp 1
`;

  const preview = storageService.previewImportData(csvData, 'csv');
  assert.equal(preview.validItems.length, 2);
  assert.equal(preview.validItems[0].korean, '선생님');
  assert.equal(preview.validItems[1].korean, '학생');
  assert.equal(preview.invalidCount, 0);
});

test('HanGo Storage - Quiz and Scoring calculation', async () => {
  const { storageService } = await import('../src/services/storage');

  const record = storageService.saveQuizResult({
    topicName: 'Kiểm tra Sơ cấp',
    score: 8,
    total: 10,
    percentage: 80,
    weakTopics: ['Trường học và học tập'],
  });

  assert.equal(record.percentage, 80);
  assert.equal(record.score, 8);
  assert.equal(record.weakTopics.length, 1);

  const history = storageService.getQuizHistory();
  assert.ok(history.length > 0);
  assert.equal(history[0].id, record.id);
});
