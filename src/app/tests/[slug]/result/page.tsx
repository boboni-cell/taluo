/**
 * 结果页 /tests/[slug]/result
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_TESTS } from '@/data/psychological-tests';
import { getResultFromStorage, type ScoringResult, type DimensionScores } from '@/lib/scoring-engine';


export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const test = ALL_TESTS.find((t) => t.slug === slug);
  if (!test) notFound();

  const [result, setResult] = useState<ScoringResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // 读取结果
  useEffect(() => {
    const stored = getResultFromStorage(slug);
    if (!stored) {
      router.replace(`/tests/${slug}/take`);
      return;
    }
    setResult(stored);
  }, [slug, router]);

  // 请求 AI 个性化总结
  useEffect(() => {
    if (!result) return;
    setAiLoading(true);
    fetch('/api/test-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName: test.title,
        resultType: result.matchedResult.title,
        dimensionScores: result.dimensionScores,
        keywords: result.matchedResult.keywords,
      }),
    })
      .then((res) => res.json())
      .then((data: { summary?: string }) => {
        if (data.summary) setAiSummary(data.summary);
      })
      .catch(() => {
        // AI 失败使用本地模板
      })
      .finally(() => setAiLoading(false));
  }, [result, test.title]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const shareText = `我在「星见」完成了「${test.title}」测试，结果是：${result.matchedResult.title}——${result.matchedResult.summary}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `我的${test.title}结果`,
          text: shareText,
        });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch { /* ignore */ }
    }
  }, [result, test.title]);

  if (!result) {
    return (
      <main className="min-h-screen bg-dark text-cream flex items-center justify-center">
        <p className="text-muted">加载结果中…</p>
      </main>
    );
  }

  const { matchedResult, dimensionScores } = result;
  const dimKeys = Object.keys(dimensionScores);

  return (
    <main className="min-h-screen bg-dark text-cream">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <Link href="/tests" className="nav-link">心理测试</Link>
      </header>

      <div className="editorial-shell max-w-2xl">
        {/* Result Type */}
        <div className="text-center mb-12">
          <p className="page-kicker mb-4">YOUR RESULT</p>
          <h1 className="font-serif-cn text-5xl sm:text-6xl mb-4">{matchedResult.title}</h1>
          <p className="text-sm text-copper tracking-[.14em]">{matchedResult.type}</p>
        </div>

        {/* Summary */}
        <div className="editorial-panel p-6 sm:p-10 mb-10">
          <p className="text-sm leading-relaxed text-cream/90">{matchedResult.summary}</p>
        </div>

        {/* AI Summary */}
        {aiLoading && (
          <div className="editorial-panel p-6 sm:p-10 mb-10 text-center">
            <p className="text-xs text-muted animate-breathe">正在生成个性化解读…</p>
          </div>
        )}
        {aiSummary && (
          <div className="editorial-panel p-6 sm:p-10 mb-10">
            <p className="page-kicker mb-4">AI 个性化总结</p>
            <p className="text-sm leading-relaxed text-cream/85">{aiSummary}</p>
          </div>
        )}

        {/* Radar Chart */}
        {dimKeys.length > 0 && (
          <div className="editorial-panel p-6 sm:p-10 mb-10">
            <p className="page-kicker mb-6">维度分析</p>
            <RadarChart dimensions={dimensionScores} test={test} />
          </div>
        )}

        {/* Keywords */}
        <div className="mb-10">
          <p className="page-kicker mb-4">关键词</p>
          <div className="flex flex-wrap gap-2">
            {matchedResult.keywords.map((kw) => (
              <span key={kw} className="pill-label">{kw}</span>
            ))}
          </div>
        </div>

        {/* Strengths & Blind Spots */}
        <div className="grid gap-8 sm:grid-cols-2 mb-10">
          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">优势特征</p>
            <ul className="space-y-2">
              {matchedResult.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-copper">+</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">潜在盲区</p>
            <ul className="space-y-2">
              {matchedResult.blindSpots.map((b, i) => (
                <li key={i} className="text-sm text-muted flex gap-2">
                  <span className="text-[#c77d6a]">!</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Patterns */}
        <div className="grid gap-8 sm:grid-cols-2 mb-10">
          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">情绪与关系模式</p>
            <p className="text-sm text-muted leading-relaxed">{matchedResult.emotionalPattern}</p>
          </div>
          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">关系中的你</p>
            <p className="text-sm text-muted leading-relaxed">{matchedResult.relationshipPattern}</p>
          </div>
        </div>

        {/* Personal Summary */}
        <div className="editorial-panel p-6 sm:p-10 mb-10">
          <p className="page-kicker mb-4">个性化总结</p>
          <p className="font-serif-cn text-xl leading-relaxed">{matchedResult.personalSummary}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center py-8 border-t border-line">
          <button onClick={handleShare} className="button-secondary text-xs">
            {shareCopied ? '已复制到剪贴板' : '分享结果'}
          </button>
          <Link href={`/tests/${slug}/report`} className="button-primary text-xs">
            解锁深度报告
          </Link>
          <Link href="/tests" className="button-secondary text-xs">
            更多测试
          </Link>
        </div>

        {/* Share Card (hidden, for screenshot) */}
        <div
          ref={shareCardRef}
          className="hidden"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '600px',
            background: '#0b0a08',
            color: '#f0eadf',
            padding: '40px',
          }}
        >
          <p style={{ color: '#b97843', fontSize: '10px', letterSpacing: '.22em' }}>星见 · 心理测试</p>
          <h2 style={{ fontFamily: 'serif', fontSize: '32px', marginTop: '12px' }}>{test.title}</h2>
          <p style={{ fontSize: '24px', marginTop: '16px', color: '#b97843' }}>{matchedResult.title}</p>
          <p style={{ fontSize: '14px', marginTop: '12px', color: '#918a80' }}>{matchedResult.summary}</p>
        </div>
      </div>

      <footer className="site-footer">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <p>© 2026 星见 · 心理测试仅供自我探索参考</p>
      </footer>
    </main>
  );
}

