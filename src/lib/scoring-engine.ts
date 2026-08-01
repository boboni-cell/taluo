/**
 * 通用心理测试评分引擎
 * 不依赖具体测试数据，只根据配置计算得分和匹配结果。
 */

import type { TestDefinition, TestResult } from '@/data/psychological-tests';

/** 用户答案：questionId → selectedOptionId (单选/量表) 或 selectedOptionId[] (多选) */
export type UserAnswers = Record<string, string | string[]>;

/** 标准化后的维度得分 */
export type DimensionScores = Record<string, number>;

export interface ScoringResult {
  /** 标准化后的维度得分 (0-100) */
  dimensionScores: DimensionScores;
  /** 匹配到的结果类型 */
  matchedResult: TestResult;
}

/**
 * 根据用户答案和测试定义计算得分
 */
export function calculateScores(
  test: TestDefinition,
  answers: UserAnswers
): ScoringResult | null {
  // 1. 计算原始分数
  const rawScores: Record<string, number> = {};

  for (const question of test.questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null) continue;

    if (question.type === 'multiple') {
      // 多选题：遍历选中的选项
      const selected = Array.isArray(answer) ? answer : [answer];
      for (const optId of selected) {
        const option = question.options.find((o) => o.id === optId);
        if (option) {
          for (const [dim, score] of Object.entries(option.scores)) {
            rawScores[dim] = (rawScores[dim] || 0) + score;
          }
        }
      }
    } else {
      // 单选、量表、情境题
      const answerId = Array.isArray(answer) ? answer[0] : answer;
      const option = question.options.find((o) => o.id === answerId);
      if (option) {
        for (const [dim, score] of Object.entries(option.scores)) {
          rawScores[dim] = (rawScores[dim] || 0) + score;
        }
      }
    }
  }

  // 2. 标准化到 0-100
  const dimensionScores: DimensionScores = {};
  if (test.scoring.normalize) {
    for (const [dim, maxRaw] of Object.entries(test.scoring.dimensionMaxRaw)) {
      const raw = rawScores[dim] || 0;
      dimensionScores[dim] = Math.round(Math.max(0, Math.min(100, (raw / maxRaw) * 100)));
    }
  } else {
    // 不标准化则直接使用原始分数
    for (const dim of Object.keys(rawScores)) {
      dimensionScores[dim] = rawScores[dim];
    }
  }

  // 3. 匹配结果类型
  const matchedResult = matchResult(test, dimensionScores);

  if (!matchedResult) return null;

  return { dimensionScores, matchedResult };
}

/**
 * 根据维度得分匹配结果类型
 * 遍历所有 resultProfiles，找到第一个所有维度阈值都匹配的结果。
 * 如果没有任何结果完全匹配，选择匹配维度最多的那个。
 */
function matchResult(
  test: TestDefinition,
  dimensionScores: DimensionScores
): TestResult | null {
  if (test.resultProfiles.length === 0) return null;

  let bestMatch: TestResult | null = null;
  let bestMatchCount = -1;

  for (const profile of test.resultProfiles) {
    let matchCount = 0;
    let allMatch = true;

    for (const [dim, threshold] of Object.entries(profile.dimensionThresholds)) {
      const score = dimensionScores[dim];
      if (score === undefined) continue;
      if (score >= threshold.min && score <= threshold.max) {
        matchCount++;
      } else {
        allMatch = false;
      }
    }

    if (allMatch) return profile;

    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestMatch = profile;
    }
  }

  return bestMatch;
}

/**
 * 存储答题结果到 localStorage
 */
export function saveResultToStorage(slug: string, result: ScoringResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `taluo_test_result_${slug}`,
      JSON.stringify(result)
    );
  } catch { /* ignore */ }
}

/**
 * 从 localStorage 读取答题结果
 */
export function getResultFromStorage(slug: string): ScoringResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`taluo_test_result_${slug}`);
    if (!stored) return null;
    return JSON.parse(stored) as ScoringResult;
  } catch {
    return null;
  }
}

/**
 * 存储答题草稿到 localStorage
 */
export interface QuizDraft {
  currentIndex: number;
  answers: UserAnswers;
  savedAt: string;
}

export function saveDraftToStorage(slug: string, draft: QuizDraft): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`taluo_test_draft_${slug}`, JSON.stringify(draft));
  } catch { /* ignore */ }
}

/**
 * 从 localStorage 读取答题草稿
 */
export function getDraftFromStorage(slug: string): QuizDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`taluo_test_draft_${slug}`);
    if (!stored) return null;
    return JSON.parse(stored) as QuizDraft;
  } catch {
    return null;
  }
}

/**
 * 清除答题草稿
 */
export function clearDraftFromStorage(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`taluo_test_draft_${slug}`);
  } catch { /* ignore */ }
}
