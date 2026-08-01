/**
 * 测试详情页 /tests/[slug]
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ALL_TESTS } from '@/data/psychological-tests';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const test = ALL_TESTS.find((t) => t.slug === slug);
  if (!test) {
    notFound();
  }

  const permissionId = test.isFree ? '' : test.permissionId;
  const { hasPermission, isLoading: permLoading } = usePermission(permissionId);

  // VIP 权限检查
  const [showModal, setShowModal] = useState(false);
  const [modalModule, setModalModule] = useState('');

  const canStart = test.isFree || hasPermission;

  const handleStart = useCallback(() => {
    if (canStart) {
      router.push(`/tests/${slug}/take`);
    } else {
      setModalModule(test.permissionId);
      setShowModal(true);
    }
  }, [canStart, slug, test.permissionId, router]);

  const handleInviteSuccess = useCallback(
    (newPermissions: string[]) => {
      // 激活成功后检查是否有对应权限或 vip
      if (
        newPermissions.includes(test.permissionId) ||
        newPermissions.includes('vip')
      ) {
        router.push(`/tests/${slug}/take`);
      }
    },
    [slug, test.permissionId, router]
  );

  // 从 TEST_CATEGORIES 找到分类名
  const categoryNames: Record<string, string> = {
    personality: '人格类型',
    emotion: '情感模式',
    relationship: '人际关系',
    inner: '内在探索',
    fun: '趣味测试',
  };

  return (
    <main className="min-h-screen bg-dark text-cream">
      <header className="site-header">
        <Link href="/" className="brand-mark" aria-label="星见首页">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="导航">
          <Link href="/tarot" className="nav-link">塔罗占卜</Link>
          <Link href="/tests" className="nav-link">心理测试</Link>
        </nav>
        <Link href="/tests" className="nav-cta md:hidden">测试</Link>
      </header>

      <div className="editorial-shell">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/tests" className="text-xs tracking-[.12em] text-muted hover:text-cream transition-colors">
            ← 返回测试中心
          </Link>
        </div>

        {/* Test Info */}
        <div className="mb-12">
          <p className="page-kicker">
            {categoryNames[test.category] || test.category} · {test.isFree ? '免费测试' : '付费测试'}
          </p>
          <h1 className="page-title">{test.title}</h1>
          <p className="page-subtitle max-w-2xl">{test.subtitle}</p>
          <p className="mt-6 text-sm text-muted leading-relaxed max-w-xl">{test.description}</p>
        </div>

        {/* Test Meta */}
        <div className="grid gap-8 sm:grid-cols-2 mb-12">
          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">ABOUT THIS TEST</p>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex justify-between border-b border-line pb-3">
                <span>题目数量</span>
                <span className="text-cream">{test.questionCount} 题</span>
              </div>
              <div className="flex justify-between border-b border-line pb-3">
                <span>预计时间</span>
                <span className="text-cream">约 {test.estimatedMinutes} 分钟</span>
              </div>
              <div className="flex justify-between border-b border-line pb-3">
                <span>测试状态</span>
                {test.isFree ? (
                  <span className="text-success">免费</span>
                ) : canStart ? (
                  <span className="text-success">已解锁</span>
                ) : permLoading ? (
                  <span className="text-muted">检查中…</span>
                ) : (
                  <span className="text-muted">需要邀请码</span>
                )}
              </div>
            </div>
          </div>

          <div className="editorial-panel p-6">
            <p className="page-kicker mb-4">WHAT YOU WILL LEARN</p>
            <div className="space-y-4 text-sm text-muted">
              <div>
                <p className="text-cream/80 mb-1">这个测试解决什么问题</p>
                <p className="leading-relaxed">{test.problemsSolved}</p>
              </div>
              <div>
                <p className="text-cream/80 mb-1">适合人群</p>
                <p className="leading-relaxed">{test.suitableFor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center py-8">
          <button
            onClick={handleStart}
            disabled={permLoading}
            className="button-primary text-base px-12 min-h-[56px]"
          >
            {permLoading ? '检查权限中…' : '开始测试'}
          </button>
          {!test.isFree && !canStart && !permLoading && (
            <p className="mt-4 text-xs text-muted">
              此测试需要邀请码解锁。点击按钮后输入邀请码即可开始。
            </p>
          )}
        </div>
      </div>

      <footer className="site-footer">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <p>关注小红书获取邀请码 · @你的小红书账号</p>
        <p>© 2026 星见 · 心理测试仅供自我探索参考</p>
      </footer>

      <InviteCodeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleInviteSuccess}
        requiredModule={modalModule}
      />
    </main>
  );
}
