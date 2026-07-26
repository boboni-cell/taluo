/**
 * 解读模板库 —— 四维透镜模型
 * 每张牌的解读 = 核心牌义 + 位置化启示 + 心理原型(大牌) + 关键词标签
 */

import { type TarotCard } from '@/data/tarot-cards';
import type { TarotSpread } from '@/data/tarot-spreads';

// ========== 工具函数 ==========

/** 从牌中取当前方向的关键词数组 */
export function getKeywords(card: TarotCard, rev: boolean): string[] {
  const raw = rev ? card.reversed : card.upright;
  if (!raw) return [];
  // 去除逆位后缀（阻塞/过度/内化）避免干扰拆分
  const cleaned = raw.replace(/[（(]阻塞[\/、]过度[\/、]内化[）)]/g, '');
  return cleaned.split(/[、，,，]/).map(k => k.trim()).filter(Boolean);
}

/** 随机取模板数组中的一项 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========== 位置化解读模板 ==========

type PositionTemplate = (cardName: string, keywords: string[], rev: boolean) => string;

const PAST_TEMPLATES: PositionTemplate[] = [
  (n, k) => `回顾过去，${n}的出现表明你曾经历过一段${k[0] || '关键'}的时期。那些经历虽然已经过去，但它们在潜移默化中塑造了你今天看待世界的方式。`,
  (n, k) => `${n}印刻着你的过往：${k[0] || '命运'}的力量曾推动你走上某条道路。理解这段历史，不是为了沉溺，而是为了看清自己从哪里来。`,
  (n, k) => `在时间的上游，${n}静静地诉说着你走过的路。${k[0] || '那段经历'}是你今天能够站在此处的基石，也是你需要感恩的来处。`,
  (n, k) => `曾经的${n}能量在你的生命中留下了痕迹。回想那段时光，${k.join('、')}的课题或许曾让你困惑，但它们都是灵魂成长的催化剂。`,
];

const PRESENT_TEMPLATES: PositionTemplate[] = [
  (n, k) => `在当下，${n}告诉你：${k[0] || '此刻'}正是你需要正视的能量。不要逃避眼前的课题，它是宇宙递给你的一封邀请函。`,
  (n, k) => `${n}是你此刻的镜子，映照出${k[0] || '你内心'}的真实状态。深呼吸，感受一下——当下的你正在与什么能量共振？`,
  (n, k) => `现在，${n}的能量正在你的生活中流动。${k.join('、')}——这些关键词不是标签，而是你此刻需要用心体会的频率。`,
  (n, k) => `当下抽到${n}绝非偶然。它精准地描摹了你正在经历的${k[0] || '情境'}，邀请你用全新的视角审视眼前的局面。`,
];

const FUTURE_TEMPLATES: PositionTemplate[] = [
  (n, k) => `展望未来，${n}暗示着一股${k[0] || '新'}的能量正在向你靠近。它不是预言，而是一份可能性——取决于你此刻的选择。`,
  (n, k) => `${n}如同一盏照亮前方的灯。未来的画卷上，${k.join('、')}的色彩正在酝酿，你拥有画笔，也拥有修改的权力。`,
  (n, k) => `在未来的地平线上，${n}隐隐浮现。它预示着${k[0] || '改变'}的契机，但不代表宿命——你的每一步行动都在重新定义结局。`,
  (n, k) => `抬头望去，${n}已经在未来等待着你。${k[0] || '这份能量'}将随着时间逐渐展开，请保持觉察，拥抱即将到来的礼物。`,
];

const CHALLENGE_TEMPLATES: PositionTemplate[] = [
  (n, k) => `你可能面临的挑战是：${k.join('、')}。${n}不是在吓唬你，而是在提醒你——提前看到墙壁，才能优雅地绕开。`,
  (n, k) => `${n}揭示了你当前课题的核心困难：${k[0] || '某种阻力'}正在考验你的决心。克服它，你的内心将变得更加强韧。`,
  (n, k) => `挑战牌${n}点出了你成长路径上的绊脚石——${k[0] || '这份考验'}看似棘手，实则是一份包装粗糙的礼物。`,
  (n, k) => `面对${n}带来的${k.join('、')}课题，请把它看作一场灵魂的模拟考试。答错无妨，重要的是你从中学会了什么。`,
];

const ADVICE_TEMPLATES: PositionTemplate[] = [
  (n, k) => `塔罗的建议是：拥抱${k[0] || '这份能量'}。${n}带来的智慧不在于避风港，而在于${k.length > 1 ? k.slice(0, 2).join('和') : k[0]}的平衡之道。`,
  (n, k) => `宇宙通过${n}给你递来了一份锦囊：${k.join('、')}。这些不是空洞的词汇，而是你可以落地实践的内功心法。`,
  (n, k) => `你的行动指南就藏在${n}之中。${k[0] || '这条建议'}看似简单，但真正做到了，你会在不觉间完成一次蜕变。`,
  (n, k) => `${n}向你轻语：${k.join('、')}。不要把它当作负担，它只是想帮你找到那条最接近你内心的路。`,
];

const CORE_TEMPLATES: PositionTemplate[] = [
  (n, k) => `问题的核心——${n}——直指${k[0] || '本质'}。围绕在表面的迷雾下，这才是你需要真正面对的灵魂议题。`,
  (n, k) => `${n}占据核心位置，它毫不客气地告诉你：${k.join('、')}才是整件事的枢纽。抓住这一点，其余自会归位。`,
];

const CROSS_TEMPLATES: PositionTemplate[] = [
  (n, k) => `${n}以交叉之力介入，它可能是你的助力，也可能是阻力——关键在于你如何看待${k[0] || '它'}。`,
  (n, k) => `交叉的${n}如同一道门槛：${k[0] || '这道能量'}横在核心之前，必须先处理好它，才能触及更深层的真相。`,
];

const ROOT_TEMPLATES: PositionTemplate[] = [
  (n, k) => `潜意识深处，${n}扎根于此。${k[0] || '这份根基'}可能源自久远的经历，它潜移默化地影响着你看待世界的方式。`,
  (n, k) => `${n}揭露了隐藏的根基——${k.join('、')}。有些东西你以为已经过去了，但它们仍在你脚下的土壤中呼吸。`,
];

const SELF_TEMPLATES: PositionTemplate[] = [
  (n, k) => `${n}映射出你当前的状态：${k.join('、')}。这是你的自我画像，也是你向世界展示的面孔。`,
  (n, k) => `你当下的自我——如${n}所示——正处在${k[0] || '某种频率'}之中。看见它、接纳它，然后才能超越它。`,
];

const ENV_TEMPLATES: PositionTemplate[] = [
  (n, k) => `环绕着你的环境中，${n}的能量正在起作用。${k.join('、')}——身边的人和事正以这样的频率影响着你。`,
  (n, k) => `${n}代表的外部环境提示：${k[0] || '周遭的力量'}不容忽视。你需要看清哪些是支持、哪些是干扰。`,
];

const HOPE_FEAR_TEMPLATES: PositionTemplate[] = [
  (n, k) => `${n}同时承载着你的渴望与恐惧：${k.join('、')}。希望和恐惧是同一枚硬币的两面，而你已经足够强大去翻转它。`,
  (n, k) => `在希望与恐惧的交界处，${n}浮现。${k[0] || '这份矛盾'}恰恰是你最真实的内心图景。`,
];

const RESULT_TEMPLATES: PositionTemplate[] = [
  (n, k) => `综合趋势指向的结局中，${n}给出了${k[0] || '方向'}。它不是定论，而是当前路径自然延伸后的一个可能站点。`,
  (n, k) => `${n}作为结果牌，暗示着${k.join('、')}的走向。如果你喜欢这个方向，继续保持；如果不，你随时可以改道。`,
];

// 位置名到模板数组的映射
const POSITION_TEMPLATE_MAP: Record<string, PositionTemplate[]> = {
  '指引': PRESENT_TEMPLATES,
  '过去': PAST_TEMPLATES,
  '现在': PRESENT_TEMPLATES,
  '未来': FUTURE_TEMPLATES,
  '现状': PRESENT_TEMPLATES,
  '挑战': CHALLENGE_TEMPLATES,
  '建议': ADVICE_TEMPLATES,
  '新月意图': [
    (n, k) => `这个周期你想种下的种子，正如${n}所喻：${k[0] || '新的意图'}正在你心中萌芽。给它阳光、给它时间，别急着看到结果。`,
    (n, k) => `${n}是你新月许愿的图腾。${k.join('、')}——让这个意图清晰地在心中成像，宇宙已经收到了你的订单。`,
    (n, k) => `在新月之夜，${n}的能量为你定下了这个周期的基调：${k[0] || '种下它'}，然后带着信任放手。`,
  ],
  '上弦行动': [
    (n, k) => `需要采取的具体行动方面，${n}鼓舞你：${k.join('、')}。上弦月的推力已经就位，现在就是动手的时机。`,
    (n, k) => `${n}给出了行动的号角：${k[0] || '迈出第一步'}，哪怕只是小小的一步。月亮在膨胀，你的行动力也是。`,
  ],
  '满月觉察': [
    (n, k) => `满月之下，${n}照亮了你需要看清的真相：${k.join('、')}。不再逃避，这份觉察本身就是最珍贵的收获。`,
    (n, k) => `${n}在满月的光辉中显现。${k[0] || '这张牌揭示的'}可能让你有些意外，但真相从来不会伤害懂得它的灵魂。`,
  ],
  '下弦释放': [
    (n, k) => `你该放下了——${n}轻声提醒。${k.join('、')}——这些旧模式曾经保护过你，但现在是时候让它们退场了。`,
    (n, k) => `${n}指向你需要释放的包袱：${k[0] || '放手'}。下弦月告诉你，舍弃不是失去，是为新的可能腾出空间。`,
  ],
  '远期过去': PAST_TEMPLATES,
  '近期过去': PAST_TEMPLATES,
  '当前状态': PRESENT_TEMPLATES,
  '近期未来': FUTURE_TEMPLATES,
  '外部影响': ENV_TEMPLATES,
  '可能结果': RESULT_TEMPLATES,
  '核心': CORE_TEMPLATES,
  '交叉': CROSS_TEMPLATES,
  '意识目标': [
    (n, k) => `你意识层面正在追求的目标，${n}看得一清二楚：${k.join('、')}。这是你清醒的渴望，也是你行动的方向。`,
    (n, k) => `${n}袒露了你心中所想：${k[0] || '这份目标'}是真诚的，还是社会期待的内化？请诚实地问问自己。`,
  ],
  '根基': ROOT_TEMPLATES,
  '自我': SELF_TEMPLATES,
  '环境': ENV_TEMPLATES,
  '希望与恐惧': HOPE_FEAR_TEMPLATES,
  '结果': RESULT_TEMPLATES,
};

/** 根据位置名生成位置化解读 */
export function generatePositionInsight(card: TarotCard, positionName: string, rev: boolean): string {
  const keywords = getKeywords(card, rev);
  const templates = POSITION_TEMPLATE_MAP[positionName];
  if (!templates) {
    // 未匹配到的位置，用通用模板
    const k = keywords[0] || '这份能量';
    return pick([
      `${card.nameZh}在「${positionName}」这个位置，为你带来了关于${k}的启示。静心感受这张牌想传递给你的讯息。`,
      `在「${positionName}」的位置上，${card.nameZh}提醒你关注${k}的课题。答案不在牌面，而在你与它的共振之中。`,
    ]);
  }
  return pick(templates)(card.nameZh, keywords, rev);
}

