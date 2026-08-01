/**
 * 深度报告页 /tests/[slug]/report
 * 需要 deep_report 权限
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_TESTS } from '@/data/psychological-tests';
import { getResultFromStorage, type ScoringResult } from '@/lib/scoring-engine';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';

export default function DeepReportPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const test = ALL_TESTS.find((t) => t.slug === slug);
  if (!test) notFound();

  const [result, setResult] = useState<ScoringResult | null>(null);
  const [reportContent, setReportContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { hasPermission: hasDeepReport, isLoading: permLoading } = usePermission('deep_report');

  useEffect(() => {
    const stored = getResultFromStorage(slug);
    if (!stored) {
      router.replace(`/tests/${slug}/take`);
      return;
    }
    setResult(stored);
  }, [slug, router]);

  // 生成深度报告内容（AI 或本地模板）
  useEffect(() => {
    if (!result || !hasDeepReport || loading || reportContent.length > 0) return;

    setLoading(true);
    fetch('/api/test-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName: test.title,
        resultType: result.matchedResult.title,
        dimensionScores: result.dimensionScores,
        keywords: result.matchedResult.keywords,
        mode: 'deep-report',
      }),
    })
      .then((res) => res.json())
      .then((data: { sections?: string[] }) => {
        if (data.sections && data.sections.length > 0) {
          setReportContent(data.sections);
        } else {
          setReportContent(generateFallbackReport(test.title, result!));
        }
      })
      .catch(() => {
        setReportContent(generateFallbackReport(test.title, result!));
      })
      .finally(() => setLoading(false));
  }, [result, hasDeepReport, loading, reportContent.length, test.title, slug]);

  const handleInviteSuccess = useCallback(
    (newPermissions: string[]) => {
      if (newPermissions.includes('deep_report') || newPermissions.includes('vip')) {
        setShowModal(false);
        setReportContent([]);
      }
    },
    []
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen bg-dark text-cream flex items-center justify-center">
        <p className="text-muted">加载中…</p>
      </main>
    );
  }

  // 无深度报告权限
  if (!hasDeepReport && !permLoading) {
    return (
      <main className="min-h-screen bg-dark text-cream">
        <header className="site-header">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__cn">星见</span>
            <span className="brand-mark__en">XINGJIAN</span>
          </Link>
          <Link href={`/tests/${slug}/result`} className="nav-link">← 返回结果</Link>
        </header>

        <div className="editorial-shell max-w-2xl text-center py-20">
          <p className="page-kicker mb-6">DEEP REPORT</p>
          <h1 className="font-serif-cn text-4xl mb-6">深度报告</h1>
          <p className="text-muted mb-8 leading-relaxed max-w-md mx-auto">
            深度报告包含人格形成逻辑、行为决策方式、情绪反应模式、亲密关系表现、人际沟通特点及成长建议。
          </p>
          <div className="editorial-panel p-6 mb-8 max-w-md mx-auto">
            <p className="text-sm text-muted mb-3">此功能需要深度报告权限</p>
            <p className="text-xs text-muted">或使用 VIP 邀请码解锁全部权限</p>
          </div>
          <button onClick={() => setShowModal(true)} className="button-primary">
            解锁深度报告
          </button>
        </div>

        <InviteCodeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleInviteSuccess}
          requiredModule="deep_report"
        />
      </main>
    );
  }

  const { matchedResult } = result;

  const sections = reportContent.length > 0 ? reportContent : [
    matchedResult.emotionalPattern,
    matchedResult.relationshipPattern,
    matchedResult.personalSummary,
  ];

  const sectionTitles = reportContent.length > 0
    ? ['人格形成逻辑', '行为与决策方式', '情绪反应模式', '亲密关系表现', '人际沟通特点', '成长建议']
    : ['情绪反应模式', '关系中的表现', '个人成长方向'];

  return (
    <main className="min-h-screen bg-dark text-cream">
      <header className="site-header no-print">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={handlePrint} className="nav-link text-xs no-print">保存为 PDF</button>
          <Link href={`/tests/${slug}/result`} className="nav-link text-xs">← 返回结果</Link>
        </div>
      </header>

      <div className="editorial-shell max-w-2xl">
        {/* Report Header */}
        <div className="mb-12">
          <p className="page-kicker mb-2">DEEP REPORT</p>
          <h1 className="font-serif-cn text-4xl sm:text-5xl mb-2">{test.title}</h1>
          <p className="text-lg text-copper">{matchedResult.title}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="editorial-panel p-10 text-center mb-10">
            <p className="text-xs text-muted animate-breathe">正在生成深度报告…</p>
          </div>
        )}

        {/* Report Sections */}
        {!loading && sections.map((content, i) => (
          <div key={i} className="editorial-panel p-6 sm:p-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-copper font-serif text-lg">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="font-serif-cn text-xl">{sectionTitles[i] || `第${i + 1}部分`}</h2>
            </div>
            <div className="h-px bg-line mb-6" />
            <p className="text-sm leading-relaxed text-cream/85">{content}</p>
          </div>
        ))}

        {/* Export hint */}
        <div className="text-center py-8 border-t border-line no-print">
          <p className="text-xs text-muted mb-4">
            点击右上角「保存为 PDF」使用浏览器打印功能导出。导出时会隐藏导航和按钮。
          </p>
          <button onClick={handlePrint} className="button-secondary text-xs">
            保存为 PDF
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .editorial-shell { width: 100% !important; max-width: 100% !important; padding: 20px !important; }
          .editorial-panel { border: 1px solid #ccc !important; background: white !important; }
          .page-kicker { color: #666 !important; }
          .text-cream, .text-cream\\/85, .text-cream\\/90 { color: #333 !important; }
          .text-muted { color: #666 !important; }
          .text-copper { color: #8b6914 !important; }
          .border-line { border-color: #ccc !important; }
          .bg-dark { background: white !important; }
          .bg-line { background: #eee !important; }
          .site-footer { display: none !important; }
        }
      `}</style>
    </main>
  );
}

/** 本地降级报告模板 */
function generateFallbackReport(
  testName: string,
  result: ScoringResult
): string[] {
  const { matchedResult: r } = result;
  return [
    `在「${testName}」中，你的核心模式表现为「${r.title}」。这种模式的形成通常与你的先天倾向和成长经历有关——你在童年和青少年时期逐渐发展出了这些应对世界的方式。${r.strengths[0] || ''}是你的天赋，而${r.blindSpots[0] || '一些盲区'}则是你需要温柔关注的部分。`,
    `你的决策方式受到内在认知偏好的影响。${r.emotionalPattern}在面临重大选择时，尝试有意识地运用你的优势（${r.strengths.slice(0, 2).join('、')}），同时提醒自己注意潜在的盲区（${r.blindSpots.slice(0, 2).join('、')}）。`,
    `${r.emotionalPattern}`,
    `${r.relationshipPattern}`,
    `在与他人的互动中，你的沟通风格是自然的延伸。理解自己的风格有助于你更好地表达需求、理解他人。记住：沟通的目的不是改变对方，而是让彼此看到更完整的画面。`,
    `基于以上分析，以下是几个温和的成长建议：第一，接纳自己当前的状态——这不是终点而是起点；第二，选择一两个你想关注的盲区，用温和的态度去观察而非批判；第三，在重要关系中尝试新的互动方式，哪怕只是一次。成长不是成为完美的人，而是成为更完整的自己。${r.personalSummary}`,
  ];
}
