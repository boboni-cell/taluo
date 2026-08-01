/**
 * 心理测试中心 · 测试数据定义
 * 所有测试内容统一由此文件驱动，页面组件不散落文案。
 */

// ── 类型定义 ──────────────────────────────────────────────

export type TestCategory = 'personality' | 'emotion' | 'relationship' | 'inner' | 'fun';

export type QuestionType = 'single' | 'multiple' | 'scale' | 'scenario';

export interface TestOption {
  id: string;
  text: string;
  /** 维度 → 得分 */
  scores: Record<string, number>;
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: TestOption[];
}

export interface DimensionScore {
  id: string;
  name: string;
  description: string;
}

export interface TestResult {
  type: string;
  title: string;
  summary: string;
  /** 维度阈值：每个维度的得分范围 */
  dimensionThresholds: Record<string, { min: number; max: number }>;
  keywords: string[];
  strengths: string[];
  blindSpots: string[];
  emotionalPattern: string;
  relationshipPattern: string;
  personalSummary: string;
}

export interface TestDefinition {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: TestCategory;
  permissionId: string;
  isFree: boolean;
  questionCount: number;
  estimatedMinutes: number;
  problemsSolved: string;
  suitableFor: string;
  questions: TestQuestion[];
  dimensions: DimensionScore[];
  scoring: {
    type: 'dimension';
    /** 是否将原始分数标准化到 0-100 */
    normalize: boolean;
    /** 每个维度的理论最大原始分数（用于标准化） */
    dimensionMaxRaw: Record<string, number>;
  };
  resultProfiles: TestResult[];
}

export interface TestCategoryInfo {
  id: TestCategory;
  name: string;
  subtitle: string;
  description: string;
  permissionId: string;
  number: string;
  count: number;
}

// ── 分类信息 ──────────────────────────────────────────────

export const TEST_CATEGORIES: TestCategoryInfo[] = [
  {
    id: 'personality',
    name: '人格类型',
    subtitle: 'Personality Type',
    description: '了解你的天生倾向与认知模式，看清自己如何理解世界。',
    permissionId: 'personality',
    number: '01',
    count: 4,
  },
  {
    id: 'emotion',
    name: '情感模式',
    subtitle: 'Emotional Pattern',
    description: '探索你的依恋风格与情感需求，理解爱中的自己。',
    permissionId: 'emotion',
    number: '02',
    count: 4,
  },
  {
    id: 'relationship',
    name: '人际关系',
    subtitle: 'Relationship',
    description: '看见你与他人的互动方式，找到更舒适的相处边界。',
    permissionId: 'relationship',
    number: '03',
    count: 4,
  },
  {
    id: 'inner',
    name: '内在探索',
    subtitle: 'Inner Exploration',
    description: '深入内心深处，理解自我价值、情绪与真实需求。',
    permissionId: 'inner',
    number: '04',
    count: 4,
  },
  {
    id: 'fun',
    name: '趣味测试',
    subtitle: 'Just for Fun',
    description: '轻松有趣的心理小测试，不需要任何邀请码。',
    permissionId: '',
    number: '05',
    count: 4,
  },
];

// ── 辅助：构建选项的快捷函数 ──────────────────────────────

function opt(id: string, text: string, scores: Record<string, number>): TestOption {
  return { id, text, scores };
}

// ── 所有测试数据 ──────────────────────────────────────────

