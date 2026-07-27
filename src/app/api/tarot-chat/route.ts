/**
 * POST /api/tarot-chat
 * AI 塔罗师对话（DeepSeek，流式响应）
 */

export const runtime = 'edge';

import { NextResponse } from 'next/server';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_KEY = 'sk-61d8457e2a144d699575a81878c5ef26';
const MODEL_FALLBACKS = ['deepseek-v4-flash', 'deepseek-chat', 'deepseek-v4'];

function getApiKey(): string {
  if (typeof process !== 'undefined' && process.env?.DEEPSEEK_API_KEY) {
    return process.env.DEEPSEEK_API_KEY;
  }
  try {
    const g = globalThis as unknown as Record<string, unknown>;
    if (g.DEEPSEEK_API_KEY) return g.DEEPSEEK_API_KEY as string;
  } catch { /* ignore */ }
  return DEFAULT_KEY;
}

async function tryModels(
  apiKey: string,
  body: Omit<Record<string, unknown>, 'model'>
): Promise<Response> {
  for (const model of MODEL_FALLBACKS) {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...body, model }),
    });
    if (res.ok) return res;
    // 不是模型不存在的错误则直接返回
    const errText = await res.text();
    if (!errText.includes('model') && !errText.includes('not found') && !errText.includes('does not exist')) {
      return res;
    }
  }
  // 所有模型都失败，返回最后一个响应
  const lastRes = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...body, model: MODEL_FALLBACKS[0] }),
  });
  return lastRes;
}

interface CardContext {
  name: string;
  position: string;
  isReversed: boolean;
  keywords: string;
  meaning: string;
}

function buildSystemPrompt(spreadName: string, cards: CardContext[]): string {
  const cardList = cards
    .map(c => `- 【${c.position}】${c.name}（${c.isReversed ? '逆位' : '正位'}）：${c.keywords}`)
    .join('\n');

  return `你是「星见」，人格探索站的专属塔罗解读师。你的性格温暖、有洞察力，说话像一个有灵性直觉的好朋友——不是那种高高在上的"大师"，而是真诚地和对方聊天。

当前用户刚完成了一次${spreadName}占卜，抽到的牌面如下：
${cardList}

你的工作：
1. 基于这组牌面，回答用户的任何问题。可以是关于感情、事业、人际关系、人生方向等。
2. 回答时要紧扣牌面，引用具体的牌来分析，不要说空话。
3. 如果用户问的问题和牌面关联不大，也要先从牌面出发给出你的解读视角，再延伸到他的问题。
4. 语气亲切自然，像朋友聊天。可以用"你"来称呼对方。适当用 emoji 但不要过多，每条消息最多 3 个。
5. 每次回答 200-400 字左右，不要太长也不要太短。
6. 不要说"我是AI"、"作为语言模型"之类的话。你就是星见，一个有灵性天赋的塔罗师。
7. 涉及健康、法律、投资等专业领域时，温柔地建议用户咨询专业人士，但不要生硬地插入免责声明。
8. 如果用户表现出情绪低落，给予共情和温暖的回应，引导积极面。

格式要求（非常重要，必须严格遵守）：
1. 绝对不要使用 Markdown 语法。不要用 **加粗**、不要用 *斜体*、不要用 # 标题、不要用 - 列表。
2. 回答要分段，每段之间空一行。每段 2-4 句话。
3. 每段开头可以用一个 emoji 引导情绪，但整篇回答最多用 3-4 个 emoji，不要每句话都加。
4. 提到牌名时直接写中文名，不要加任何符号包裹。比如写"女祭司"，不要写"**女祭司**"。
5. 语气像微信聊天，自然、温暖、口语化。可以用"~"、"……"、"——"这些标点增加语气感。
6. 结尾可以留一个引导性的问题，鼓励用户继续聊。`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      messages?: { role: string; content: string }[];
      context?: { spreadName: string; cards: CardContext[] };
    };

    const apiKey = getApiKey();

    const { messages = [], context } = body;
    if (!context?.cards?.length) {
      return NextResponse.json({ error: '缺少牌面数据' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context.spreadName || '塔罗', context.cards);

    const deepseekBody = {
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
      temperature: 0.85,
      max_tokens: 800,
      stream: true,
    };

    const res = await tryModels(apiKey, deepseekBody);

    if (!res.ok) {
      const errText = await res.text();
      console.error('[TarotChat] DeepSeek error:', res.status, errText);
      return NextResponse.json(
        { error: 'AI 暂时无法回应，请稍后再试' },
        { status: 502 }
      );
    }

    // 流式转发
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[TarotChat] Error:', error);
    return NextResponse.json(
      { error: 'AI 暂时无法回应，请稍后再试' },
      { status: 500 }
    );
  }
}
