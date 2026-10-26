import {
  User,
  VocabularyItem,
  GrammarItem,
  GameScoreRecord,
  QuizResultRecord,
} from '../types';
import { INITIAL_VOCABULARIES } from '../data/initialVocabularies';
import { INITIAL_GRAMMAR } from '../data/initialGrammar';
import { srsService, ReviewGrade } from './spacedRepetition';

const USERS_KEY = 'hango_users';
const CURRENT_USER_KEY = 'hango_current_user_id';
const VOCAB_PREFIX = 'hango_vocab_';
const GRAMMAR_PREFIX = 'hango_grammar_';
const GAME_RECORDS_PREFIX = 'hango_games_';
const QUIZ_HISTORY_PREFIX = 'hango_quizzes_';

// Simple password hashing simulation (not storing plain text)
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hango_' + Math.abs(hash).toString(16) + '_sec';
}

interface StoredUserAccount extends User {
  passwordHash: string;
}

class StorageService {
  // ================= USERS & AUTH =================

  public getUsers(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public getCurrentUser(): User | null {
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentId) return null;
    const users = this.getUsers();
    const user = users.find((u) => u.id === currentId);
    if (!user) return null;

    // Check streak
    this.updateStreakIfNeeded(user);
    return user;
  }

  private updateStreakIfNeeded(user: StoredUserAccount): void {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate === today) return;

