/**
 * 塔罗解读生成器
 *
 * 单牌沿着“画面象征 → 情绪承接 → 牌位意义”展开；牌阵层面再处理
 * 元素、牌间关系和行动建议。输出保持确定性，避免刷新后换一套万能话术。
 */

import { type TarotCard } from '@/data/tarot-cards';
import type { TarotSpread } from '@/data/tarot-spreads';

interface DirectionalKeywords {
  upright: string;
  reversed: string;
}

const MINOR_KEYWORDS: Record<string, Record<number, DirectionalKeywords>> = {
  wands: {
    1: { upright: '灵感火花、行动意愿、新开始', reversed: '精力不足、热情消退、延迟' },
    2: { upright: '规划、远见、开拓', reversed: '害怕改变、犹豫、计划不足' },
    3: { upright: '扩展、远行、等待成果', reversed: '受阻、延误、视野受限' },
    4: { upright: '庆祝、归属、阶段成果', reversed: '支持不足、短暂失衡、内部不安' },
    5: { upright: '竞争、磨合、观点碰撞', reversed: '回避冲突、内耗、求同存异' },
    6: { upright: '胜利、认可、进展', reversed: '自负、未获认可、信心受挫' },
    7: { upright: '守住立场、韧性、迎战', reversed: '不堪重负、动摇、放弃防守' },
    8: { upright: '快速推进、消息、时机', reversed: '混乱、延迟、被迫减速' },
    9: { upright: '最后坚持、警觉、韧性', reversed: '耗竭、多疑、失去支撑' },
    10: { upright: '责任、重担、压力', reversed: '难以放手、过劳、卸下负担' },
    11: { upright: '探索、好消息、自由热情', reversed: '缺乏方向、拖延、虚张声势' },
    12: { upright: '大胆行动、追求、冒险', reversed: '鲁莽、急躁、能量分散' },
    13: { upright: '自信、魅力、热情领导', reversed: '不安全感、嫉妒、控制欲' },
    14: { upright: '远见、领导、成熟行动力', reversed: '专横、冲动、不切实际' },
  },
  cups: {
    1: { upright: '情感开启、直觉、爱意流动', reversed: '情感枯竭、压抑、创造受阻' },
    2: { upright: '连结、互相吸引、平等关系', reversed: '失衡、沟通断裂、关系紧张' },
    3: { upright: '友谊、庆祝、共同支持', reversed: '过度放纵、流言、孤立' },
    4: { upright: '倦怠、沉思、看不见机会', reversed: '重新苏醒、接纳、愿意参与' },
    5: { upright: '失落、遗憾、哀伤', reversed: '接受现实、疗愈、重新前行' },
    6: { upright: '怀旧、善意、旧日连结', reversed: '告别过去、活在当下、成长' },
    7: { upright: '幻想、诱惑、选择过多', reversed: '聚焦、看清现实、停止逃避' },
    8: { upright: '离开、寻找意义、情感转身', reversed: '害怕离开、依恋、反复犹豫' },
    9: { upright: '满足、愿望实现、享受成果', reversed: '内在空虚、贪求、表面满足' },
    10: { upright: '家庭和谐、情感圆满、归属', reversed: '关系失和、期待破裂、疏离' },
    11: { upright: '感性消息、想象力、温柔好奇', reversed: '情绪不成熟、失望、缺乏安全感' },
    12: { upright: '浪漫追寻、理想、跟随内心', reversed: '情绪淹没、幻想破灭、不切实际' },
    13: { upright: '共情、直觉、情感智慧', reversed: '自我牺牲、依赖、边界模糊' },
    14: { upright: '情绪稳定、包容、温和领导', reversed: '情绪操控、冷淡、反复无常' },
  },
  swords: {
    1: { upright: '真相、突破、清晰判断', reversed: '混乱、思维阻塞、错误判断' },
    2: { upright: '艰难选择、僵持、暂时平衡', reversed: '信息过载、逃避、被迫决定' },
    3: { upright: '心痛、分离、正视伤口', reversed: '疗愈、原谅、逐渐放下' },
    4: { upright: '休息、恢复、安静整理', reversed: '焦躁、被迫行动、无法休息' },
    5: { upright: '代价高昂的胜利、冲突、强硬', reversed: '余怨、和解、退出争斗' },
    6: { upright: '过渡、离开风暴、逐渐平静', reversed: '旧包袱、未解决、困在原地' },
    7: { upright: '策略、隐藏意图、绕行', reversed: '坦白、重新思考、良心不安' },
    8: { upright: '自我束缚、受困、视野受限', reversed: '松绑、新视角、重获自由' },
    9: { upright: '焦虑、失眠、过度担忧', reversed: '希望回归、求助、走出阴影' },
    10: { upright: '痛苦终点、触底、周期结束', reversed: '开始复原、否极泰来、重新站起' },
    11: { upright: '敏锐、求知、观察消息', reversed: '空谈、误导、尖刻沟通' },
    12: { upright: '果断、直接、快速推进', reversed: '粗暴、缺乏共情、鲁莽' },
    13: { upright: '独立、清醒、坦率智慧', reversed: '冷漠、苛责、压抑感受' },
    14: { upright: '理性、公正、思想权威', reversed: '滥用权力、冷酷、僵化判断' },
  },
  pentacles: {
    1: { upright: '现实机会、丰盛种子、落地', reversed: '错失机会、准备不足、贪求' },
    2: { upright: '调度、适应、保持平衡', reversed: '失衡、承担过多、顾此失彼' },
    3: { upright: '合作、技艺、共同建造', reversed: '配合不足、敷衍、品质下降' },
    4: { upright: '安全感、积累、守住资源', reversed: '囤积、物质执着、控制' },
    5: { upright: '匮乏、失去支持、不安全感', reversed: '复苏、获得帮助、走出困难' },
    6: { upright: '给予与接受、慷慨、公平交换', reversed: '债务、单向付出、附带条件' },
    7: { upright: '耐心投入、评估、等待收成', reversed: '回报有限、急于求成、缺乏远见' },
    8: { upright: '打磨技艺、专注、长期练习', reversed: '失去专注、完美主义、机械重复' },
    9: { upright: '独立、丰足、享受成果', reversed: '物质依赖、不安全感、孤立' },
    10: { upright: '传承、长期稳定、共同财富', reversed: '财务失稳、内部纷争、缺乏归属' },
    11: { upright: '务实学习、机会萌芽、认真投入', reversed: '进展迟缓、拖延、不切实际' },
    12: { upright: '可靠、勤勉、稳步推进', reversed: '停滞、乏味、过度保守' },
    13: { upright: '照料、现实安全、丰足生活', reversed: '忽略自己、过度付出、不安全感' },
    14: { upright: '稳定丰盛、纪律、资源领导力', reversed: '贪婪、控制、被财富定义' },
  },
};

