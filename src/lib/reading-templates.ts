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
  wands: '权杖这组牌主要讲行动、热情，以及你到底愿不愿意迈出那一步',
  cups: '圣杯这组牌主要讲感受和关系，也包括那些一直没能直接说出口的需要',
  swords: '宝剑这组牌主要讲思考、沟通和事实，也会照见想太多带来的疲惫',
  pentacles: '星币这组牌很现实，讲的是身体、金钱、时间和生活里的安全感',
};

const RANK_SYMBOLS: Record<number, string> = {
  1: '王牌像一颗刚拿到手的种子，机会是真的，但还需要你去接住',
  2: '数字二通常会带来两个人、两种选择，或两股力量之间的拉扯',
  3: '数字三说明一件事开始成形，也往往需要别人加入',
  4: '数字四想把事情稳下来，但太稳也可能变成停在原地',
  5: '数字五会打破原来的平衡，让一直躲着的问题浮出来',
  6: '数字六在找回平衡，事情开始有机会重新顺起来',
  7: '数字七带来一次考验，问你为什么还要继续坚持',
  8: '数字八讲推进和熟练，也提醒你别只顾赶路',
  9: '数字九已经很接近完成，所以力量和疲惫会一起出现',
  10: '数字十走到了一个周期的末尾，旧事需要收尾，新一轮才会开始',
  11: '侍从像刚收到消息的学习者，重点是保持好奇，先别装作什么都懂',
  12: '骑士会把事情往前推，但冲得太快也容易走过头',
  13: '皇后讲的是怎么照顾一件事、一个人，也包括怎么照顾自己',
  14: '国王关心的是怎么把局面管好，也考验你会不会用好手里的力量',
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

type ReversalMode = 'excess' | 'internalized' | 'blocked' | 'release';

function getReversalMode(card: TarotCard): ReversalMode {
  const meaning = card.reversedMeaning || '';
  if (/恢复|疗愈|走出|走出来|解脱|松动|松开|释放|消散|散去|复苏|重获|站起来|正在过去|好转|减轻|摆脱|接受现实|真相浮现|否极泰来/.test(meaning)) {
    return 'release';
  }
  if (/过度|太过|控制|冲动|贪婪|自负|独裁|强势|极端/.test(meaning)) {
    return 'excess';
  }
  if (/内心|自我|直觉|情感|焦虑|恐惧|信心/.test(meaning)) {
    return 'internalized';
  }
  return 'blocked';
}

function getDirection(card: TarotCard, rev: boolean): string {
  if (!rev) return '它是正位，这股力量目前比较顺，现实里也更容易看见它的作用';
  switch (getReversalMode(card)) {
    case 'release': return '它虽然是逆位，但这里更像在松绑和恢复：问题还没完全过去，你已经开始从里面走出来了';
    case 'excess': return '但它是逆位，问题不是你做得不够，而是可能用力过头，原本的保护和坚持反而成了压力';
    case 'internalized': return '它以逆位出现，说明变化更多发生在心里；外面还不明显，但你其实已经感觉到不对劲了';
    case 'blocked': return '它以逆位出现，说明事情并非完全没机会，只是眼下确实有个地方卡住了';
  }
}

function getEmotionalBridge(card: TarotCard, rev: boolean): string {
  if (card.id === 13) {
    return '先别被“死神”这个名字吓到。它说的是一段旧状态该结束了，而真正难的，是你可能还舍不得放手。';
  }
  if (card.id === 16) {
    return '高塔不是在预告灾难。它更像一句实话：有些东西已经撑不住了，与其继续硬扛，不如先找出哪里最不稳。';
  }
  if (card.id === 15) {
    return '这张牌不是在责怪你的执着。人会抓住一件事，通常是因为它曾经给过安全感；先承认这一点，才谈得上松开。';
  }
  if (card.id === 59) {
    return '它不会把难受说得很轻巧，但也有一个很明确的意思：最糟的阶段走到头以后，接下来才有可能真正恢复。';
  }

  const themes = getKeywords(card, rev).slice(0, 2).join('、');
  if (card.arcana === 'major') {
    return `这是一张大阿卡纳，所以“${themes}”不太像一时的小情绪，更像你最近绕不开的一门功课。`;
  }

  switch (card.suit) {
    case 'wands':
      return `说得实际一点，它在问：面对“${themes}”，你是真的想行动，还是只是心里着急？`;
    case 'cups':
      return `这张牌更关心你的真实感受。“${themes}”背后，可能有一句话一直没有好好说出来。`;
    case 'swords':
      return `它提醒你别让脑子一直空转。“${themes}”需要的是看清事实，不是把每一种坏结果都提前想一遍。`;
    case 'pentacles':
      return `它讲的不是玄乎的能量，而是现实里的时间、钱、身体和安全感。“${themes}”最后都要落到具体安排上。`;
    default:
      return `这张牌最想让你留意的是“${themes}”，看看它在现实里对应哪件具体的事。`;
  }
}

/** 用看得懂的口语连接牌面、牌义与现实。 */
export function generateCoreMeaning(card: TarotCard, rev: boolean): string {
  const symbolism = getCardSymbolism(card);
  const meaning = getCardMeaning(card, rev);
  return `${symbolism}\n\n${meaning}\n\n${getEmotionalBridge(card, rev)}`;
}

type PositionKind = 'past' | 'present' | 'future' | 'challenge' | 'advice' | 'external' | 'inner' | 'root' | 'general';

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

function getConcreteAction(card: TarotCard): string {
  if (card.arcana === 'major') return '把这件事里你能控制和不能控制的部分分别写下来，只对前者做一个决定';
  switch (card.suit) {
    case 'wands': return '从最想做的事情里选一件，完成一个最小但真实的第一步';
    case 'cups': return '找一次合适的机会，把自己的感受、需要和边界说清楚';
    case 'swords': return '把已知事实和自己的猜测分开写，再根据事实做判断';
    case 'pentacles': return '盘点现在能用的时间、金钱和现实资源，再排下一步';
    default: return '选一个这周就能完成的小动作，不要只停在想法里';
  }
}

/** 把牌义放进具体牌位，先把“这个位置到底说明什么”讲清楚。 */
export function generateDeepPositionInsight(
  card: TarotCard,
  positionName: string,
  rev: boolean,
  positionDescription = '',
): string {
  const theme = `“${getKeywords(card, rev).slice(0, 2).join('、')}”`;
  const direction = getDirection(card, rev);

  switch (getPositionKind(positionName)) {
    case 'past':
      return `它落在“${positionName}”，说明${theme}不是今天才出现的。以前的事也许已经过去，但你现在的判断里还留着它的影响。\n\n${direction}。${positionName.includes('远期') ? '你可以想一想：现在这个选择，有多少是在回应眼前，又有多少还是在保护过去的自己？' : '不用逼自己马上翻篇，先分清哪些是过去留下的反应，哪些才是眼前真正发生的事。'}`;
    case 'root':
      return `它在“${positionName}”，说的是表面问题下面真正起作用的东西。很多反复出现的状况，可能都绕不开${theme}。\n\n${direction}。先处理这个根上的问题，外面的局面才会真的变化。`;
    case 'present':
      return `它落在“${positionName}”，所以这是眼下最需要正视的一点：${theme}。先不用急着判断整件事好不好，当前这一步看清了，后面才知道怎么走。\n\n${direction}。`;
    case 'challenge':
      return `它落在“${positionName}”，说明真正难处理的是${theme}。这不只是阻碍，也正是最有可能出现突破的地方。\n\n${direction}。你现在需要分清：自己是在谨慎处理，还是已经因为害怕结果而不敢动了？`;
    case 'external':
      return `它出现在“${positionName}”，说明${theme}更多来自环境、规则或别人的态度，不全是你一个人的问题。\n\n${direction}。先看对方实际做了什么，不要替别人脑补答案，也别把不属于你的责任全接过来。`;
    case 'inner':
      return `这个位置说的是你心里真正的态度。${theme}可能一直都在，只是你还没有完全说出口；想要和害怕同时存在，也很正常。\n\n${direction}。先承认自己到底在期待什么、担心什么，再决定会更稳。`;
    case 'advice':
      return `它在“${positionName}”，给的方向其实很直接：别只停在想法里，要处理${theme}。${direction}。\n\n先从一件小事开始：${getConcreteAction(card)}。做完再看结果，比继续猜更有用。`;
    case 'future':
      return `它落在“${positionName}”，不是说结果已经注定，而是提醒你：照现在的走法，${theme}会越来越明显。\n\n${direction}。${positionName.includes('结果') ? '这是目前最可能的落点，不是不能改变的判决。' : '现在提前看到这股趋势，就是为了让你还有时间调整。'}`;
    default:
      return `“${positionName}”看的是${positionDescription || '当前最重要的问题'}。放在这里，${card.nameZh}把重点落在${theme}上。\n\n${direction}。先把这件具体的事看清，再谈它是好是坏。`;
  }
}

export function generateSuitSummary(cards: { suit?: string; arcana: string }[]): string {
  const majorCount = cards.filter(card => card.arcana === 'major').length;
  const suitCounts: Record<string, number> = {};
  for (const card of cards) if (card.suit) suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  const suits = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  const parts: string[] = [];

  if (majorCount) {
    parts.push(majorCount >= cards.length / 2
      ? '大阿卡纳比较多，说明这不太像一个很快就会过去的小插曲，而是正好碰到了一次重要转折'
      : '牌里出现了大阿卡纳，说明眼前这件具体的事，也在推动你重新看待自己的选择');
  }
  if (suits.length) {
    const [dominantSuit, count] = suits[0];
    const isDominant = count > (suits[1]?.[1] || 0);
    if (isDominant) {
      const voices: Record<string, string> = {
        wands: '权杖最集中，重点在于你到底要不要行动，以及力气该往哪里用',
        cups: '圣杯最集中，所以这次真正的重点是关系、感受和那些还没说出口的话',
        swords: '宝剑最集中，说明你现在最需要的是看清事实、停止反复猜测并把话说清楚',
        pentacles: '星币最集中，说明问题最后要回到现实：时间、钱、安全感和具体安排',
      };
      parts.push(voices[dominantSuit]);
    }
  }
  return parts.join('。') + (parts.length ? '。' : '');
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
  return `${card.nameZh}${card.rev ? '逆位' : '正位'}的“${keywords}”`;
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
  const { cards } = ctx;
  if (!cards.length) return { intro: '', trend: '', outro: '' };

  const uprightCount = cards.filter(card => !card.rev).length;
  const reversedCount = cards.length - uprightCount;
  const balance = reversedCount > uprightCount
    ? '逆位牌偏多，所以眼下的重点不是硬往前冲，而是先把真正卡住的地方弄明白。'
    : uprightCount > reversedCount
      ? '正位牌偏多，说明事情不是没路走，你手上已经有一些可以真正用起来的条件。'
      : '正位和逆位差不多，说明一边有机会，一边也有顾虑；现在不适合只看好坏，要看哪一步最关键。';
  const suitSummary = generateSuitSummary(cards);
  const intro = `先说结论：${balance}${suitSummary ? ` ${suitSummary}` : ''}`;

  const first = cards[0];
  const middle = cards.length > 2 ? cards[Math.floor(cards.length / 2)] : null;
  const last = cards[cards.length - 1];
  const beginning = cards.length === 1
    ? `${cardTheme(first)}是这次牌面的核心，它把重点落在“${getKeywords(first, first.rev).slice(0, 2).join('、')}”上。`
    : `这组牌先从“${first.posName}”的${cardTheme(first)}说起，说明事情一开始就绕不开这一点。`;
  const turning = middle
    ? `到了“${middle.posName}”，${cardTheme(middle)}是整个故事的转折：前面的影响到了这里，开始变成你现在必须面对的选择。`
    : '';
  const ending = cards.length === 1
    ? ''
    : `最后落到“${last.posName}”的${cardTheme(last)}。这不是已经写死的结局，而是照现在的状态继续下去，最容易出现的走向。`;
  const lastIsReleasing = last.rev && getReversalMode(last) === 'release';
  const synthesis = cards.length === 1
    ? '所以这次不用急着从牌里找一个绝对答案，先看看它指出的这个核心问题，是否正是你一直没有认真处理的部分。'
    : last.rev && !lastIsReleasing
      ? `连起来看，事情想从“${getKeywords(first, first.rev)[0]}”走向“${getKeywords(last, last.rev)[0]}”，但最后一步还有阻力。不是完全没可能，而是不能照原来的方式继续。`
      : lastIsReleasing
        ? `连起来看，事情正在从“${getKeywords(first, first.rev)[0]}”慢慢走向“${getKeywords(last, last.rev)[0]}”。恢复已经开始，但还需要时间，不能因为暂时没完全好就否定已经发生的变化。`
      : `连起来看，整组牌正在从“${getKeywords(first, first.rev)[0]}”走向“${getKeywords(last, last.rev)[0]}”。方向已经出现，但能不能走到那里，要看你怎么回应中间这张关键牌。`;
  const trend = `${beginning}${turning ? `\n\n${turning}` : ''}${ending ? `\n\n${ending}` : ''}\n\n${synthesis}`;

  const adviceCard = cards.find(card => /建议|行动|释放|指引/.test(card.posName)) || last;
  const relation = ctx.combos[0] || ctx.relations[0] || ctx.suitAnalysis;
  const relationNote = relation ? `这几张牌之间还有一个很明显的联系：${relation.replace(/^[^：]+：/, '')}。\n\n` : '';
  const outro = `${relationNote}眼下最有用的不是继续猜结果，而是先做两件具体的事。第一，${getConcreteAction(adviceCard)}。第二，${getSecondAction(cards)}。\n\n塔罗给的是现在这条路最可能的发展，不是替你作决定。哪一张牌让你最不舒服，往往就是最值得先处理的地方。`;

  return { intro, trend, outro };
}
