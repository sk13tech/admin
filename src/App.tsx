import { useState } from 'react';
import { onAdminAuth, adminLogout } from './firebase';
import type { User } from 'firebase/auth';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Lock, Loader2, RotateCcw, Play, Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import SiteSettings from './pages/SiteSettings';
import Replacements from './pages/Replacements';
import Customers from './pages/Customers';
import { useEffect } from 'react';

// Reuse simple login from firebase helper directly
import { adminLogin } from './firebase';

function LoginScreen({ dark }: { dark: boolean }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await adminLogin(email, pass);
    if (res.error) setErr(res.error);
    setBusy(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${dark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-emerald-50/30'}`}>
      <form onSubmit={submit} className={`w-full max-w-sm p-8 space-y-5 rounded-2xl border shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200"><Lock className="h-7 w-7 text-white" /></div>
          <h1 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Admin Panel</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Standalone Admin</p>
        </div>
        <div><label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${dark ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'} focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500`} /></div>
        <div><label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} required className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${dark ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'} focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500`} /></div>
        {err && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{err}</div>}
        <button type="submit" disabled={busy} className="w-full bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center justify-center gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}</button>
      </form>
    </div>
  );
}

type Page = 'dashboard' | 'orders' | 'products' | 'customers' | 'replacements' | 'reels' | 'settings';
const topNav = [
  { label: 'Dashboard', page: 'dashboard' as Page, icon: LayoutDashboard },
  { label: 'Orders', page: 'orders' as Page, icon: ShoppingCart },
  { label: 'Replacements', page: 'replacements' as Page, icon: RotateCcw },
];
const sideNav = [
  { label: 'Products', page: 'products' as Page, icon: Package },
  { label: 'Customers', page: 'customers' as Page, icon: Users },
  { label: 'Reels', page: 'reels' as Page, icon: Play },
  { label: 'Settings', page: 'settings' as Page, icon: Settings },
];


function Layout({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [page, setPage] = useState<Page>('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const goTo = (p: Page) => { setPage(p); setSideOpen(false); };

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`fixed inset-x-0 top-0 z-40 backdrop-blur-sm border-b ${dark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200/80'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center"><Package className="h-4 w-4 text-white" /></div><div><p className={`text-sm font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Admin</p><p className="text-[9px] uppercase tracking-widest text-slate-400 leading-tight">Standalone</p></div></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className={`h-9 w-9 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-700 text-amber-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} title={dark ? 'Light mode' : 'Dark mode'}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={() => setSideOpen(!sideOpen)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>More</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-none"><div className="flex px-4 pb-2 gap-1 min-w-max">{topNav.map(n => (<button key={n.page} onClick={() => goTo(n.page)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${page === n.page ? 'bg-emerald-600 text-white shadow-sm' : dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}><n.icon className="h-3.5 w-3.5" /> {n.label}</button>))}{sideNav.some(n => n.page === page) && <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm">{sideNav.find(n => n.page === page)!.label}</span>}</div></div>
      </header>
      {sideOpen && (<><div className="fixed inset-0 z-40 bg-black/10" onClick={() => setSideOpen(false)} /><div className={`fixed top-0 right-0 bottom-0 z-50 w-56 shadow-xl border-l ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}><div className={`flex items-center justify-between px-4 h-14 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}><p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Manage</p><button onClick={() => setSideOpen(false)} className={`h-8 w-8 flex items-center justify-center rounded-xl ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X className="h-4 w-4 text-slate-500" /></button></div><nav className="p-3 space-y-1">{sideNav.map(n => (<button key={n.page} onClick={() => goTo(n.page)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${page === n.page ? 'bg-emerald-600 text-white' : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}><n.icon className="h-4 w-4" /> {n.label}</button>))}<div className={`border-t mt-3 pt-3 ${dark ? 'border-slate-700' : 'border-slate-100'}`}><button onClick={adminLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut className="h-4 w-4" /> Sign Out</button></div></nav></div></>)}
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-8">
        {page === 'dashboard' && <Dashboard goTo={goTo} dark={dark} />}
        {page === 'orders' && <Orders />}
        {page === 'products' && <Products />}
        {page === 'customers' && <Customers dark={dark} />}
        {page === 'replacements' && <Replacements dark={dark} />}
        {page === 'reels' && <SiteSettings dark={dark} />}
        {page === 'settings' && <SiteSettings dark={dark} />}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('admin_theme') === 'dark');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('admin_theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => onAdminAuth(u => { setUser(u); setLoading(false); }), []);
  if (loading) return <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>;
  return !user ? <LoginScreen dark={dark} /> : <Layout dark={dark} setDark={setDark} />;
}