/** 从牌中取符合 RWS 体系、当前方向的关键词。 */
export function getKeywords(card: TarotCard, rev: boolean): string[] {
  const standard = card.suit && card.number ? MINOR_KEYWORDS[card.suit]?.[card.number] : null;
  const raw = standard ? (rev ? standard.reversed : standard.upright) : (rev ? card.reversed : card.upright);
  return raw.split(/[、，,]/).map(keyword => keyword.trim()).filter(Boolean);
}

const MAJOR_SYMBOLISM: Record<number, string> = {
  0: '愚者站在崖边，脚下是未知，身旁的小狗像本能一样提醒着他；他带的行李很少，因为新的旅程容不下太多旧重量。',
  1: '魔术师一手指天、一手指地，桌上四种牌组工具齐备；灵感只有落到手中，才会真正成为现实。',
  2: '女祭司静坐在黑白两根柱子之间，身后的帷幕遮住尚未显形的答案；这是一张要求安静倾听的牌。',
  3: '皇后坐在丰茂的麦田与树林中，柔软并不等于软弱，她让被照料的事物有空间自然生长。',
  4: '皇帝坐在坚硬的石座上，身后的山脉稳固而克制；他的力量来自边界、秩序和承担。',
  5: '教皇端坐在仪式中央，两位求学者在他面前聆听；画面谈的是传统、传承，以及你如何面对既有规则。',
  6: '恋人牌中的两个人站在天使之下，彼此看见，也面对选择；真正的结合始于价值观的一致。',
  7: '战车前的两只斯芬克斯望向不同方向，驾车者必须让相反的力量朝同一条路前进。',
  8: '力量牌里的人没有制服狮子，而是温柔地合上它的嘴；真正的勇气，是能够靠近自己的恐惧而不被吞没。',
  9: '隐者独自站在雪山上，手里的灯只能照亮下一小步；有些答案必须离开人群的声音才能听见。',
  10: '命运之轮持续转动，没有人永远停在最高或最低处；这张牌让人看见周期，也看见顺势调整的时机。',
  11: '正义一手持剑、一手托秤，既要看清事实，也要承担选择带来的结果。',
  12: '倒吊人自愿倒悬，头边却有明亮的光；暂停不是惩罚，而是让旧视角松动的一段空白。',
  13: '死神骑着白马缓缓前行，远处的太阳仍在升起；画面说的不是字面死亡，而是旧章节退场后不可阻挡的更替。',
  14: '节制天使把水在两只杯子之间缓慢调和，一只脚在水中、一只脚在岸上；疗愈来自不偏不倚的流动。',
  15: '恶魔脚下的人被松松的锁链系住，只要愿意看见就能取下；最难挣脱的束缚，往往先存在于习惯和欲望里。',
  16: '闪电击中高塔，王冠与旧结构一起坠落；它令人不安，却也把建立在虚假地基上的东西照得无处可藏。',
  17: '星星下的人把水倒回河流与土地，经历高塔之后，疗愈不是喧闹的胜利，而是愿意再次相信生命。',
  18: '月光下有两条路延伸进远方，狗与狼同时对月低鸣；直觉和恐惧在半明半暗里很容易被混淆。',
  19: '太阳照着骑白马的孩子，向日葵在身后盛开；这是无需隐藏、能够坦然感受生命力的画面。',
  20: '审判的号角响起，人们从棺木中抬起双手；这不是外界裁决，而是内在终于愿意回应自己的召唤。',
  21: '世界牌中的舞者站在花环中央，四方守护者见证一段旅程的完成；圆满不是停止，而是带着整合后的自己进入下一圈。',
};

