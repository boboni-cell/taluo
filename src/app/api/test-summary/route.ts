/**
 * POST /api/test-summary
 * AI 个性化测试总结（DeepSeek，非流式）
 */

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

function getEnvVar(name: string): string {
  try {
    const ctx = getRequestContext();
    const env = ctx.env as Record<string, unknown>;
    if (env && env[name]) return env[name] as string;
  } catch { /* not CF env */ }
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  return '';
}

interface RequestBody {
  testName?: string;
  resultType?: string;
  dimensionScores?: Record<string, number>;
  keywords?: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.testName || !body.resultType) {
      return NextResponse.json({ summary: '' }, { status: 200 });
    }

    const apiKey = getEnvVar('DEEPSEEK_API_KEY');
    if (!apiKey) {
      console.warn('[TestSummary] No API key found');
      return NextResponse.json({ summary: '' }, { status: 200 });
    }

    const dimText = body.dimensionScores
      ? Object.entries(body.dimensionScores)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : '';
    const kwText = body.keywords?.join('、') || '';

    const prompt = `你是一个温和而有洞察力的心理测评解读师。请根据以下信息，用2-3句话（约80-120字）给出个性化的解读总结。语言自然、温暖、不做作。不要使用Markdown格式，不要称呼用户为"你"，直接从结果本身开始描述。

测试名称：${body.testName}
结果类型：${body.resultType}
维度得分：${dimText}
关键词：${kwText}

请直接给出解读：`;

    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error('[TestSummary] DeepSeek error:', res.status, await res.text());
      return NextResponse.json({ summary: '' }, { status: 200 });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const summary = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[TestSummary] Error:', error);
    return NextResponse.json({ summary: '' }, { status: 200 });
  }
}
