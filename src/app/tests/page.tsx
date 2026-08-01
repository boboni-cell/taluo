/**
 * 测试中心页面 /tests
 */
'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_TESTS, TEST_CATEGORIES, type TestCategory, type TestDefinition } from '@/data/psychological-tests';
import { usePermission } from '@/hooks/usePermission';
import { fetchPermissions } from '@/lib/permissions-client';

export default function TestsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dark text-cream flex items-center justify-center">
        <p className="text-muted">加载中…</p>
      </main>
    }>
      <TestsContent />
    </Suspense>
  );
}

function TestsContent() {
  const searchParams = useSearchParams();

  const initialCategory = (searchParams.get('category') as TestCategory) || 'personality';
  const [activeCategory, setActiveCategory] = useState<TestCategory>(initialCategory);

  // 按需检查权限：只检查当前分类
  const categoryInfo = TEST_CATEGORIES.find((c) => c.id === activeCategory);
  const permissionId = categoryInfo?.permissionId || '';

  // 获取所有权限（用于显示解锁状态），只调一次
  const [allPermissions, setAllPermissions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchPermissions()
      .then((data) => {
        if (!cancelled) {
          setAllPermissions(data.permissions);
        }
      })
      .catch(() => {
        if (!cancelled) { /* ignore */ }
      });
    return () => { cancelled = true; };
  }, []);

  // 使用 usePermission hook 检查当前分类权限
  const { hasPermission: currentCategoryUnlocked } = usePermission(permissionId);

  const hasVip = allPermissions.includes('vip');

  // 缓存每个分类的测试数量
  const testsByCategory = useMemo(() => {
    const map: Record<TestCategory, TestDefinition[]> = {} as Record<TestCategory, TestDefinition[]>;
    for (const cat of TEST_CATEGORIES) {
      map[cat.id] = ALL_TESTS.filter((t) => t.category === cat.id);
    }
    return map;
  }, []);

  const handleCategoryChange = useCallback((cat: TestCategory) => {
    setActiveCategory(cat);
  }, []);

  const getAccessStatus = useCallback(
    (test: TestDefinition): 'free' | 'unlocked' | 'locked' => {
      if (test.isFree) return 'free';
      if (hasVip) return 'unlocked';
      if (allPermissions.includes(test.permissionId)) return 'unlocked';
      // 检查分类权限（当前分类已解锁 = 该分类所有测试解锁）
      if (currentCategoryUnlocked) return 'unlocked';
      return 'locked';
    },
    [hasVip, allPermissions, currentCategoryUnlocked]
  );

  const currentTests = testsByCategory[activeCategory] || [];

  return (
    <main className="min-h-screen bg-dark text-cream">
      {/* Header */}
      <header className="site-header">
        <Link href="/" className="brand-mark" aria-label="星见首页">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="导航">
          <Link href="/tarot" className="nav-link">塔罗占卜</Link>
          <Link href="/tests" className="nav-link" style={{ color: 'var(--copper)' }}>心理测试</Link>
        </nav>
        <Link href="/tests" className="nav-cta md:hidden">测试</Link>
      </header>

      <div className="editorial-shell">
        {/* Page Title */}
        <div className="mb-12">
          <p className="page-kicker">PSYCHOLOGICAL TESTS</p>
          <h1 className="page-title">心理测试中心</h1>
          <p className="page-subtitle max-w-2xl">
            通过科学的心理测评工具，深入了解自己的人格特质、情感模式与内在需求。
            每一次测试都是一次自我发现的旅程。
          </p>
        </div>

        {/* Category Nav */}
        <div className="mb-12 border-b border-line">
          <div className="flex flex-wrap gap-1 -mb-px">
            {TEST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-5 py-3 text-xs tracking-[.12em] transition-colors border-b-2 ${
                  activeCategory === cat.id
                    ? 'border-copper text-cream'
                    : 'border-transparent text-muted hover:text-cream/80'
                }`}
              >
                {cat.name}
                <span className="ml-2 text-[10px] opacity-50">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Description */}
        <div className="mb-10">
          <p className="text-sm text-muted leading-relaxed">{categoryInfo?.description}</p>
        </div>

        {/* Test Cards */}
        <div className="grid gap-px bg-line sm:grid-cols-2">
          {currentTests.map((test) => {
            const status = getAccessStatus(test);
            return (
              <div key={test.slug} className="bg-dark p-6 sm:p-8 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="pill-label">{test.category === 'fun' ? '免费' : '付费'}</span>
                  {status === 'free' && (
                    <span className="text-[10px] tracking-[.12em] text-success">免费</span>
                  )}
                  {status === 'unlocked' && !test.isFree && (
                    <span className="text-[10px] tracking-[.12em] text-success">已解锁</span>
                  )}
                  {status === 'locked' && (
                    <span className="text-[10px] tracking-[.12em] text-muted">需要邀请码</span>
                  )}
                </div>

                <h3 className="font-serif-cn text-2xl mb-2">{test.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">{test.subtitle}</p>

                <div className="flex items-center gap-4 text-[10px] tracking-[.08em] text-muted mb-5">
                  <span>{test.questionCount} 题</span>
                  <span className="text-line">|</span>
                  <span>约 {test.estimatedMinutes} 分钟</span>
                </div>

                <Link
                  href={`/tests/${test.slug}`}
                  className="button-secondary text-center text-xs"
                >
                  查看测试
                </Link>
              </div>
            );
          })}
        </div>

        {currentTests.length === 0 && (
          <div className="py-20 text-center text-muted">
            <p className="font-serif-cn text-2xl mb-3">暂无测试</p>
            <p className="text-sm">该分类下暂无可用的测试，请选择其他分类。</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <p>关注小红书获取邀请码 · @你的小红书账号</p>
        <p>© 2026 星见 · 心理测试仅供自我探索参考</p>
      </footer>
    </main>
  );
}