const SPECIAL_MINOR_SYMBOLISM: Record<number, string> = {
  22: '云中伸出的手托起一根发芽的权杖，尚未成形的火花已经有了生命；这是“我想开始”的最初一瞬。',
  31: '一个人抱着十根沉重的权杖走向城镇，终点已经不远，但肩上的重量也到了无法忽视的程度。',
  34: '权杖皇后身旁有向日葵与黑猫，她的火焰温暖、笃定，也懂得让别人因她的存在而亮起来。',
  39: '圣杯四的人抱臂坐在树下，云中递来的杯子就在眼前，他却还沉浸在自己的情绪里。',
  40: '圣杯五的人低头看着三只倾倒的杯子，却暂时没有发现身后仍有两杯完好；失去是真的，却不是全部。',
  43: '一个人在月色中离开已经整齐摆好的八只杯子；不是因为毫无留恋，而是内心知道还要寻找更深的东西。',
  52: '三把剑刺入雨中的心，画面没有回避疼痛；能够为伤口命名，本身就是疗愈的开始。',
  57: '蒙眼的人被松散的绳索围在剑阵中，脚下其实仍有路；困住她的边界，有一部分来自看不见出口的念头。',
  59: '十把剑已经落下，远处天际却出现第一线晨光；最痛的阶段被承认之后，转折才真正有地方发生。',
  68: '两个人在寒夜经过亮着灯的教堂，却没有走进去；匮乏有时会让人看不见其实已经靠近的帮助。',
  71: '工匠俯身雕刻一枚又一枚星币，完成的作品挂在身后；专注不是重复，而是每一次都比上一次更靠近成熟。',
  77: '星币国王坐在葡萄藤与累积的财富之间，神情并不急切；真正的丰足来自长期纪律，而不是占有本身。',
};