// ========== 综合指引模板 ==========

const GUIDANCE_INTROS: ((spreadName: string, count: number, majorCount: number, suitSummary: string) => string)[] = [
  (s, n, m, suit) => `本次${s}占卜共抽取了${n}张牌，其中大阿卡纳${m}张${suit ? '，' + suit : ''}。整体能量如一面多棱镜，折射出你当下生命画卷的不同切面。`,
  (s, n, m, suit) => `${n}张牌在${s}中徐徐展开${suit ? '，' + suit : ''}。它们各自承载着独特的频率，合在一起却诉说着同一个故事——你的故事。`,
  (s, n, m, suit) => `${s}为你召唤了${n}位使者，其中${m}位来自大阿卡纳的殿堂${suit ? '，' + suit : ''}。每一张牌都是一面镜子，请准备好凝视自己。`,
  (s, n, m, suit) => `这${n}张牌组成了一幅能量拼图${suit ? '——' + suit : ''}。让我帮你把这些碎片拼接起来，看看宇宙为你准备了怎样的画卷。`,
  (s, n, m, suit) => `${s}的${n}张牌已经就位${suit ? '，' + suit : ''}。解读牌面如同解读梦境——需要理性，更需要感受力。让我们一起进入这个空间。`,
];

const GUIDANCE_TRENDS: ((first: TarotCard & { rev: boolean }, last: TarotCard & { rev: boolean }, firstPos: string, lastPos: string) => string)[] = [
  (f, l, fp, lp) => `从「${fp}」的${f.nameZh}到「${lp}」的${l.nameZh}，牌面呈现出一条${f.rev === l.rev ? '呼应与深化的' : '转折与蜕变的'}脉络。${f.rev && !l.rev ? '逆位开局走向正位收官，说明前半程的阻滞正在被你慢慢解开。' : !f.rev && l.rev ? '正位起势却以逆位收束，提示你在前进中可能需要调整某些策略。' : '正逆位的一致性，说明当下的能量流动有着清晰的指向性。'}`,
  (f, l, fp, lp) => `「${fp}」${f.nameZh}为起点，「${lp}」${l.nameZh}为终点，两张牌之间的张力构成了你这趟占卜之旅的弧线。${f.arcana === 'major' && l.arcana === 'major' ? '两端都是大阿卡纳，说明这绝非一次普通的心灵巡礼。' : f.arcana === 'major' ? '旅程以大阿卡纳开启，意味着起点有命运之手的直接参与。' : l.arcana === 'major' ? '终点是大阿卡纳，无论中间经历了什么，最终会迎来一次灵魂级别的升华。' : '小阿卡纳的起止，将焦点牢牢锁定在日常生活的具体课题上。'}`,
  (f, l, fp, lp) => `从${f.nameZh}到${l.nameZh}的弧线中，${f.rev !== l.rev ? '你能感受到一次清晰的心境转身。' : '有着同频共振的和谐感。'}${fp}与${lp}遥相呼应，构成了一组完整的心灵对话。`,
];