// ── SVG 雷达图组件 ──────────────────────────────────────

function RadarChart({
  dimensions,
  test,
}: {
  dimensions: DimensionScores;
  test: { dimensions: { id: string; name: string }[] };
}) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const levels = 4;

  const dims = test.dimensions.filter((d) => dimensions[d.id] !== undefined);
  const count = dims.length;
  if (count < 3) {
    // 维度少于3个时不画雷达图，改为简单的条形图
    return (
      <div className="space-y-3">
        {dims.map((dim) => {
          const score = dimensions[dim.id];
          return (
            <div key={dim.id}>
              <div className="flex justify-between text-[10px] tracking-[.1em] mb-1">
                <span className="text-muted">{dim.name}</span>
                <span className="text-copper">{score}</span>
              </div>
              <div className="h-[3px] bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-copper transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const angleStep = (2 * Math.PI) / count;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // 背景网格
  const gridPolygons = [];
  for (let level = 1; level <= levels; level++) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const p = getPoint(i, (level / levels) * 100);
      points.push(`${p.x},${p.y}`);
    }
    gridPolygons.push(
      <polygon
        key={level}
        points={points.join(' ')}
        fill="none"
        stroke="#2b2722"
        strokeWidth="0.5"
      />
    );
  }

  // 轴线
  const axes = [];
  for (let i = 0; i < count; i++) {
    const p = getPoint(i, 100);
    axes.push(
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={p.x}
        y2={p.y}
        stroke="#2b2722"
        strokeWidth="0.5"
      />
    );
  }

  // 数据多边形
  const dataPoints = dims.map((_, i) => {
    const score = dimensions[dims[i].id];
    const p = getPoint(i, score);
    return `${p.x},${p.y}`;
  });

  // 标签
  const labels = dims.map((dim, i) => {
    const p = getPoint(i, 120);
    return (
      <text
        key={dim.id}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#918a80"
        fontSize="10"
        letterSpacing=".08em"
      >
        {dim.name}
      </text>
    );
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridPolygons}
        {axes}
        <polygon
          points={dataPoints.join(' ')}
          fill="rgba(185, 120, 67, 0.15)"
          stroke="#b97843"
          strokeWidth="1.5"
        />
        {dims.map((dim, i) => {
          const score = dimensions[dim.id];
          const p = getPoint(i, score);
          return (
            <circle
              key={dim.id}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#b97843"
            />
          );
        })}
        {labels}
      </svg>
    </div>
  );
}