const SUIT_SYMBOLS: Record<string, string> = {
  wands: '权杖承载火元素，谈的是欲望、勇气与“我是否愿意行动”',
  cups: '圣杯承载水元素，盛放感受、关系，以及那些不容易被直接说出的需要',
  swords: '宝剑承载风元素，切开想象与事实，也会让反复思考的痛感变得清晰',
  pentacles: '星币承载土元素，把问题带回身体、金钱、时间和真正能够握住的生活',
};

const RANK_SYMBOLS: Record<number, string> = {
  1: '王牌是一颗刚落到手中的种子，潜力很真，但仍需要被接住',
  2: '数字二让两股力量彼此照见，选择与关系由此出现',
  3: '数字三让最初的想法开始长出形状，并邀请他人参与',
  4: '数字四试图建立稳定，也会检验这种稳定是否已经变成停滞',
  5: '数字五打破原有平衡，让冲突迫使真实问题浮出水面',
  6: '数字六寻找重新流动的方式，让失衡有机会被修复',
  7: '数字七把人带到考验前，要求重新评估坚持的理由',
  8: '数字八带来推进与熟练，也提醒节奏过快时容易失去感受',
  9: '数字九已经接近完成，累积的力量与疲惫会同时显现',
  10: '数字十走到周期尽头，完成、负担与下一轮转化彼此相连',
  11: '侍从像刚收到讯息的学习者，好奇心比成熟答案更重要',
  12: '骑士把花色的力量带上路，追求会成为动力，也可能走向极端',
  13: '皇后把力量收进内在，以感受、照料和成熟承接它',
  14: '国王把力量带到外部世界，考验如何负责地掌控与运用',
};

function getCardSymbolism(card: TarotCard): string {
  if (card.arcana === 'major') return MAJOR_SYMBOLISM[card.id] || '';
  if (SPECIAL_MINOR_SYMBOLISM[card.id]) return SPECIAL_MINOR_SYMBOLISM[card.id];
  const suit = card.suit ? SUIT_SYMBOLS[card.suit] : '';
  const rank = card.number ? RANK_SYMBOLS[card.number] : '';
  return [suit, rank].filter(Boolean).join('；') + '。';
}

const SPECIAL_MEANINGS: Record<number, Partial<Record<'upright' | 'reversed', string>>> = {
  13: {
    upright: '死神象征一个阶段已经完成它的使命。结束当然会带来失落，但它同时为新的身份、关系或生活方式腾出了位置。',
    reversed: '必要的转变正在被延后。你或周围的人也许还舍不得熟悉的状态；这不是软弱，只是告别需要时间，也需要一个足够安全的出口。',
  },
  15: {
    upright: '恶魔让依恋、执念或不平等的交换浮到明面。看见自己被什么吸引、又被什么困住，不是为了责备，而是为了取回选择。',
    reversed: '锁链已经开始松动。你正在辨认那些不再适合自己的习惯与关系，真正的自由会从一次诚实的“不再继续”开始。',
  },
  16: {
    upright: '高塔象征旧结构无法继续维持，真相因此突然显露。变化可能令人不安，但被清理的是已经失去支撑的部分，不是你全部的人生。',
    reversed: '变化的冲击被延后或转入内部，你可能已经觉察到哪里不稳，却还在等待更合适的处理时机。牌面鼓励的是主动修补，而不是恐惧灾难。',
  },
  37: {
    upright: '圣杯二讲的是彼此看见与平等回应。无论它指向爱情、友谊还是合作，真正珍贵的都不是表面一致，而是双方都愿意把真实的自己带进关系。',
    reversed: '两只杯子之间的流动出现了偏差，可能是话没有说开，也可能是一方付出得更多。它没有直接否定这段连结，而是请双方重新确认需要、边界与诚意。',
  },
  59: {
    upright: '宝剑十承认一个过程已经痛到无法再照旧继续。终点有时并不体面，但当最坏的一刻被看见，新的清晨也就有了入口。',
    reversed: '最艰难的部分正在松动，你开始从曾经压倒自己的经历里重新站起来。伤痕还在并不代表没有好转，复原本来就不是一夜之间完成的。',
  },
  76: {
    upright: '星币皇后把温暖变成可以触摸的照料：一顿饭、稳定的安排、可靠的陪伴。她提醒你，真正的丰足是自己与身边的人都能被妥善安放。',
    reversed: '照顾现实与他人的力量失去了平衡。你可能为了维持安全感而抓得太紧，也可能照料别人太久，忘记自己同样需要休息、支持与被照顾。',
  },
};

