'use client';

import { useState, useCallback, useEffect } from 'react';
import { activateCode } from '@/lib/permissions-client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPermissions: string[]) => void;
  requiredModule: string;
}

export default function InviteCodeModal({ isOpen, onClose, onSuccess, requiredModule }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  // 关闭时重置状态（延迟等动画结束）
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setCode('');
        setError('');
        setLoading(false);
        setSuccessMsg('');
        setNewPerms([]);
        setShake(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // 成功 2 秒后自动关闭
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => {
      onSuccess(newPerms);
      onClose();
    }, 2000);
    return () => clearTimeout(t);
  }, [successMsg, newPerms, onSuccess, onClose]);

  const handleActivate = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('请输入邀请码');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await activateCode(trimmed);
      if (result.success) {
        setSuccessMsg('激活成功！');
        setNewPerms(result.newPermissions || []);
      } else {
        setError(result.message || '激活失败，请稍后再试');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('网络错误，请稍后再试');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleActivate();
    },
    [handleActivate]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCode(e.target.value.toUpperCase());
      if (error) setError('');
    },
    [error]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* ---- 遮罩层 ---- */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto"
        onClick={onClose}
      >
        {/* ---- 弹窗容器 ---- */}
        <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`
              w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-2xl
              bg-[#1A0F0A] border border-accent/30 sm:border-accent/40
              shadow-2xl shadow-black/50
              animate-modalIn
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- 顶部拖拽条（手机端） ---- */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-cream/20" />
            </div>

            {/* ====== 成功状态 ====== */}
            {successMsg ? (
              <div className="px-6 py-10 sm:py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" className="animate-checkDraw" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-3 tracking-wider">
                  {successMsg}
                </h2>
                <p className="text-sm text-cream/60">
                  已解锁：{newPerms.join('、') || '全部功能'}
                </p>
              </div>
            ) : (
              /* ====== 输入状态 ====== */
              <div className="px-6 py-8 sm:py-10">
                {/* 标题 */}
                <h2 className="text-xl sm:text-2xl font-bold text-accent text-center tracking-[0.15em] mb-2">
                  请输入邀请码
                </h2>

                {/* 副标题 */}
                <p className="text-sm text-cream/50 text-center mb-6">
                  关注小红书 @你的账号名 获取邀请码
                </p>

                {/* 输入框区域 */}
                <div className={shake ? 'animate-shake' : ''}>
                  <input
                    type="text"
                    value={code}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入邀请码"
                    disabled={loading}
                    autoFocus
                    className={`
                      w-full bg-[#2C1810] text-cream text-lg text-center tracking-[0.3em]
                      rounded-xl border-2 px-6 py-4
                      placeholder:text-cream/20
                      outline-none transition-colors duration-200
                      disabled:opacity-50
                      ${error
                        ? 'border-red-400/60 focus:border-red-400'
                        : 'border-accent/40 focus:border-accent'
                      }
                    `}
                  />

                  {/* 错误提示 */}
                  {error && (
                    <p className="text-sm text-red-400/80 text-center mt-3 animate-fadeIn">
                      {error}
                    </p>
                  )}
                </div>

                {/* 激活按钮 */}
                <button
                  onClick={handleActivate}
                  disabled={loading || !code.trim()}
                  className={`
                    w-full mt-5 rounded-xl py-4 text-base font-bold tracking-[0.2em]
                    transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${loading
                      ? 'bg-accent/30 text-accent/50'
                      : 'bg-gradient-to-r from-accent to-yellow-600 text-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/10'
                    }
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-accent/50 border-t-accent rounded-full animate-spin" />
                      验证中…
                    </span>
                  ) : (
                    '激活'
                  )}
                </button>

                {/* 底部提示 */}
                <p className="text-xs text-cream/25 text-center mt-5">
                  每个邀请码仅限一次使用
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
