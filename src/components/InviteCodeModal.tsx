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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-title"
          className="w-full border border-line bg-[#12100d] p-7 shadow-2xl shadow-black/60 animate-modalIn sm:max-w-[470px] sm:p-10"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-10 flex items-start justify-between border-b border-line pb-5">
            <div>
              <p className="page-kicker">PRIVATE ACCESS</p>
              <p className="mt-2 text-[10px] tracking-[.14em] text-muted">星见内测邀请</p>
            </div>
            <button onClick={onClose} className="text-xs tracking-[.14em] text-muted transition-colors hover:text-cream">关闭</button>
          </div>

          {successMsg ? (
            <div className="py-8 text-center">
              <p className="page-kicker text-[#8fa07a]">ACCESS GRANTED</p>
              <h2 id="invite-title" className="mt-5 font-serif-cn text-4xl font-normal">已解锁</h2>
              <p className="mt-4 text-sm text-muted">{newPerms.join('、') || '全部功能'} 已可使用</p>
            </div>
          ) : (
            <div>
              <h2 id="invite-title" className="font-serif-cn text-4xl font-normal leading-tight">输入邀请码，<br />开始你的解读。</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                关注小红书 @你的账号名 获取邀请码
                {requiredModule ? `。激活后即可使用${requiredModule === 'tarot' ? '塔罗占卜' : requiredModule}。` : '。'}
              </p>

              <div className={`mt-8 ${shake ? 'animate-shake' : ''}`}>
                <label htmlFor="invite-code" className="mb-3 block text-[10px] tracking-[.18em] text-[#9d9489]">INVITATION CODE</label>
                <input
                  id="invite-code"
                  type="text"
                  value={code}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="输入邀请码"
                  disabled={loading}
                  autoFocus
                  className={`w-full border bg-[#0b0a08] px-5 py-4 text-base tracking-[.22em] text-cream outline-none transition-colors placeholder:text-[#534c44] disabled:opacity-50 ${error ? 'border-[#9e5e50]' : 'border-[#403930] focus:border-accent'}`}
                />
                {error && <p className="mt-3 text-xs text-[#c77d6a] animate-fadeIn">{error}</p>}
              </div>

              <button onClick={handleActivate} disabled={loading || !code.trim()} className="button-primary mt-5 w-full">
                {loading ? '正在验证…' : '验证并进入'}
              </button>
              <p className="mt-5 text-center text-[10px] tracking-[.08em] text-[#625b53]">每个邀请码仅限一次使用</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