function softenDomainLanguage(meaning: string): string {
  return meaning
    .replace(/职场关系/g, '关系')
    .replace(/职场中/g, '关系与现实中')
    .replace(/职场/g, '现实环境')
    .replace(/事业上/g, '眼前的事情上')
    .replace(/事业中/g, '生活中')
    .replace(/事业/g, '生活方向')
    .replace(/职业生涯/g, '长期发展')
    .replace(/职业方向/g, '人生方向')
    .replace(/职业/g, '人生方向')
    .replace(/工作与生活/g, '外在责任与内在需要')
    .replace(/工作中/g, '现实中')
    .replace(/工作的/g, '日常的')
    .replace(/工作/g, '现实事务')
    .replace(/团队像家人一样/g, '关系中有真诚的归属感')
    .replace(/团队合作/g, '共同协作')
    .replace(/团队/g, '身边的人')
    .replace(/领导或同事/g, '身边的人')
    .replace(/项目/g, '计划')
    .replace(/职位/g, '位置')
    .replace(/加薪或晋升/g, '更稳定的回报');
}

/** 供结果页和 AI 对话共同使用，避免牌义被限定在单一生活领域。 */
export function getCardMeaning(card: TarotCard, rev: boolean): string {
  const direction = rev ? 'reversed' : 'upright';
  const special = SPECIAL_MEANINGS[card.id]?.[direction];
  const original = rev ? card.reversedMeaning : card.uprightMeaning;
  return softenDomainLanguage(special || original || '这张牌邀请你留意当前处境中最突出的感受与变化。');
}

type ReversalMode = 'excess' | 'internalized' | 'blocked';

function getReversalMode(card: TarotCard): ReversalMode {
  const meaning = card.reversedMeaning || '';
  if (/过度|太过|控制|冲动|贪婪|自负|独裁|强势|极端/.test(meaning)) {
    return 'excess';
  }
  if (/内心|自我|直觉|情感|焦虑|恐惧|信心/.test(meaning)) {
    return 'internalized';
  }
  return 'blocked';
}

function getDirection(card: TarotCard, rev: boolean): string {
  if (!rev) return '正位让这股力量自然地向外流动，你也更容易看见它正在怎样影响现实';
  switch (getReversalMode(card)) {
    case 'excess': return '逆位让原本有帮助的力量用得太满，保护、坚持或掌控因此逐渐变成压力';
    case 'internalized': return '逆位把变化带进了内心；外面未必已经显露，你的感受却先一步知道事情正在改变';
    case 'blocked': return '逆位说明这股力量暂时被卡住了；它不是失败，而是在等待阻力被真正看见';
  }
}