const GUIDANCE_OUTROS: (() => string)[] = [
  () => `亲爱的朋友，塔罗从来不是命运的判决书，它只是帮你把内心的声音放大到可以听见。答案一直在你心里，我只是帮你擦了擦镜子。`,
  () => `带着这些启示回到生活中吧。不需要强迫自己马上改变什么，保持觉察就好——觉察本身就是最深刻的转变。`,
  () => `牌面已经说完它的话，剩下的交给你。你比任何一张牌都更了解自己的路。记住：你拥有塑造命运的全部力量。`,
  () => `深吸一口气，把这些讯息轻轻收进心里。不要过度分析，也不要急于印证。让它们在时间中自然发酵，你会发现其中的智慧比今天理解的更多。`,
  () => `无论牌面带来了什么讯息，请相信生命正在以一种你暂时看不清的方式为你铺路。你并不孤单，整个宇宙都在支持着你的成长。`,
];

// ========== 花色分析辅助文案 ==========

const SUIT_LABELS: Record<string, string[]> = {
  wands: ['行动与创造的能量主导着画面', '热情和动力是本次的主旋律', '火元素的活力贯穿始终'],
  cups: ['情感和直觉的潮汐最为显著', '内心深处的声音在呼唤关注', '水元素的流动带来了丰富的感受性'],
  swords: ['思维与沟通的议题占据上风', '理性分析的锋芒清晰可见', '风元素的清澈带来了犀利的洞见'],
  pentacles: ['物质与现实的层面是关键领域', '脚踏实地是这段时间的功课', '土元素的沉稳在提醒你扎根'],
};

