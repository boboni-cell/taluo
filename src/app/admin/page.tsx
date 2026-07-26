'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">✦</span>
          <h1 className="mt-3 text-2xl font-bold text-accent tracking-[0.15em]">后台管理</h1>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1A0F0A]/80 border border-accent/20 rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="用户名"
              disabled={loading}
              autoFocus
              className="w-full bg-[#2C1810] text-cream rounded-xl border border-accent/30 px-4 py-3 outline-none focus:border-accent transition-colors disabled:opacity-50 placeholder:text-cream/20"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="密码"
              disabled={loading}
              className="w-full bg-[#2C1810] text-cream rounded-xl border border-accent/30 px-4 py-3 outline-none focus:border-accent transition-colors disabled:opacity-50 placeholder:text-cream/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400/80 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-yellow-600 text-dark font-bold py-3 tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </main>
  );
}