function getEmotionalBridge(card: TarotCard, rev: boolean): string {
  if (card.id === 13) {
    return '如果这张牌让你紧张，先不用害怕。它触碰的是人面对改变时很真实的舍不得：明知一段状态已经走到尽头，却还没有准备好面对空出来的位置。';
  }
  if (card.id === 16) {
    return '它承认失去稳定感会让人不安，也承认你可能已经很努力地维持局面。牌面邀请你问的不是“会不会崩塌”，而是“什么已经无法再支撑我”。';
  }
  if (card.id === 15) {
    return '这张牌不责怪你的依恋。人会抓住熟悉的东西，往往是因为它曾经提供过安全感；看见锁链，才有可能温柔而清醒地松开它。';
  }
  if (card.id === 59) {
    return '这张牌不会轻描淡写你已经承受的疲惫。它只是把微弱的晨光也放进画面里：到了最低处，并不等于故事只能停在那里。';
  }

  const themes = getKeywords(card, rev).slice(0, 2).join('、');
  if (card.arcana === 'major') {
    return `大阿卡纳往往触及的不是一件小事，而是你正在经历的内在阶段。读到“${themes}”时，先留意身体和情绪的第一反应——那通常比急着判断吉凶更接近这张牌与你的连接。`;
  }

  switch (card.suit) {
    case 'wands':
      return `它触碰的是那种心里有火、却还要决定如何用力的时刻。感受一下“${themes}”在你身上更像热情，还是已经变成了压力。`;
    case 'cups':
      return `这张牌先接住感受，不急着替你判断对错。“${themes}”背后也许藏着一个还没有被好好说出口的需要。`;
    case 'swords':
      return `如果你最近一直在脑中反复推演，这张牌理解那种想把事情彻底想明白的疲惫。“${themes}”提醒你，清醒不等于必须对自己苛刻。`;
    case 'pentacles':
      return `它关心的是你真正赖以生活的东西：安全感、身体、时间与资源。“${themes}”并不抽象，它会落在你每天怎样照顾自己、怎样安排现实上。`;
    default:
      return `这张牌邀请你慢一点感受“${themes}”，看看它在现实生活中最像哪一种正在发生的体验。`;
  }
}

/** 以牌面意象开场，再承接牌义和真实感受。 */
export function generateCoreMeaning(card: TarotCard, rev: boolean): string {
  const symbolism = getCardSymbolism(card);
  const meaning = getCardMeaning(card, rev);
  return `${symbolism}\n\n${meaning}\n\n${getEmotionalBridge(card, rev)}`;
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
  if (card.arcana === 'major') return `围绕“${keyword}”写下你能控制与不能控制的部分，只对前者做一个决定`;
  switch (card.suit) {
    case 'wands': return `从“${keyword}”相关的想法里选一件，完成最小但真实的第一步`;
    case 'cups': return `围绕“${keyword}”进行一次坦诚沟通，说清感受、需要和边界`;
    case 'swords': return `把“${keyword}”涉及的事实与猜测分成两列，再依据事实判断`;
    case 'pentacles': return `盘点“${keyword}”涉及的时间、金钱和现实资源，排出下一步`;
    default: return `为“${keyword}”选一个本周能够完成的小动作`;
  }
}

function getTheme(card: TarotCard, rev: boolean): string {
  const keywords = getKeywords(card, rev).slice(0, 2).join('、');
  const domain = card.suit ? SUIT_DOMAINS[card.suit] : '';
  return [domain, keywords].filter(Boolean).join('中的');
}

