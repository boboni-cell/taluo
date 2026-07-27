/**
 * 塔罗解读生成器
 *
 * 原则：单牌只解释“牌义 × 牌位”，牌阵层面再统一处理花色、
 * 叙事线和行动建议，避免同一套话在每张牌下重复出现。
 */

import { type TarotCard } from '@/data/tarot-cards';
import type { TarotSpread } from '@/data/tarot-spreads';

/** 从牌中取当前方向的关键词数组 */
export function getKeywords(card: TarotCard, rev: boolean): string[] {
  const raw = rev ? card.reversed : card.upright;
  if (!raw) return [];
  const cleaned = raw.replace(/[（(]阻塞[\/、]过度[\/、]内化[）)]/g, '');
  return cleaned.split(/[、，,，]/).map(k => k.trim()).filter(Boolean);
}

/** 使用牌本身的方向牌义，不再附加随机的生活情节。 */
export function generateCoreMeaning(card: TarotCard, rev: boolean): string {
  return (rev ? card.reversedMeaning : card.uprightMeaning)
    || '这张牌提示你留意当前处境中最突出的感受、选择和变化。';
}

type PositionKind = 'past' | 'present' | 'future' | 'challenge' | 'advice' | 'external' | 'inner' | 'root' | 'general';

const SUIT_DOMAINS: Record<string, string> = {
  wands: '行动与创造',
  cups: '情感与关系',
  swords: '思考与沟通',
  pentacles: '资源与现实',
};

function getPositionKind(positionName: string): PositionKind {
  if (/过去/.test(positionName)) return 'past';
  if (/未来|结果/.test(positionName)) return 'future';
  if (/挑战|交叉/.test(positionName)) return 'challenge';
  if (/建议|行动|释放|指引/.test(positionName)) return 'advice';
  if (/环境|外部/.test(positionName)) return 'external';
  if (/意识|希望|恐惧|自我/.test(positionName)) return 'inner';
  if (/根基/.test(positionName)) return 'root';
  if (/现在|现状|当前|核心/.test(positionName)) return 'present';
  return 'general';
}

function getConcreteAction(card: TarotCard, rev: boolean): string {
  const keyword = getKeywords(card, rev)[0] || '这张牌的主题';
  if (card.arcana === 'major') {
    return `围绕“${keyword}”写下你能控制与不能控制的部分，只对前者做一个决定`;
  }

  switch (card.suit) {
    case 'wands':
      return `从“${keyword}”相关的想法中选一件，今天完成最小的第一步`;
    case 'cups':
      return `围绕“${keyword}”进行一次坦诚沟通，分别说清感受、需要和边界`;
    case 'swords':
      return `把“${keyword}”涉及的事实与猜测分成两列，再依据事实判断`;
    case 'pentacles':
      return `盘点“${keyword}”涉及的时间、金钱和现实资源，并排出下一步`;
    default:
      return `为“${keyword}”选一个本周能够完成的小动作`;
  }
}

/**
 * 把牌义放进具体牌位中。只描述牌面能支持的方向，
 * 不虚构换工作、关系变化等用户没有提供的经历。
 */
export function generateDeepPositionInsight(
  card: TarotCard,
  positionName: string,
  rev: boolean,
  positionDescription = '',
): string {
  const keywords = getKeywords(card, rev).slice(0, 2);
  const domain = card.suit ? SUIT_DOMAINS[card.suit] : '';
  const themeText = [domain, keywords.join('、')].filter(Boolean).join('中的');
  const theme = themeText ? `“${themeText}”` : '这张牌的主题';
  const direction = rev ? '逆位让这股能量表现为受阻、过度，或需要先向内处理' : '正位说明这股能量较容易被看见和运用';

  switch (getPositionKind(positionName)) {
    case 'past':
      return `在“${positionName}”位置，${card.nameZh}把${theme}指向形成当前局面的背景。${direction}；${positionName.includes('远期') ? '这更像已经内化的旧经验，需要辨认哪些观念延续到了现在' : '这段影响离现在较近，可以直接检查它改变了你最近的哪一种判断或反应'}。`;
    case 'root':
      return `作为局面的根基，${card.nameZh}说明${theme}是表面问题之下更深的一层原因。${direction}；先处理这层基础，比急着改变结果更有效。`;
    case 'present':
      return `在“${positionName}”位置，${card.nameZh}说明当前最需要看清的是${theme}。${direction}；它描述的是眼下的着力点，不是对整件事的最终判定。`;
    case 'challenge':
      return `这里的挑战集中在${theme}：${card.nameZh}既指出阻力，也提示可被调用的能力。${direction}；先确认问题来自能力不足、使用过度，还是方向不对。`;
    case 'external':
      return `在外部位置，${card.nameZh}把${theme}放在环境、规则或他人的作用上。${direction}；请把外部事实与自己的推测分开，避免替别人预设立场。`;
    case 'inner':
      return `这个位置反映你的内在视角。${card.nameZh}显示${theme}正在影响你的期待和判断；${direction}，因此需要先分清真实需要与焦虑投射。`;
    case 'advice':
      return `这张牌在“${positionName}”位置给出的重点是${theme}。${direction}；可执行的落点是：${getConcreteAction(card, rev)}。`;
    case 'future':
      return `在“${positionName}”位置，${card.nameZh}描述的是沿当前路径更可能出现的趋势：${theme}会成为${positionName.includes('结果') ? '这组牌的阶段性落点' : '下一阶段的重点'}。${direction}；它是可被选择影响的走向，不是已经写定的结果。`;
    default:
      return `结合“${positionName}”所代表的${positionDescription || '当前议题'}，${card.nameZh}把重点放在${theme}。${direction}；请用它校准下一步，而不是把它当成孤立的吉凶判断。`;
  }
}

