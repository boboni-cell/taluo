/**
 * 解读模板库 —— 重构版
 * 每张牌的解读 = 核心牌义(展开) + 位置深度解读 + 元素能量分析 + 给你的话
 */

import { type TarotCard } from '@/data/tarot-cards';
import type { TarotSpread } from '@/data/tarot-spreads';
import {
  generatePositionInsight,
  generateElementAnalysis,
  generateAdvice,
  generateActionAdvice,
  generateEnergyOverview as genEnergyOverview,
  generateNarrative as genNarrative,
  type PositionContext,
  type ElementContext,
  type AdviceContext,
  type SummaryContext,
} from './templates';

// ========== 工具函数 ==========

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

/** 从牌中取当前方向的关键词数组 */
export function getKeywords(card: TarotCard, rev: boolean): string[] {
  const raw = rev ? card.reversed : card.upright;
  if (!raw) return [];
  const cleaned = raw.replace(/[（(]阻塞[\/、]过度[\/、]内化[）)]/g, '');
  return cleaned.split(/[、，,，]/).map(k => k.trim()).filter(Boolean);
}

// ========== 核心牌义展开 ==========
export function generateCoreMeaning(card: TarotCard, rev: boolean): string {
  const meaning = rev ? card.reversedMeaning : card.uprightMeaning;
  const keywords = getKeywords(card, rev);
  const kw = keywords[0] || '当下';

  if (!meaning) return '这张牌的能量正在向你传递信息。';

  const expansions = [
    `简单来说，这张牌想告诉你的是——${kw}，是你此刻最需要关注的核心。它不是一个空洞的标签，而是精准地描摹了你正在经历的内在状态。在你的生活中，这可能体现为：某件反复萦绕在心头的事终于有了眉目、某个关系中的微妙变化让你重新思考自己的位置、或者是内心深处一种说不清的预感在催促你做出调整。${rev ? '因为是逆位，所以这份能量可能需要你先向内看——在行动之前，先确认自己真正想要的是什么。' : '正位的能量在鼓励你大胆地去回应这份召唤——不需要等所有条件都完美，现在就可以迈出第一步。'}`,
    `用更日常的话来说——${kw}，就是你最近可能隐隐约约感觉到、但还没来得及仔细想清楚的东西。它像你床头那本翻了几页但没读完的书，像你手机备忘录里那条只写了开头就停下的想法。这张牌在提醒你：是时候重新拿起它了。无论这份能量在你的工作中表现为一个需要果断处理的决策，还是在你的个人生活中表现为一个需要温柔对待的心结——${rev ? '逆位提示你，也许你一直在用"还没准备好"来拖延面对它。' : '正位在鼓励你，现在就是最好的时机。'}`,
  ];

  return `${meaning}\n\n${pick(expansions)}`;
}

// ========== 位置化深度解读 ==========
export function generateDeepPositionInsight(card: TarotCard, positionName: string, rev: boolean): string {
  const keywords = getKeywords(card, rev);
  const element = card.element || '';
  const arcanaType = card.arcana === 'major' ? '大阿卡纳' : '小阿卡纳';

  const context: PositionContext = {
    card,
    cardName: card.nameZh,
    position: positionName,
    isReversed: rev,
    keywords,
    keywordStr: keywords.join('、'),
    firstKeyword: keywords[0] || '这份能量',
    element,
    arcanaType,
  };

  return generatePositionInsight(context);
}

// ========== 元素能量分析 ==========
export function generateDeepElementAnalysis(card: TarotCard, rev: boolean): string {
  const keywords = getKeywords(card, rev);
  const context: ElementContext = {
    card,
    cardName: card.nameZh,
    isReversed: rev,
    keywords,
    keywordStr: keywords.join('、'),
    firstKeyword: keywords[0] || '这份能量',
  };

  return generateElementAnalysis(context);
}

// ========== 给你的话 ==========
export function generatePersonalAdvice(card: TarotCard, rev: boolean): string {
  const keywords = getKeywords(card, rev);
  const context: AdviceContext = {
    cardName: card.nameZh,
    isReversed: rev,
    firstKeyword: keywords[0] || '这份能量',
  };

  return generateAdvice(context);
}

// ========== 花色分析 ==========
const SUIT_LABELS: Record<string, string[]> = {
  wands: ['行动与创造的能量主导着画面', '热情和动力是本次的主旋律', '火元素的活力贯穿始终'],
  cups: ['情感和直觉的潮汐最为显著', '内心深处的声音在呼唤关注', '水元素的流动带来了丰富的感受性'],
  swords: ['思维与沟通的议题占据上风', '理性分析的锋芒清晰可见', '风元素的清澈带来了犀利的洞见'],
  pentacles: ['物质与现实的层面是关键领域', '脚踏实地是这段时间的功课', '土元素的沉稳在提醒你扎根'],
};

export function generateSuitSummary(cards: { suit?: string; arcana: string }[]): string {
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const suitCounts: Record<string, number> = {};
  for (const c of cards) { if (c.suit) suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; }
  const parts: string[] = [];
  const names: Record<string, string> = { wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币' };

  if (majorCount > 0) {
    if (majorCount >= cards.length * 0.5) {
      parts.push(`大阿卡纳占比过半（${majorCount}/${cards.length}），命运的笔触非常浓重，重大人生转折的能量正在涌动`);
    } else {
      parts.push(`大阿卡纳出现了${majorCount}张，为牌面铺上了一层命运启示的底色`);
    }
  }

  const sorted = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  for (const [suit, count] of sorted) {
    const labels = SUIT_LABELS[suit];
    parts.push(`${names[suit]}牌${count}张，${labels ? pick(labels) : ''}`);
  }

  if (sorted.length === 0 && majorCount === cards.length) {
    parts.push('牌面完全由大阿卡纳构成——这是一次纯粹的灵魂对话');
  }

  return parts.join('；') + '。';
}

// ========== 综合指引 ==========
export interface ReadingContext {
  spread: TarotSpread;
  cards: (TarotCard & { pos: number; rev: boolean; posName: string })[];
  relations: string[];
  combos: string[];
  suitAnalysis: string | null;
}

export function generateComprehensiveGuidance(ctx: ReadingContext): { intro: string; trend: string; outro: string } {
  const { spread, cards } = ctx;
  if (!cards.length) return { intro: '', trend: '', outro: '' };

  const uprightCount = cards.filter(c => !c.rev).length;
  const reversedCount = cards.length - uprightCount;
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const suitSummary = generateSuitSummary(cards);

  // 第一段：整体能量场
  const summaryCtx: SummaryContext = { spreadName: spread.nameZh, cards, uprightCount, reversedCount, majorCount, suitSummary };
  const intro = genEnergyOverview(summaryCtx);

  // 第二段：核心叙事线
  const trend = genNarrative(summaryCtx);

  // 第三段：行动指南
  const first = cards[0];
  const last = cards[cards.length - 1];
  const firstKW = getKeywords(first, first.rev)[0] || '';
  const lastKW = getKeywords(last, last.rev)[0] || '';

  const outro = generateActionAdvice({
    spreadName: spread.nameZh,
    uprightCount, reversedCount, majorCount, suitSummary,
    firstCardName: first.nameZh,
    lastCardName: last.nameZh,
    firstKW, lastKW,
  });

  return { intro, trend, outro };
}