/** 把牌义放进具体牌位，使用邀请式语言而非机械判定。 */
export function generateDeepPositionInsight(
  card: TarotCard,
  positionName: string,
  rev: boolean,
  positionDescription = '',
): string {
  const theme = `“${getTheme(card, rev)}”`;
  const direction = getDirection(card, rev);

  switch (getPositionKind(positionName)) {
    case 'past':
      return `它落在“${positionName}”，所以这里讲的不是一段已经无关紧要的往事。${card.nameZh}把${theme}留在了现在的选择里，像一条不容易察觉的暗线。\n\n${direction}。${positionName.includes('远期') ? '你可以回想：是否有一种很早形成的自我保护方式，直到今天仍在替你作决定？' : '最近发生的事余温还在；与其催自己赶快翻篇，不如先承认它确实改变了你的感受。'}`;
    case 'root':
      return `作为“${positionName}”，${card.nameZh}沉在表面问题之下。${theme}可能是这一切真正的起点，只是它平时不一定会被直接说出来。\n\n${direction}。当你愿意照顾这层根基，外面的局面才有机会真正松动。`;
    case 'present':
      return `这张牌落在“${positionName}”，像一面正对着当下的镜子。它没有要求你马上解决所有事，而是先看清${theme}此刻怎样发生在你身上。\n\n${direction}。如果某一句让你有被说中的感觉，可以先停在那里——那通常就是这张牌最想让你看见的部分。`;
    case 'challenge':
      return `在“${positionName}”上，${card.nameZh}既是阻力，也是你可以取回的能力。真正让人辛苦的，也许不是缺少${theme}，而是不知道该把它用到什么程度。\n\n${direction}。牌面邀请你分辨：你是在保护自己，还是已经为了保护而把自己困住？`;
    case 'external':
      return `它出现在“${positionName}”，说明${theme}更多由环境、规则或他人的态度触发。你可能已经感受到周围有些东西不愿改变，或有一股力量让你不得不保持警觉。\n\n${direction}。先别替别人预设答案；把能够确认的事实与内心的担忧分开，你会更清楚什么属于你、什么不需要由你承担。`;
    case 'inner':
      return `这个位置照见的是你没有完全说出口的内在立场。${card.nameZh}让${theme}浮到水面，也承认期待与害怕有时会同时存在。\n\n${direction}。你不必急着消灭其中任何一面，先让两种声音都被听见，真正的选择才会出现。`;
    case 'advice':
      return `作为“${positionName}”，${card.nameZh}不是再给你一个抽象答案，而是邀请你把${theme}活进现实。${direction}。\n\n先不用做很大的改变。可以从这里开始：${getConcreteAction(card, rev)}。当行动足够小，内心才有空间诚实回应它是否适合你。`;
    case 'future':
      return `在“${positionName}”，${card.nameZh}照见的是沿当前路径继续前行时，${theme}可能怎样展开。它更像远处的天气，而不是一份已经盖章的判决。\n\n${direction}。${positionName.includes('结果') ? '这是一种阶段性的落点，你今天的选择仍会改变它最终抵达的方式。' : '你现在看见这股趋势，正是为了在真正走到那里之前拥有调整的余地。'}`;
    default:
      return `结合“${positionName}”所代表的“${positionDescription || '当前议题'}”，${card.nameZh}邀请你从${theme}重新靠近这件事。\n\n${direction}。牌面不是替你作答，而是把一个原本模糊的感受照亮，让你能更诚实地回应自己。`;
  }
}

const SUIT_NAMES: Record<string, string> = {
  wands: '权杖（火）', cups: '圣杯（水）', swords: '宝剑（风）', pentacles: '星币（土）',
};

