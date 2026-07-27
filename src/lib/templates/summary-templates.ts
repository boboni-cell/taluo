/**
 * 综合指引模板 — 三段式深度总结（至少 300 字）
 */

import type { TarotCard } from '@/data/tarot-cards';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export interface SummaryContext {
  spreadName: string;
  cards: (TarotCard & { pos: number; rev: boolean; posName: string })[];
  uprightCount: number;
  reversedCount: number;
  majorCount: number;
  suitSummary: string;
}

// ====== 第一段：整体能量场 ======
export function generateEnergyOverview(ctx: SummaryContext): string {
  const { spreadName, cards, uprightCount, reversedCount, majorCount, suitSummary } = ctx;
  const total = cards.length;

  const urJudgment = uprightCount > reversedCount
    ? '整体来看，正位牌的比重更大，说明你当下的能量场是向外扩展的——你的行动力、表达欲和对外界的影响力都处于一个相对积极的状态。'
    : reversedCount > uprightCount
      ? '逆位牌偏多，提示你的注意力可能需要从外部世界稍微收回来一些，更多关注内在的感受和反思。这不是坏事——有时候，退后一步反而能看清楚全局。'
      : '正逆位牌的分布非常均衡，就像呼吸一样一进一出。这意味着你正在经历一个动态平衡的阶段——外在行动和内在感受之间有一种微妙的和谐。';

  const majorNote = majorCount > 0
    ? (majorCount >= total * 0.5
      ? `尤其值得注意的是，${majorCount}张大阿卡纳的出现，为这次占卜注入了浓重的命运感——你面对的不只是日常的选择，而是对人生方向有深远影响的课题。`
      : `${majorCount}张大阿卡纳的出现，为日常的议题增添了一层深意——有些看似琐碎的事，其实都关联着更大的生命主题。`)
    : '';

  return `这次${spreadName}共抽取了${total}张牌，其中${uprightCount}张正位、${reversedCount}张逆位。${urJudgment}\n\n${suitSummary}${majorNote ? '\n\n' + majorNote : ''}`;
}

// ====== 第二段：核心叙事线 ======
export function generateNarrative(ctx: SummaryContext): string {
  const { cards } = ctx;
  if (cards.length < 2) return '';

  const mapped = cards.map(c => ({
    name: c.nameZh,
    pos: c.posName,
    rev: c.rev,
    kw: c.rev ? c.reversed : c.upright,
  }));

  const first = mapped[0];
  const last = mapped[mapped.length - 1];
  const middle = mapped.slice(1, -1);

  const storyParts = mapped.map((c, i) => {
    const arrow = i < mapped.length - 1 ? ' → ' : '';
    return `${c.pos}${c.rev ? '(逆)' : ''}的${c.name}${arrow}`;
  }).join('');

  const middleKW = middle.map(m => m.kw.split('、')[0] || '').filter(Boolean).join('、');
  const trend = first.rev === last.rev
    ? '在这条时间线上，开端和收束的能量有着某种一致的频率——这说明整件事有一个清晰的内在逻辑。'
    : '这条线索呈现出一种从变化到整合的趋势——开始和结束的能量不尽相同，中间经历了重要的转折。';

  return `从「${first.pos}」的${first.name}开始——${first.kw ? first.kw.split('、')[0] + '是故事的起点' : '故事拉开了序幕'}，它奠定了整条叙事线的基调。${middle.length > 0 ? `中间经过${middleKW ? `${middleKW}等能量的层层推进` : '几张牌的层层推进'}，` : ''}最终走到「${last.pos}」的${last.name}——${last.kw ? last.kw.split('、')[0] + '收束了整条线索' : '画上了一个意味深长的句号'}。\n\n${trend}\n\n你的故事线大概是这样的：${storyParts}。把这条线连起来看，你会发现每一张牌都不是孤立的——它们像多米诺骨牌一样，一张推动着下一张。`;
}

// ====== 第三段：行动指南（委托给 advice-templates） ======
// 实际在 reading-templates.ts 中调用 generateActionAdvice
