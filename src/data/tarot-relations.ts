/** 牌间关系与经典组合 */
import { type TarotCard } from './tarot-cards';

// 经典组合：使用牌名关键词匹配
const CLASSIC_COMBOS: { names: string[][]; desc: string }[] = [
  { names: [['死神'],['星星']], desc: '死神+星星：结束后的疗愈，旧篇章的终结带来新的希望' },
  { names: [['塔'],['星星']], desc: '高塔+星星：崩塌后重建，最深的绝望中孕育着最亮的星光' },
  { names: [['死神'],['审判']], desc: '死神+审判：方向重估，一个周期的结束呼唤着全新的觉醒' },
  { names: [['月亮'],['太阳']], desc: '月亮+太阳：幻象被照亮，潜意识的不安在光明中得到化解' },
  { names: [['恶魔'],['力量']], desc: '恶魔+力量：驯化阴影，直面欲望并以温柔的力量化解束缚' },
  { names: [['女祭司'],['魔术师']], desc: '女祭司+魔术师：直觉与行动校时，内在智慧指引外在行动的最佳时机' },
  { names: [['隐者'],['恋人']], desc: '隐士+恋人：独处影响连接，内省之后的相遇更具深度' },
  { names: [['皇帝'],['命运之轮']], desc: '皇帝+命运之轮：控制被变化测试，稳固的结构面临命运的转折' },
  { names: [['正义'],['命运之轮']], desc: '正义+命运之轮：选择遇到时机回响，公正的决定在恰当的时机产生涟漪' },
  { names: [['塔'],['宝剑十']], desc: '高塔+宝剑十：旧结构彻底结束，废墟之上是重建的起点' },
];

export function getClassicCombination(cards: TarotCard[]): string[] {
  const results: string[] = [];
  for (const combo of CLASSIC_COMBOS) {
    const allMatch = combo.names.every(names =>
      names.some(n => cards.some(c => c.nameZh.includes(n)))
    );
    if (allMatch) results.push(combo.desc);
  }
  return results;
}

export function getCardRelation(card1: TarotCard, card2: TarotCard): string | null {
  if (card1.arcana === 'major' && card2.arcana === 'major') {
    const sum = card1.id + card2.id;
    if (sum === 21) return `${card1.nameZh}和${card2.nameZh}像在从两个方向谈同一件事：一边想往前走，一边提醒你别跳过还没处理完的部分`;
    const stage1 = card1.id <= 7 ? 1 : card1.id <= 14 ? 2 : 3;
    const stage2 = card2.id <= 7 ? 1 : card2.id <= 14 ? 2 : 3;
    if (card1.id < card2.id) return `两张牌放在一起，事情正从${stage1===1?'确认自己要什么':stage1===2?'调整内在状态':'面对不愿承认的问题'}，走向${stage2===1?'确认自己要什么':stage2===2?'调整内在状态':'面对不愿承认的问题'}`;
    if (card1.id > card2.id) return '后面的牌把你带回了一个更早的问题；现在这件事想要往前，旧的那一关还得重新看一遍';
  }
  if (card1.suit && card2.suit && card1.suit === card2.suit && card1.number && card2.number) {
    if (card1.number < card2.number) return `${card1.nameZh}走到${card2.nameZh}，说明同一个问题正在往下一阶段发展，不再只是刚开始时的状态`;
    if (card1.number > card2.number) return `${card1.nameZh}和${card2.nameZh}的顺序在往回走，说明现在需要先补上一个被忽略的基础环节`;
  }
  const elements: Record<string,string> = { wands:'火', cups:'水', swords:'风', pentacles:'土' };
  const e1 = card1.suit ? elements[card1.suit] : '';
  const e2 = card2.suit ? elements[card2.suit] : '';
  if (e1 && e2 && e1 !== e2) {
    const pair = [e1,e2].sort().join('');
    if (pair === '风火') return '想法和行动在互相推动，进展可能很快，但别急到没想清楚就做';
    if (pair === '水土') return '感受和现实条件能够互相支持，适合稳稳推进，但也要小心因为求稳而停住';
    if (pair === '火水') return '想马上行动的冲动和心里的感受在打架，先把情绪安顿好，再决定怎么做';
    if (pair === '风土') return '脑子里想得很多，现实条件却跟不上；先解决一个最具体的限制，比继续分析更有用';
  }
  return null;
}

export function analyzeSuitDensity(cards: TarotCard[]): string | null {
  const counts: Record<string,number> = {};
  let majorCount = 0;
  for (const c of cards) {
    if (c.arcana === 'major') majorCount++;
    else if (c.suit) counts[c.suit] = (counts[c.suit] || 0) + 1;
  }
  const total = cards.length;
  if (majorCount > total * 0.5) return `这组牌里大阿卡纳很多，说明眼前的问题不只是一个小插曲，更像一次需要认真面对的转折`;
  const maxSuit = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  if (maxSuit && maxSuit[1] >= Math.max(3, total * 0.5)) {
    const names: Record<string,string> = { wands:'权杖(火)', cups:'圣杯(水)', swords:'宝剑(风)', pentacles:'星币(土)' };
    return `${names[maxSuit[0]]}出现得最多，所以这次的重点是${maxSuit[0]==='cups'?'感情、关系和真实感受':maxSuit[0]==='wands'?'要不要行动，以及怎么把力气用对地方':maxSuit[0]==='swords'?'沟通、事实和停止反复猜测':'金钱、时间、安全感和现实安排'}`;
  }
  return null;
}