    const last = new Date(user.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      user.streakDays += 1;
    } else if (diffDays > 1) {
      user.streakDays = 1;
    }
    user.lastActiveDate = today;
    this.saveUserAccount(user);
  }

  public register(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) return { success: false, error: 'Họ và tên không được để trống.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return { success: false, error: 'Địa chỉ email không đúng định dạng.' };
    if (!password || password.length < 6) return { success: false, error: 'Mật khẩu phải chứa ít nhất 6 ký tự.' };

    const users = this.getUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      return { success: false, error: 'Email này đã được đăng ký tài khoản khác.' };
    }

    const newUser: StoredUserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
      email: trimmedEmail,
      avatar: '🧑‍🎓',
      dailyGoal: 10,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);

    // Initialize vocabulary & grammar for new user
    this.initUserData(newUser.id);

    return { success: true, user: newUser };
  }

  public login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email === trimmedEmail);

    if (!user) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email.' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    localStorage.setItem(CURRENT_USER_KEY, user.id);
    this.updateStreakIfNeeded(user);
    return { success: true, user };
  }

  public loginAsGuest(): User {
    const guestId = 'guest_demo_user';
    let users = this.getUsers();
    let guest = users.find((u) => u.id === guestId);

    if (!guest) {
      guest = {
        id: guestId,
        name: 'Học viên Trải nghiệm',
        email: 'guest@hango.edu.vn',
        avatar: '🇰🇷',
        dailyGoal: 10,
        streakDays: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isGuest: true,
        passwordHash: hashPassword('guest123'),
      };
      users.push(guest);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      this.initUserData(guestId);
    }

    localStorage.setItem(CURRENT_USER_KEY, guestId);
    return guest;
  }

  public logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  public updateUserProfile(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === current.id);
    if (index === -1) return null;

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return updatedUser;
  }

  public resetPassword(email: string, newPass: string): { success: boolean; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email === trimmedEmail);

    if (!user) {
      return { success: false, error: 'Không tìm thấy tài khoản với email này.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    user.passwordHash = hashPassword(newPass);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  }

  private saveUserAccount(user: StoredUserAccount): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  // ================= VOCABULARY VALIDATION & SANITIZATION =================
  private static VOCAB_VERSION = 'v2_1000_pristine';

  public static isValidKoreanVocab(item: any): boolean {
    if (!item || typeof item !== 'object') return false;
    const korean = (item.korean || '').trim();
    const vietnamese = (item.vietnamese || item.meaning || '').trim();

    if (!korean || !vietnamese) return false;

    // Must contain authentic Korean Hangul syllables
    if (!/[\uac00-\ud7af]/.test(korean)) return false;

    // Must NOT contain corruption markers (e.g. &U, &#, replacement character \uFFFD, or double question marks)
    const corruptRegex = /(&#|\ufffd|&U|\u0000|\?\?\?)/i;
    if (corruptRegex.test(korean) || corruptRegex.test(vietnamese)) return false;

    return true;
  }

  private initUserData(userId: string): void {
    const vocabKey = VOCAB_PREFIX + userId;
    const versionKey = 'hango_vocab_ver_' + userId;

    if (!localStorage.getItem(vocabKey) || localStorage.getItem(versionKey) !== StorageService.VOCAB_VERSION) {
      this.healAndMigrate1000Vocab(userId);
    }

    const grammarKey = GRAMMAR_PREFIX + userId;
    if (!localStorage.getItem(grammarKey)) {
      localStorage.setItem(grammarKey, JSON.stringify(INITIAL_GRAMMAR));
    }
  }

  /**
   * Auto-heals corrupted words, upgrades to 1,000 words, and preserves user learning progress & custom words
   */
  public healAndMigrate1000Vocab(userId?: string): VocabularyItem[] {
    const uid = userId || this.getCurrentUser()?.id || 'guest_demo_user';
    const vocabKey = VOCAB_PREFIX + uid;
    const versionKey = 'hango_vocab_ver_' + uid;

    let existingItems: VocabularyItem[] = [];
    try {
      const raw = localStorage.getItem(vocabKey);
      if (raw) {
        existingItems = JSON.parse(raw);
      }
    } catch {
      existingItems = [];
    }

    // Map user study status by clean Korean word
    const userProgressMap = new Map<string, Partial<VocabularyItem>>();
    const customValidWords: VocabularyItem[] = [];

    if (Array.isArray(existingItems)) {
      for (const item of existingItems) {
        if (!StorageService.isValidKoreanVocab(item)) continue;

        const kKey = item.korean.trim();
        userProgressMap.set(kKey, {
          isLearned: item.isLearned,
          isFavorite: item.isFavorite,
          reviewCount: item.reviewCount,
          lastReviewedAt: item.lastReviewedAt,
          lastReviewResult: item.lastReviewResult,
          correctCount: item.correctCount,
          incorrectCount: item.incorrectCount,
          srsStage: item.srsStage,
          srsEaseFactor: item.srsEaseFactor,
          srsIntervalDays: item.srsIntervalDays,
          srsRepetitions: item.srsRepetitions,
          nextReviewDate: item.nextReviewDate,
          customScheduledDate: item.customScheduledDate,
        });

        if (item.isCustom) {
          customValidWords.push(item);
        }
      }
    }

    // Build the clean 1,000 vocabulary set with user progress mapped
    const healedList: VocabularyItem[] = INITIAL_VOCABULARIES.map((initItem) => {
      const progress = userProgressMap.get(initItem.korean.trim());
      if (progress) {
        return {
          ...initItem,
          isLearned: progress.isLearned ?? initItem.isLearned,
          isFavorite: progress.isFavorite ?? initItem.isFavorite,
          reviewCount: progress.reviewCount ?? initItem.reviewCount,
          lastReviewedAt: progress.lastReviewedAt ?? initItem.lastReviewedAt,
          lastReviewResult: progress.lastReviewResult ?? initItem.lastReviewResult,
          correctCount: progress.correctCount ?? initItem.correctCount,
          incorrectCount: progress.incorrectCount ?? initItem.incorrectCount,
          srsStage: progress.srsStage ?? initItem.srsStage,
          srsEaseFactor: progress.srsEaseFactor ?? initItem.srsEaseFactor,
          srsIntervalDays: progress.srsIntervalDays ?? initItem.srsIntervalDays,
          srsRepetitions: progress.srsRepetitions ?? initItem.srsRepetitions,
          nextReviewDate: progress.nextReviewDate ?? initItem.nextReviewDate,
          customScheduledDate: progress.customScheduledDate ?? initItem.customScheduledDate,
        };
      }
      return { ...initItem };
    });

    // Append any valid custom words user created
    const existingKoreanSet = new Set(healedList.map((v) => v.korean.trim()));
    for (const customItem of customValidWords) {
      if (!existingKoreanSet.has(customItem.korean.trim())) {
        healedList.push(customItem);
        existingKoreanSet.add(customItem.korean.trim());
      }
    }

    localStorage.setItem(vocabKey, JSON.stringify(healedList));
    localStorage.setItem(versionKey, StorageService.VOCAB_VERSION);
    return healedList;
  }

  public getVocabularies(userId?: string): VocabularyItem[] {
    const uid = userId || this.getCurrentUser()?.id || 'guest_demo_user';
    const key = VOCAB_PREFIX + uid;
    const versionKey = 'hango_vocab_ver_' + uid;

    try {
      const data = localStorage.getItem(key);
      const currentVer = localStorage.getItem(versionKey);

      if (!data || currentVer !== StorageService.VOCAB_VERSION) {
        return this.healAndMigrate1000Vocab(uid);
      }

      const parsed: VocabularyItem[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < 1000) {
        return this.healAndMigrate1000Vocab(uid);
      }

      // Quick sanity check on the first few and sample items
      const hasCorrupt = parsed.slice(0, 50).some((item) => !StorageService.isValidKoreanVocab(item));
      if (hasCorrupt) {
        return this.healAndMigrate1000Vocab(uid);
      }

      return parsed;
    } catch {
      return this.healAndMigrate1000Vocab(uid);
    }
  }

  public saveVocabularies(items: VocabularyItem[], userId?: string): void {
    const uid = userId || this.getCurrentUser()?.id || 'guest_demo_user';
    localStorage.setItem(VOCAB_PREFIX + uid, JSON.stringify(items));
    localStorage.setItem('hango_vocab_ver_' + uid, StorageService.VOCAB_VERSION);
  }

  public addVocabulary(
    item: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>
  ): { success: boolean; error?: string; item?: VocabularyItem } {
    const korean = item.korean?.trim();
    const vietnamese = item.vietnamese?.trim();

    if (!korean) {
      return { success: false, error: 'Từ tiếng Hàn không được để trống.' };
    }
    if (!vietnamese) {
      return { success: false, error: 'Nghĩa tiếng Việt không được để trống.' };
    }

    const currentVocabs = this.getVocabularies();

    // Check duplicate
    const duplicate = currentVocabs.find(
      (v) => v.korean.toLowerCase() === korean.toLowerCase() && v.categoryId === item.categoryId
    );
    if (duplicate) {
      return {
        success: false,
        error: `Từ tiếng Hàn "${korean}" đã tồn tại trong chủ đề này.`,
      };
    }

    const newItem: VocabularyItem = {
      ...item,
      id: 'voc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      korean,
      vietnamese,
      pronunciation: item.pronunciation?.trim() || '',
      exampleKorean: item.exampleKorean?.trim() || '',
      exampleVietnamese: item.exampleVietnamese?.trim() || '',
      note: item.note?.trim() || '',
      isFavorite: !!item.isFavorite,
      isLearned: !!item.isLearned,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...currentVocabs];
    this.saveVocabularies(updated);
    return { success: true, item: newItem };
  }

  public updateVocabulary(id: string, updates: Partial<VocabularyItem>): { success: boolean; error?: string } {
    const currentVocabs = this.getVocabularies();
    const index = currentVocabs.findIndex((v) => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy từ vựng cần cập nhật.' };
    }

    // Duplicate check if korean or category changed
    if (updates.korean) {
      const newKorean = updates.korean.trim();
      const catId = updates.categoryId || currentVocabs[index].categoryId;
      const dup = currentVocabs.find(
        (v) => v.id !== id && v.korean.toLowerCase() === newKorean.toLowerCase() && v.categoryId === catId
      );
      if (dup) {
        return { success: false, error: `Từ "${newKorean}" đã tồn tại trong chủ đề này.` };
      }
      updates.korean = newKorean;
    }

    currentVocabs[index] = {
      ...currentVocabs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveVocabularies(currentVocabs);
    return { success: true };
  }

  public deleteVocabulary(id: string): { success: boolean; error?: string } {
    const currentVocabs = this.getVocabularies();
    const filtered = currentVocabs.filter((v) => v.id !== id);
    if (filtered.length === currentVocabs.length) {
      return { success: false, error: 'Không tìm thấy từ vựng để xóa.' };
    }
    this.saveVocabularies(filtered);
    return { success: true };
  }

  public toggleVocabularyFavorite(id: string): boolean {
    const vocabs = this.getVocabularies();
    const item = vocabs.find((v) => v.id === id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    item.updatedAt = new Date().toISOString();
    this.saveVocabularies(vocabs);
    return item.isFavorite;
  }

  public toggleVocabularyLearned(id: string): boolean {
    const vocabs = this.getVocabularies();
    const item = vocabs.find((v) => v.id === id);
    if (!item) return false;
    item.isLearned = !item.isLearned;
    item.updatedAt = new Date().toISOString();
    this.saveVocabularies(vocabs);
    return item.isLearned;
  }

  public recordReviewResult(id: string, isCorrect: boolean, grade?: ReviewGrade): void {
    const vocabs = this.getVocabularies();
    const item = vocabs.find((v) => v.id === id);
    if (!item) return;

    // Determine grade if not explicitly passed
    const reviewGrade: ReviewGrade = grade || (isCorrect ? 3 : 1);
    const srsUpdate = srsService.calculateNextReview(item, reviewGrade);

    Object.assign(item, srsUpdate);
    // Clear custom scheduled date once reviewed
    if (item.customScheduledDate && srsService.formatDate(new Date()) >= item.customScheduledDate) {
      delete item.customScheduledDate;
    }

    this.saveVocabularies(vocabs);
  }

  /**
   * Set custom review schedule for a single vocabulary item
   */
  public scheduleWordReview(id: string, targetDateStr: string): boolean {
    const vocabs = this.getVocabularies();
    const item = vocabs.find((v) => v.id === id);
    if (!item) return false;

    item.customScheduledDate = targetDateStr;
    item.nextReviewDate = targetDateStr;
    item.updatedAt = new Date().toISOString();
    this.saveVocabularies(vocabs);
    return true;
  }

  /**
   * Remove custom review schedule for a single word
   */
  public clearWordSchedule(id: string): boolean {
    const vocabs = this.getVocabularies();
    const item = vocabs.find((v) => v.id === id);
    if (!item) return false;

    delete item.customScheduledDate;
    item.updatedAt = new Date().toISOString();
    this.saveVocabularies(vocabs);
    return true;
  }

  /**
   * Batch schedule review date for an entire topic category
   */
  public scheduleCategoryReview(categoryId: number, targetDateStr: string): number {
    const vocabs = this.getVocabularies();
    let count = 0;

    vocabs.forEach((item) => {
      if (item.categoryId === categoryId) {
        item.customScheduledDate = targetDateStr;
        item.nextReviewDate = targetDateStr;
        item.updatedAt = new Date().toISOString();
        count++;
      }
    });

    if (count > 0) {
      this.saveVocabularies(vocabs);
    }
    return count;
  }

  // ================= GRAMMAR =================

  public getGrammars(userId?: string): GrammarItem[] {
    const uid = userId || this.getCurrentUser()?.id || 'guest_demo_user';
    const key = GRAMMAR_PREFIX + uid;
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(INITIAL_GRAMMAR));
        return INITIAL_GRAMMAR;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_GRAMMAR;
    }
  }

  public saveGrammars(items: GrammarItem[], userId?: string): void {
    const uid = userId || this.getCurrentUser()?.id || 'guest_demo_user';
    localStorage.setItem(GRAMMAR_PREFIX + uid, JSON.stringify(items));
  }

  public toggleGrammarFavorite(id: string): boolean {
    const grammars = this.getGrammars();
    const item = grammars.find((g) => g.id === id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    this.saveGrammars(grammars);
    return item.isFavorite;
  }

  public toggleGrammarCompleted(id: string): boolean {
    const grammars = this.getGrammars();
    const item = grammars.find((g) => g.id === id);
    if (!item) return false;
    item.isCompleted = !item.isCompleted;
    this.saveGrammars(grammars);
    return item.isCompleted;
  }

  // ================= GAMES & QUIZZES =================

  public saveGameScore(record: Omit<GameScoreRecord, 'id' | 'date'>): GameScoreRecord {
    const uid = this.getCurrentUser()?.id || 'guest_demo_user';
    const key = GAME_RECORDS_PREFIX + uid;
    const records: GameScoreRecord[] = JSON.parse(localStorage.getItem(key) || '[]');

    const newRecord: GameScoreRecord = {
      ...record,
      id: 'gm_' + Date.now(),
      date: new Date().toISOString(),
    };

    records.unshift(newRecord);
    localStorage.setItem(key, JSON.stringify(records.slice(0, 50))); // Keep last 50
    return newRecord;
  }

  public getGameScores(): GameScoreRecord[] {
    const uid = this.getCurrentUser()?.id || 'guest_demo_user';
    const key = GAME_RECORDS_PREFIX + uid;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  public saveQuizResult(record: Omit<QuizResultRecord, 'id' | 'date'>): QuizResultRecord {
    const uid = this.getCurrentUser()?.id || 'guest_demo_user';
    const key = QUIZ_HISTORY_PREFIX + uid;
    const history: QuizResultRecord[] = JSON.parse(localStorage.getItem(key) || '[]');

    const newRecord: QuizResultRecord = {
      ...record,
      id: 'qz_' + Date.now(),
      date: new Date().toISOString(),
    };

    history.unshift(newRecord);
    localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    return newRecord;
  }

  public getQuizHistory(): QuizResultRecord[] {
    const uid = this.getCurrentUser()?.id || 'guest_demo_user';
    const key = QUIZ_HISTORY_PREFIX + uid;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  // ================= STATISTICS =================

  public getDashboardStats() {
    const vocabs = this.getVocabularies();
    const grammars = this.getGrammars();
    const quizHistory = this.getQuizHistory();
    const user = this.getCurrentUser();
    const today = srsService.formatDate(new Date());

    const totalWords = vocabs.length;
    const learnedWords = vocabs.filter((v) => v.isLearned).length;
    const favoriteWords = vocabs.filter((v) => v.isFavorite).length;
    const dueForReviewWords = vocabs.filter((v) => srsService.isDue(v, today)).length;
    const completedGrammars = grammars.filter((g) => g.isCompleted).length;
    const latestQuiz = quizHistory.length > 0 ? quizHistory[0] : null;

    return {
      totalWords,
      learnedWords,
      favoriteWords,
      needReviewWords: dueForReviewWords,
      completedGrammars,
      totalGrammars: grammars.length,
      latestQuizScore: latestQuiz ? Math.round((latestQuiz.score / latestQuiz.total) * 100) : null,
      streakDays: user?.streakDays || 1,
      dailyGoal: user?.dailyGoal || 10,
    };
  }

  // ================= IMPORT & EXPORT =================

  public previewImportData(
    rawContent: string,
    format: 'json' | 'csv'
  ): {
    validItems: VocabularyItem[];
    duplicateCount: number;
    invalidCount: number;
    errors: string[];
  } {
    const currentVocabs = this.getVocabularies();
    const existingMap = new Set(currentVocabs.map((v) => v.korean.toLowerCase().trim()));

    const validItems: VocabularyItem[] = [];
    const errors: string[] = [];
    let duplicateCount = 0;
    let invalidCount = 0;

    if (format === 'json') {
      try {
        const parsed = JSON.parse(rawContent);
        const list = Array.isArray(parsed) ? parsed : [parsed];

        list.forEach((item: any, idx: number) => {
          if (!item.korean || !item.vietnamese) {
            invalidCount++;
            errors.push(`Dòng ${idx + 1}: Thiếu từ tiếng Hàn hoặc nghĩa tiếng Việt.`);
            return;
          }

          const korean = String(item.korean).trim();
          const isDup = existingMap.has(korean.toLowerCase());
          if (isDup) {
            duplicateCount++;
          }

          validItems.push({
            id: 'imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            korean: korean,
            vietnamese: String(item.vietnamese).trim(),
            pronunciation: item.pronunciation ? String(item.pronunciation).trim() : '',
            wordType: (item.wordType || 'Danh từ') as any,
            exampleKorean: item.exampleKorean ? String(item.exampleKorean).trim() : '',
            exampleVietnamese: item.exampleVietnamese ? String(item.exampleVietnamese).trim() : '',
            categoryId: Number(item.categoryId) || 1,
            level: (item.level || 'Sơ cấp 1') as any,
            note: item.note ? String(item.note).trim() : '',
            isFavorite: !!item.isFavorite,
            isLearned: !!item.isLearned,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      } catch (err: any) {
        errors.push('Định dạng tệp JSON không hợp lệ: ' + err.message);
      }
    } else {
      // CSV parser
      const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        errors.push('Tệp CSV cần có ít nhất dòng tiêu đề và 1 dòng dữ liệu.');
      } else {
        // Skip header
        const header = lines[0].toLowerCase();
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          const korean = cols[0];
          const vietnamese = cols[1];

          if (!korean || !vietnamese) {
            invalidCount++;
            errors.push(`Dòng ${i + 1}: Không đủ thông tin từ và nghĩa.`);
            continue;
          }

          if (existingMap.has(korean.toLowerCase())) {
            duplicateCount++;
          }

          validItems.push({
            id: 'imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            korean: korean,
            vietnamese: vietnamese,
            pronunciation: cols[2] || '',
            wordType: (cols[3] || 'Danh từ') as any,
            exampleKorean: cols[4] || '',
            exampleVietnamese: cols[5] || '',
            categoryId: parseInt(cols[6], 10) || 1,
            level: (cols[7] || 'Sơ cấp 1') as any,
            note: cols[8] || '',
            isFavorite: false,
            isLearned: false,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return { validItems, duplicateCount, invalidCount, errors };
  }

  public executeImport(validItems: VocabularyItem[], overwriteDuplicates: boolean): number {
    const currentVocabs = this.getVocabularies();
    let importedCount = 0;

    if (overwriteDuplicates) {
      const vocabMap = new Map(currentVocabs.map((v) => [v.korean.toLowerCase().trim(), v]));
      validItems.forEach((item) => {
        const key = item.korean.toLowerCase().trim();
        vocabMap.set(key, item);
        importedCount++;
      });
      this.saveVocabularies(Array.from(vocabMap.values()));
    } else {
      const existingSet = new Set(currentVocabs.map((v) => v.korean.toLowerCase().trim()));
      const toAdd: VocabularyItem[] = [];
      validItems.forEach((item) => {
        if (!existingSet.has(item.korean.toLowerCase().trim())) {
          toAdd.push(item);
          existingSet.add(item.korean.toLowerCase().trim());
          importedCount++;
        }
      });
      this.saveVocabularies([...toAdd, ...currentVocabs]);
    }

    return importedCount;
  }

  public exportData(format: 'json' | 'csv', categoryIds?: number[]): void {
    let items = this.getVocabularies();
    if (categoryIds && categoryIds.length > 0) {
      items = items.filter((i) => categoryIds.includes(i.categoryId));
    }

    let fileContent = '';
    let mimeType = '';
    let fileName = `hango_vocabularies_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      fileContent = JSON.stringify(items, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      // CSV format with UTF-8 BOM
      const headers = [
        'Tiếng Hàn',
        'Nghĩa Tiếng Việt',
        'Phát Âm',
        'Loại Từ',
        'Ví Dụ Tiếng Hàn',
        'Dịch Ví Dụ',
        'Mã Chủ Đề',
        'Cấp Độ',
        'Ghi Chú',
      ];
      const rows = items.map((item) => [
        `"${item.korean.replace(/"/g, '""')}"`,
        `"${item.vietnamese.replace(/"/g, '""')}"`,
        `"${(item.pronunciation || '').replace(/"/g, '""')}"`,
        `"${item.wordType}"`,
        `"${(item.exampleKorean || '').replace(/"/g, '""')}"`,
        `"${(item.exampleVietnamese || '').replace(/"/g, '""')}"`,
        item.categoryId,
        `"${item.level}"`,
        `"${(item.note || '').replace(/"/g, '""')}"`,
      ]);

      fileContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileName += '.csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