export function generateSuitSummary(cards: { suit?: string; arcana: string }[]): string {
  const majorCount = cards.filter(card => card.arcana === 'major').length;
  const suitCounts: Record<string, number> = {};
  for (const card of cards) if (card.suit) suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  const suits = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  const parts: string[] = [];

  if (majorCount) {
    parts.push(majorCount >= cards.length / 2
      ? `${majorCount}张大阿卡纳让这副牌触及较深的人生阶段，眼前的事可能正牵动你对方向和自我身份的理解`
      : `${majorCount}张大阿卡纳藏在日常牌之间，说明具体生活里正夹着一层更深的成长课题`);
  }
  if (suits.length) {
    const [dominantSuit, count] = suits[0];
    const isDominant = count > (suits[1]?.[1] || 0);
    parts.push(`牌面由${suits.map(([suit, value]) => `${SUIT_NAMES[suit] || suit}${value}张`).join('、')}构成`);
    if (isDominant) {
      const voices: Record<string, string> = {
        wands: '火元素最响，事情正在问你是否愿意真正投入并行动',
        cups: '水元素最响，关系与未说出口的感受是整组牌的心脏',
        swords: '风元素最响，反复思考、沟通和真相辨认贯穿了整组牌',
        pentacles: '土元素最响，安全感、资源与现实落地是无法绕开的主轴',
      };
      parts.push(voices[dominantSuit]);
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
  return `${card.nameZh}${card.rev ? '逆位' : '正位'}所说的“${keywords}”`;
}

function getSecondAction(cards: (TarotCard & { rev: boolean })[]): string {
  const counts: Record<string, number> = {};
  for (const card of cards) if (card.suit) counts[card.suit] = (counts[card.suit] || 0) + 1;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  switch (dominant) {
    case 'wands': return '选出最想推进的一件事，也明确一件暂时不做的事，让火焰集中而不是四处耗散';
    case 'cups': return '找一个安全的人，把你真实的感受说成“我感到……我需要……”，不要只讲事情经过';
    case 'swords': return '当脑中再次反复推演时，写下三条已知事实和三条尚未证实的担忧，让它们不再混在一起';
    case 'pentacles': return '检查未来七天的时间、支出和身体状态，先修补最缺乏安全感的一个现实环节';
    default: return '记下这组牌最让你有感觉的一句话，一周后再回来看看它发生了什么变化';
  }
}

/** 把整组牌编织成一条故事，而不是再次罗列定义。 */
export function generateComprehensiveGuidance(ctx: ReadingContext): { intro: string; trend: string; outro: string } {
  const { spread, cards } = ctx;
  if (!cards.length) return { intro: '', trend: '', outro: '' };

  const uprightCount = cards.filter(card => !card.rev).length;
  const reversedCount = cards.length - uprightCount;
  const balance = reversedCount > uprightCount
    ? `有${reversedCount}张牌以逆位出现。它们并不是在否定你的努力，更像在说：有些力量并非不存在，只是卡在了还没被说清、还没被允许的地方。`
    : uprightCount > reversedCount
      ? `有${uprightCount}张牌以正位出现，整副牌有一种逐渐向外舒展的感觉；你已经拥有一些可以真实调用的力量。`
      : '正位与逆位彼此交错，像一次一边前行、一边回头确认内心的旅程。推进和整理，都不是多余的。';
  const intro = `先把${spread.nameZh}的牌一起放远一点看。${balance}\n\n${generateSuitSummary(cards)}`;

  const first = cards[0];
  const middle = cards.length > 2 ? cards[Math.floor(cards.length / 2)] : null;
  const last = cards[cards.length - 1];
  const beginning = `故事从“${first.posName}”的${cardTheme(first)}开始。它不是一张背景牌，而像一条从过去延伸过来的线，解释了你为什么会以现在的方式感受和选择。`;
  const turning = middle
    ? `走到中段，“${middle.posName}”的${cardTheme(middle)}让故事转了方向：前面的经验在这里不再只是记忆，而开始要求你回应。`
    : '';
  const ending = `最后，“${last.posName}”由${cardTheme(last)}收束。它没有替你宣布结局，而是让你看见：如果沿着现在的节奏走下去，什么会被带到下一阶段；你仍然可以在途中改变走法。`;
  const trend = `${beginning}\n\n${turning ? `${turning}\n\n` : ''}${ending}`;

  const adviceCard = cards.find(card => /建议|行动|释放|指引/.test(card.posName)) || last;
  const relation = ctx.combos[0] || ctx.relations[0] || ctx.suitAnalysis;
  const relationNote = relation ? `牌与牌之间最值得停留的一处回声是：${relation.replace(/^[^：]+：/, '')}。它让前后的牌不再是各说各话，而是在回应同一个核心。\n\n` : '';
  const outro = `${relationNote}这次不需要你立刻完成一个巨大的改变。先做两件小而真实的事：\n① ${getConcreteAction(adviceCard, adviceCard.rev)}；\n② ${getSecondAction(cards)}。\n\n如果某张牌让你不舒服、舍不得，或有一种被说中的酸涩，那份感觉本身也是解读的一部分。牌面展示的是此刻能量的流向，最终的选择权始终在你手中。`;

  return { intro, trend, outro };
}
