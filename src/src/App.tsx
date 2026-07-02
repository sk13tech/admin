import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAdminAuth, adminLogin, adminLogout } from './firebase';
import { LayoutDashboard, ShoppingCart, Package, Users, RotateCcw, Settings, Play, LogOut, Lock, Loader2, Menu as MenuIcon, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Replacements from './pages/Replacements';
import SiteSettings from './pages/SiteSettings';
import Reels from './pages/Reels';

function LoginScreen() {
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-emerald-50/30">
      <form onSubmit={submit} className="w-full max-w-sm p-8 space-y-5 rounded-2xl border shadow-sm bg-white border-slate-200">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200"><Lock className="h-7 w-7 text-white" /></div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm mt-1 text-slate-500">Standalone Admin</p>
        </div>
        <div><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" /></div>
        <div><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} required className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" /></div>
        {err && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</div>}
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

function Layout() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const goTo = (p: Page) => { setPage(p); setSideOpen(false); };

  return (
    <div className="min-h-screen transition-colors bg-slate-50">
      <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-sm border-b bg-white/95 border-slate-200/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center"><Package className="h-4 w-4 text-white" /></div><div><p className="text-sm font-bold leading-tight text-slate-900">Admin</p><p className="text-[9px] uppercase tracking-widest text-slate-400 leading-tight">Standalone</p></div></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSideOpen(!sideOpen)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"><MenuIcon className="h-3.5 w-3.5" /> More</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-none"><div className="flex px-4 pb-2 gap-1 min-w-max">{topNav.map(n => (<button key={n.page} onClick={() => goTo(n.page)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${page === n.page ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}><n.icon className="h-3.5 w-3.5" /> {n.label}</button>))}{sideNav.some(n => n.page === page) && <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm">{sideNav.find(n => n.page === page)!.label}</span>}</div></div>
      </header>
      {sideOpen && (<><div className="fixed inset-0 z-40 bg-black/10" onClick={() => setSideOpen(false)} /><div className="fixed top-0 right-0 bottom-0 z-50 w-56 shadow-xl border-l bg-white border-slate-200"><div className="flex items-center justify-between px-4 h-14 border-b border-slate-100"><p className="text-sm font-bold text-slate-900">Manage</p><button onClick={() => setSideOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button></div><nav className="p-3 space-y-1">{sideNav.map(n => (<button key={n.page} onClick={() => goTo(n.page)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${page === n.page ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><n.icon className="h-4 w-4" /> {n.label}</button>))}<div className="border-t mt-3 pt-3 border-slate-100"><button onClick={adminLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign Out</button></div></nav></div></>)}
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-8">
        {page === 'dashboard' && <Dashboard goTo={goTo} />}
        {page === 'orders' && <Orders />}
        {page === 'products' && <Products />}
        {page === 'customers' && <Customers />}
        {page === 'replacements' && <Replacements />}
        {page === 'reels' && <Reels />}
        {page === 'settings' && <SiteSettings />}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      return onAdminAuth(u => {
        setUser(u);
        setLoading(false);
      });
    } catch (err: any) {
      setError(err?.message || 'Firebase initialization failed');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Configuration Error</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <p className="text-xs text-slate-500">Please check your Firebase configuration in the .env file</p>
        </div>
      </div>
    );
  }

  return user ? <Layout /> : <LoginScreen />;
}
