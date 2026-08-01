/**
 * 答题页 /tests/[slug]/take
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_TESTS } from '@/data/psychological-tests';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';
import {
  calculateScores,
  saveResultToStorage,
  saveDraftToStorage,
  getDraftFromStorage,
  clearDraftFromStorage,
  type UserAnswers,
  type QuizDraft,
} from '@/lib/scoring-engine';

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const test = ALL_TESTS.find((t) => t.slug === slug);
  if (!test) notFound();

  const permissionId = test.isFree ? '' : test.permissionId;
  const { hasPermission, isLoading: permLoading } = usePermission(permissionId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showToast, setShowToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // 恢复草稿
  useEffect(() => {
    if (draftRestored) return;
    const draft = getDraftFromStorage(slug);
    if (draft && draft.answers && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      setCurrentIndex(draft.currentIndex);
    }
    setDraftRestored(true);
  }, [slug, draftRestored]);

  // 自动保存草稿
  useEffect(() => {
    if (!draftRestored) return;
    const draft: QuizDraft = {
      currentIndex,
      answers,
      savedAt: new Date().toISOString(),
    };
    saveDraftToStorage(slug, draft);
  }, [currentIndex, answers, slug, draftRestored]);

  const totalQuestions = test.questions.length;
  const currentQuestion = test.questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id];

  const hasSelected = (): boolean => {
    if (!selectedAnswer) return false;
    if (Array.isArray(selectedAnswer)) return selectedAnswer.length > 0;
    return selectedAnswer !== '';
  };

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => {
        const q = test.questions[currentIndex];
        if (q.type === 'multiple') {
          const current = (prev[q.id] as string[]) || [];
          const updated = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [q.id]: updated };
        }
        return { ...prev, [q.id]: optionId };
      });
      setShowToast('');
    },
    [currentIndex, test.questions]
  );

  const handleNext = useCallback(() => {
    if (!hasSelected()) {
      setShowToast('请先选择一个选项再继续');
      return;
    }
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setShowToast('');
    }
  }, [currentIndex, totalQuestions, hasSelected]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setShowToast('');
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (!hasSelected()) {
      setShowToast('请先回答最后一题');
      return;
    }
    setSubmitting(true);
    try {
      const result = calculateScores(test, answers);
      if (result) {
        saveResultToStorage(slug, result);
        clearDraftFromStorage(slug);
        router.push(`/tests/${slug}/result`);
      } else {
        setShowToast('结果计算出错，请重试');
      }
    } catch {
      setShowToast('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }, [slug, test, answers, router, hasSelected]);

  const handleInviteSuccess = useCallback(
    (newPermissions: string[]) => {
      if (newPermissions.includes(test.permissionId) || newPermissions.includes('vip')) {
        setShowModal(false);
      }
    },
    [test.permissionId]
  );

  // 权限检查中
  if (permLoading) {
    return (
      <main className="min-h-screen bg-dark text-cream flex items-center justify-center">
        <p className="text-muted">检查权限中…</p>
      </main>
    );
  }

  // 无权限
  if (!test.isFree && !hasPermission && !permLoading) {
    return (
      <main className="min-h-screen bg-dark text-cream">
        <header className="site-header">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__cn">星见</span>
            <span className="brand-mark__en">XINGJIAN</span>
          </Link>
        </header>
        <div className="editorial-shell text-center py-20">
          <p className="page-kicker mb-6">ACCESS REQUIRED</p>
          <p className="text-muted mb-8">此测试需要邀请码解锁</p>
          <button onClick={() => setShowModal(true)} className="button-primary">
            输入邀请码
          </button>
        </div>
        <InviteCodeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleInviteSuccess}
          requiredModule={test.permissionId}
        />
      </main>
    );
  }

  // 渲染题目
  const renderOptions = () => {
    if (!currentQuestion) return null;

    const qType = currentQuestion.type;
    const isMultiple = qType === 'multiple';
    const selected = selectedAnswer ? (Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]) : [];

    return (
      <div className="space-y-3 mt-8">
        {currentQuestion.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-5 border transition-colors ${
                isSelected
                  ? 'border-copper bg-[#1a1510]'
                  : 'border-line hover:border-[#4b4036] bg-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] mt-0.5 ${
                    isSelected ? 'border-copper bg-copper text-dark' : 'border-[#4b4036] text-muted'
                  }`}
                >
                  {isMultiple ? (isSelected ? '✓' : '') : (isSelected ? '●' : '')}
                </span>
                <span className="text-sm leading-relaxed">{opt.text}</span>
              </div>
            </button>
          );
        })}
        {isMultiple && (
          <p className="text-[10px] text-muted mt-2">可多选，点击已选项可取消</p>
        )}
      </div>
    );
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <main className="min-h-screen bg-dark text-cream">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <Link href={`/tests/${slug}`} className="nav-link text-xs">
          退出答题
        </Link>
      </header>

      <div className="editorial-shell max-w-2xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-[10px] tracking-[.12em] text-muted mb-3">
            <span>第 {currentIndex + 1} / {totalQuestions} 题</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-[2px] bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-copper transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="editorial-panel p-6 sm:p-10">
          {currentQuestion.type === 'scale' && (
            <p className="page-kicker mb-4">程度量表</p>
          )}
          {currentQuestion.type === 'scenario' && (
            <p className="page-kicker mb-4">情境选择</p>
          )}
          {currentQuestion.type === 'multiple' && (
            <p className="page-kicker mb-4">多选题</p>
          )}

          <p className="font-serif-cn text-xl sm:text-2xl leading-relaxed">
            {currentQuestion?.text}
          </p>

          {renderOptions()}

          {/* Toast */}
          {showToast && (
            <p className="mt-4 text-xs text-[#c77d6a] animate-fadeIn">{showToast}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="button-secondary text-xs disabled:opacity-30"
          >
            上一题
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button onClick={handleNext} className="button-primary text-xs">
              下一题
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="button-primary text-xs"
            >
              {submitting ? '提交中…' : '查看结果'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
