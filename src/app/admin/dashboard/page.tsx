'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 类型
interface CodeItem {
  id: number; code: string; status: string; maxUses: number; usedCount: number;
  expiresAt: string | null; note: string | null; createdAt: string; activatedAt: string | null;
  permissions: string[];
}
interface Stats { total: number; unused: number; activated: number; other: number; }
interface ModuleItem { id: string; name_zh: string; }

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'unused', label: '未使用' },
  { value: 'activated', label: '已激活' },
  { value: 'expired', label: '已过期' },
  { value: 'revoked', label: '已作废' },
];

function statusColor(s: string) {
  const map: Record<string, string> = {
    unused: 'bg-green-400/15 text-green-400/80 border-green-400/20',
    activated: 'bg-blue-400/15 text-blue-400/80 border-blue-400/20',
    expired: 'bg-gray-400/15 text-gray-400/80 border-gray-400/20',
    revoked: 'bg-red-400/15 text-red-400/80 border-red-400/20',
  };
  return map[s] || '';
}
function statusLabel(s: string) { return STATUS_OPTIONS.find(o => o.value === s)?.label || s; }

export default function DashboardPage() {
  const router = useRouter();
  const [, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, unused: 0, activated: 0, other: 0 });
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState('');
  const [inviteRequired, setInviteRequired] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);

  // 生成弹窗
  const [showGen, setShowGen] = useState(false);
  const [genPerms, setGenPerms] = useState<string[]>(['tarot']);
  const [genCount, setGenCount] = useState(10);
  const [genMaxUses, setGenMaxUses] = useState(30);
  const [genExpiry, setGenExpiry] = useState('');
  const [genExpiryDate, setGenExpiryDate] = useState('');
  const [genNote, setGenNote] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  // 权限检查 & 加载数据
  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
    loadCodes(t, 1, '');
    loadModules();
    loadAccessMode();
  }, []);

  async function loadCodes(token: string, p: number, status: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/codes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem('adminToken'); router.push('/admin'); return; }
      const data = await res.json();
      setCodes(data.list || []);
      setTotalPages(Math.ceil((data.total || 0) / PAGE_SIZE));
      // 计算统计（简化：用 list 中数据估算）
      const all: CodeItem[] = data.list || [];
      setStats({
        total: data.total || 0,
        unused: all.filter((c: CodeItem) => c.status === 'unused').length,
        activated: all.filter((c: CodeItem) => c.status === 'activated').length,
        other: all.filter((c: CodeItem) => c.status === 'expired' || c.status === 'revoked').length,
      });
      setPage(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadModules() {
    try { setModules([{ id: 'tarot', name_zh: '塔罗占卜' }, { id: 'personality', name_zh: '人格类型测试' }, { id: 'emotion', name_zh: '情感模式测试' }, { id: 'relationship', name_zh: '人际关系测试' }, { id: 'inner', name_zh: '内在探索测试' }, { id: 'deep_report', name_zh: '深度报告' }, { id: 'vip', name_zh: '全部权限' }]); } catch {}
  }

  async function loadAccessMode() {
    setAccessLoading(true);
    try {
      const res = await fetch('/api/access-mode', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setInviteRequired(data.inviteRequired !== false);
      else showToast(data.error || '读取访问设置失败');
    } catch {
      showToast('读取访问设置失败');
    } finally {
      setAccessLoading(false);
    }
  }

  async function toggleAccessMode() {
    const t = localStorage.getItem('adminToken');
    if (!t || accessLoading) return;
    const nextValue = !inviteRequired;
    setAccessLoading(true);
    try {
      const res = await fetch('/api/access-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ inviteRequired: nextValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/admin');
          return;
        }
        showToast(data.error || '更新访问设置失败');
        return;
      }
      setInviteRequired(data.inviteRequired);
      showToast(data.inviteRequired ? '已开启邀请码验证' : '已关闭邀请码验证，访客可直接使用');
    } catch {
      showToast('更新访问设置失败');
    } finally {
      setAccessLoading(false);
    }
  }

  const refresh = useCallback(() => {
    const t = localStorage.getItem('adminToken');
    if (t) loadCodes(t, page, filterStatus);
  }, [page, filterStatus]);

  function handleFilter(s: string) { setFilterStatus(s); const t = localStorage.getItem('adminToken'); if (t) loadCodes(t, 1, s); }

  function handleLogout() { localStorage.removeItem('adminToken'); router.push('/admin'); }

  async function copyCode(code: string) {
    try { await navigator.clipboard.writeText(code); showToast('已复制: ' + code); }
    catch { showToast('复制失败'); }
  }

  async function handleRevoke(id: number) {
    const t = localStorage.getItem('adminToken');
    if (!t) return;
    const res = await fetch('/api/admin/codes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ codeId: id, action: 'revoke' }),
    });
    if (res.ok) { showToast('已作废'); refresh(); }
  }

  async function handleGenerate() {
    const t = localStorage.getItem('adminToken');
    if (!t) return;
    setGenLoading(true);
    try {
      let expiresAt: string | null = null;
      if (genExpiry === '7d') expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      else if (genExpiry === '30d') expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      else if (genExpiry === 'custom' && genExpiryDate) expiresAt = new Date(genExpiryDate).toISOString();

      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ permissions: genPerms, count: genCount, maxUses: genMaxUses, expiresAt, note: genNote || null }),
      });
      const data = await res.json();
      if (data.success) { setGenResult(data.codes); } else { showToast(data.error || '生成失败'); }
    } catch { showToast('网络错误'); }
    finally { setGenLoading(false); }
  }

  async function copyAll() {
    try { await navigator.clipboard.writeText(genResult.join('\n')); showToast('已复制全部邀请码'); }
    catch { showToast('复制失败'); }
  }

  function exportCSV() {
    const csv = '邀请码\n' + genResult.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invite-codes.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-dark px-4 py-6 sm:px-8 sm:py-10">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-accent tracking-[0.15em]">✦ 后台管理</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAccessMode}
              disabled={accessLoading}
              aria-pressed={inviteRequired}
              className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wider transition-colors disabled:cursor-wait disabled:opacity-50 ${
                inviteRequired
                  ? 'border-accent/50 bg-accent/15 text-accent hover:bg-accent/25'
                  : 'border-green-400/40 bg-green-400/10 text-green-300 hover:bg-green-400/20'
              }`}
            >
              {accessLoading ? '读取中…' : `邀请码验证：${inviteRequired ? '已开启' : '已关闭'}`}
            </button>
            <button onClick={handleLogout} className="text-sm text-cream/40 hover:text-red-400 transition-colors">退出登录</button>
          </div>
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: '总邀请码', value: stats.total, color: 'text-accent' },
            { label: '未使用', value: stats.unused, color: 'text-green-400' },
            { label: '已激活', value: stats.activated, color: 'text-blue-400' },
            { label: '已过期/作废', value: stats.other, color: 'text-gray-400' },
          ].map((s, i) => (
            <div key={i} className="bg-[#1A0F0A] border border-accent/15 rounded-xl p-4 sm:p-5 text-center">
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{loading ? '…' : s.value}</p>
              <p className="text-xs text-cream/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <button onClick={() => setShowGen(true)} className="rounded-lg bg-gradient-to-r from-accent to-yellow-600 text-dark font-bold px-5 py-2.5 text-sm tracking-wider hover:opacity-90">
            批量生成邀请码
          </button>
          <select
            value={filterStatus}
            onChange={e => handleFilter(e.target.value)}
            className="bg-[#2C1810] text-cream/80 border border-accent/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* table */}
        <div className="bg-[#1A0F0A] border border-accent/15 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-accent/10">
              <tr className="text-cream/50 text-left">
                <th className="py-3 px-4 font-normal">邀请码</th>
                <th className="py-3 px-4 font-normal hidden sm:table-cell">权限模块</th>
                <th className="py-3 px-4 font-normal">状态</th>
                <th className="py-3 px-4 font-normal hidden sm:table-cell">使用</th>
                <th className="py-3 px-4 font-normal hidden md:table-cell">创建时间</th>
                <th className="py-3 px-4 font-normal">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-cream/30">加载中…</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-cream/30">暂无数据</td></tr>
              ) : (
                codes.map(c => (
                  <tr key={c.id} className="border-b border-accent/5 hover:bg-accent/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-accent/80">{c.code}</td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.permissions.map((p, i) => (
                          <span key={i} className="text-[10px] bg-accent/10 text-accent/70 px-1.5 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusColor(c.status)}`}>
                        {statusLabel(c.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cream/50 hidden sm:table-cell">{c.usedCount}/{c.maxUses}</td>
                    <td className="py-3 px-4 text-cream/40 text-xs hidden md:table-cell">{c.createdAt?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyCode(c.code)} className="text-xs text-accent/60 hover:text-accent">复制</button>
                        {c.status === 'unused' && (
                          <button onClick={() => handleRevoke(c.id)} className="text-xs text-red-400/60 hover:text-red-400">作废</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => { const t = localStorage.getItem('adminToken'); if (t) loadCodes(t, i + 1, filterStatus); }}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1 ? 'bg-accent text-dark' : 'bg-[#2C1810] text-cream/50 hover:text-accent'
                }`}
              >{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary/95 border border-accent text-accent px-6 py-3 rounded-full text-sm tracking-wider animate-fadeInUp">{toast}</div>
      )}

      {/* generate modal */}
      {showGen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowGen(false)}>
          <div className="bg-[#1A0F0A] border border-accent/30 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-accent mb-4 tracking-wider">批量生成邀请码</h2>

            {genResult.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-cream/60">已生成 {genResult.length} 个邀请码：</p>
                <div className="bg-[#2C1810] rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm text-accent/80 space-y-1">
                  {genResult.map((c, i) => <div key={i}>{c}</div>)}
                </div>
                <div className="flex gap-3">
                  <button onClick={copyAll} className="flex-1 rounded-lg border border-accent text-accent py-2.5 text-sm tracking-wider hover:bg-accent/10">一键复制全部</button>
                  <button onClick={exportCSV} className="flex-1 rounded-lg border border-accent/50 text-cream/70 py-2.5 text-sm tracking-wider hover:border-accent">导出CSV</button>
                </div>
                <button onClick={() => { setShowGen(false); setGenResult([]); refresh(); }} className="w-full rounded-lg bg-accent/20 text-accent py-2.5 text-sm">关闭</button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 权限选择 */}
                <div>
                  <p className="text-sm text-cream/50 mb-2">权限模块</p>
                  <div className="flex flex-wrap gap-2">
                    {modules.map(m => (
                      <label key={m.id} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                        genPerms.includes(m.id) ? 'bg-accent/20 border-accent text-accent' : 'border-accent/20 text-cream/50 hover:border-accent/50'
                      }`}>
                        <input type="checkbox" className="hidden" checked={genPerms.includes(m.id)}
                          onChange={() => setGenPerms(prev => prev.includes(m.id) ? prev.filter(p => p !== m.id) : [...prev, m.id])} />
                        {m.name_zh}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-cream/50 mb-1">生成数量</p>
                    <input type="number" min={1} max={100} value={genCount} onChange={e => setGenCount(Number(e.target.value))}
                      className="w-full bg-[#2C1810] text-cream border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-cream/50 mb-1">单码使用次数</p>
                    <input type="number" min={1} value={genMaxUses} onChange={e => setGenMaxUses(Number(e.target.value))}
                      className="w-full bg-[#2C1810] text-cream border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-cream/50 mb-1">过期时间</p>
                  <select value={genExpiry} onChange={e => { setGenExpiry(e.target.value); setGenExpiryDate(''); }}
                    className="w-full bg-[#2C1810] text-cream/80 border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent">
                    <option value="">永久有效</option>
                    <option value="7d">7 天</option>
                    <option value="30d">30 天</option>
                    <option value="custom">自定义日期</option>
                  </select>
                  {genExpiry === 'custom' && (
                    <input type="date" value={genExpiryDate} onChange={e => setGenExpiryDate(e.target.value)}
                      className="w-full mt-2 bg-[#2C1810] text-cream border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  )}
                </div>

                <div>
                  <p className="text-sm text-cream/50 mb-1">备注（可选）</p>
                  <input type="text" value={genNote} onChange={e => setGenNote(e.target.value)} placeholder="如：小红书用户@xxx"
                    className="w-full bg-[#2C1810] text-cream border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent placeholder:text-cream/20" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowGen(false)} className="flex-1 rounded-lg border border-accent/30 text-cream/60 py-2.5 text-sm">取消</button>
                  <button onClick={handleGenerate} disabled={genLoading || genPerms.length === 0}
                    className="flex-1 rounded-lg bg-gradient-to-r from-accent to-yellow-600 text-dark font-bold py-2.5 text-sm disabled:opacity-50">
                    {genLoading ? '生成中…' : '生成'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