/** 生成花色分布的总结文案 */
export function generateSuitSummary(cards: { suit?: string; arcana: string }[]): string {
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const suitCounts: Record<string, number> = {};
  for (const c of cards) {
    if (c.suit) suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  }
  const parts: string[] = [];

  // 总牌数较少的情况
  if (cards.length <= 3) {
    if (majorCount > 0) parts.push(`大阿卡纳出现了${majorCount}张`);
    const sorted = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
    for (const [suit, count] of sorted) {
      const names: Record<string, string> = { wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币' };
      parts.push(`${names[suit]}${count}张`);
    }
    const theme = majorCount >= cards.length * 0.5
      ? '命运的笔触非常浓重，说明当前正处在人生的重要节点'
      : sorted.length > 0 && sorted[0][1] > 1
        ? `${SUIT_LABELS[sorted[0][0]] ? pick(SUIT_LABELS[sorted[0][0]]) : ''}（${sorted[0][1]}张）`
        : '牌面花色均衡，能量在各层面均匀分布，说明当前的课题是综合性的而非单一维度';
    return parts.join('、') + '。' + theme;
  }

  // 多牌情况
  if (majorCount > 0) {
    if (majorCount >= cards.length * 0.5) {
      parts.push(`大阿卡纳占比过半（${majorCount}/${cards.length}），命运的浪潮正在涌动，重大人生转折的能量非常强烈`);
    } else {
      parts.push(`大阿卡纳${majorCount}张，为整体铺上了一层命运启示的底色`);
    }
  }

  const sorted = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  for (const [suit, count] of sorted) {
    const names: Record<string, string> = { wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币' };
    const labels = SUIT_LABELS[suit];
    const label = labels ? pick(labels) : '';
    parts.push(`${names[suit]}牌${count}张，${label}`);
  }

  if (sorted.length === 0) {
    parts.push('牌面完全由大阿卡纳构成，这是一次灵魂层面的深度对话');
  }

  return parts.join('；') + '。';
}

// ========== 综合入口 ==========

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
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  const suitSummary = generateSuitSummary(cards);

  const first = cards[0];
  const last = cards[cards.length - 1];
  const firstPos = spread.positions[first.pos]?.nameZh || '';
  const lastPos = spread.positions[last.pos]?.nameZh || '';

  const intro = pick(GUIDANCE_INTROS)(spread.nameZh, cards.length, majorCount, suitSummary);
  const trend = cards.length >= 2
    ? pick(GUIDANCE_TRENDS)(first, last, firstPos, lastPos)
    : '';
  const outro = pick(GUIDANCE_OUTROS)();

  return { intro, trend, outro };
}