const SUIT_NAMES: Record<string, string> = {
  wands: `权杖（${SUIT_DOMAINS.wands}）`,
  cups: `圣杯（${SUIT_DOMAINS.cups}）`,
  swords: `宝剑（${SUIT_DOMAINS.swords}）`,
  pentacles: `星币（${SUIT_DOMAINS.pentacles}）`,
};

/** 花色只在整组牌中分析一次。 */
export function generateSuitSummary(cards: { suit?: string; arcana: string }[]): string {
  const majorCount = cards.filter(card => card.arcana === 'major').length;
  const suitCounts: Record<string, number> = {};
  for (const card of cards) {
    if (card.suit) suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }

  const parts: string[] = [];
  if (majorCount) {
    const scope = majorCount >= cards.length / 2 ? '长期方向与价值选择较突出' : '日常议题中夹着一层更深的成长课题';
    parts.push(`大阿卡纳${majorCount}张，${scope}`);
  }

  const suits = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  if (suits.length) {
    parts.push(`花色分布为${suits.map(([suit, count]) => `${SUIT_NAMES[suit] || suit}${count}张`).join('、')}`);
    if (suits[0][1] > (suits[1]?.[1] || 0)) {
      parts.push(`${SUIT_NAMES[suits[0][0]] || suits[0][0]}是本组最集中的现实议题`);
    }
  }

  return parts.join('；') + (parts.length ? '。' : '');
}

export interface ReadingContext {
  spread: TarotSpread;
  cards: (TarotCard & { pos: number; rev: boolean; posName: string })[];
  relations: string[];
  combos: string[];
  suitAnalysis: string | null;
}

function cardTheme(card: TarotCard & { rev: boolean }): string {
  const keywords = getKeywords(card, card.rev).slice(0, 2).join('、');
  return `${card.nameZh}${card.rev ? '逆位' : '正位'}${keywords ? `（${keywords}）` : ''}`;
}

/** 整组牌只做一次能量统计、叙事串联和行动落点。 */
export function generateComprehensiveGuidance(ctx: ReadingContext): { intro: string; trend: string; outro: string } {
  const { spread, cards } = ctx;
  if (!cards.length) return { intro: '', trend: '', outro: '' };

  const uprightCount = cards.filter(card => !card.rev).length;
  const reversedCount = cards.length - uprightCount;
  const suitSummary = generateSuitSummary(cards);
  const balance = reversedCount > uprightCount
    ? '逆位较多，整组牌更强调尚未理顺的内在阻力；逆位不等于坏结果。'
    : uprightCount > reversedCount
      ? '正位较多，牌面给出的力量更容易落实到外在行动。'
      : '正逆位数量相当，外在推进与内在调整需要同时进行。';
  const intro = `${spread.nameZh}中有${uprightCount}张正位、${reversedCount}张逆位。${balance}${suitSummary ? `\n${suitSummary}` : ''}`;

  const first = cards[0];
  const middle = cards.length > 2 ? cards[Math.floor(cards.length / 2)] : null;
  const last = cards[cards.length - 1];
  const arc = [
    `起点“${first.posName}”由${cardTheme(first)}定调`,
    middle ? `中段“${middle.posName}”由${cardTheme(middle)}形成转折` : null,
    `落点“${last.posName}”指向${cardTheme(last)}`,
  ].filter(Boolean).join('；');
  const trend = `把牌连起来看：${arc}。重点不是逐张判断好坏，而是观察开端的主题经过中段后，如何改变了最后一张牌的表达。`;

  const adviceCard = cards.find(card => /建议|行动|释放|指引/.test(card.posName)) || last;
  const relation = ctx.combos[0] || ctx.relations[0] || ctx.suitAnalysis;
  const relationNote = relation ? `牌间最值得留意的联系是：${relation.replace(/^[^：]+：/, '')}。` : '';
  const outro = `${relationNote}行动上先落实“${adviceCard.posName}”的${adviceCard.nameZh}：${getConcreteAction(adviceCard, adviceCard.rev)}。把它当作未来一周可观察、可修正的实验，而不是宿命结论。`;

  return { intro, trend, outro };
}