export const ALL_TESTS: TestDefinition[] = [

  // ══════════════════════════════════════════════════════════
  // 人格类型 (personality)
  // ══════════════════════════════════════════════════════════

  {
    slug: 'mbti-style',
    title: 'MBTI 类人格测试',
    subtitle: '探索你的认知偏好与人格轮廓',
    description: '基于荣格认知功能理论，通过日常情境的选择，勾勒你的 MBTI 人格类型轮廓。了解你在能量来源、信息获取、决策方式和生活方式四个维度的自然倾向。',
    category: 'personality',
    permissionId: 'personality',
    isFree: false,
    questionCount: 12,
    estimatedMinutes: 8,
    problemsSolved: '帮助你理解自己为什么在某些情境中感到舒适、在另一些情境中感到消耗，以及如何利用自己的认知优势。',
    suitableFor: '对自我认知感兴趣、想知道自己 MBTI 类型但还没做过正式测试的人。',
    dimensions: [
      { id: 'EI', name: '外向-内向', description: '能量来源：从外部世界还是内心世界获取能量' },
      { id: 'SN', name: '感觉-直觉', description: '信息获取：关注具体细节还是整体模式' },
      { id: 'TF', name: '思考-情感', description: '决策方式：依据逻辑原则还是价值感受' },
      { id: 'JP', name: '判断-感知', description: '生活方式：偏好计划有序还是灵活开放' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { EI: 12, SN: 12, TF: 12, JP: 12 } },
    questions: [
      {
        id: 'q1', type: 'single', text: '参加完一场热闹的聚会后，你通常感觉：',
        options: [
          opt('a', '精力充沛，还想继续社交', { EI: 3 }),
          opt('b', '愉快但有些疲惫，需要一点独处时间', { EI: 1 }),
          opt('c', '非常疲惫，只想一个人待着恢复', { EI: 0 }),
        ],
      },
      {
        id: 'q2', type: 'single', text: '阅读一本非虚构类书籍时，你更关注：',
        options: [
          opt('a', '书中具体的数据、案例和事实', { SN: 3 }),
          opt('b', '作者想要传达的核心理念和洞见', { SN: 0 }),
          opt('c', '两者都关注，视书籍类型而定', { SN: 1.5 }),
        ],
      },
      {
        id: 'q3', type: 'single', text: '做重要决定时，你更依赖：',
        options: [
          opt('a', '逻辑分析和利弊权衡', { TF: 3 }),
          opt('b', '内心的感受和价值观判断', { TF: 0 }),
          opt('c', '两者结合，但逻辑优先', { TF: 2 }),
          opt('d', '两者结合，但感受优先', { TF: 1 }),
        ],
      },
      {
        id: 'q4', type: 'single', text: '面对周末没有安排的情况，你倾向于：',
        options: [
          opt('a', '提前规划好要做的事情，按计划执行', { JP: 3 }),
          opt('b', '随性而为，看当下的心情决定', { JP: 0 }),
          opt('c', '大概有个方向，但保持灵活', { JP: 1.5 }),
        ],
      },
      {
        id: 'q5', type: 'single', text: '遇到困难时，你更倾向于：',
        options: [
          opt('a', '找朋友聊聊，在交流中理清思路', { EI: 3 }),
          opt('b', '自己先想清楚，再决定要不要和别人说', { EI: 1 }),
          opt('c', '完全自己消化，不太习惯向别人倾诉', { EI: 0 }),
        ],
      },
      {
        id: 'q6', type: 'single', text: '学习一项新技能时，你更喜欢：',
        options: [
          opt('a', '先了解理论和原理，再动手实践', { SN: 0 }),
          opt('b', '直接上手尝试，在实践中学习', { SN: 3 }),
          opt('c', '看别人怎么做，然后跟着模仿', { SN: 2 }),
        ],
      },
      {
        id: 'q7', type: 'single', text: '朋友向你倾诉烦恼时，你的第一反应是：',
        options: [
          opt('a', '分析问题，帮忙找解决方案', { TF: 3 }),
          opt('b', '先共情和安慰，让朋友感到被理解', { TF: 0 }),
          opt('c', '一边安慰一边帮忙分析', { TF: 1.5 }),
        ],
      },
      {
        id: 'q8', type: 'single', text: '你的书桌或工作台通常是：',
        options: [
          opt('a', '整洁有序，每样东西都有固定位置', { JP: 3 }),
          opt('b', '看起来有点乱，但你知道东西在哪', { JP: 0 }),
          opt('c', '时整时乱，取决于忙不忙', { JP: 1.5 }),
        ],
      },
      {
        id: 'q9', type: 'single', text: '在团队项目中，你更享受：',
        options: [
          opt('a', '和大家一起头脑风暴、讨论交流', { EI: 3 }),
          opt('b', '分工明确后各自独立完成自己的部分', { EI: 0 }),
          opt('c', '都可以，取决于团队成员是谁', { EI: 1.5 }),
        ],
      },
      {
        id: 'q10', type: 'single', text: '旅行时，你更喜欢：',
        options: [
          opt('a', '有详细的行程计划和预订', { SN: 0, JP: 3 }),
          opt('b', '只有一个大方向，到了再说', { SN: 3, JP: 0 }),
          opt('c', '安排好住宿交通，其余随缘', { SN: 1.5, JP: 1.5 }),
        ],
      },
      {
        id: 'q11', type: 'scale', text: '"规则是为大多数人制定的，特殊情况应该灵活处理。"',
        options: [
          opt('a', '非常同意', { TF: 0 }),
          opt('b', '比较同意', { TF: 0.5 }),
          opt('c', '中立', { TF: 1.5 }),
          opt('d', '不太同意', { TF: 2.5 }),
          opt('e', '完全不同意', { TF: 3 }),
        ],
      },
      {
        id: 'q12', type: 'single', text: '用三个词描述自己，你会更倾向于用：',
        options: [
          opt('a', '具体的行为或角色（如"工程师""早起的人"）', { SN: 3 }),
          opt('b', '抽象的特质或价值观（如"理想主义""好奇"）', { SN: 0 }),
          opt('c', '两者各占一半', { SN: 1.5 }),
        ],
      },
    ],
    resultProfiles: [
      {
        type: 'INTJ', title: '建筑师', summary: '你是一个具有战略思维的独立思考者，善于看到全局并制定长远计划。你重视效率和逻辑，在复杂系统中能找到最优路径。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 0, max: 49 }, TF: { min: 51, max: 100 }, JP: { min: 51, max: 100 } },
        keywords: ['战略思维', '独立', '理性', '远见', '系统化'],
        strengths: ['擅长长远规划', '独立思考能力强', '能够在复杂问题中找到核心逻辑', '自律且目标明确'],
        blindSpots: ['可能显得过于冷淡或疏离', '对情感需求不够敏感', '有时过于追求完美而拖延行动'],
        emotionalPattern: '你倾向于用理性分析来处理情绪，而不是直接表达。这让你在压力下保持冷静，但也可能导致情绪积压。',
        relationshipPattern: '你在关系中重视深度而非广度，宁缺毋滥。你欣赏有独立思想和能力的伴侣，但需要注意表达温暖和关怀。',
        personalSummary: '你是一个天生的战略家。信任你的远见，但也要记得——有时候最好的策略就是允许自己感受当下。',
      },
      {
        type: 'INTP', title: '逻辑学家', summary: '你是一个充满好奇心的思想者，喜欢探索概念和可能性。你享受独立思考的乐趣，对世界有独特的理解方式。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 0, max: 49 }, TF: { min: 51, max: 100 }, JP: { min: 0, max: 49 } },
        keywords: ['好奇', '分析', '创新', '灵活', '独立'],
        strengths: ['出色的分析能力', '开放的思维方式', '能发现别人忽略的联系', '不盲从权威'],
        blindSpots: ['容易陷入过度分析而难以行动', '可能忽视实际细节', '社交场合可能显得心不在焉'],
        emotionalPattern: '你倾向于将情绪也当作需要分析的对象，这有时会让你与自己的真实感受产生距离。',
        relationshipPattern: '你在关系中珍视智识上的共鸣。你需要一个能理解你独立需求、不要求过多情感汇报的伴侣。',
        personalSummary: '你的头脑是一座无穷的图书馆。享受探索，但别忘了偶尔走出来，让风吹在脸上。',
      },
      {
        type: 'ENTJ', title: '指挥官', summary: '你是一个天生的领导者，善于组织资源、制定计划并推动执行。你敢于做决定，也乐于承担责任。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 0, max: 49 }, TF: { min: 51, max: 100 }, JP: { min: 51, max: 100 } },
        keywords: ['领导力', '果断', '效率', '远见', '自信'],
        strengths: ['出色的组织和领导能力', '快速决策', '善于激励他人', '目标导向'],
        blindSpots: ['可能显得过于强势', '对他人感受不够敏感', '有时过于急躁'],
        emotionalPattern: '你习惯把情绪放在一边以完成任务。短期有效，但长期可能让你与自己的感受失去联系。',
        relationshipPattern: '你在关系中也需要掌控感和目标感。找到一个能与你并驾齐驱而非被你指挥的伴侣很重要。',
        personalSummary: '你的行动力是你的天赋。记得指挥别人之前，先听听自己内心的声音。',
      },
      {
        type: 'ENTP', title: '辩论家', summary: '你是一个思维敏捷的创新者，喜欢挑战常规和探索新的可能。你善于在辩论中看清问题的多面性。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 0, max: 49 }, TF: { min: 51, max: 100 }, JP: { min: 0, max: 49 } },
        keywords: ['创新', '机智', '好奇', '灵活', '自信'],
        strengths: ['快速学习和适应', '创造性地解决问题', '善于沟通和说服', '不畏惧挑战'],
        blindSpots: ['可能对日常事务缺乏耐心', '容易喜新厌旧', '有时过于争强好胜'],
        emotionalPattern: '你习惯用幽默和理性来应对情绪，这让你看起来总是轻松自如，但也可能让身边人觉得不够真诚。',
        relationshipPattern: '你享受关系中的智力较量和新鲜感。你需要一个能跟上你的节奏、又不介意你偶尔"杠精"的伴侣。',
        personalSummary: '你的头脑是一个永不停歇的创意引擎。享受火花四溅，但也要学会在适当的时候安静下来。',
      },
      {
        type: 'INFJ', title: '提倡者', summary: '你是一个有深度的理想主义者，内心丰富而敏感。你善于理解他人的感受，同时也有坚定的价值观。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 0, max: 49 }, TF: { min: 0, max: 49 }, JP: { min: 51, max: 100 } },
        keywords: ['理想主义', '深度', '共情', '洞察', '坚定'],
        strengths: ['深刻的洞察力', '强烈的共情能力', '坚定的价值观', '善于帮助他人成长'],
        blindSpots: ['容易过度付出而忽略自己', '对批评特别敏感', '有时过于理想化而脱离现实'],
        emotionalPattern: '你的情绪世界丰富而深邃。你感受到的比别人多，这也意味着你需要更多的独处时间来消化。',
        relationshipPattern: '你在关系中追求深度和意义，不满足于表面的和谐。你需要一个能看见你内心世界的伴侣。',
        personalSummary: '你的温柔是你的力量。不要因为世界嘈杂就怀疑自己内心的声音。',
      },
      {
        type: 'INFP', title: '调停者', summary: '你是一个内心丰富的理想主义者，忠于自己的价值观。你善于发现美和意义，对世界有独特的感知方式。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 0, max: 49 }, TF: { min: 0, max: 49 }, JP: { min: 0, max: 49 } },
        keywords: ['理想主义', '创造力', '共情', '真实', '灵活'],
        strengths: ['丰富的想象力和创造力', '真诚而温暖', '善于理解不同的观点', '忠于内心'],
        blindSpots: ['容易陷入自我怀疑', '可能难以做实际的决定', '有时过于理想化'],
        emotionalPattern: '你的情绪是你创造力的源泉。你深刻地感受一切，这在让你丰富的同时也让你脆弱。',
        relationshipPattern: '你在关系中追求灵魂层面的连接。你是一个温柔而忠诚的伴侣，但也需要保持自己的独立空间。',
        personalSummary: '你的内心有一个完整的世界。保护它的温柔，也勇敢地让它被看见。',
      },
      {
        type: 'ENFJ', title: '主人公', summary: '你是一个富有感染力的领导者，善于激励和帮助他人。你有强烈的责任感和对美好世界的向往。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 0, max: 49 }, TF: { min: 0, max: 49 }, JP: { min: 51, max: 100 } },
        keywords: ['领导力', '共情', '激励', '责任感', '魅力'],
        strengths: ['出色的沟通和激励能力', '强烈同理心', '善于组织和引导', '真诚关怀他人'],
        blindSpots: ['可能过度承担责任', '容易忽略自己的需求', '对批评比较敏感'],
        emotionalPattern: '你对他人情绪的感知非常敏锐，常在不知不觉中成为他人的情绪支柱。但要小心不要因此耗尽自己。',
        relationshipPattern: '你在关系中全情投入，希望帮助伴侣成为最好的自己。但也要允许对方有自己的节奏。',
        personalSummary: '你的存在照亮了别人的路。记得也要给自己留一盏灯。',
      },
      {
        type: 'ENFP', title: '竞选者', summary: '你是一个充满热情和创造力的人，善于在生活的各种可能中找到灵感。你的热情具有感染力。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 0, max: 49 }, TF: { min: 0, max: 49 }, JP: { min: 0, max: 49 } },
        keywords: ['热情', '创造力', '开放', '共情', '自由'],
        strengths: ['丰富的创造力', '感染他人的热情', '善于发现可能性', '真诚开放'],
        blindSpots: ['可能难以专注一件事', '对日常琐事缺乏耐心', '有时过于情绪化'],
        emotionalPattern: '你的情绪来得快去得也快。你享受情绪的丰富色彩，但也需要学会在风暴中稳住自己。',
        relationshipPattern: '你在关系中追求新鲜感和深度连接。你需要一个能陪你冒险又能在你需要时给予稳定的伴侣。',
        personalSummary: '你的灵魂是一团温暖的火。让它在合适的地方燃烧，但不要烧尽自己。',
      },
      {
        type: 'ISTJ', title: '物流师', summary: '你是一个可靠而务实的人，重视事实和秩序。你用自己的勤奋和诚信赢得了身边人的信任。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 51, max: 100 }, TF: { min: 51, max: 100 }, JP: { min: 51, max: 100 } },
        keywords: ['可靠', '务实', '严谨', '负责', '秩序'],
        strengths: ['极强的执行力和可靠性', '注重细节和事实', '稳重的判断力', '信守承诺'],
        blindSpots: ['可能对新事物过于谨慎', '有时显得固执', '可能忽略情感因素'],
        emotionalPattern: '你倾向于将情绪视为需要管理的任务。这让你在危机中非常可靠，但也可能让你忽视自己的情感需求。',
        relationshipPattern: '你在关系中用行动而非语言表达爱。稳定、可靠是你最大的浪漫，但也需要学习用言语表达温暖。',
        personalSummary: '你的稳重是身边人的定心丸。偶尔允许自己走出计划，也许会有惊喜。',
      },
      {
        type: 'ISFJ', title: '守卫者', summary: '你是一个温暖而细心的人，默默守护着你在乎的人和事。你的关怀低调但持久。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 51, max: 100 }, TF: { min: 0, max: 49 }, JP: { min: 51, max: 100 } },
        keywords: ['温暖', '细心', '守护', '务实', '忠诚'],
        strengths: ['细腻的观察力和记忆力', '不求回报的关怀', '踏实可靠', '维护传统和稳定'],
        blindSpots: ['可能过度牺牲自己', '不太会表达自己的需求', '对变化适应较慢'],
        emotionalPattern: '你习惯把自己的情绪放在最后。你的温柔是礼物，但不要让它变成你一个人的负担。',
        relationshipPattern: '你在关系中是一个默默付出的守护者。你需要学会让对方知道你的需求，而不是等待对方自己发现。',
        personalSummary: '你的善良是世界上最安静也最有力量的东西。照顾别人的同时，也请温柔对待自己。',
      },
      {
        type: 'ESTJ', title: '总经理', summary: '你是一个高效的组织者，善于制定规则并确保执行。你重视秩序和效率，在管理事务方面表现出色。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 51, max: 100 }, TF: { min: 51, max: 100 }, JP: { min: 51, max: 100 } },
        keywords: ['高效', '组织', '务实', '果断', '负责'],
        strengths: ['出色的组织和管理能力', '果断决策', '高度负责', '注重实效'],
        blindSpots: ['可能过于强势', '对不同的做事方式容忍度低', '可能忽视他人的情感需求'],
        emotionalPattern: '你习惯把效率放在第一位，情绪被视为影响效率的因素。这让你高效，但也可能让你和身边人产生距离。',
        relationshipPattern: '你在关系中也有清晰的期待和规则。找到能欣赏你的可靠、也能帮你放松的人很重要。',
        personalSummary: '你的能力让别人可以依靠。偶尔放下"应该"，允许自己享受没有目标的时光。',
      },
      {
        type: 'ESFJ', title: '执政官', summary: '你是一个热心而善于社交的人，乐于照顾身边人的需求。你在建立和谐关系方面有天赋。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 51, max: 100 }, TF: { min: 0, max: 49 }, JP: { min: 51, max: 100 } },
        keywords: ['热心', '社交', '关怀', '和谐', '务实'],
        strengths: ['出色的社交和协调能力', '真诚关怀他人', '善于营造温暖氛围', '踏实可靠'],
        blindSpots: ['可能过度在意他人看法', '有时忽视自己的需求', '对批评较敏感'],
        emotionalPattern: '你的情绪和周围人的情绪紧密相连。你善于照顾他人感受，但需要学会区分"别人的情绪"和"自己的情绪"。',
        relationshipPattern: '你在关系中是一个全心投入的照顾者。你需要一个懂得感恩、也会反过来照顾你的伴侣。',
        personalSummary: '你的温暖是别人世界里的阳光。记得阳光也需要偶尔躲在云后面休息。',
      },
      {
        type: 'ISTP', title: '鉴赏家', summary: '你是一个冷静而灵活的行动者，善于在当下解决问题。你喜欢探索事物的运作方式，享受动手的乐趣。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 51, max: 100 }, TF: { min: 51, max: 100 }, JP: { min: 0, max: 49 } },
        keywords: ['冷静', '灵活', '务实', '独立', '探索'],
        strengths: ['出色的临场应变能力', '务实解决问题', '独立自主', '善于掌握工具和技能'],
        blindSpots: ['可能显得疏离或不够投入', '不擅长表达情感', '可能对长远规划缺乏兴趣'],
        emotionalPattern: '你习惯把情绪当作需要处理的信息而非需要表达的感受。这让你冷静，但也可能让身边人觉得你不在乎。',
        relationshipPattern: '你在关系中重视空间和自由。你需要一个不粘人、能与你各自精彩又彼此欣赏的伴侣。',
        personalSummary: '你的冷静是一种力量。偶尔让情绪自然流淌，不会淹没你，只会让你更完整。',
      },
      {
        type: 'ISFP', title: '探险家', summary: '你是一个温柔而有艺术气质的人，用自己的方式感受和表达美。你活在当下，忠于自己的感受。',
        dimensionThresholds: { EI: { min: 0, max: 49 }, SN: { min: 51, max: 100 }, TF: { min: 0, max: 49 }, JP: { min: 0, max: 49 } },
        keywords: ['温柔', '艺术', '真实', '灵活', '审美'],
        strengths: ['敏锐的审美感知', '真诚而不做作', '善于发现生活中的美', '灵活适应'],
        blindSpots: ['可能回避冲突', '不善于长期规划', '有时过于自我沉浸'],
        emotionalPattern: '你的情绪是你创作的颜料。你感受深刻但不一定表达，这让你有一种独特的神秘感。',
        relationshipPattern: '你在关系中重视当下的真实感受。你需要一个懂得欣赏你的独特、不试图改变你的伴侣。',
        personalSummary: '你的存在本身就是一种美。不需要成为别人期待的样子，你已经足够好。',
      },
      {
        type: 'ESTP', title: '企业家', summary: '你是一个精力充沛的行动派，善于把握当下的机会。你享受刺激和挑战，在快节奏中如鱼得水。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 51, max: 100 }, TF: { min: 51, max: 100 }, JP: { min: 0, max: 49 } },
        keywords: ['行动力', '冒险', '务实', '灵活', '社交'],
        strengths: ['出色的应变能力', '敢于冒险', '务实高效', '社交能力强'],
        blindSpots: ['可能过于冲动', '对长远后果考虑不足', '可能忽视他人的感受'],
        emotionalPattern: '你习惯用行动应对一切，包括情绪。但有时候，停下来感受比立刻行动更有用。',
        relationshipPattern: '你在关系中追求刺激和新鲜感。你需要一个能跟上你的节奏、也能在你需要时提供安稳的伴侣。',
        personalSummary: '你的能量感染了身边的人。享受冒险，但别忘了带上锚——它让你在风暴中也能找到方向。',
      },
      {
        type: 'ESFP', title: '表演者', summary: '你是一个充满活力的人，天生具有感染力。你享受当下，善于用自己的热情让周围的人快乐。',
        dimensionThresholds: { EI: { min: 51, max: 100 }, SN: { min: 51, max: 100 }, TF: { min: 0, max: 49 }, JP: { min: 0, max: 49 } },
        keywords: ['活力', '热情', '务实', '灵活', '社交'],
        strengths: ['感染力极强的热情', '善于制造快乐', '灵活适应', '真诚待人'],
        blindSpots: ['可能逃避严肃话题', '注意力容易分散', '有时过于追求享乐'],
        emotionalPattern: '你的情绪写在脸上，这是一种难得的真诚。但也要注意，不是所有人都值得看到你的全部。',
        relationshipPattern: '你在关系中追求快乐和陪伴。你需要一个能与你一起享受生活、也能在需要时认真对话的伴侣。',
        personalSummary: '你的存在让世界变得更明亮。享受聚光灯，但也珍惜那些你不需要表演的时刻。',
      },
    ],
  },

  {
    slug: 'introvert-extrovert',
    title: '内向/外向倾向测试',
    subtitle: '了解你的能量来源与社交偏好',
    description: '不同于简单的"喜欢社交"或"不喜欢社交"，内向-外向是一个关于能量来源的光谱。这个测试帮助你理解自己从哪里获取能量、如何恢复精力，以及怎样的社交节奏最适合你。',
    category: 'personality',
    permissionId: 'personality',
    isFree: false,
    questionCount: 10,
    estimatedMinutes: 6,
    problemsSolved: '帮助你了解自己真正的能量模式，从而更好地安排工作、社交和独处时间，减少精力耗竭。',
    suitableFor: '经常感到社交疲惫、或不确定自己到底是内向还是外向的人。',
    dimensions: [
      { id: 'IE', name: '内外向指数', description: '能量来源的偏向：外部世界还是内心世界' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { IE: 20 } },
    questions: [
      {
        id: 'q1', type: 'single', text: '经过一整天密集的社交活动后，你通常：',
        options: [
          opt('a', '感到充实和满足', { IE: 4 }),
          opt('b', '虽然开心但需要时间恢复', { IE: 2 }),
          opt('c', '身心俱疲，需要长时间独处恢复', { IE: 0 }),
        ],
      },
      {
        id: 'q2', type: 'single', text: '当你需要思考一个重要问题时，你倾向于：',
        options: [
          opt('a', '和别人讨论，在交流中理清思路', { IE: 4 }),
          opt('b', '先自己想想，再找人讨论', { IE: 2 }),
          opt('c', '自己独自思考，得出结论后再分享', { IE: 0 }),
        ],
      },
      {
        id: 'q3', type: 'scale', text: '"我更喜欢一对一的深入对话，而不是一群人热闹的聚会。"',
        options: [
          opt('a', '非常同意', { IE: 0 }),
          opt('b', '比较同意', { IE: 1 }),
          opt('c', '中立', { IE: 2 }),
          opt('d', '不太同意', { IE: 3 }),
          opt('e', '完全不同意', { IE: 4 }),
        ],
      },
      {
        id: 'q4', type: 'single', text: '在新的社交场合中，你通常：',
        options: [
          opt('a', '主动寻找交谈对象，很快融入', { IE: 4 }),
          opt('b', '等别人来和自己说话，慢慢适应', { IE: 2 }),
          opt('c', '安静观察，选择和少数几个人交流', { IE: 0 }),
        ],
      },
      {
        id: 'q5', type: 'single', text: '周末你最理想的充电方式是：',
        options: [
          opt('a', '和朋友聚会、参加活动', { IE: 4 }),
          opt('b', '一部分时间和朋友在一起，一部分时间独处', { IE: 2 }),
          opt('c', '一个人安静地看书、看电影或做自己的事', { IE: 0 }),
        ],
      },
      {
        id: 'q6', type: 'single', text: '在会议或讨论中，你通常：',
        options: [
          opt('a', '想到什么就说什么，边说边想', { IE: 4 }),
          opt('b', '先在脑子里组织好语言再发言', { IE: 0 }),
          opt('c', '看情况：重要的事想好了再说，不重要的事想到就说', { IE: 2 }),
        ],
      },
      {
        id: 'q7', type: 'single', text: '当你情绪低落时，什么样的方式最有效：',
        options: [
          opt('a', '找朋友倾诉，得到安慰和支持', { IE: 4 }),
          opt('b', '先自己消化一下，再决定要不要找人聊', { IE: 2 }),
          opt('c', '独自待着，通过阅读、写作或散步来整理情绪', { IE: 0 }),
        ],
      },
      {
        id: 'q8', type: 'scale', text: '"被很多人同时关注会让我感到不自在。"',
        options: [
          opt('a', '非常同意', { IE: 0 }),
          opt('b', '比较同意', { IE: 1 }),
          opt('c', '中立', { IE: 2 }),
          opt('d', '不太同意', { IE: 3 }),
          opt('e', '完全不同意', { IE: 4 }),
        ],
      },
      {
        id: 'q9', type: 'single', text: '你更喜欢的工作方式是：',
        options: [
          opt('a', '在开放、互动性强的环境中工作', { IE: 4 }),
          opt('b', '在安静、不受打扰的环境中工作', { IE: 0 }),
          opt('c', '两者结合，视任务类型切换', { IE: 2 }),
        ],
      },
      {
        id: 'q10', type: 'single', text: '你觉得自己社交圈子的特点是：',
        options: [
          opt('a', '朋友很多，社交圈广泛而活跃', { IE: 4 }),
          opt('b', '朋友不多但关系深厚', { IE: 0 }),
          opt('c', '有一群比较熟的朋友，也有一些泛泛之交', { IE: 2 }),
        ],
      },
    ],
    resultProfiles: [
      {
        type: 'extrovert', title: '偏向外向', summary: '你从外部世界中获取能量。与人交流让你感到充实，热闹的环境让你兴奋。你善于在互动中思考和表达。',
        dimensionThresholds: { IE: { min: 61, max: 100 } },
        keywords: ['外向', '社交能量', '表达型', '行动导向'],
        strengths: ['善于社交和建立关系', '快速思考和表达', '在团队中活跃气氛', '行动力强'],
        blindSpots: ['可能忽视独处的重要性', '偶尔不够深思熟虑', '容易过度消耗而不自知'],
        emotionalPattern: '你通过与他人互动来处理情绪，分享和倾诉是你的重要出口。',
        relationshipPattern: '你在关系中主动而热情，享受与伴侣一起参与各种活动。需要注意给对方足够的安静空间。',
        personalSummary: '你的能量像阳光一样向外辐射。享受与人连接的同时，也给自己留一些安静的角落。',
      },
      {
        type: 'ambivert', title: '中间型', summary: '你处于内外向光谱的中间位置，兼具两者的特质。你既能在社交中找到乐趣，也能在独处中获得能量。',
        dimensionThresholds: { IE: { min: 36, max: 60 } },
        keywords: ['平衡', '灵活', '适应力', '中间型'],
        strengths: ['灵活适应不同的社交场景', '既能深入思考也能有效表达', '理解内向者和外向者的需求'],
        blindSpots: ['有时不清楚自己的真实偏好', '可能在不同场合表现不一致而感到困惑'],
        emotionalPattern: '你处理情绪的方式比较灵活，有时需要独处、有时需要倾诉，取决于具体情况。',
        relationshipPattern: '你在关系中能够平衡亲密与独立。你理解伴侣对空间的需求，也懂得创造共同的时光。',
        personalSummary: '你是一座桥，连接着内向的深邃和外向的广阔。这种灵活性是你的独特优势。',
      },
      {
        type: 'introvert', title: '偏向内向', summary: '你从内心世界获取能量。独处让你恢复精力，深入思考让你感到满足。你更喜欢有质量的少数关系而非广泛的社交。',
        dimensionThresholds: { IE: { min: 0, max: 35 } },
        keywords: ['内向', '深度思考', '独立', '内省'],
        strengths: ['深度思考能力强', '善于倾听和观察', '独立而不依赖他人', '建立了深厚的少数关系'],
        blindSpots: ['可能因过于安静而被误解', '社交场合可能被忽视', '有时需要更主动地表达'],
        emotionalPattern: '你通过独处和内省来处理情绪，需要时间和空间来消化感受。',
        relationshipPattern: '你在关系中珍视深度和真诚。你不需要很多朋友，但每一个都很重要。在亲密关系中，你忠诚而专注。',
        personalSummary: '你的内心是一个广阔而丰富的世界。不需要强迫自己变成别人，你的安静本身就是一种力量。',
      },
    ],
  },

  {
    slug: 'decision-making',
    title: '决策方式测试',
    subtitle: '发现你做决定的底层逻辑',
    description: '我们每天都在做决定，从午餐吃什么到人生重大选择。这个测试帮助你理解自己决策时的核心驱动力——是逻辑分析、直觉感受，还是二者的混合。',
    category: 'personality',
    permissionId: 'personality',
    isFree: false,
    questionCount: 10,
    estimatedMinutes: 6,
    problemsSolved: '帮助你认识自己的决策风格，从而在重大选择时更有意识地利用自己的优势、弥补盲区。',
    suitableFor: '面临重要选择、或经常对自己的决定感到后悔和不确定的人。',
    dimensions: [
      { id: 'LR', name: '逻辑-直觉', description: '决策时偏向逻辑分析还是直觉感受' },
      { id: 'SP', name: '速度-谨慎', description: '决策速度：快速果断还是深思熟虑' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { LR: 20, SP: 20 } },
    questions: [
      {
        id: 'q1', type: 'single', text: '购买大件商品时，你通常会：',
        options: [
          opt('a', '详细比较参数、性价比和评价，做表格对比', { LR: 4, SP: 0 }),
          opt('b', '大致了解后凭感觉决定', { LR: 0, SP: 4 }),
          opt('c', '两者结合：先研究再凭直觉选', { LR: 2, SP: 2 }),
        ],
      },
      {
        id: 'q2', type: 'single', text: '面对两个都不错的选择时，你的决断速度：',
        options: [
          opt('a', '很快就能决定，不纠结', { SP: 4 }),
          opt('b', '会纠结一阵子，但最终能决定', { SP: 2 }),
          opt('c', '反复权衡，经常需要很久才能下定决心', { SP: 0 }),
        ],
      },
      {
        id: 'q3', type: 'single', text: '做一个决定后，你更可能：',
        options: [
          opt('a', '坚定执行，不回头看', { SP: 4 }),
          opt('b', '偶尔会怀疑是不是选错了', { SP: 2 }),
          opt('c', '经常反复想"如果选另一个会怎样"', { SP: 0 }),
        ],
      },
      {
        id: 'q4', type: 'scale', text: '"做决定时，直觉比数据更可靠。"',
        options: [
          opt('a', '非常同意', { LR: 0 }),
          opt('b', '比较同意', { LR: 1 }),
          opt('c', '中立', { LR: 2 }),
          opt('d', '不太同意', { LR: 3 }),
          opt('e', '完全不同意', { LR: 4 }),
        ],
      },
      {
        id: 'q5', type: 'single', text: '当有人质疑你的决定时，你通常会：',
        options: [
          opt('a', '用事实和逻辑来捍卫自己的决定', { LR: 4 }),
          opt('b', '虽然坚持，但会反思自己是否忽略了什么', { LR: 2 }),
          opt('c', '很容易动摇，开始怀疑自己的判断', { LR: 0, SP: 0 }),
        ],
      },
      {
        id: 'q6', type: 'single', text: '你更信任哪种信息来做决定：',
        options: [
          opt('a', '数据和事实', { LR: 4 }),
          opt('b', '亲身经历和感受', { LR: 0 }),
          opt('c', '信任的人的建议和经验', { LR: 1 }),
        ],
      },
      {
        id: 'q7', type: 'single', text: '在紧急情况下需要快速决定，你通常：',
        options: [
          opt('a', '能迅速做出合理判断', { SP: 4 }),
          opt('b', '有点慌但最终能决定', { SP: 2 }),
          opt('c', '脑子一片空白，很难决定', { SP: 0 }),
        ],
      },
      {
        id: 'q8', type: 'single', text: '做选择时，你最害怕的是：',
        options: [
          opt('a', '做出不合逻辑的选择', { LR: 4 }),
          opt('b', '做出让自己内心不舒服的选择', { LR: 0 }),
          opt('c', '错过更好的选项', { SP: 0 }),
        ],
      },
      {
        id: 'q9', type: 'scale', text: '"大多数情况下，我宁愿多花时间考虑也不要做出错误的决定。"',
        options: [
          opt('a', '非常同意', { SP: 0 }),
          opt('b', '比较同意', { SP: 1 }),
          opt('c', '中立', { SP: 2 }),
          opt('d', '不太同意', { SP: 3 }),
          opt('e', '完全不同意', { SP: 4 }),
        ],
      },
      {
        id: 'q10', type: 'single', text: '回顾你做过的重要决定，你更看重：',
        options: [
          opt('a', '这个决定在逻辑上是否正确', { LR: 4 }),
          opt('b', '这个决定是否让自己感到安心', { LR: 0 }),
          opt('c', '这个决定带来了怎样的实际结果', { LR: 2 }),
        ],
      },
    ],
    resultProfiles: [
      {
        type: 'logical-fast', title: '分析型决策者', summary: '你依赖逻辑分析做决定，且效率很高。你善于收集信息、权衡利弊，并迅速做出判断。你是一个令人信赖的决策者。',
        dimensionThresholds: { LR: { min: 51, max: 100 }, SP: { min: 51, max: 100 } },
        keywords: ['逻辑', '高效', '果断', '分析'],
        strengths: ['快速收集和分析信息', '决断力强', '有主见', '决策效率高'],
        blindSpots: ['可能忽略情感因素', '有时过于自信', '可能不给他人的意见足够重视'],
        emotionalPattern: '你把决策当作需要解决的逻辑问题，情感因素往往被排在后面。这在工作中是优势，在个人关系中可能需要调整。',
        relationshipPattern: '你在关系中也可能过于"理性决策"，需要记得感情不能完全用逻辑来衡量。',
        personalSummary: '你的头脑是一台精准的分析仪。高效是好事，但有些重要决定值得慢下来。',
      },
      {
        type: 'logical-slow', title: '审慎型决策者', summary: '你同样依赖逻辑分析，但倾向于深入思考后才做决定。你重视信息和准确性，不急于下结论。',
        dimensionThresholds: { LR: { min: 51, max: 100 }, SP: { min: 0, max: 50 } },
        keywords: ['逻辑', '审慎', '深入', '全面'],
        strengths: ['考虑周全', '重视事实和证据', '不冲动决定', '决策质量高'],
        blindSpots: ['可能陷入分析瘫痪', '有时错过时机', '对不确定性的容忍度较低'],
        emotionalPattern: '你相信充分的思考能消除不确定性。但有些人生决定永远不会有完美的信息，这需要你适度拥抱不确定性。',
        relationshipPattern: '你在感情中也倾向于深思熟虑，这让你不会冲动进入关系，但也可能错过了自然而然的缘分。',
        personalSummary: '你的慎重是一种美德。但请记得：生活中最重要的决定，往往不是想出来的，而是走出来的。',
      },
      {
        type: 'intuitive-fast', title: '直觉型决策者', summary: '你相信自己的直觉和感受，并且做决定很果断。你的内心有一个敏感的指南针，能快速指向你认为正确的方向。',
        dimensionThresholds: { LR: { min: 0, max: 50 }, SP: { min: 51, max: 100 } },
        keywords: ['直觉', '果断', '感受', '自信'],
        strengths: ['快速决断', '信任自己的判断', '不被过度分析困扰', '灵活调整'],
        blindSpots: ['可能忽略重要的事实信息', '直觉有时并不可靠', '可能因过于自信而后悔'],
        emotionalPattern: '你的情绪是你的决策指南。这是一种珍贵的天赋，但偶尔也需要用理性来校准。',
        relationshipPattern: '你在感情中凭感觉行事，爱憎分明。这对快速建立连接有帮助，但也需要在关键时刻加入一些理性思考。',
        personalSummary: '你的直觉是多年经验凝结的智慧。信任它，但也给它留一扇通往理性分析的窗口。',
      },
      {
        type: 'intuitive-slow', title: '感受型决策者', summary: '你重视内心的感受，同时也不急于做决定。你希望做出的选择不仅"正确"，更要让你内心感到"对"。',
        dimensionThresholds: { LR: { min: 0, max: 50 }, SP: { min: 0, max: 50 } },
        keywords: ['感受', '审慎', '真实', '内在'],
        strengths: ['重视内心感受', '不被外部压力左右', '决策时兼顾理性感性', '真诚面对自己'],
        blindSpots: ['可能过于依赖情绪状态', '在需要快速决定时可能犹豫', '有时过度思考感受而延迟行动'],
        emotionalPattern: '你与自己的情绪有很深的连接。这是一份礼物，但也要小心不要让当下的情绪过度左右长远的选择。',
        relationshipPattern: '你在感情中非常重视真实感受，不会勉强自己。但也需要注意，感情需要行动来培养，而不仅仅是感受。',
        personalSummary: '你认真对待自己的内心。有时候答案不在更深的思考里，而在向前走出的一步里。',
      },
    ],
  },

  {
    slug: 'emotional-sensitivity',
    title: '情绪敏感度测试',
    subtitle: '了解你感知情绪的精细程度',
    description: '情绪敏感度指的是你对自身和他人情绪的觉察和处理方式。高敏感意味着你能感知到细微的情绪变化，低敏感则让你在面对情绪波动时更加稳定。两者各有优势。',
    category: 'personality',
    permissionId: 'personality',
    isFree: false,
    questionCount: 10,
    estimatedMinutes: 6,
    problemsSolved: '帮助你了解自己的情绪敏感程度，从而更好地管理情绪，不被过度刺激困扰，也不因迟钝而错过重要信号。',
    suitableFor: '经常感到被情绪淹没、或觉得自己对他人情绪不太敏感的人。',
    dimensions: [
      { id: 'ES', name: '情绪敏感度', description: '对自身和他人情绪的感知程度' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { ES: 20 } },
    questions: [
      {
        id: 'q1', type: 'single', text: '别人话中隐含的不满或失望，你通常：',
        options: [
          opt('a', '立刻就能感觉到', { ES: 4 }),
          opt('b', '有时候能感觉到，有时不能', { ES: 2 }),
          opt('c', '往往事后才意识到', { ES: 0 }),
        ],
      },
      {
        id: 'q2', type: 'scale', text: '"一部感人的电影能让我心情受影响很久。"',
        options: [
          opt('a', '非常同意', { ES: 4 }),
          opt('b', '比较同意', { ES: 3 }),
          opt('c', '中立', { ES: 2 }),
          opt('d', '不太同意', { ES: 1 }),
          opt('e', '完全不同意', { ES: 0 }),
        ],
      },
      {
        id: 'q3', type: 'single', text: '在嘈杂、明亮或拥挤的环境中，你通常：',
        options: [
          opt('a', '很快感到不适和疲惫', { ES: 4 }),
          opt('b', '有点不舒服但可以适应', { ES: 2 }),
          opt('c', '基本不受影响', { ES: 0 }),
        ],
      },
      {
        id: 'q4', type: 'single', text: '别人对你说话的语气变化，你：',
        options: [
          opt('a', '非常敏感，细微的变化都能察觉', { ES: 4 }),
          opt('b', '比较敏感，明显的语气变化能察觉', { ES: 2 }),
          opt('c', '不太注意语气变化', { ES: 0 }),
        ],
      },
      {
        id: 'q5', type: 'single', text: '看到别人尴尬或出丑的场景，你：',
        options: [
          opt('a', '会感到强烈的尴尬和不舒服', { ES: 4 }),
          opt('b', '会有点不舒服但不强烈', { ES: 2 }),
          opt('c', '不太会有特别的感觉', { ES: 0 }),
        ],
      },
      {
        id: 'q6', type: 'scale', text: '"别人的情绪很容易影响到我自己的状态。"',
        options: [
          opt('a', '非常同意', { ES: 4 }),
          opt('b', '比较同意', { ES: 3 }),
          opt('c', '中立', { ES: 2 }),
          opt('d', '不太同意', { ES: 1 }),
          opt('e', '完全不同意', { ES: 0 }),
        ],
      },
      {
        id: 'q7', type: 'single', text: '当房间里有人情绪不好时，你：',
        options: [
          opt('a', '一进门就能感觉到', { ES: 4 }),
          opt('b', '需要一点时间才能察觉', { ES: 2 }),
          opt('c', '除非对方明确表达，否则不太注意', { ES: 0 }),
        ],
      },
      {
        id: 'q8', type: 'single', text: '你需要多少独处时间来消化一天的经历：',
        options: [
          opt('a', '需要很多独处时间，否则会感到超负荷', { ES: 4 }),
          opt('b', '需要一些，但不算特别多', { ES: 2 }),
          opt('c', '基本不需要特别的独处时间', { ES: 0 }),
        ],
      },
      {
        id: 'q9', type: 'single', text: '咖啡因、强烈气味或细微的噪音对你的影响：',
        options: [
          opt('a', '影响很大，很容易被干扰', { ES: 4 }),
          opt('b', '有一定影响，但可以应对', { ES: 2 }),
          opt('c', '基本没什么影响', { ES: 0 }),
        ],
      },
      {
        id: 'q10', type: 'scale', text: '"我觉得自己比大多数人更容易被感动或触动。"',
        options: [
          opt('a', '非常同意', { ES: 4 }),
          opt('b', '比较同意', { ES: 3 }),
          opt('c', '中立', { ES: 2 }),
          opt('d', '不太同意', { ES: 1 }),
          opt('e', '完全不同意', { ES: 0 }),
        ],
      },
    ],
    resultProfiles: [
      {
        type: 'high-sensitivity', title: '高敏感型', summary: '你拥有比大多数人更敏锐的情绪感知能力。你能察觉到细微的情绪变化和环境刺激，这让你善于共情，但也更容易感到疲惫。高敏感不是弱点，而是一种独特的天赋。',
        dimensionThresholds: { ES: { min: 61, max: 100 } },
        keywords: ['敏锐', '深度加工', '易感', '共情', '丰富'],
        strengths: ['细腻的情绪感知力', '强烈的共情能力', '善于发现细节和深意', '丰富的内心世界'],
        blindSpots: ['容易过度刺激', '需要更多恢复时间', '可能过度揣测他人意图', '偶尔因敏感而产生不必要的不安'],
        emotionalPattern: '你的情绪体验丰富而深刻。你感受到的世界比大多数人更立体、更细腻。这份敏感是你的天赋，也需要你用心呵护。',
        relationshipPattern: '你在关系中非常体贴，能察觉到伴侣的微小情绪变化。但也需要注意区分"对方的情绪"和"自己的责任"。',
        personalSummary: '敏感不是脆弱，是你感知世界的天线更灵敏。学会调节信号的强度，而不是关闭天线。',
      },
      {
        type: 'moderate-sensitivity', title: '中等敏感型', summary: '你的情绪感知能力处于平衡状态。你能感知到自己和他人的情绪，但不会被轻易淹没。这种平衡让你在各种情境中都能较好地适应。',
        dimensionThresholds: { ES: { min: 36, max: 60 } },
        keywords: ['平衡', '适应', '稳定', '灵活'],
        strengths: ['良好的情绪调节能力', '既能共情也能保持距离', '在不同环境中适应良好'],
        blindSpots: ['有时可能错过细微的情绪信号', '对深度情绪体验的需求可能被自己忽视'],
        emotionalPattern: '你的情绪系统运行平稳。你能感知到情绪变化并做出调整，但不会轻易被情绪左右。',
        relationshipPattern: '你在关系中是一个稳定的存在。你能理解伴侣的情绪需求，同时保持自己的情绪边界。',
        personalSummary: '你的平衡是一种健康的常态。既不需要刻意增强敏感度，也不需要压抑自己的感受。',
      },
      {
        type: 'low-sensitivity', title: '稳定型', summary: '你在面对情绪刺激时保持稳定，不容易被外界的情绪波动影响。这种稳定性让你在压力和危机中保持冷静，是你重要的优势。',
        dimensionThresholds: { ES: { min: 0, max: 35 } },
        keywords: ['稳定', '冷静', '理性', '抗压'],
        strengths: ['在压力下保持冷静', '不容易被他人情绪影响', '决策时不受情绪干扰', '情绪恢复快'],
        blindSpots: ['可能忽略他人的情绪需求', '有时显得不够温暖', '可能错过重要的情感信号'],
        emotionalPattern: '你的情绪像一个稳定的大坝，不容易被外界的风浪撼动。这在危机中是巨大的优势，但在亲密关系中，需要刻意留出感受的空间。',
        relationshipPattern: '你在关系中稳定可靠，不情绪化。但伴侣可能需要你更多地去主动感知和回应他们的情绪需求。',
        personalSummary: '你的稳定是身边人的依靠。偶尔打开一点情感的闸门，不会冲垮你，只会让你更完整。',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 情感模式 (emotion)
  // ══════════════════════════════════════════════════════════

  {
    slug: 'attachment-style',
    title: '依恋类型测试',
    subtitle: '了解你在亲密关系中的依恋模式',
    description: '基于依恋理论，探索你在亲密关系中的核心模式——是安全型、焦虑型、回避型还是混乱型。理解自己的依恋风格，是改善亲密关系的第一步。',
    category: 'emotion',
    permissionId: 'emotion',
    isFree: false,
    questionCount: 12,
    estimatedMinutes: 8,
    problemsSolved: '帮助你理解自己在关系中反复出现的行为模式，从而更有意识地建立健康、安全的亲密关系。',
    suitableFor: '在亲密关系中感到困惑、重复类似问题、或想更了解自己关系模式的人。',
    dimensions: [
      { id: 'AX', name: '依恋焦虑', description: '对被抛弃和关系稳定性的担忧程度' },
      { id: 'AV', name: '依恋回避', description: '对亲密和依赖的不适程度' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { AX: 24, AV: 24 } },
    questions: [
      {
        id: 'q1', type: 'scale', text: '"我担心伴侣不会像我在乎他/她那样在乎我。"',
        options: [
          opt('a', '非常同意', { AX: 4 }),
          opt('b', '比较同意', { AX: 3 }),
          opt('c', '中立', { AX: 2 }),
          opt('d', '不太同意', { AX: 1 }),
          opt('e', '完全不同意', { AX: 0 }),
        ],
      },
      {
        id: 'q2', type: 'scale', text: '"我不习惯向伴侣完全敞开心扉。"',
        options: [
          opt('a', '非常同意', { AV: 4 }),
          opt('b', '比较同意', { AV: 3 }),
          opt('c', '中立', { AV: 2 }),
          opt('d', '不太同意', { AV: 1 }),
          opt('e', '完全不同意', { AV: 0 }),
        ],
      },
      {
        id: 'q3', type: 'single', text: '当伴侣没有及时回复消息时，你通常：',
        options: [
          opt('a', '开始焦虑，担心是不是自己做了什么让对方不高兴', { AX: 4 }),
          opt('b', '有点在意但能自我调节', { AX: 2 }),
          opt('c', '不太在意，各忙各的很正常', { AX: 0 }),
        ],
      },
      {
        id: 'q4', type: 'single', text: '当关系变得太亲密时，你倾向于：',
        options: [
          opt('a', '感到有些不自在，想保持一定距离', { AV: 4 }),
          opt('b', '需要一点时间适应，但最终能接受', { AV: 2 }),
          opt('c', '享受亲密，不会觉得不适', { AV: 0 }),
        ],
      },
      {
        id: 'q5', type: 'scale', text: '"我经常需要确认伴侣对我的感情。"',
        options: [
          opt('a', '非常同意', { AX: 4 }),
          opt('b', '比较同意', { AX: 3 }),
          opt('c', '中立', { AX: 2 }),
          opt('d', '不太同意', { AX: 1 }),
          opt('e', '完全不同意', { AX: 0 }),
        ],
      },
      {
        id: 'q6', type: 'scale', text: '"在关系中保持独立比完全融合更重要。"',
        options: [
          opt('a', '非常同意', { AV: 4 }),
          opt('b', '比较同意', { AV: 3 }),
          opt('c', '中立', { AV: 2 }),
          opt('d', '不太同意', { AV: 1 }),
          opt('e', '完全不同意', { AV: 0 }),
        ],
      },
      {
        id: 'q7', type: 'single', text: '吵架后，你更倾向于：',
        options: [
          opt('a', '立刻想要和好，害怕冷战持续', { AX: 4 }),
          opt('b', '需要冷静一下，但不会拖太久', { AX: 2, AV: 0 }),
          opt('c', '自己待着，不太想主动联系', { AV: 4 }),
        ],
      },
      {
        id: 'q8', type: 'single', text: '伴侣对你表达强烈的爱意时，你感觉：',
        options: [
          opt('a', '非常开心和安心', { AX: 0, AV: 0 }),
          opt('b', '开心但也有一点点压力', { AX: 1, AV: 1 }),
          opt('c', '有些不知所措，甚至想退缩', { AV: 4 }),
        ],
      },
      {
        id: 'q9', type: 'scale', text: '"如果伴侣离开我，我的人生会变得不完整。"',
        options: [
          opt('a', '非常同意', { AX: 4 }),
          opt('b', '比较同意', { AX: 3 }),
          opt('c', '中立', { AX: 2 }),
          opt('d', '不太同意', { AX: 1 }),
          opt('e', '完全不同意', { AX: 0 }),
        ],
      },
      {
        id: 'q10', type: 'single', text: '你是否觉得依赖别人是软弱的表现：',
        options: [
          opt('a', '是的，我不喜欢依赖任何人', { AV: 4 }),
          opt('b', '有点，但我理解适当的依赖是正常的', { AV: 2 }),
          opt('c', '不觉得，相互依赖是关系的一部分', { AV: 0 }),
        ],
      },
      {
        id: 'q11', type: 'single', text: '伴侣心情不好但不肯说原因时，你：',
        options: [
          opt('a', '非常焦虑，反复追问，觉得可能是自己的原因', { AX: 4 }),
          opt('b', '有点在意，但会给他/她一些空间', { AX: 2 }),
          opt('c', '给空间，相信对方想说的时候自然会说', { AX: 0, AV: 1 }),
        ],
      },
      {
        id: 'q12', type: 'single', text: '一段关系结束后，你通常：',
        options: [
          opt('a', '急于寻找新的关系来填补空缺', { AX: 4 }),
          opt('b', '需要较长时间恢复，但能走出来', { AX: 2 }),
          opt('c', '告诉自己一个人也很好，快速投入工作或其他事', { AV: 4 }),
        ],
      },
    ],
    resultProfiles: [
      {
        type: 'secure', title: '安全型依恋', summary: '你在亲密关系中感到自在，能够在亲密的连接和独立之间找到健康的平衡。你相信自己是值得被爱的，也相信伴侣是可靠的。',
        dimensionThresholds: { AX: { min: 0, max: 49 }, AV: { min: 0, max: 49 } },
        keywords: ['安全', '信任', '平衡', '健康'],
        strengths: ['在关系中感到安全', '能表达需求也能给予空间', '相信自己也相信伴侣', '善于处理冲突'],
        blindSpots: ['可能不理解不安全依恋的伴侣为何如此焦虑或回避'],
        emotionalPattern: '你在关系中情绪稳定，不会因小事过度反应。你享受亲密也享受独立。',
        relationshipPattern: '你能够建立健康、稳定、相互尊重的关系。你是伴侣的安全基地，也允许对方成为你的。',
        personalSummary: '你的安全感是你给关系最好的礼物。保持这份信任，也温柔地理解那些还在寻找安全感的人。',
      },
      {
        type: 'anxious', title: '焦虑型依恋', summary: '你在关系中渴望亲密和被爱，但内心常常担心被抛弃或不被足够重视。你可能需要频繁的确认和回应来感到安心。',
        dimensionThresholds: { AX: { min: 51, max: 100 }, AV: { min: 0, max: 49 } },
        keywords: ['渴望亲密', '不安', '需要确认', '敏感'],
        strengths: ['对关系非常投入', '情感丰富而真诚', '善于察觉关系中的问题'],
        blindSpots: ['过度担心可能导致自我实现的预言', '可能给伴侣太多压力', '容易因小事产生强烈情绪反应'],
        emotionalPattern: '你的情绪常常随着关系的温度起伏。当感觉连接稳固时你最快乐，当感觉疏远时你最痛苦。',
        relationshipPattern: '你给关系投入了大量的情感。学习自我安抚和建立内在安全感，能让你在爱中更从容。',
        personalSummary: '你的爱深沉而热烈。信任自己值得被爱，即使没有每时每刻的确认。',
      },
      {
        type: 'avoidant', title: '回避型依恋', summary: '你在关系中重视独立和自主，不习惯过度亲密。你可能觉得依赖别人是软弱的，也不喜欢别人过度依赖你。',
        dimensionThresholds: { AX: { min: 0, max: 49 }, AV: { min: 51, max: 100 } },
        keywords: ['独立', '自足', '保持距离', '理性'],
        strengths: ['高度独立自主', '不轻易被情绪左右', '在独处中感到自在'],
        blindSpots: ['可能推开真正关心你的人', '在亲密关系中显得冷淡', '可能忽视自己内心对连接的需求'],
        emotionalPattern: '你习惯自己处理情绪，不轻易向他人展露脆弱。这让你看起来很强大，但也可能让你感到孤独。',
        relationshipPattern: '你在关系中需要大量空间。找到一个尊重你边界、也愿意等你慢慢敞开的伴侣很重要。',
        personalSummary: '你的独立是一种力量。但允许自己偶尔依靠别人，不是软弱，是另一种勇敢。',
      },
      {
        type: 'fearful', title: '混乱型依恋', summary: '你在关系中既渴望亲密又害怕亲密。你可能在关系中反复出现推拉模式——靠近时感到不安，远离时又渴望连接。',
        dimensionThresholds: { AX: { min: 51, max: 100 }, AV: { min: 51, max: 100 } },
        keywords: ['矛盾', '渴望又恐惧', '起伏', '复杂'],
        strengths: ['对自己和关系有深刻的洞察', '情感体验丰富', '渴望真正的连接'],
        blindSpots: ['推拉模式可能伤害自己和伴侣', '情绪波动较大', '对关系缺乏稳定的预期'],
        emotionalPattern: '你的内心同时存在对亲密的渴望和对受伤的恐惧。这两种力量常常让你在关系中感到困惑和疲惫。',
        relationshipPattern: '你在关系中可能有"靠近-推开"的反复模式。理解这种模式是改变的第一步。',
        personalSummary: '你的内心同时渴望爱与恐惧受伤。理解这种矛盾，温柔地对待它，慢慢地你会找到属于自己的平衡。',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 情感模式 (emotion) — 其余 3 个测试
  // ══════════════════════════════════════════════════════════

  {
    slug: 'love-behavior', title: '恋爱中的行为模式', subtitle: '看清你在爱情中的本能反应',
    description: '了解你在恋爱关系中反复出现的行为模式，包括你如何表达爱、如何处理冲突、如何应对不确定性。',
    category: 'emotion', permissionId: 'emotion', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你识别在恋爱中可能有问题的行为模式，从而有意识地做出调整。',
    suitableFor: '在恋爱中感到困惑、或多次重复相似问题的人。',
    dimensions: [{ id: 'LB', name: '行为模式', description: '恋爱行为偏向：投入型/平衡型/独立型' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { LB: 20 } },
    questions: [
      { id: 'q1', type: 'single', text: '刚开始一段关系时，你通常会：', options: [opt('a','全身心投入，每天都想在一起',{LB:4}),opt('b','慢慢来，让感情自然发展',{LB:2}),opt('c','保持一定距离，不太快投入',{LB:0})] },
      { id: 'q2', type: 'scale', text: '"在关系中，我倾向于把伴侣的需求放在自己前面。"', options: [opt('a','非常同意',{LB:4}),opt('b','比较同意',{LB:3}),opt('c','中立',{LB:2}),opt('d','不太同意',{LB:1}),opt('e','完全不同意',{LB:0})] },
      { id: 'q3', type: 'single', text: '和伴侣发生分歧时，你通常：', options: [opt('a','倾向于妥协，维持和谐',{LB:4}),opt('b','坚持己见，据理力争',{LB:0}),opt('c','先冷静一下再讨论',{LB:2})] },
      { id: 'q4', type: 'scale', text: '"我需要知道伴侣每时每刻在做什么，否则会不安。"', options: [opt('a','非常同意',{LB:4}),opt('b','比较同意',{LB:3}),opt('c','中立',{LB:2}),opt('d','不太同意',{LB:1}),opt('e','完全不同意',{LB:0})] },
      { id: 'q5', type: 'single', text: '伴侣和朋友出去玩没叫你，你：', options: [opt('a','很不开心，觉得自己被冷落',{LB:4}),opt('b','有点在意但理解对方需要自己的空间',{LB:2}),opt('c','无所谓，自己也有自己的生活',{LB:0})] },
      { id: 'q6', type: 'single', text: '当关系中出现沉默或空白时，你：', options: [opt('a','感到不安，想赶紧找话说',{LB:4}),opt('b','有时不太舒服，但能容忍',{LB:2}),opt('c','享受这种安静，不需要一直说话',{LB:0})] },
      { id: 'q7', type: 'single', text: '你如何回应伴侣的批评：', options: [opt('a','立刻道歉或解释，想尽快修复',{LB:4}),opt('b','先听对方说完，再表达自己的想法',{LB:2}),opt('c','防御性地反驳，不太接受批评',{LB:0})] },
      { id: 'q8', type: 'scale', text: '"爱情应该永远保持刚认识时的那种激情。"', options: [opt('a','非常同意',{LB:3}),opt('b','比较同意',{LB:2}),opt('c','中立',{LB:2}),opt('d','不太同意',{LB:1}),opt('e','完全不同意',{LB:0})] },
      { id: 'q9', type: 'single', text: '你对"给伴侣惊喜"的态度是：', options: [opt('a','很喜欢准备惊喜，是表达爱的重要方式',{LB:4}),opt('b','偶尔会做，但不会太刻意',{LB:2}),opt('c','不太擅长也不太在意这些形式',{LB:0})] },
      { id: 'q10', type: 'single', text: '觉得自己在恋爱中最大的问题是：', options: [opt('a','太粘人，容易失去自我',{LB:4}),opt('b','有时过于理智，显得不够浪漫',{LB:0}),opt('c','在不同关系中表现不同，说不准',{LB:2})] },
    ],
    resultProfiles: [
      { type:'invested', title:'投入型', summary:'你在爱情中全情投入，把关系放在很重要的位置。你的爱热烈而真诚，但也需要注意保持自我边界。',
        dimensionThresholds:{LB:{min:61,max:100}}, keywords:['投入','热烈','关怀','付出型'],
        strengths:['真诚的情感表达','愿意为关系付出','善于制造浪漫','感情深沉'], blindSpots:['可能过度投入失去自我','容易产生不安全感','有时给对方太大压力'],
        emotionalPattern:'你的情绪与关系状态高度绑定。关系中好你就好，关系中不好你就很痛苦。',
        relationshipPattern:'你需要学习在爱中保持自我。两个人不等于一个人，保持独立的你反而让关系更健康。',
        personalSummary:'你的爱像一团火，温暖而明亮。但火需要燃料，记得给自己留一些。' },
      { type:'balanced', title:'平衡型', summary:'你在爱情中能够平衡亲密与独立。你享受两个人的时光，也珍惜各自的空間。',
        dimensionThresholds:{LB:{min:36,max:60}}, keywords:['平衡','成熟','稳定','互信'],
        strengths:['健康的关系边界','既能付出也能接受','稳定可靠','善于沟通'], blindSpots:['有时可能过于理性','可能被误解为不够热情'],
        emotionalPattern:'你在关系中情绪稳定，不会因小事大起大落。这让你的伴侣感到安心。',
        relationshipPattern:'你的平衡是关系的良好基础。继续保持这种相互尊重又彼此珍惜的模式。',
        personalSummary:'你的爱像一棵树，根基稳固而枝叶舒展。不张扬，但让人安心。' },
      { type:'independent', title:'独立型', summary:'你在爱情中非常重视个人空间和独立性。你的爱可能不常挂在嘴边，但用行动来表达。',
        dimensionThresholds:{LB:{min:0,max:35}}, keywords:['独立','自足','理性','行动派'],
        strengths:['自我价值不依赖关系','在关系中保持清醒','用行动而非言语表达爱'], blindSpots:['可能显得冷淡疏远','伴侣可能感到不被需要','有时回避情感表达'],
        emotionalPattern:'你习惯自己处理情绪，不太依赖伴侣提供情感支持。这让你在关系中显得独立，但也可能让伴侣觉得被排除在外。',
        relationshipPattern:'你需要学习在独立之外，也让伴侣感受到被需要。爱不仅是各自安好，也是彼此依靠。',
        personalSummary:'你的独立是你的魅力。偶尔放下盔甲，让在乎的人走近，不会失去自己。' },
    ],
  },

  {
    slug: 'emotional-needs', title: '情感需求测试', subtitle: '发现你在关系中最渴望什么',
    description: '每个人在关系中都有独特的情感需求——有人需要很多言语肯定，有人更需要高质量的陪伴。这个测试帮你识别自己的核心情感需求。',
    category: 'emotion', permissionId: 'emotion', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你向伴侣更清晰地表达自己的需求，也理解自己为什么在某些关系中感到不满足。',
    suitableFor: '总觉得伴侣"不懂自己"、在关系中感到不满足但说不清缺什么的人。',
    dimensions: [
      { id: 'WA', name: '言语肯定需求', description: '需要言语表达的爱和认可' },
      { id: 'AC', name: '陪伴需求', description: '需要高质量的共处时间' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { WA: 20, AC: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"伴侣经常说爱我对我很重要。"', options: [opt('a','非常同意',{WA:4}),opt('b','比较同意',{WA:3}),opt('c','中立',{WA:2}),opt('d','不太同意',{WA:1}),opt('e','完全不同意',{WA:0})] },
      { id: 'q2', type: 'scale', text: '"和伴侣一起做日常小事（比如逛超市）对我来说很幸福。"', options: [opt('a','非常同意',{AC:4}),opt('b','比较同意',{AC:3}),opt('c','中立',{AC:2}),opt('d','不太同意',{AC:1}),opt('e','完全不同意',{AC:0})] },
      { id: 'q3', type: 'single', text: '哪种方式让你感觉最被爱：', options: [opt('a','伴侣认真地对你说温暖的话',{WA:4}),opt('b','伴侣花时间陪你做你喜欢的事',{AC:4}),opt('c','伴侣记住你的需求并默默帮你处理',{WA:2,AC:2})] },
      { id: 'q4', type: 'single', text: '伴侣出差一周，你最想念的是：', options: [opt('a','每天的电话或消息交流',{WA:4}),opt('b','一起吃饭、散步的日常陪伴',{AC:4}),opt('c','说不上来具体想什么，就是觉得少了点什么',{WA:2,AC:2})] },
      { id: 'q5', type: 'scale', text: '"行动比语言更有力量，我不需要伴侣一直说爱我。"', options: [opt('a','非常同意',{WA:0}),opt('b','比较同意',{WA:1}),opt('c','中立',{WA:2}),opt('d','不太同意',{WA:3}),opt('e','完全不同意',{WA:4})] },
      { id: 'q6', type: 'single', text: '你的"爱的语言"更偏向：', options: [opt('a','说出来——赞美、感谢、鼓励',{WA:4}),opt('b','在一起——安静陪伴、共同经历',{AC:4}),opt('c','做出来——帮忙解决问题、实际行动',{WA:1,AC:1})] },
      { id: 'q7', type: 'single', text: '你和伴侣各自刷手机但坐在同一个房间里，你觉得：', options: [opt('a','挺好的，这就是我想要的陪伴感',{AC:4}),opt('b','有点无聊，希望有更多互动',{WA:4}),opt('c','无所谓，看心情',{WA:2,AC:2})] },
      { id: 'q8', type: 'single', text: '伴侣忘记了你们的纪念日但准备了惊喜补偿，你：', options: [opt('a','还是很在意忘记这件事',{WA:3,AC:1}),opt('b','惊喜补偿让我很开心，忘记没关系',{AC:4}),opt('c','两者平衡：有点遗憾但也能接受',{WA:2,AC:2})] },
      { id: 'q9', type: 'scale', text: '"我宁愿伴侣少说一些甜言蜜语，多花时间真正和我在一起。"', options: [opt('a','非常同意',{AC:4}),opt('b','比较同意',{AC:3}),opt('c','中立',{AC:2}),opt('d','不太同意',{AC:1}),opt('e','完全不同意',{AC:0})] },
      { id: 'q10', type: 'single', text: '回想最幸福的关系时刻，它通常是：', options: [opt('a','对方对我说了让我非常感动的话',{WA:4}),opt('b','和对方一起度过的一段安静美好的时光',{AC:4}),opt('c','对方为我做了一件让我特别感动的事',{WA:2,AC:2})] },
    ],
    resultProfiles: [
      { type:'words', title:'言语肯定型', summary:'你最重要的情感需求是言语上的爱和认可。听到伴侣说"我爱你"、收到温暖的赞美，对你来说是不可或缺的情感滋养。',
        dimensionThresholds:{WA:{min:51,max:100},AC:{min:0,max:50}}, keywords:['言语','肯定','表达','沟通'],
        strengths:['善于表达自己的情感','重视关系中的沟通','能给伴侣清晰的需求指引'], blindSpots:['可能过度依赖言语确认','当伴侣不善言辞时会感到不安'],
        emotionalPattern:'言语对你来说不仅是沟通工具，更是情感的载体。沉默会让你感到不安。',
        relationshipPattern:'你需要一个愿意用言语表达爱的伴侣。学会欣赏对方用行动表达的另一种爱也很重要。',
        personalSummary:'你的需求是合理的。真诚地告诉伴侣你需要听到的话，也给对方时间去学习你的语言。' },
      { type:'presence', title:'陪伴型', summary:'你最重要的情感需求是高质量的陪伴。对你说一百句情话，不如安静地坐在你身边看一场电影。',
        dimensionThresholds:{WA:{min:0,max:50},AC:{min:51,max:100}}, keywords:['陪伴','共处','时间','行动'],
        strengths:['珍惜真实相处的时光','对言语表达的依赖较低','善于在日常中感受爱'], blindSpots:['可能忽视伴侣对言语肯定的需求','当对方很忙时感到被冷落'],
        emotionalPattern:'你用"在一起的时间"来测量爱的浓度。时间投入本身就是你最看重的爱的证明。',
        relationshipPattern:'你需要一个愿意为你花时间的伴侣。同时也要理解，有时候忙碌并不等于不爱。',
        personalSummary:'你的爱实实在在。享受共处的每一刻，也相信那比任何言语都更有力量。' },
      { type:'both', title:'均衡型', summary:'你既需要言语的肯定，也需要实实在在的陪伴。两者对你来说同等重要，缺一不可。',
        dimensionThresholds:{WA:{min:51,max:100},AC:{min:51,max:100}}, keywords:['均衡','全面','丰富'],
        strengths:['需求清晰全面','能够在不同形式的爱中感受满足'], blindSpots:['可能对伴侣要求较高','当某一方面不足时容易感到不满'],
        emotionalPattern:'你渴望丰富而多元的爱的表达。这种丰富性让你在关系中感受深刻，也让你对爱的标准较高。',
        relationshipPattern:'你需要一个能在言语和行动上都满足你的伴侣。学会在对方擅长的方式中找到满足也很重要。',
        personalSummary:'你对爱的理解是完整的。享受这种丰富，也给伴侣留下成长和学习的空间。' },
      { type:'action', title:'行动型', summary:'你的情感需求既不是大量言语也不是长时间陪伴，而是实际的行动——对方为你做的事、帮的忙、解决的问题。',
        dimensionThresholds:{WA:{min:0,max:50},AC:{min:0,max:50}}, keywords:['行动','务实','服务'],
        strengths:['不被甜言蜜语冲昏头脑','看重实际行动'], blindSpots:['伴侣可能觉得做得不够好','需要学习接受不同形式的爱'],
        emotionalPattern:'你通过对方做了什么来判断爱的深度。行动对你来说是最诚实的语言。',
        relationshipPattern:'你需要一个能通过行动表达爱的伴侣。同时也要学习欣赏言语和陪伴中的爱意。',
        personalSummary:'你重视实实在在的爱。记得偶尔也告诉伴侣你看到了、感受到了，这对他们很重要。' },
    ],
  },

  {
    slug: 'breakup-recovery', title: '分手与关系恢复模式', subtitle: '理解你面对失去的方式',
    description: '探索你在面对关系结束或重大失望时的应对模式——有的人快速转移注意力，有的人需要长时间的沉淀。理解自己的模式有助于更健康地度过难关。',
    category: 'emotion', permissionId: 'emotion', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你理解自己在面对关系失去时的反应模式，减少自责，找到更适合自己的恢复路径。',
    suitableFor: '正在经历分手、或对过往分手经历仍感到困扰的人。',
    dimensions: [{ id: 'BR', name: '恢复模式', description: '分手后的恢复方式：快速翻篇/慢慢愈合' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { BR: 20 } },
    questions: [
      { id: 'q1', type: 'single', text: '一段认真投入的关系结束后，你通常需要多久才能感觉"走出来了"：', options: [opt('a','相对较快，几个月就能翻篇',{BR:4}),opt('b','需要大半年到一年',{BR:2}),opt('c','需要很长时间，一两年甚至更久',{BR:0})] },
      { id: 'q2', type: 'single', text: '分手后你的第一反应通常是：', options: [opt('a','立刻切断联系，让自己忙起来',{BR:4}),opt('b','会难过一阵子，但不影响正常生活',{BR:2}),opt('c','整个人被情绪淹没，很难正常生活',{BR:0})] },
      { id: 'q3', type: 'single', text: '你会保留前任的社交账号或联系方式吗：', options: [opt('a','全部删掉，看到就不舒服',{BR:4}),opt('b','留着但不会主动联系',{BR:2}),opt('c','舍不得删，偶尔还会看看',{BR:0})] },
      { id: 'q4', type: 'scale', text: '"分手后，我倾向于快速开始新的约会或关系来转移注意力。"', options: [opt('a','非常同意',{BR:4}),opt('b','比较同意',{BR:3}),opt('c','中立',{BR:2}),opt('d','不太同意',{BR:1}),opt('e','完全不同意',{BR:0})] },
      { id: 'q5', type: 'single', text: '分手后你会不断回想"如果当初……就好了"吗：', options: [opt('a','不会，过去就过去了',{BR:4}),opt('b','偶尔会，但不困扰',{BR:2}),opt('c','经常会，反复想如果做了不同选择会不会不一样',{BR:0})] },
      { id: 'q6', type: 'single', text: '听到前任有了新的对象，你的反应：', options: [opt('a','没什么感觉，与我无关',{BR:4}),opt('b','有点不舒服但能接受',{BR:2}),opt('c','非常难过，觉得被取代了',{BR:0})] },
      { id: 'q7', type: 'single', text: '分手后你如何对待共同的朋友圈：', options: [opt('a','保持正常交往，不因分手改变',{BR:4}),opt('b','暂时少联系，等平静了再说',{BR:2}),opt('c','尽量避免，怕尴尬或想起对方',{BR:0})] },
      { id: 'q8', type: 'scale', text: '"我宁愿自己慢慢消化分手的痛苦，也不愿向朋友反复倾诉。"', options: [opt('a','非常同意',{BR:0}),opt('b','比较同意',{BR:1}),opt('c','中立',{BR:2}),opt('d','不太同意',{BR:3}),opt('e','完全不同意',{BR:4})] },
      { id: 'q9', type: 'single', text: '你如何看待"分手后还能做朋友"：', options: [opt('a','可以，感情结束了就是结束了',{BR:4}),opt('b','理论上可以，但实际上很难',{BR:2}),opt('c','做不到，彻底断了比较好',{BR:0})] },
      { id: 'q10', type: 'single', text: '一段关系结束后，你觉得最大的收获通常是：', options: [opt('a','更清楚自己想要什么',{BR:2}),opt('b','一段宝贵的人生经历',{BR:2}),opt('c','还在寻找答案中',{BR:1})] },
    ],
    resultProfiles: [
      { type:'fast-recovery', title:'快速翻篇型', summary:'你有较强的心理韧性，能够在关系结束后相对快速地调整状态并向前看。你倾向于用行动来应对痛苦，而不是沉浸在情绪中。',
        dimensionThresholds:{BR:{min:61,max:100}}, keywords:['韧性','行动','向前看','独立'],
        strengths:['心理恢复快','善于自我调节','不沉溺于过去'], blindSpots:['可能回避真正的情绪处理','有时看起来"太冷血"','可能跳过必要的哀悼阶段'],
        emotionalPattern:'你倾向于用理性切割来处理情感。这让你恢复快，但也要确保不是压抑而是真正消化。',
        relationshipPattern:'你的恢复能力让你能较快重新开始。但每一段关系都有值得沉淀的东西，别翻篇太快。',
        personalSummary:'你的坚强让人佩服。偶尔允许自己脆弱，不耽误你继续前行。' },
      { type:'moderate-recovery', title:'自然愈合型', summary:'你以自然的速度消化分手的痛苦。你不会刻意催促自己"快点好起来"，也不会沉溺其中无法自拔。',
        dimensionThresholds:{BR:{min:36,max:60}}, keywords:['自然','耐心','接纳','成长'],
        strengths:['允许自己真实地感受痛苦','在过程中获得成长','不被外界节奏催促'], blindSpots:['恢复时间可能较长','在过程中有时会反复'],
        emotionalPattern:'你相信时间是最好的药。你允许自己慢慢地、完整地走完哀悼的过程。',
        relationshipPattern:'你在每段关系结束后都会认真反思和整理，这让你的下一段关系通常更好。',
        personalSummary:'你的方式是最健康的。不逃避痛苦，也不被痛苦定义。时间是你的朋友。' },
      { type:'slow-recovery', title:'深度愈合型', summary:'你是一个情感深沉的人，关系的结束对你的影响很深。你需要很长时间来消化和恢复，这不是脆弱，而是你用心爱过的证明。',
        dimensionThresholds:{BR:{min:0,max:35}}, keywords:['深情','内省','敏感','沉淀'],
        strengths:['情感体验深刻','在痛苦中获得深刻的自我认知','用心爱过不留遗憾'], blindSpots:['可能过度沉浸在过去','有时难以重新开始','可能把新关系和旧关系比较'],
        emotionalPattern:'你的情绪有很深的根。拔掉一棵树比拔掉一棵草需要更长的时间，这是自然的。',
        relationshipPattern:'你的深情是你的本质。但也要学会——新的种子需要新的土壤，而不是在旧土里反复翻找。',
        personalSummary:'慢慢来。真正愈合的过程不是遗忘，而是带着经历继续生长。' },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 人际关系 (relationship) — 4 个测试
  // ══════════════════════════════════════════════════════════

  {
    slug: 'social-personality', title: '社交人格测试', subtitle: '了解你在社交中的自然角色',
    description: '每个人在群体中都有自己独特的角色——有人是天生的组织者、有人是安静的观察者、有人是活跃气氛的人。发现你的社交人格。',
    category: 'relationship', permissionId: 'relationship', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你在社交中找到自己最舒适的位置，减少社交焦虑，发挥自己的社交优势。',
    suitableFor: '在社交场合中感到不自在、或不确定自己适合什么社交角色的人。',
    dimensions: [{ id: 'SP', name: '社交角色', description: '社交中的自然角色偏向' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { SP: 20 } },
    questions: [
      { id: 'q1', type: 'single', text: '在一个新群体中，你通常会：', options: [opt('a','主动组织和协调大家',{SP:4}),opt('b','积极参与但不主导',{SP:2}),opt('c','先观察，慢慢找到自己的位置',{SP:0})] },
      { id: 'q2', type: 'single', text: '聚会中大家突然沉默，你：', options: [opt('a','主动找话题活跃气氛',{SP:4}),opt('b','偶尔会救场，但不是每次都出手',{SP:2}),opt('c','沉默就沉默吧，不需要每次都打破',{SP:0})] },
      { id: 'q3', type: 'scale', text: '"在群体中，我更喜欢听大家说而不是自己说。"', options: [opt('a','非常同意',{SP:0}),opt('b','比较同意',{SP:1}),opt('c','中立',{SP:2}),opt('d','不太同意',{SP:3}),opt('e','完全不同意',{SP:4})] },
      { id: 'q4', type: 'single', text: '朋友遇到矛盾找你调解时，你：', options: [opt('a','乐于调解，觉得自己擅长处理',{SP:4}),opt('b','可以试试但不太自信',{SP:2}),opt('c','不想卷入，让当事人自己解决',{SP:0})] },
      { id: 'q5', type: 'single', text: '你如何看待自己在群体中的"存在感"：', options: [opt('a','挺强的，大家容易注意到我',{SP:4}),opt('b','中等，需要的时候能站出来',{SP:2}),opt('c','比较低，我更习惯在边缘位置',{SP:0})] },
      { id: 'q6', type: 'single', text: '集体活动需要有人组织时，你：', options: [opt('a','主动承担组织者的角色',{SP:4}),opt('b','如果有人需要帮忙会协助',{SP:2}),opt('c','等别人组织好参与就好',{SP:0})] },
      { id: 'q7', type: 'scale', text: '"我不太喜欢成为大家注意的焦点。"', options: [opt('a','非常同意',{SP:0}),opt('b','比较同意',{SP:1}),opt('c','中立',{SP:2}),opt('d','不太同意',{SP:3}),opt('e','完全不同意',{SP:4})] },
      { id: 'q8', type: 'single', text: '在团队讨论中，你的发言频率：', options: [opt('a','经常发言，有想法就会说',{SP:4}),opt('b','中等，有话则长无话则短',{SP:2}),opt('c','较少发言，除非被问到',{SP:0})] },
      { id: 'q9', type: 'single', text: '被别人评价"你很有领导力"时，你：', options: [opt('a','认同，我确实喜欢带头',{SP:4}),opt('b','有点意外但能接受',{SP:2}),opt('c','不认同，我不觉得自己有领导力',{SP:0})] },
      { id: 'q10', type: 'single', text: '参加社交活动后你的感觉：', options: [opt('a','精力充沛，很开心',{SP:4}),opt('b','看情况，有时候开心有时候累',{SP:2}),opt('c','通常很疲惫，需要时间恢复',{SP:0})] },
    ],
    resultProfiles: [
      { type:'leader', title:'主导型', summary:'你是群体中的天然领导者，善于组织和带动他人。人们在需要方向和协调时往往会看向你。',
        dimensionThresholds:{SP:{min:61,max:100}}, keywords:['主导','领导','组织','外向'],
        strengths:['善于组织和协调','有自然的领导力','敢于表达和带头'], blindSpots:['可能过于主导给他人压力','有时忽略安静成员的声音'],
        emotionalPattern:'你在社交中通过掌控和引导来获得安全感。当一切在你的协调下顺利进行时，你感到满足。',
        relationshipPattern:'你习惯在关系中也是"主导"的一方。注意给对方留出主导的空间，关系需要平衡。',
        personalSummary:'你的领导力是一种天赋。有时候最好的领导不是走在最前面，而是走在旁边。' },
      { type:'participant', title:'参与型', summary:'你在群体中积极参与但不抢风头。你是团队的粘合剂，善于配合和支持。',
        dimensionThresholds:{SP:{min:36,max:60}}, keywords:['参与','配合','平衡','协作'],
        strengths:['善于配合和协作','在群体中灵活适应','能平衡表达和倾听'], blindSpots:['有时可能过于被动','在需要主动时可能犹豫'],
        emotionalPattern:'你在群体中感受氛围并自然融入。你不需要主导，但也不缺席。',
        relationshipPattern:'你在关系中是一个好搭档。你懂得何时前进何时后退，这种灵活性非常珍贵。',
        personalSummary:'你的平衡是一种智慧。不争不抢，但一直在场，从不缺席。' },
      { type:'observer', title:'观察型', summary:'你在群体中更倾向于观察和倾听。你不是冷漠，而是用不同的方式参与——你注意到别人忽略的细节，理解更深层的动态。',
        dimensionThresholds:{SP:{min:0,max:35}}, keywords:['观察','倾听','深度','安静'],
        strengths:['善于观察和理解','是很好的倾听者','不随波逐流'], blindSpots:['可能被认为不合群','有时过于安静而错过表达机会'],
        emotionalPattern:'你通过观察来参与社交。你不是局外人，只是用安静的方式在场。',
        relationshipPattern:'你在关系中是一个用心的观察者。你记得伴侣的喜好和习惯，用细微的方式表达关心。',
        personalSummary:'你的安静是一种力量。你看到的世界比别人更细腻，这是你自己的望远镜。' },
    ],
  },

  {
    slug: 'conflict-style', title: '冲突处理方式', subtitle: '了解你面对冲突时的本能反应',
    description: '冲突是人际关系中不可避免的一部分。了解你在冲突中的自然反应——是直面、回避、妥协还是对抗——能帮助你更有意识地处理分歧。',
    category: 'relationship', permissionId: 'relationship', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你在冲突中减少情绪化反应，选择更有效的处理方式，维护重要的人际关系。',
    suitableFor: '经常在冲突中感到失控、后悔自己的反应方式、或害怕冲突的人。',
    dimensions: [
      { id: 'CA', name: '直面-回避', description: '面对冲突时倾向于直面还是回避' },
      { id: 'CC', name: '合作-竞争', description: '处理冲突时倾向于合作还是竞争' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { CA: 20, CC: 20 } },
    questions: [
      { id: 'q1', type: 'single', text: '有人当众指出你的错误时，你的第一反应是：', options: [opt('a','正面回应，解释自己的立场',{CA:4,CC:4}),opt('b','沉默或尴尬地笑笑，想赶紧过去',{CA:0,CC:0}),opt('c','表面接受，心里不太服气',{CA:2,CC:2})] },
      { id: 'q2', type: 'single', text: '和亲近的人发生争执时，你倾向于：', options: [opt('a','一定要把话说清楚，不逃避',{CA:4}),opt('b','先冷静一下，但最终会面对',{CA:2}),opt('c','先回避，等情绪过了再说',{CA:0})] },
      { id: 'q3', type: 'scale', text: '"在争论中，我更在意谁对谁错而不是维持和谐。"', options: [opt('a','非常同意',{CC:4}),opt('b','比较同意',{CC:3}),opt('c','中立',{CC:2}),opt('d','不太同意',{CC:1}),opt('e','完全不同意',{CC:0})] },
      { id: 'q4', type: 'single', text: '冲突中对方哭了或情绪崩溃时，你：', options: [opt('a','暂停争论，先安抚对方',{CC:0}),opt('b','有点不知所措，但会试着缓和',{CC:1}),opt('c','觉得对方在打感情牌，继续讲道理',{CC:4})] },
      { id: 'q5', type: 'single', text: '发生冲突后，你会主动联系对方吗：', options: [opt('a','会，我觉得没什么大不了的',{CA:4}),opt('b','看情况，如果是我的问题会主动',{CA:2}),opt('c','通常不会，等对方先来',{CA:0})] },
      { id: 'q6', type: 'scale', text: '"避免冲突比解决问题更重要，尤其是和重要的人。"', options: [opt('a','非常同意',{CA:0,CC:0}),opt('b','比较同意',{CA:1,CC:1}),opt('c','中立',{CA:2,CC:2}),opt('d','不太同意',{CA:3,CC:3}),opt('e','完全不同意',{CA:4,CC:4})] },
      { id: 'q7', type: 'single', text: '在意见截然不同的会议上，你：', options: [opt('a','清晰表达自己的立场，推动讨论',{CA:4,CC:4}),opt('b','表达但会注意不让气氛太紧张',{CA:2,CC:2}),opt('c','尽量不表达不同意见，保持气氛',{CA:0,CC:0})] },
      { id: 'q8', type: 'single', text: '冲突结束后，你通常会：', options: [opt('a','很快翻篇，不记仇',{CA:4}),opt('b','需要一些时间消化',{CA:2}),opt('c','会记住这件事，心里有个疙瘩',{CA:0})] },
      { id: 'q9', type: 'single', text: '你更认同哪种说法：', options: [opt('a','冲突是解决问题的方式，不一定是坏事',{CA:4,CC:2}),opt('b','大多数冲突可以通过沟通化解',{CA:2,CC:2}),opt('c','能避免的冲突都应该避免',{CA:0,CC:0})] },
      { id: 'q10', type: 'single', text: '当冲突无法解决时，你的态度是：', options: [opt('a','接受分歧，不必事事一致',{CC:0}),opt('b','先搁置但希望以后能解决',{CC:2}),opt('c','无法接受，总有一方是对的',{CC:4})] },
    ],
    resultProfiles: [
      { type:'assertive', title:'直面合作型', summary:'你面对冲突时勇敢而成熟。你不回避问题，同时也能考虑对方的感受和立场。你追求的不仅是赢，更是相互理解。',
        dimensionThresholds:{CA:{min:51,max:100},CC:{min:0,max:50}}, keywords:['直面','合作','成熟','沟通'],
        strengths:['不回避冲突','善于有效沟通','能兼顾表达和倾听'], blindSpots:['有时可能过于直接','对回避型的人可能造成压力'],
        emotionalPattern:'你把冲突看作需要处理的事情而非需要害怕的事情。这种态度让你在关系中更加从容。',
        relationshipPattern:'你是一个成熟的冲突处理者。继续用这种态度面对分歧，它会让关系更坚固而非更脆弱。',
        personalSummary:'你的勇气在于敢面对。不是所有冲突都能完美解决，但你每次尝试都在让关系变得更真实。' },
      { type:'competitive', title:'直面竞争型', summary:'你面对冲突时非常直接，坚持自己的立场。你相信真理越辩越明，不怕争论。但有时过于坚持对错可能伤害关系。',
        dimensionThresholds:{CA:{min:51,max:100},CC:{min:51,max:100}}, keywords:['直接','坚持','竞争','强势'],
        strengths:['立场坚定','不轻易妥协','敢于说真话'], blindSpots:['可能过于强势','有时赢了争论输了关系','对他人感受关注不足'],
        emotionalPattern:'你用理性和逻辑来应对冲突，情感因素被放在次要位置。这让你的论点有力，但可能让对方感到不被理解。',
        relationshipPattern:'你在冲突中的强势是你的风格。学会在坚持立场的同时也给对方的情感留出空间。',
        personalSummary:'你的直接是一种真诚。但最好的沟通不是证明自己是对的，而是让对方感受到被听见。' },
      { type:'avoidant', title:'回避型', summary:'你倾向于避免冲突，重视关系的和谐。你不喜欢紧张和对抗，宁愿退一步海阔天空。这种态度维护了表面和平，但也可能积累未解决的问题。',
        dimensionThresholds:{CA:{min:0,max:50},CC:{min:0,max:50}}, keywords:['回避','和谐','忍让','温和'],
        strengths:['善于维护关系和谐','不轻易激化矛盾','温和耐心'], blindSpots:['可能积累不满','重要问题可能被回避','可能被认为不够真诚'],
        emotionalPattern:'冲突让你感到紧张和不适，你倾向于用退让来恢复平静。但退让不等于解决。',
        relationshipPattern:'你在关系中非常温和，不愿意伤害对方。但长期回避冲突可能导致更大的问题。学会温和地表达不同意见。',
        personalSummary:'你的温和是珍贵的品质。但有时候，一次真诚的对话比一万次沉默的退让更有价值。' },
      { type:'passive-aggressive', title:'被动对抗型', summary:'你表面上避免冲突，但内心并不真的接受。你可能用沉默、拖延或间接的方式表达不满。这种模式让冲突以更隐蔽的方式持续。',
        dimensionThresholds:{CA:{min:0,max:50},CC:{min:51,max:100}}, keywords:['被动','间接','沉默','不满'],
        strengths:['不会直接爆发冲突','内心有自己的判断'], blindSpots:['可能让问题变得更复杂','对方可能不知道你真正的不满','行为可能被误解为不合作'],
        emotionalPattern:'你的愤怒和不满通常不直接表达，而是通过其他渠道释放。这让你看起来平静，但内心可能波涛汹涌。',
        relationshipPattern:'你的间接表达方式可能让伴侣感到困惑。学会直接说出你的感受和需求，虽然一开始会不舒服，但长期对关系更好。',
        personalSummary:'你的沉默不是软弱。但把心里的话说出来，比让它在心里发酵要健康得多。' },
    ],
  },

  {
    slug: 'boundary-sense', title: '边界感测试', subtitle: '了解你在人际关系中边界的清晰度',
    description: '健康的边界是良好人际关系的基础。这个测试帮助你了解自己在说"不"、保护个人空间、区分自己和他人责任方面的能力。',
    category: 'relationship', permissionId: 'relationship', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你建立更健康的个人边界，减少因边界模糊导致的人际困扰和精力耗竭。',
    suitableFor: '经常感到被别人越界、难以拒绝他人、或在关系中感到疲惫的人。',
    dimensions: [{ id: 'BS', name: '边界清晰度', description: '个人边界的清晰和坚定程度' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { BS: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"我很难拒绝别人的请求，即使自己已经很忙了。"', options: [opt('a','非常同意',{BS:0}),opt('b','比较同意',{BS:1}),opt('c','中立',{BS:2}),opt('d','不太同意',{BS:3}),opt('e','完全不同意',{BS:4})] },
      { id: 'q2', type: 'single', text: '同事总是让你帮忙做他分内的事，你：', options: [opt('a','每次都帮，不好意思拒绝',{BS:0}),opt('b','偶尔帮，但会表达自己的困难',{BS:2}),opt('c','明确拒绝，这是他的责任',{BS:4})] },
      { id: 'q3', type: 'single', text: '朋友深夜打电话倾诉，但你已经很累了，你：', options: [opt('a','接电话耐心听，再累也不拒绝',{BS:0}),opt('b','接但告诉对方明天再详细聊',{BS:2}),opt('c','不接，第二天解释昨晚太累了',{BS:4})] },
      { id: 'q4', type: 'scale', text: '"别人的情绪问题常常变成我的情绪负担。"', options: [opt('a','非常同意',{BS:0}),opt('b','比较同意',{BS:1}),opt('c','中立',{BS:2}),opt('d','不太同意',{BS:3}),opt('e','完全不同意',{BS:4})] },
      { id: 'q5', type: 'single', text: '有人对你提出不合理的要求时，你：', options: [opt('a','虽然觉得不合理但还是会考虑',{BS:0}),opt('b','会解释为什么不合理，但可能最终妥协',{BS:2}),opt('c','直接拒绝，不觉得需要解释太多',{BS:4})] },
      { id: 'q6', type: 'single', text: '你觉得"让别人失望"这件事：', options: [opt('a','非常难受，会尽量避免',{BS:0}),opt('b','有点不舒服但能接受',{BS:2}),opt('c','是正常的，不可能让所有人都满意',{BS:4})] },
      { id: 'q7', type: 'single', text: '当有人侵犯了你的隐私或空间时，你：', options: [opt('a','默默忍耐，不想引起冲突',{BS:0}),opt('b','委婉提醒，希望对方注意到',{BS:2}),opt('c','直接而礼貌地告诉对方你的边界',{BS:4})] },
      { id: 'q8', type: 'scale', text: '"我常常觉得自己对别人的感受负有责任。"', options: [opt('a','非常同意',{BS:0}),opt('b','比较同意',{BS:1}),opt('c','中立',{BS:2}),opt('d','不太同意',{BS:3}),opt('e','完全不同意',{BS:4})] },
      { id: 'q9', type: 'single', text: '在关系中，你如何处理伴侣查看你手机的请求：', options: [opt('a','给，没什么好藏的，虽然有点不舒服',{BS:1}),opt('b','给，但会表达这是信任问题',{BS:2}),opt('c','拒绝，这是个人隐私',{BS:4})] },
      { id: 'q10', type: 'single', text: '回顾过去，你觉得自己的边界问题主要来自：', options: [opt('a','害怕冲突或让人失望',{BS:0}),opt('b','在学习和调整中',{BS:2}),opt('c','基本没有被边界问题困扰过',{BS:4})] },
    ],
    resultProfiles: [
      { type:'clear-boundary', title:'边界清晰型', summary:'你有健康的个人边界。你知道自己的底线在哪里，也能清晰地表达。你在照顾他人和照顾自己之间找到了平衡。',
        dimensionThresholds:{BS:{min:61,max:100}}, keywords:['清晰','坚定','平衡','健康'],
        strengths:['善于保护自己的时间和精力','能清晰地表达拒绝','不因别人的情绪而过度内耗'], blindSpots:['有时可能显得过于"硬"','对边界模糊的人可能缺乏耐心'],
        emotionalPattern:'你能区分"别人的情绪"和"自己的责任"。这种能力让你在关系中保持清醒和稳定。',
        relationshipPattern:'你在关系中既有亲密也有空间。你的边界清晰让伴侣知道如何尊重你。',
        personalSummary:'你的边界是你对自己的尊重。继续保持这种清晰，它让你在关系中更自由。' },
      { type:'moderate-boundary', title:'边界成长型', summary:'你正在学习建立更好的边界。有时你能坚定地说不，有时还是会妥协。你在进步的路上。',
        dimensionThresholds:{BS:{min:36,max:60}}, keywords:['成长','学习','灵活','调整'],
        strengths:['意识到了边界的重要性','在努力改变旧的模式','能灵活处理不同关系'], blindSpots:['在某些关系中边界仍然模糊','偶尔会因为边界不清晰而感到疲惫'],
        emotionalPattern:'你在学习区分"我的事"和"别人的事"。这个过程有反复，但你在向前走。',
        relationshipPattern:'你正在学习在不同的关系中设定不同的边界。继续练习，它会变得越来越自然。',
        personalSummary:'成长是过程而不是终点。每一次勇敢的"不"都是在为自己画一条更清晰的线。' },
      { type:'porous-boundary', title:'边界模糊型', summary:'你的个人边界比较模糊。你常常把别人的需求放在自己前面，难以拒绝，容易被他人的情绪淹没。这不是善良的代价，而是需要学习的技能。',
        dimensionThresholds:{BS:{min:0,max:35}}, keywords:['模糊','付出','学习','保护'],
        strengths:['非常善良和体贴','善于感知他人需求','在关系中无私付出'], blindSpots:['过度付出导致自身耗竭','难以表达自己的真实需求','可能被他人利用善意'],
        emotionalPattern:'你习惯把他人的情绪背在自己身上。这让你成为一个温暖的陪伴者，但也让你很容易感到疲惫和负担。',
        relationshipPattern:'你需要在关系中学习说"不"。拒绝不是推开别人，而是保护自己，从而能更长久地陪伴。',
        personalSummary:'你的柔软是珍贵的。但棉花也需要外壳来保护。建立边界不是变冷，是变强。' },
    ],
  },

  {
    slug: 'people-pleasing', title: '讨好型倾向测试', subtitle: '了解你的讨好行为模式',
    description: '讨好型行为是指在人际关系中过度迎合他人、压抑自己真实想法和需求的模式。这个测试帮助你识别自己的讨好倾向及其程度。',
    category: 'relationship', permissionId: 'relationship', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你识别讨好型行为，理解其背后的心理动因，从而更真实地做自己。',
    suitableFor: '总觉得自己在"讨好"别人、不敢表达真实想法、害怕冲突和拒绝的人。',
    dimensions: [{ id: 'PP', name: '讨好倾向', description: '讨好行为的程度' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { PP: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"即使不同意对方的观点，我通常也会附和或保持沉默。"', options: [opt('a','非常同意',{PP:4}),opt('b','比较同意',{PP:3}),opt('c','中立',{PP:2}),opt('d','不太同意',{PP:1}),opt('e','完全不同意',{PP:0})] },
      { id: 'q2', type: 'single', text: '别人对你提出请求时，你的第一念头是：', options: [opt('a','如果不答应对方会不高兴吧',{PP:4}),opt('b','我能做就做，不能做就直说',{PP:0}),opt('c','看对方是谁以及事情的重要性',{PP:2})] },
      { id: 'q3', type: 'scale', text: '"比起表达自己的不满，我更倾向于忍一忍就算了。"', options: [opt('a','非常同意',{PP:4}),opt('b','比较同意',{PP:3}),opt('c','中立',{PP:2}),opt('d','不太同意',{PP:1}),opt('e','完全不同意',{PP:0})] },
      { id: 'q4', type: 'single', text: '点菜时，其他人选的菜你不爱吃，你：', options: [opt('a','不说，凑合吃',{PP:4}),opt('b','委婉地提议加一两个自己爱吃的',{PP:2}),opt('c','直接说想吃别的',{PP:0})] },
      { id: 'q5', type: 'single', text: '你发消息后对方很久不回，你：', options: [opt('a','反复思考自己是不是说错了什么',{PP:4}),opt('b','会想一下但不至于纠结',{PP:2}),opt('c','不在意，对方可能在忙',{PP:0})] },
      { id: 'q6', type: 'scale', text: '"我常常为了让别人开心而牺牲自己的喜好。"', options: [opt('a','非常同意',{PP:4}),opt('b','比较同意',{PP:3}),opt('c','中立',{PP:2}),opt('d','不太同意',{PP:1}),opt('e','完全不同意',{PP:0})] },
      { id: 'q7', type: 'single', text: '有人当面批评你，你通常：', options: [opt('a','立刻接受并道歉，即使不觉得自己有错',{PP:4}),opt('b','先听但不急于道歉',{PP:2}),opt('c','如果不同意会据理力争',{PP:0})] },
      { id: 'q8', type: 'single', text: '你是否经常说"都行""随便""看你"：', options: [opt('a','经常，已经成了口头禅',{PP:4}),opt('b','有时候，看情况',{PP:2}),opt('c','不会，我通常有明确的想法',{PP:0})] },
      { id: 'q9', type: 'scale', text: '"我很难忍受别人对我有负面看法。"', options: [opt('a','非常同意',{PP:4}),opt('b','比较同意',{PP:3}),opt('c','中立',{PP:2}),opt('d','不太同意',{PP:1}),opt('e','完全不同意',{PP:0})] },
      { id: 'q10', type: 'single', text: '当你拒绝别人后，你的感受通常是：', options: [opt('a','很内疚，反复想对方会不会不高兴',{PP:4}),opt('b','有点不舒服但能接受',{PP:2}),opt('c','坦然，这是正常的',{PP:0})] },
    ],
    resultProfiles: [
      { type:'authentic', title:'真实做自己', summary:'你有非常低的讨好倾向。你能够真实地表达自己的想法和感受，不会为了取悦别人而委屈自己。这是一种健康的自我状态。',
        dimensionThresholds:{PP:{min:0,max:35}}, keywords:['真实','自信','独立','坦率'],
        strengths:['能够真实表达自己','不依赖他人认可','自我价值感稳定'], blindSpots:['有时可能显得不够圆融','需要注意表达方式不伤害他人'],
        emotionalPattern:'你的情绪独立于他人的评价。你不需要所有人的喜欢也能感到自洽。',
        relationshipPattern:'你在关系中保持真实，这对建立真诚的关系非常有利。同时也要注意温柔的表达方式。',
        personalSummary:'你的真实是最珍贵的品质。继续保持，同时也不吝啬展现你的温柔。' },
      { type:'moderate-pleasing', title:'适度讨好型', summary:'你在某些关系中或某些情境下会有讨好倾向。你内心有自己的想法，但有时为了维护和谐会选择退让。这是许多人都会有的状态。',
        dimensionThresholds:{PP:{min:36,max:60}}, keywords:['平衡','适应','灵活','和谐'],
        strengths:['善于维护关系和谐','在不同场合中灵活调整','能意识到自己的讨好倾向'], blindSpots:['在重要关系中可能压抑真实想法','有时分不清"灵活"和"讨好"'],
        emotionalPattern:'你在他人的感受和自己的感受之间寻找平衡。这种平衡有时让你感到拉扯。',
        relationshipPattern:'你在关系中努力做一个"好相处"的人。但要记得，真正的好相处不是没有意见，而是能坦诚地有不同意见。',
        personalSummary:'觉察是改变的开始。你已经看到了自己的模式，接下来就是一步一步地练习真实。' },
      { type:'severe-pleasing', title:'深度讨好型', summary:'你有较强的讨好倾向。你几乎在所有关系中都会优先考虑他人的感受和需求，常常压抑真实的自己。你的善良很珍贵，但也付出了代价。',
        dimensionThresholds:{PP:{min:61,max:100}}, keywords:['讨好','压抑','善良','需要改变'],
        strengths:['非常体贴和善解人意','能快速感知他人需求','在关系中全心付出'], blindSpots:['长期压抑真实需求可能导致情绪爆发','容易被利用','在关系中失去自我'],
        emotionalPattern:'你已经习惯了把他人的需求放在首位，以至于有时忘记了自己也有需求和感受。',
        relationshipPattern:'你在关系中过度付出可能让对方也感到压力。真实的关系需要两个人都能被看见、被听见。',
        personalSummary:'你已经够好了。不需要通过讨好来换取爱。真正的爱建立在真实的你之上，不是讨好的你。' },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 内在探索 (inner) — 4 个测试
  // ══════════════════════════════════════════════════════════

  {
    slug: 'self-worth', title: '自我价值感测试', subtitle: '了解你的自我认知与价值感来源',
    description: '自我价值感是你对自己作为一个人的基本评价。这个测试帮助你了解你的自我价值感来自哪里，以及它是稳定的还是容易受外界影响的。',
    category: 'inner', permissionId: 'inner', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你了解自我价值感的来源和稳定性，从而建立更健康的自我认知，减少对外界认可的依赖。',
    suitableFor: '经常自我怀疑、过于在意他人评价、成功时自信失败时自卑的人。',
    dimensions: [{ id: 'SW', name: '自我价值感', description: '自我价值感的稳定程度' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { SW: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"我的价值很大程度取决于我的成就和他人的认可。"', options: [opt('a','非常同意',{SW:0}),opt('b','比较同意',{SW:1}),opt('c','中立',{SW:2}),opt('d','不太同意',{SW:3}),opt('e','完全不同意',{SW:4})] },
      { id: 'q2', type: 'single', text: '当你做了一件失败的事后，你通常：', options: [opt('a','觉得自己整个人都很失败',{SW:0}),opt('b','会低落一阵子，但能区分"这次失败"和"我很失败"',{SW:2}),opt('c','把这当作一次学习，不影响整体自我评价',{SW:4})] },
      { id: 'q3', type: 'single', text: '别人夸奖你时，你的反应是：', options: [opt('a','不好意思，觉得对方只是客套',{SW:0}),opt('b','能接受但不会太当真',{SW:2}),opt('c','坦然接受，谢谢对方的认可',{SW:4})] },
      { id: 'q4', type: 'scale', text: '"即使什么都不做，我也觉得自己是有价值的。"', options: [opt('a','非常同意',{SW:4}),opt('b','比较同意',{SW:3}),opt('c','中立',{SW:2}),opt('d','不太同意',{SW:1}),opt('e','完全不同意',{SW:0})] },
      { id: 'q5', type: 'single', text: '在社交中看到比自己优秀的人时，你：', options: [opt('a','感到自卑和焦虑',{SW:0}),opt('b','欣赏但不觉得自己差',{SW:2}),opt('c','被激励，觉得每个人都有自己的节奏',{SW:4})] },
      { id: 'q6', type: 'scale', text: '"我经常在心里和别人比较，并觉得自己不够好。"', options: [opt('a','非常同意',{SW:0}),opt('b','比较同意',{SW:1}),opt('c','中立',{SW:2}),opt('d','不太同意',{SW:3}),opt('e','完全不同意',{SW:4})] },
      { id: 'q7', type: 'single', text: '当有人不喜欢你时，你：', options: [opt('a','非常在意，会努力讨好对方',{SW:0}),opt('b','有点在意但很快能调整',{SW:2}),opt('c','坦然接受，不可能每个人都喜欢我',{SW:4})] },
      { id: 'q8', type: 'single', text: '独自一人没有什么成就的一天，你的感觉是：', options: [opt('a','焦虑，觉得浪费了时间',{SW:0}),opt('b','有点不适但能接受',{SW:2}),opt('c','享受，休息和放空也是生活的一部分',{SW:4})] },
      { id: 'q9', type: 'scale', text: '"我需要不断地证明自己，否则就觉得自己在退步。"', options: [opt('a','非常同意',{SW:0}),opt('b','比较同意',{SW:1}),opt('c','中立',{SW:2}),opt('d','不太同意',{SW:3}),opt('e','完全不同意',{SW:4})] },
      { id: 'q10', type: 'single', text: '你如何描述你对自己的基本看法：', options: [opt('a','不太确定自己有什么价值',{SW:0}),opt('b','时高时低，不稳定',{SW:2}),opt('c','不管怎样，我接纳并尊重自己',{SW:4})] },
    ],
    resultProfiles: [
      { type:'stable-high', title:'稳定高价值感', summary:'你拥有健康而稳定的自我价值感。无论外界如何变化，你对自己的基本评价是积极和稳定的。这是一种很难得的心理状态。',
        dimensionThresholds:{SW:{min:61,max:100}}, keywords:['稳定','自信','自洽','接纳'],
        strengths:['自我价值不依赖外界认可','能坦然接受成功和失败','不轻易被他人评价影响'], blindSpots:['有时可能显得过于自信','需要注意理解他人的不安全感'],
        emotionalPattern:'你的情绪相对稳定，因为你的自我价值感不随外界波动。这是你内心强大的基础。',
        relationshipPattern:'你在关系中是自信而稳定的。你不需要通过伴侣来确认自己的价值，这让你能建立更健康的关系。',
        personalSummary:'你的自洽是一种珍贵的财富。继续保持这种稳定的自我价值感，它是你人生的坚实根基。' },
      { type:'fluctuating', title:'波动型价值感', summary:'你的自我价值感随着外界反馈而变化。被认可时你觉得自己很好，被批评时你开始怀疑自己。这是许多人都有的状态。',
        dimensionThresholds:{SW:{min:36,max:60}}, keywords:['波动','敏感','成长中','反思'],
        strengths:['对他人的反馈敏感','善于反思和自我调整','有提升自我价值感的意愿'], blindSpots:['过度依赖外界评价','可能因一时挫折而全盘否定自己'],
        emotionalPattern:'你的情绪像过山车，随着外界的认可和否定而起伏。学习建立内在的稳定锚点对你很重要。',
        relationshipPattern:'你在关系中可能需要伴侣的肯定来确认自己的价值。这很正常，但不要把它变成你唯一的来源。',
        personalSummary:'你的价值不是由别人的评分决定的。你是一个正在成长的人，这本身就是价值。' },
      { type:'low', title:'低价值感', summary:'你对自己的基本评价偏低。你可能常常觉得自己不够好、不够优秀、不值得被爱。这不是事实，而是你需要温柔以待的内在模式。',
        dimensionThresholds:{SW:{min:0,max:35}}, keywords:['低价值','怀疑','需要关怀','成长'],
        strengths:['谦逊不张扬','对自己有较高要求','内心深处渴望成长'], blindSpots:['过度自我否定可能阻碍发展','可能错失因自信不足而放弃的机会'],
        emotionalPattern:'你内心的批评者声音很大。你对自己比任何人对你都苛刻。学习做自己温柔的朋友是一个重要的课题。',
        relationshipPattern:'你可能会在关系中过度付出以证明自己的价值。但真正的爱不建立在"有用"之上。你本身就值得被爱。',
        personalSummary:'请试着像对待最好的朋友那样对待自己。你的存在本身就是价值，不需要任何附加条件。' },
    ],
  },

  {
    slug: 'emotional-suppression', title: '情绪压抑倾向', subtitle: '了解你处理情绪的方式',
    description: '情绪压抑是一种常见的应对策略——将不愉快的情绪推到一边而不是面对它们。短期内有效，但长期可能影响心理健康和人际关系。',
    category: 'inner', permissionId: 'inner', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你识别情绪压抑的模式，学习更健康的方式来表达和处理情绪。',
    suitableFor: '常被说"你太理性了"、不习惯表达情绪、或突然情绪爆发的人。',
    dimensions: [{ id: 'ES', name: '情绪压抑', description: '压抑情绪的程度' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { ES: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"我觉得表达负面情绪是软弱的表现。"', options: [opt('a','非常同意',{ES:4}),opt('b','比较同意',{ES:3}),opt('c','中立',{ES:2}),opt('d','不太同意',{ES:1}),opt('e','完全不同意',{ES:0})] },
      { id: 'q2', type: 'single', text: '当你感到愤怒时，你通常会：', options: [opt('a','压下去，告诉自己不值得生气',{ES:4}),opt('b','先忍耐，积累到一定程度再爆发',{ES:3}),opt('c','当下就表达出来，但注意方式',{ES:0})] },
      { id: 'q3', type: 'single', text: '你上一次哭是什么时候：', options: [opt('a','不记得了，我很少哭',{ES:4}),opt('b','几个月前',{ES:2}),opt('c','最近就有哭过',{ES:0})] },
      { id: 'q4', type: 'scale', text: '"别人问我怎么了的时候，我通常说没什么。"', options: [opt('a','非常同意',{ES:4}),opt('b','比较同意',{ES:3}),opt('c','中立',{ES:2}),opt('d','不太同意',{ES:1}),opt('e','完全不同意',{ES:0})] },
      { id: 'q5', type: 'single', text: '独处时你会突然感到莫名的悲伤或烦躁吗：', options: [opt('a','经常，那些被压下去的情绪会突然冒出来',{ES:4}),opt('b','偶尔会有',{ES:2}),opt('c','不会，我的情绪比较稳定',{ES:0})] },
      { id: 'q6', type: 'single', text: '朋友在你面前哭时，你：', options: [opt('a','手足无措，不知道怎么安慰',{ES:4}),opt('b','会安慰但有点不自在',{ES:2}),opt('c','自然地安慰和陪伴',{ES:0})] },
      { id: 'q7', type: 'scale', text: '"我更倾向于用行动来解决问题，而不是花时间处理情绪。"', options: [opt('a','非常同意',{ES:4}),opt('b','比较同意',{ES:3}),opt('c','中立',{ES:2}),opt('d','不太同意',{ES:1}),opt('e','完全不同意',{ES:0})] },
      { id: 'q8', type: 'single', text: '你如何看待"情绪化"这个词：', options: [opt('a','贬义的，表示不成熟',{ES:4}),opt('b','中性的，视程度而定',{ES:2}),opt('c','正常的，每个人都会有情绪',{ES:0})] },
      { id: 'q9', type: 'single', text: '童年时期，你的家庭如何看待情绪表达：', options: [opt('a','不太鼓励，常被教导要坚强/懂事',{ES:4}),opt('b','有时能表达有时不能',{ES:2}),opt('c','鼓励表达，情绪被接纳',{ES:0})] },
      { id: 'q10', type: 'single', text: '如果让你给自己的"情绪表达能力"打分：', options: [opt('a','很低，我几乎不表达真实情绪',{ES:4}),opt('b','中等，有些情绪能表达有些不能',{ES:2}),opt('c','不错，我能比较自如地表达情绪',{ES:0})] },
    ],
    resultProfiles: [
      { type:'expressive', title:'通畅表达型', summary:'你能够健康地感知和表达自己的情绪。你不会压抑自己的感受，但也不会被情绪控制。这是一种理想的状态。',
        dimensionThresholds:{ES:{min:0,max:35}}, keywords:['通畅','表达','健康','平衡'],
        strengths:['能识别和表达情绪','不害怕情绪','情绪调节能力好'], blindSpots:['需要注意在某些场合适度控制表达'],
        emotionalPattern:'你的情绪像一条自然流淌的河，不会泛滥也不会干涸。这是你的优势。',
        relationshipPattern:'你在关系中能真实地表达感受，这让伴侣更容易理解和靠近你。',
        personalSummary:'你与情绪的关系是健康而通畅的。继续倾听自己的感受，它们是重要的指引。' },
      { type:'moderate-suppression', title:'偶尔压抑型', summary:'你在大多数时候能处理情绪，但某些类型的情绪或某些情境下会选择压抑。你正在学习更全面地接纳自己的感受。',
        dimensionThresholds:{ES:{min:36,max:60}}, keywords:['偶尔压抑','选择性表达','学习'],
        strengths:['能意识到自己的压抑模式','在不同情境中有一定的灵活性'], blindSpots:['某些情绪可能被长期忽略','可能低估情绪积累的影响'],
        emotionalPattern:'你有一些"不允许"自己拥有的情绪。找到它们并给它们表达的空间，你会感到更完整。',
        relationshipPattern:'你在关系中有时会咽下一些话。偶尔适当地表达不满，反而会让关系更真实。',
        personalSummary:'情绪不是敌人。每一种情绪都在告诉你一些重要的信息。学会倾听它们。' },
      { type:'severe-suppression', title:'深度压抑型', summary:'你倾向于将大部分情绪压在心底。你可能觉得情绪是不必要的麻烦，或者害怕一旦打开就收不住。这种压抑在保护你的同时也在消耗你。',
        dimensionThresholds:{ES:{min:61,max:100}}, keywords:['压抑','封闭','需要释放','积累'],
        strengths:['在压力下保持表面冷静','不被情绪影响决策'], blindSpots:['长期压抑可能导致身体或心理问题','在关系中显得疏离','可能突然爆发'],
        emotionalPattern:'你的情绪像被压在水下的球，你越用力压，它越会以意想不到的方式弹出来。',
        relationshipPattern:'你在关系中可能让伴侣感到"走不进你的内心"。学习慢慢打开，不需要一次全部敞开，但至少留一条缝。',
        personalSummary:'你的坚强是有代价的。允许自己感受，哪怕一开始只是一点点。情绪不会杀死你，压抑才会慢慢耗尽你。' },
    ],
  },

  {
    slug: 'perfectionism', title: '完美主义程度', subtitle: '了解你的完美主义倾向与表现',
    description: '完美主义不是追求卓越，而是害怕不完美。这个测试帮助你区分健康的追求高标准和不健康的完美主义，并了解它如何影响你的生活。',
    category: 'inner', permissionId: 'inner', isFree: false, questionCount: 10, estimatedMinutes: 6,
    problemsSolved: '帮助你识别不健康的完美主义模式，减少因过高标准带来的焦虑和拖延。',
    suitableFor: '对自己要求极高、经常拖延、或总觉得自己做得不够好的人。',
    dimensions: [{ id: 'PM', name: '完美主义', description: '完美主义倾向的程度' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { PM: 20 } },
    questions: [
      { id: 'q1', type: 'scale', text: '"如果一件事不能做到最好，我宁愿不做。"', options: [opt('a','非常同意',{PM:4}),opt('b','比较同意',{PM:3}),opt('c','中立',{PM:2}),opt('d','不太同意',{PM:1}),opt('e','完全不同意',{PM:0})] },
      { id: 'q2', type: 'single', text: '完成一项任务后，你通常：', options: [opt('a','总觉得自己还能做得更好',{PM:4}),opt('b','基本满意但有一些小遗憾',{PM:2}),opt('c','尽力了就接受结果',{PM:0})] },
      { id: 'q3', type: 'scale', text: '"看到别人做得比我好，我会对自己非常苛刻。"', options: [opt('a','非常同意',{PM:4}),opt('b','比较同意',{PM:3}),opt('c','中立',{PM:2}),opt('d','不太同意',{PM:1}),opt('e','完全不同意',{PM:0})] },
      { id: 'q4', type: 'single', text: '你是否因为害怕做得不够好而推迟开始一项任务：', options: [opt('a','经常，拖延是我的一大问题',{PM:4}),opt('b','有时候会',{PM:2}),opt('c','不会，我先做了再说',{PM:0})] },
      { id: 'q5', type: 'single', text: '别人指出你工作中的一个小错误，你：', options: [opt('a','非常沮丧，觉得自己很失败',{PM:4}),opt('b','有点不好意思但能接受',{PM:2}),opt('c','坦然接受，谁都会犯错',{PM:0})] },
      { id: 'q6', type: 'scale', text: "\u201c我对于\u2018差不多就行\u2019这种状态感到很不舒服。\u201d", options: [opt('a','非常同意',{PM:4}),opt('b','比较同意',{PM:3}),opt('c','中立',{PM:2}),opt('d','不太同意',{PM:1}),opt('e','完全不同意',{PM:0})] },
      { id: 'q7', type: 'single', text: '面对一个没有明确标准的新任务，你：', options: [opt('a','非常焦虑，不知道该做到什么程度',{PM:4}),opt('b','有点不安但能应对',{PM:2}),opt('c','觉得自由发挥挺好的',{PM:0})] },
      { id: 'q8', type: 'single', text: '你的完美主义更多表现为：', options: [opt('a','对自己的要求——我必须是完美的',{PM:4}),opt('b','对结果的要求——事情必须完美',{PM:3}),opt('c','对他人的要求——你也应该做得更好',{PM:2})] },
      { id: 'q9', type: 'scale', text: '"我不太能享受过程，只有最终完美的结果才能让我满足。"', options: [opt('a','非常同意',{PM:4}),opt('b','比较同意',{PM:3}),opt('c','中立',{PM:2}),opt('d','不太同意',{PM:1}),opt('e','完全不同意',{PM:0})] },
      { id: 'q10', type: 'single', text: '你如何看待"足够好"这个概念：', options: [opt('a','这是为自己的不够努力找借口',{PM:4}),opt('b','理论上知道但实践中很难接受',{PM:2}),opt('c','这是健康而明智的态度',{PM:0})] },
    ],
    resultProfiles: [
      { type:'healthy-striving', title:'健康追求型', summary:'你有着积极的追求卓越的态度，但不会被完美主义绑架。你能接受"足够好"，也允许自己犯错。这是最健康的状态。',
        dimensionThresholds:{PM:{min:0,max:35}}, keywords:['健康','卓越','接纳','平衡'],
        strengths:['追求高标准的动力','同时能接受不完美','不会因害怕失败而拖延'], blindSpots:['有时可能需要提高标准'],
        emotionalPattern:'你不会因为不完美而过度自责。你对自己的接纳让情绪保持稳定。',
        relationshipPattern:'你在关系中不会苛求完美，这让伴侣在你面前能放松地做自己。',
        personalSummary:'你对"够好"的接纳是一种智慧。追求但不苛求，努力但不偏执。' },
      { type:'moderate-perfectionist', title:'中等完美主义', summary:'你有一定的完美主义倾向，在某些领域或某些时候过度追求完美。你会因达不到自己的标准而感到沮丧，但也能在一定程度上自我调节。',
        dimensionThresholds:{PM:{min:36,max:60}}, keywords:['较高标准','偶尔苛求','自我调节'],
        strengths:['对质量有较高要求','对自己有清晰的期待'], blindSpots:['在某些领域可能因完美主义而拖延','有时对自己过于苛刻'],
        emotionalPattern:'当事情不如预期时，你会感到明显的挫败感。学会在此时温柔地对待自己是一个成长的方向。',
        relationshipPattern:'你的高标准可能让伴侣感到压力。尝试放松一些要求，关系中的"够好"往往已经足够好。',
        personalSummary:'你的标准是你的动力，但不要让它变成你的牢笼。卓越和完美之间有一条重要的界线。' },
      { type:'severe-perfectionist', title:'深度完美主义', summary:'你有强烈的完美主义倾向。完美主义已经显著影响到了你的生活——你可能会因为害怕不完美而拖延、回避挑战，或在完成后仍无法感到满足。',
        dimensionThresholds:{PM:{min:61,max:100}}, keywords:['苛求','焦虑','拖延','自我批评'],
        strengths:['对质量有极高的要求','在能做到完美的事情上表现出色'], blindSpots:['完美主义导致拖延和回避','对自己过于苛刻','很难享受过程和成果'],
        emotionalPattern:'你的内心有一个非常严厉的批评者。它让你一直处于"不够好"的焦虑中。这个声音不是真相，而是你需要温柔对待的旧模式。',
        relationshipPattern:'你的完美主义可能延伸到关系中——对伴侣有很高的期待。学习接受"足够好的关系"而非"完美的关系"。',
        personalSummary:'你已经足够好了。真正的完美不是没有瑕疵，而是完整地接纳包括瑕疵在内的全部自己。' },
    ],
  },

  {
    slug: 'inner-needs', title: '内在需求测试', subtitle: '发现你内心深处真正的渴望',
    description: '在日常生活的噪音中，我们常常忽视了自己内心真正需要什么。这个测试帮助你从六个核心维度了解自己的内在需求优先级。',
    category: 'inner', permissionId: 'inner', isFree: false, questionCount: 12, estimatedMinutes: 8,
    problemsSolved: '帮助你识别自己最核心的内在需求，从而在生活中做出更符合内心的选择，减少"不知道为什么就是不开心"的感觉。',
    suitableFor: '感到迷茫、不确定自己真正想要什么、或总觉得不满足的人。',
    dimensions: [
      { id: 'SA', name: '安全需求', description: '对稳定、可预测和安全感的渴望' },
      { id: 'AU', name: '自主需求', description: '对独立、自由和自我决定的渴望' },
      { id: 'CN', name: '连接需求', description: '对归属、亲密和被理解的渴望' },
      { id: 'GR', name: '成长需求', description: '对进步、学习和自我实现的渴望' },
    ],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { SA: 24, AU: 24, CN: 24, GR: 24 } },
    questions: [
      { id: 'q1', type: 'single', text: '你现在的生活中，最让你不安的是：', options: [opt('a','未来不确定，缺乏安全感',{SA:4}),opt('b','感觉被束缚，没有自由',{AU:4}),opt('c','感到孤独，缺少理解',{CN:4}),opt('d','停滞不前，没有成长',{GR:4})] },
      { id: 'q2', type: 'single', text: '如果必须放弃一样，你最不能忍受失去：', options: [opt('a','稳定的收入和住所',{SA:4}),opt('b','自己做决定的权利',{AU:4}),opt('c','生命中重要的人',{CN:4}),opt('d','追求梦想的机会',{GR:4})] },
      { id: 'q3', type: 'scale', text: '"我宁愿少赚一些钱，也要做自己喜欢的事。"', options: [opt('a','非常同意',{AU:4,SA:0}),opt('b','比较同意',{AU:3,SA:1}),opt('c','中立',{AU:2,SA:2}),opt('d','不太同意',{AU:1,SA:3}),opt('e','完全不同意',{AU:0,SA:4})] },
      { id: 'q4', type: 'single', text: '周末晚上，你最理想的状态是：', options: [opt('a','在舒适安全的家里放松',{SA:4}),opt('b','做自己计划了很久的个人项目',{AU:4}),opt('c','和亲近的人在一起聊天吃饭',{CN:4}),opt('d','学习一项新技能或参加一个课程',{GR:4})] },
      { id: 'q5', type: 'single', text: '工作上，什么对你最重要：', options: [opt('a','稳定的工作环境和收入',{SA:4}),opt('b','有自主权，不被人管着',{AU:4}),opt('c','好的团队氛围和人际关系',{CN:4}),opt('d','能不断学习和成长的机会',{GR:4})] },
      { id: 'q6', type: 'single', text: '最近一次感到真正满足是因为：', options: [opt('a','生活各方面都很稳定',{SA:4}),opt('b','完成了一个自己设定的目标',{AU:4}),opt('c','和重要的人有一次深入的交流',{CN:4}),opt('d','学到了新东西或有了新的突破',{GR:4})] },
      { id: 'q7', type: 'scale', text: '"我害怕做出不可逆的人生决定。"', options: [opt('a','非常同意',{SA:4}),opt('b','比较同意',{SA:3}),opt('c','中立',{SA:2}),opt('d','不太同意',{SA:1}),opt('e','完全不同意',{SA:0})] },
      { id: 'q8', type: 'single', text: '收到一笔意外之财，你会怎么用：', options: [opt('a','存起来，以备不时之需',{SA:4}),opt('b','投资自己的爱好或创业想法',{AU:4}),opt('c','请重要的人一起旅行或吃饭',{CN:4}),opt('d','报名一个一直想上的课程',{GR:4})] },
      { id: 'q9', type: 'single', text: '你觉得一个"好的人生"最重要的是：', options: [opt('a','平安顺遂，没有大的波折',{SA:4}),opt('b','活出自己，不被别人定义',{AU:4}),opt('c','有深厚的爱与连接',{CN:4}),opt('d','不断超越自己，实现潜能',{GR:4})] },
      { id: 'q10', type: 'scale', text: '"我很难忍受一个人待太久，需要和别人保持连接。"', options: [opt('a','非常同意',{CN:4}),opt('b','比较同意',{CN:3}),opt('c','中立',{CN:2}),opt('d','不太同意',{CN:1}),opt('e','完全不同意',{CN:0})] },
      { id: 'q11', type: 'single', text: '你觉得目前生活中最大的缺失是：', options: [opt('a','安全感——经济和生活的稳定',{SA:4}),opt('b','自由——能做自己想做的事',{AU:4}),opt('c','连接——深刻而有意义的关系',{CN:4}),opt('d','成长——看到自己在进步',{GR:4})] },
      { id: 'q12', type: 'single', text: '想象五年后的自己，你最先想到的是：', options: [opt('a','生活稳定、安心踏实',{SA:4}),opt('b','自由自在、不被束缚',{AU:4}),opt('c','身边有爱人和好友',{CN:4}),opt('d','成为了更好的自己',{GR:4})] },
    ],
    resultProfiles: [
      { type:'safety', title:'安全导向型', summary:'你最核心的内在需求是安全感。你渴望稳定的环境、可预测的未来和踏实的根基。这不是保守，而是你建立其他一切的基础。',
        dimensionThresholds:{SA:{min:51,max:100}}, keywords:['安全','稳定','踏实','根基'],
        strengths:['重视规划和准备','能在稳定中发挥最大潜力','是一个可靠的伙伴'], blindSpots:['可能回避必要的风险','有时过度追求安全而错过机会'],
        emotionalPattern:'不确定性是你最大的压力来源。当生活可预测时，你的情绪最稳定。',
        relationshipPattern:'你在关系中重视承诺和稳定。你需要一个能给你安全感、不会随意变动的伴侣。',
        personalSummary:'安全不是枷锁而是根基。有了稳固的根基，你才能放心地向上生长。' },
      { type:'autonomy', title:'自主导向型', summary:'你最核心的内在需求是自主和自由。你渴望能够掌控自己的生活、做出自己的选择、不被他人或环境束缚。',
        dimensionThresholds:{AU:{min:51,max:100}}, keywords:['自由','独立','掌控','自我'],
        strengths:['强烈的自我驱动力','不依赖他人做决定','敢于走自己的路'], blindSpots:['可能抗拒必要的约束','有时过于独立而不愿求助'],
        emotionalPattern:'当感到被控制或束缚时，你会产生强烈的抵触情绪。自由是你呼吸的空气。',
        relationshipPattern:'你在关系中需要大量空间。找到一个尊重你独立性的伴侣是幸福的关键。',
        personalSummary:'你的自由精神是宝贵的。但要记得，真正的自由不是没有牵绊，而是选择值得的牵绊。' },
      { type:'connection', title:'连接导向型', summary:'你最核心的内在需求是连接和归属。你渴望深刻的关系、被理解和被看见。孤独是你最难以忍受的状态。',
        dimensionThresholds:{CN:{min:51,max:100}}, keywords:['连接','归属','爱','理解'],
        strengths:['善于建立深厚的关系','有强烈的同理心','在关系中全心投入'], blindSpots:['可能过度依赖关系来定义自己','有时为了连接而委屈自己'],
        emotionalPattern:'你的情绪与关系状态紧密相连。重要的关系稳定时，你感到幸福；关系出现裂痕时，你最为痛苦。',
        relationshipPattern:'你对关系的投入是你的天赋。同时也要学习在关系中保持独立的自己。',
        personalSummary:'你是一座桥，连接着自己和他人。记得这座桥也需要自己的支撑点。' },
      { type:'growth', title:'成长导向型', summary:'你最核心的内在需求是成长和自我实现。你渴望不断进步、学习新东西、成为更好的自己。停滞不前是你最大的恐惧。',
        dimensionThresholds:{GR:{min:51,max:100}}, keywords:['成长','进步','潜能','超越'],
        strengths:['强烈的上进心','持续学习和改进','不甘平庸'], blindSpots:['可能永远不满足现状','有时忽视当下已有的美好'],
        emotionalPattern:'当你感到自己在进步时，你的情绪最高涨。当你感到停滞时，会陷入焦虑和自我怀疑。',
        relationshipPattern:'你在关系中也需要成长感。你需要一个能和你一起成长、而不是让你感到停滞的伴侣。',
        personalSummary:'你的向上生长是美好的。只是别忘了——你已经是一棵挺拔的树，不因为还没有最高而不够好。' },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 趣味测试 (fun) — 全部免费
  // ══════════════════════════════════════════════════════════

  {
    slug: 'hidden-personality', title: '你的隐藏人格', subtitle: '发现你不为人知的那一面',
    description: '每个人都有自己不太展现的一面——在特定情境下才会显露的隐藏人格。来发现你性格中那个有趣的反差面。',
    category: 'fun', permissionId: '', isFree: true, questionCount: 8, estimatedMinutes: 5,
    problemsSolved: '让你发现自己可能忽略的性格侧面，带来轻松的自我认知。',
    suitableFor: '想轻松探索自我、喜欢趣味心理测试的任何人。',
    dimensions: [{ id: 'HP', name: '隐藏人格', description: '隐藏人格类型' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { HP: 16 } },
    questions: [
      { id: 'q1', type: 'single', text: '如果你有一种超能力，你会选：', options: [opt('a','隐身',{HP:3}),opt('b','读心术',{HP:1}),opt('c','瞬间移动',{HP:2}),opt('d','时间暂停',{HP:0})] },
      { id: 'q2', type: 'single', text: '朋友突然放鸽子，独自一人的晚上你会：', options: [opt('a','正好！享受难得的独处时光',{HP:0}),opt('b','有点生气，但找其他事情做',{HP:2}),opt('c','立刻约其他朋友出来',{HP:3}),opt('d','感到失落，在家刷手机',{HP:1})] },
      { id: 'q3', type: 'single', text: '你最常做的梦是：', options: [opt('a','在飞或做不可思议的事',{HP:2}),opt('b','被追赶或遇到危险',{HP:1}),opt('c','回到学校或以前的场景',{HP:0}),opt('d','很少记得自己做过梦',{HP:3})] },
      { id: 'q4', type: 'single', text: '深夜饿了冰箱只有简单食材，你：', options: [opt('a','创意发挥，做出一道意想不到的料理',{HP:2}),opt('b','随便对付一口，吃饱就行',{HP:3}),opt('c','不吃了，忍到明天',{HP:0}),opt('d','点外卖，为什么要委屈自己',{HP:1})] },
      { id: 'q5', type: 'single', text: '看一部很烂的电影，你的反应：', options: [opt('a','津津有味地吐槽，烂片也有烂片的乐趣',{HP:2}),opt('b','中途退出，不浪费时间',{HP:3}),opt('c','坚持看完，既然开始了就看完',{HP:0}),opt('d','边看边做别的事',{HP:1})] },
      { id: 'q6', type: 'single', text: '你被突然要求在众人面前表演一个节目：', options: [opt('a','大大方方，说来就来',{HP:3}),opt('b','有点紧张但硬着头皮上',{HP:2}),opt('c','坚决拒绝，打死也不干',{HP:0}),opt('d','巧妙地把焦点转移到别人身上',{HP:1})] },
      { id: 'q7', type: 'single', text: '你的社交媒体头像通常是：', options: [opt('a','自己的照片',{HP:3}),opt('b','风景或物品',{HP:0}),opt('c','卡通或抽象图案',{HP:1}),opt('d','不固定，经常换',{HP:2})] },
      { id: 'q8', type: 'single', text: '被人误解时你最可能的反应是：', options: [opt('a','立刻解释清楚',{HP:3}),opt('b','算了，懂的人自然懂',{HP:0}),opt('c','心里很在意但表面装作无所谓',{HP:1}),opt('d','用幽默化解尴尬',{HP:2})] },
    ],
    resultProfiles: [
      { type:'rebel', title:'隐藏的叛逆者', summary:'表面上看你可能是随和好相处的人，但你的隐藏人格是一个不折不扣的叛逆者——有自己的主见，讨厌被束缚，在关键时刻会出人意料地坚持自己的选择。',
        dimensionThresholds:{HP:{min:61,max:100}}, keywords:['叛逆','自由','个性','出人意料'],
        strengths:['有自己的主见','不随波逐流','关键时刻敢于坚持'], blindSpots:['有时过于叛逆而忽视合理建议'],
        emotionalPattern:'你在日常中保持低调，但内心有自己的小宇宙。当被触碰底线时会让人看到你完全不同的一面。',
        relationshipPattern:'你需要一个不试图"驯服"你的伴侣。欣赏你独立性的人才能真正走近你。',
        personalSummary:'你的隐藏面让认识你的人惊喜。继续做那个温柔但有棱角的人。' },
      { type:'dreamer', title:'隐藏的梦想家', summary:'你在现实中可能务实理性，但内心深处住着一个浪漫的梦想家——你有很多别人不知道的想法和憧憬，在独处时悄悄构建着自己的理想世界。',
        dimensionThresholds:{HP:{min:36,max:60}}, keywords:['梦想','浪漫','内心丰富','理想'],
        strengths:['内心世界丰富','有美好的想象力','对未来有憧憬'], blindSpots:['有时想法多于行动'],
        emotionalPattern:'你的内心比你表现出来的要柔软和浪漫得多。那些没说出口的梦想是你最珍贵的宝藏。',
        relationshipPattern:'你需要一个能看见你柔软一面的伴侣。在安全的关系中，你的浪漫面会自然绽放。',
        personalSummary:'你表面安静内心热闹。保护你的梦想，它们是让你与众不同的东西。' },
      { type:'anchor', title:'隐藏的定海神针', summary:'你看起来可能不是最显眼的那个人，但在关键时刻你是大家依赖的稳定力量。当周围一片混乱时，你是那个不动声色稳住局面的人。',
        dimensionThresholds:{HP:{min:0,max:35}}, keywords:['稳定','可靠','镇定','支撑'],
        strengths:['在危机中保持冷静','是可靠的伙伴','不情绪化'], blindSpots:['可能平时太过低调而被忽视'],
        emotionalPattern:'你的情绪比大多数人想象的更稳定。你不容易被外界动荡影响，这让你在风暴中成为别人的港湾。',
        relationshipPattern:'你是一个不需要太多维护的伴侣。稳定、可靠是你的标签，但也要记得偶尔表达你的情感需求。',
        personalSummary:'你的稳定是身边人最珍贵的礼物。虽然不张扬，但每次风暴来临，大家都会看向你。' },
    ],
  },

  {
    slug: 'first-impression', title: '你给别人的第一印象', subtitle: '了解你给人留下的初印象',
    description: '你是否好奇别人第一次见你时会怎么想？这个测试通过你的行为偏好来推测你给人留下的第一印象。',
    category: 'fun', permissionId: '', isFree: true, questionCount: 8, estimatedMinutes: 5,
    problemsSolved: '帮助你了解自己在社交场合给人的初印象，从而更好地理解社交反馈。',
    suitableFor: '对社交好奇、想知道别人怎么看自己的任何人。',
    dimensions: [{ id: 'FI', name: '第一印象', description: '给人留下的第一印象类型' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { FI: 16 } },
    questions: [
      { id: 'q1', type: 'single', text: '第一次见到陌生人时，你通常：', options: [opt('a','主动微笑打招呼',{FI:3}),opt('b','等对方先开口',{FI:0}),opt('c','礼貌点头但不主动攀谈',{FI:1}),opt('d','看情况，对方友善就友善',{FI:2})] },
      { id: 'q2', type: 'single', text: '你的着装风格更接近：', options: [opt('a','简约干练，注重质感',{FI:0}),opt('b','舒适自然，不刻意打扮',{FI:2}),opt('c','有点个性，让人印象深刻',{FI:3}),opt('d','取决于场合和心情',{FI:1})] },
      { id: 'q3', type: 'single', text: '第一次见面聊天时你更倾向于：', options: [opt('a','多问对方问题，让对方说话',{FI:1}),opt('b','分享自己的故事和经历',{FI:3}),opt('c','寻找共同话题',{FI:2}),opt('d','保持安静，等对方引导',{FI:0})] },
      { id: 'q4', type: 'single', text: '如果有人第一次见面就说你"高冷"，你：', options: [opt('a','早就习惯了，我确实看起来不太好接近',{FI:0}),opt('b','有点意外，我觉得自己挺友善的',{FI:1}),opt('c','从没被这么说过',{FI:3}),opt('d','无所谓，了解我的人知道不是',{FI:2})] },
      { id: 'q5', type: 'single', text: '第一次见面时你最容易给人留下的印象是：', options: [opt('a','有想法、有深度',{FI:0}),opt('b','温暖、好相处',{FI:2}),opt('c','有趣、有活力',{FI:3}),opt('d','安静、有点神秘',{FI:1})] },
      { id: 'q6', type: 'single', text: '新认识的人对你的最初评价通常是：', options: [opt('a','看起来挺严肃的',{FI:0}),opt('b','挺好聊的',{FI:2}),opt('c','很有意思的一个人',{FI:3}),opt('d','需要多接触才能了解',{FI:1})] },
      { id: 'q7', type: 'single', text: '你说话的速度和音量：', options: [opt('a','偏快偏大，充满能量',{FI:3}),opt('b','中等节奏，平稳',{FI:2}),opt('c','偏慢偏轻，沉着',{FI:0}),opt('d','变化较大，看话题',{FI:1})] },
      { id: 'q8', type: 'single', text: '第一次见面时的眼神接触，你更倾向于：', options: [opt('a','保持适度但自然的目光接触',{FI:2}),opt('b','比较多的目光接触，想传达真诚',{FI:3}),opt('c','避免过多的目光接触，觉得有些不自在',{FI:0}),opt('d','根据对方来调整',{FI:1})] },
    ],
    resultProfiles: [
      { type:'warm', title:'温暖亲切型', summary:'你给人留下的第一印象是温暖而亲切的。你不设防的笑容和自然的态度让人觉得舒服、容易接近。这是非常难得的社交魅力。',
        dimensionThresholds:{FI:{min:61,max:100}}, keywords:['温暖','亲切','开朗','阳光'],
        strengths:['容易与人建立连接','给人安全感','社交场合如鱼得水'], blindSpots:['可能表面太热络而忽略了深度'],
        emotionalPattern:'你的情绪外露而真实，这种透明度让人信任你。',
        relationshipPattern:'你的温暖是你最好的名片。人们因为你的亲切而靠近，因为你的真诚而留下。',
        personalSummary:'你是很多人眼中的一缕阳光。继续保持这份温度，世界需要更多像你一样温暖的人。' },
      { type:'mysterious', title:'神秘有趣型', summary:'你给人留下的第一印象是有点神秘但又有趣。你不是那种第一眼就能看透的人，这让别人对你产生好奇。你的幽默感和深度会在后续的接触中慢慢展现。',
        dimensionThresholds:{FI:{min:36,max:60}}, keywords:['神秘','有趣','好奇','层次'],
        strengths:['让人产生好奇心','有层次感','越了解越有惊喜'], blindSpots:['可能一开始被误解为冷淡'],
        emotionalPattern:'你不会一次把自己全部展现出来。这种层层递进的方式让关系的发展有节奏感。',
        relationshipPattern:'深入了解你的人会发现你比初印象丰富得多。你是那种"越相处越喜欢"的类型。',
        personalSummary:'你是一本需要慢慢读的书。封面可能低调，但内容精彩。' },
      { type:'cool', title:'冷静沉稳型', summary:'你给人留下的第一印象是冷静、沉着、有距离感。你可能看起来不太好接近，但了解你的人知道你只是慢热，内心其实温暖而丰富。',
        dimensionThresholds:{FI:{min:0,max:35}}, keywords:['冷静','沉稳','慢热','深度'],
        strengths:['给人专业和可靠的感觉','不轻易被看透','有内在的力量'], blindSpots:['可能被误解为冷淡或傲慢','社交中可能被忽略'],
        emotionalPattern:'你的外表冷静但内心丰富。你不是没有温度，只是不轻易向外释放。',
        relationshipPattern:'你是慢热型的宝藏。那些有耐心等你展现真面目的人会发现一个完全不同的你。',
        personalSummary:'你的冷静是你独特的气质。不需要强迫自己变得热络，只要在适当的时候让别人看到你的温度就好。' },
    ],
  },

  {
    slug: 'spirit-animal', title: '你的精神动物', subtitle: '找到与你灵魂共鸣的动物',
    description: '不同的动物象征不同的性格特质。通过你的选择和偏好，发现最能代表你内在精神的那只动物。',
    category: 'fun', permissionId: '', isFree: true, questionCount: 8, estimatedMinutes: 5,
    problemsSolved: '以有趣的方式让你反思自己的核心特质，看看自己更像哪种动物。',
    suitableFor: '喜欢动物、想要轻松了解自己的任何人。',
    dimensions: [{ id: 'SA', name: '精神动物', description: '精神动物类型' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { SA: 16 } },
    questions: [
      { id: 'q1', type: 'single', text: '你理想的周末是：', options: [opt('a','去山里徒步，与自然融为一体',{SA:1}),opt('b','和朋友聚会，热闹开心',{SA:3}),opt('c','待在家里，享受舒适和安静',{SA:2}),opt('d','探索一个没去过的地方',{SA:0})] },
      { id: 'q2', type: 'single', text: '面对困难时你的风格是：', options: [opt('a','独自默默扛过去',{SA:1}),opt('b','发动身边的人一起想办法',{SA:3}),opt('c','谨慎分析，制定计划再行动',{SA:0}),opt('d','灵活应变，走一步看一步',{SA:2})] },
      { id: 'q3', type: 'single', text: '在朋友中你扮演的角色是：', options: [opt('a','智者——大家会来问你的意见',{SA:0}),opt('b','守护者——保护和支持大家',{SA:1}),opt('c','开心果——活跃气氛的那个',{SA:3}),opt('d','自由人——来去自如，不固定',{SA:2})] },
      { id: 'q4', type: 'single', text: '以下哪种环境让你最舒服：', options: [opt('a','广阔的草原或森林',{SA:1}),opt('b','温暖舒适的家',{SA:2}),opt('c','热闹的城市街头',{SA:3}),opt('d','宁静的山顶或海边',{SA:0})] },
      { id: 'q5', type: 'single', text: '你更欣赏哪种品质：', options: [opt('a','智慧和远见',{SA:0}),opt('b','忠诚和勇气',{SA:1}),opt('c','快乐和感染力',{SA:3}),opt('d','适应力和灵性',{SA:2})] },
      { id: 'q6', type: 'single', text: '你对"一个人"的态度是：', options: [opt('a','享受独处，这是充电的时间',{SA:0}),opt('b','可以一个人但更喜欢有伴',{SA:1}),opt('c','不太喜欢一个人待着',{SA:3}),opt('d','一个人和一群人都有自己的乐趣',{SA:2})] },
      { id: 'q7', type: 'single', text: '你最喜欢哪个时间段：', options: [opt('a','清晨，万物苏醒的时刻',{SA:1}),opt('b','上午，精力最充沛',{SA:0}),opt('c','下午到傍晚，最有生活气息',{SA:3}),opt('d','深夜，安静而有灵感',{SA:2})] },
      { id: 'q8', type: 'single', text: '你的直觉更接近：', options: [opt('a','分析思考型的——先想再做',{SA:0}),opt('b','本能行动型的——想到就做',{SA:1}),opt('c','情感驱动型的——感觉对了就行动',{SA:3}),opt('d','灵活切换型的——看情况决定',{SA:2})] },
    ],
    resultProfiles: [
      { type:'wolf', title:'狼', summary:'你的精神动物是狼——独立而忠诚，智慧而勇敢。你重视自己的族群（亲密关系），在这之外保持警觉和独立。你不轻易信任，但一旦信任就会守护到底。',
        dimensionThresholds:{SA:{min:0,max:35}}, keywords:['独立','智慧','忠诚','勇敢'],
        strengths:['独立性强','对重要的人忠诚','有敏锐的直觉和判断力'], blindSpots:['可能过于独立而显得不合群','需要时间才能信任他人'],
        emotionalPattern:'你不轻易展露情感，但内心深处的情感深沉而持久。',
        relationshipPattern:'你是一个可靠而专注的伴侣。你的忠诚和守护让你在关系中值得信赖。',
        personalSummary:'像狼一样，你既能在群体中协作，也能独自前行。你的独立和忠诚同样珍贵。' },
      { type:'dolphin', title:'海豚', summary:'你的精神动物是海豚——聪明、社交、充满活力。你善于与人沟通，在群体中活跃而受欢迎。你有很强的共情能力，也享受生活的乐趣。',
        dimensionThresholds:{SA:{min:36,max:55}}, keywords:['社交','聪明','活力','共情'],
        strengths:['善于沟通和协作','有强烈的共情能力','积极乐观'], blindSpots:['可能过度依赖社交','偶尔需要安静下来'],
        emotionalPattern:'你的情绪像海浪一样起伏，但总体是明亮而温暖的。',
        relationshipPattern:'你需要丰富的社交和有深度的关系。找到一个能与你一同畅游人生海洋的伴侣。',
        personalSummary:'像海豚一样，你在群体中闪闪发光。享受社交的乐趣，也要允许自己有深潜的时刻。' },
      { type:'cat', title:'猫', summary:'你的精神动物是猫——独立、优雅、有自己的一套。你不喜欢被强迫做任何事，在舒适和自由之间有自己的平衡。表面上可能有点傲娇，但对你真正在乎的人有一颗温暖的心。',
        dimensionThresholds:{SA:{min:56,max:75}}, keywords:['独立','优雅','自我','温暖'],
        strengths:['独立而不依赖','有自己的节奏','对在乎的人温柔体贴'], blindSpots:['可能显得冷淡或疏远','不善于表达情感'],
        emotionalPattern:'你的情感世界是私密的。你不是没有感情，只是不轻易展示。',
        relationshipPattern:'你在关系中需要大量空间。爱你不等于占有你，欣赏你独立性的人才是对的人。',
        personalSummary:'像猫一样，你按自己的节奏生活。柔软但有爪，温暖但有边界。' },
      { type:'eagle', title:'鹰', summary:'你的精神动物是鹰——视野开阔，目标明确。你喜欢从高处看问题，不沉溺于琐碎细节。你有自己的远大目标，并为之专注飞行。',
        dimensionThresholds:{SA:{min:76,max:100}}, keywords:['远见','专注','自由','力量'],
        strengths:['有远见和全局观','目标明确且专注','不随波逐流'], blindSpots:['可能忽视细节','有时显得太有距离感'],
        emotionalPattern:'你习惯从高处俯瞰自己的情绪，这种距离感让你不被情绪困住，但也可能让你与自己的感受产生距离。',
        relationshipPattern:'你欣赏能与你在高处并肩飞翔的伴侣。你不喜欢被拉扯到琐碎中，你需要同样有视野的人。',
        personalSummary:'像鹰一样，你的目光投向远方。享受飞翔的自由，也不忘偶尔降落，感受大地的温度。' },
    ],
  },

  {
    slug: 'ideal-relationship', title: '你的理想关系类型', subtitle: '发现你真正向往的关系模式',
    description: '每个人对理想关系的想象都不同。这个测试通过你的偏好和价值观，发现你内心真正向往的关系类型。',
    category: 'fun', permissionId: '', isFree: true, questionCount: 8, estimatedMinutes: 5,
    problemsSolved: '帮助你更清晰地了解自己在关系中真正看重什么，从而在寻找伴侣时更有方向。',
    suitableFor: '对爱情有美好想象、想知道自己适合什么关系模式的人。',
    dimensions: [{ id: 'IR', name: '理想关系', description: '理想关系类型' }],
    scoring: { type: 'dimension', normalize: true, dimensionMaxRaw: { IR: 16 } },
    questions: [
      { id: 'q1', type: 'single', text: '你心中理想的爱情更像是：', options: [opt('a','战友——一起打怪升级、共同成长',{IR:0}),opt('b','港湾——温暖安全、彼此依靠',{IR:1}),opt('c','冒险——充满惊喜、永不无聊',{IR:3}),opt('d','知己——灵魂共鸣、无需多言',{IR:2})] },
      { id: 'q2', type: 'single', text: '约会你最看重的是：', options: [opt('a','深入的对话和交流',{IR:2}),opt('b','一起做有趣的事',{IR:3}),opt('c','安静舒适的陪伴',{IR:1}),opt('d','一起学习和成长',{IR:0})] },
      { id: 'q3', type: 'single', text: '你认为一段好关系最重要的是：', options: [opt('a','共同成长和进步',{IR:0}),opt('b','安全感和信任',{IR:1}),opt('c','灵魂层面的理解',{IR:2}),opt('d','快乐和新鲜感',{IR:3})] },
      { id: 'q4', type: 'single', text: '你对伴侣最大的期待是：', options: [opt('a','一个并肩前行的搭档',{IR:0}),opt('b','一个温暖的依靠',{IR:1}),opt('c','一个懂我的知己',{IR:2}),opt('d','一个让生活有趣的玩伴',{IR:3})] },
      { id: 'q5', type: 'single', text: '关系中你最不能接受的是：', options: [opt('a','对方不上进，没有共同成长',{IR:0}),opt('b','对方不可靠，没有安全感',{IR:1}),opt('c','对方不理解我，精神不共鸣',{IR:2}),opt('d','生活变得无聊乏味',{IR:3})] },
      { id: 'q6', type: 'single', text: '你想象中最美好的日常画面是：', options: [opt('a','一起工作或学习，互相激励',{IR:0}),opt('b','窝在沙发上看电影，彼此依偎',{IR:1}),opt('c','深夜长谈，分享各自的想法',{IR:2}),opt('d','一起去旅行或尝试新鲜事物',{IR:3})] },
      { id: 'q7', type: 'single', text: '你认为最好的爱情描述是：', options: [opt('a','"我们让彼此成为更好的人"',{IR:0}),opt('b','"无论发生什么，我都在这"',{IR:1}),opt('c','"你懂我的欲言又止"',{IR:2}),opt('d','"和你在一起，每一天都是新的"',{IR:3})] },
      { id: 'q8', type: 'single', text: '如果给理想关系写一句话：', options: [opt('a','并肩作战，顶峰相见',{IR:0}),opt('b','风雨同舟，相濡以沫',{IR:1}),opt('c','灵魂相认，无需多言',{IR:2}),opt('d','鲜衣怒马，共赴山海',{IR:3})] },
    ],
    resultProfiles: [
      { type:'partner', title:'成长伙伴型', summary:'你理想的爱情是一起成长、并肩前行的伙伴关系。你不仅希望对方是伴侣，更希望是人生道路上的战友。你在关系中追求进步和互相成就。',
        dimensionThresholds:{IR:{min:0,max:35}}, keywords:['成长','搭档','进步','并肩'],
        strengths:['能在关系中互相激励','有共同的目标感','不满足于停滞'], blindSpots:['有时可能把关系过度"项目化"','需要注意关系中柔软的部分'],
        emotionalPattern:'你在关系中重视理性和成长，但不要忽略了情绪的连接和柔软的表达。',
        relationshipPattern:'你需要一个能跟得上你的步伐、也愿意和你一起规划未来的伴侣。',
        personalSummary:'你们是彼此人生最好的战友。并肩前行的路上，也别忘了牵一牵手。' },
      { type:'haven', title:'温暖港湾型', summary:'你理想的爱情是一个温暖的避风港。在这个不安定的世界里，你希望关系是你最大的安全来源——有人等你回家，有人给你依靠。',
        dimensionThresholds:{IR:{min:36,max:55}}, keywords:['温暖','安全','依靠','稳定'],
        strengths:['善于营造温暖的关系氛围','在关系中提供稳定感','重视承诺和忠诚'], blindSpots:['可能过度依赖关系来获得安全感'],
        emotionalPattern:'你对关系有很深的情感依赖。当关系稳定时你感到安心和满足。',
        relationshipPattern:'你需要一个能给你安全感的伴侣。稳定、可靠、温暖是你的关键词。',
        personalSummary:'你是一个温柔的人，值得一个温柔的怀抱。你的港湾也是别人的港湾。' },
      { type:'soulmate', title:'灵魂知己型', summary:'你理想的爱情是灵魂层面的深度连接。你渴望一个真正懂你的人——不需要太多解释，一个眼神就够。精神共鸣比任何外在条件都重要。',
        dimensionThresholds:{IR:{min:56,max:75}}, keywords:['灵魂','理解','共鸣','深度'],
        strengths:['追求深度的连接','善于理解和共情','在关系中真诚投入'], blindSpots:['对灵魂共鸣的要求可能过高','有时忽视实际的相处'],
        emotionalPattern:'你渴望被深刻地理解。表面的关系让你感到孤独，但一次真正的共鸣可以照亮你很久。',
        relationshipPattern:'你需要一个能在思想上与你对话的伴侣。智力和情感上的匹配对你来说比什么都重要。',
        personalSummary:'你的灵魂在寻找它的回声。相信你终会遇到那个不用解释也懂你的人。' },
      { type:'adventure', title:'冒险旅伴型', summary:'你理想的爱情是一场充满惊喜的冒险。你希望关系保持新鲜、有趣和刺激。你害怕的不是关系的挑战，而是关系的乏味。你们一起探索世界，也在探索中探索彼此。',
        dimensionThresholds:{IR:{min:76,max:100}}, keywords:['冒险','新鲜','乐趣','探索'],
        strengths:['保持关系的新鲜感','善于创造美好回忆','有强烈的生活热情'], blindSpots:['可能难以适应关系的平淡期','有时过于追求刺激而忽视稳定'],
        emotionalPattern:'你在新鲜和刺激中感受到爱的活力。当关系变得可预测时，你可能会感到不安。',
        relationshipPattern:'你需要一个同样热爱生活、愿意陪你探索的伴侣。平淡的日子也可以有微小的冒险。',
        personalSummary:'你的爱是一场永不停歇的探险。享受路上的风景，也珍惜一起走过的每一步。' },
    ],
  },
];
