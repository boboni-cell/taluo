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
    if (sum === 21) return '镜像张力：两张大阿卡纳编号之和为21，互为镜像，张力中蕴含互补的智慧';
    const stage1 = card1.id <= 7 ? 1 : card1.id <= 14 ? 2 : 3;
    const stage2 = card2.id <= 7 ? 1 : card2.id <= 14 ? 2 : 3;
    if (card1.id < card2.id) return `愚人之旅推进：${card1.nameZh}→${card2.nameZh}，经历从${stage1===1?'建立身份':stage1===2?'内在修正':'阴影整合'}到${stage2===1?'建立身份':stage2===2?'内在修正':'阴影整合'}的旅程`;
    if (card1.id > card2.id) return `愚人之旅倒序：${card1.nameZh}→${card2.nameZh}，倒退回到更早的课题重新学习`;
  }
  if (card1.suit && card2.suit && card1.suit === card2.suit && card1.number && card2.number) {
    if (card1.number < card2.number) return `同花色数字旅程：${card1.nameZh}→${card2.nameZh}，从小到大的推进，能量逐步展开`;
    if (card1.number > card2.number) return `同花色数字旅程：${card1.nameZh}→${card2.nameZh}，从大到小的重启，回到基础重新出发`;
  }
  const elements: Record<string,string> = { wands:'火', cups:'水', swords:'风', pentacles:'土' };
  const e1 = card1.suit ? elements[card1.suit] : '';
  const e2 = card2.suit ? elements[card2.suit] : '';
  if (e1 && e2 && e1 !== e2) {
    const pair = [e1,e2].sort().join('');
    if (pair === '风火') return '风火互助：思维与行动力相互激发，推进力强但可能缺乏沉淀';
    if (pair === '水土') return '水土互助：情感与现实互相滋养，稳健但需防停滞';
    if (pair === '火水') return '火水相蒸：行动力与情感相互消耗，需要找到平衡点';
    if (pair === '风土') return '风土相僵：思考与物质现实互相制约，容易陷入僵局';
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
  if (majorCount > total * 0.5) return `大阿卡纳占比超过50%（${majorCount}/${total}），重大转折正在发生，命运的力量在起作用`;
  const maxSuit = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  if (maxSuit && maxSuit[1] >= Math.max(3, total * 0.5)) {
    const names: Record<string,string> = { wands:'权杖(火)', cups:'圣杯(水)', swords:'宝剑(风)', pentacles:'星币(土)' };
    return `${names[maxSuit[0]]}花色密集（${maxSuit[1]}/${total}张），${maxSuit[0]==='cups'?'情感与关系主题突出':maxSuit[0]==='wands'?'行动与创造的能量主导':maxSuit[0]==='swords'?'思维和冲突议题凸显':'物质和实际事务为主轴'}`;
  }
  return null;
}
