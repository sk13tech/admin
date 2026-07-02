import { useState, useEffect } from 'react';
import { getDocs, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TrendingUp, ShoppingCart, Clock, CheckCircle, Package, Users, AlertCircle, X } from 'lucide-react';

function money(v: number) { return '₹' + v.toLocaleString('en-IN'); }
function fmt(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

type Page = 'dashboard' | 'orders' | 'products' | 'customers' | 'replacements' | 'reels' | 'settings';
type Props = { goTo: (p: Page) => void };

export default function Dashboard({ goTo }: Props) {
  const [stats, setStats] = useState<any>({ totalOrders: 0, totalProducts: 0, totalContacts: 0, totalRevenue: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, replacement: 0 });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<any[]>([]);
  const [dupTxns, setDupTxns] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let productCount = 0; let contactCount = 0; let countsLoaded = false;
    Promise.all([getDocs(collection(db, 'products')), getDocs(collection(db, 'contacts'))]).then(([p, c]) => { productCount = p.size; contactCount = c.size; countsLoaded = true; });
    return onSnapshot(collection(db, 'orders'), snap => {
      const st: any = { totalOrders: snap.size, totalProducts: productCount, totalContacts: contactCount, totalRevenue: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, replacement: 0 };
      const all: any[] = []; const txns: Record<string, number> = {};
      snap.forEach(d => {
        const x = d.data();
        if (x.transactionId === 'AWAITING_PAYMENT' || x.transactionId === 'AUTO_CANCELLED_UNPAID') return;
        if (x.status !== 'cancelled') { st.totalRevenue += x.totalAmount || 0; st[x.status] = (st[x.status] || 0) + 1; }
        if (x.replacementRequested && x.replacementStatus !== 'reshipped') st.replacement++;
        all.push({ id: d.id, ...x });
        if (x.transactionId && x.transactionId !== 'GIFTCARD' && x.status !== 'cancelled') txns[x.transactionId] = (txns[x.transactionId] || 0) + 1;
      });
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecent(all.slice(0, 5));
      setStats(st);
      setDupTxns(Object.entries(txns).filter(([_, c]) => c > 1).map(([t]) => t));
      if (countsLoaded || snap.size > 0) setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Revenue', value: money(stats.totalRevenue), icon: TrendingUp, page: 'orders' as Page, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, page: 'orders' as Page, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, page: 'orders' as Page, color: 'text-amber-600 bg-amber-50' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, page: 'orders' as Page, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Products', value: stats.totalProducts, icon: Package, page: 'products' as Page, color: 'text-violet-600 bg-violet-50' },
    { label: 'Customers', value: stats.totalContacts, icon: Users, page: 'customers' as Page, color: 'text-sky-600 bg-sky-50' },
  ];

  const allSlices = [
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Confirmed', value: stats.confirmed, color: '#3b82f6' },
    { label: 'Processing', value: stats.processing, color: '#14b8a6' },
    { label: 'Shipped', value: stats.shipped, color: '#6366f1' },
    { label: 'Delivered', value: stats.delivered, color: '#10b981' },
    { label: 'Replacement', value: stats.replacement, color: '#8b5cf6' },
  ];
  const slices = allSlices.filter(sl => sl.value > 0);
  const total = slices.reduce((sum, sl) => sum + sl.value, 0) || 1;
  let cumulative = 0;
  const paths = slices.map(sl => {
    const start = cumulative / total; const end = (cumulative + sl.value) / total; cumulative += sl.value;
    const sa = start * 2 * Math.PI - Math.PI / 2; const ea = end * 2 * Math.PI - Math.PI / 2;
    const largeArc = sl.value / total > 0.5 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(sa), y1 = 50 + 40 * Math.sin(sa);
    const x2 = 50 + 40 * Math.cos(ea), y2 = 50 + 40 * Math.sin(ea);
    return { ...sl, d: slices.length === 1 ? 'M50,10 A40,40 0 1,1 49.99,10 Z' : `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`, pct: Math.round(sl.value / total * 100) };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {dupTxns.length > 0 && !dismissed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-sm"><strong className="font-semibold text-amber-900">Duplicate Transaction IDs</strong><p className="text-amber-700 mt-0.5">{dupTxns.join(', ')}</p></div>
          <button onClick={() => setDismissed(true)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-amber-100"><X className="h-4 w-4 text-amber-600" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <button key={c.label} onClick={() => goTo(c.page)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.color} mb-3`}><c.icon className="h-5 w-5" /></div>
            <p className="text-xs font-medium text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-900">{c.value}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Business Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-48 h-48">
              {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
              <text x="50" y="45" textAnchor="middle" className="fill-slate-900 text-[10px] font-bold">{total}</text>
              <text x="50" y="55" textAnchor="middle" className="fill-slate-500 text-[6px]">orders</text>
            </svg>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            {allSlices.map((sl, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: sl.color, opacity: sl.value > 0 ? 1 : 0.2 }} />
                <span className="text-slate-600 flex-1">{sl.value} ({total > 0 ? Math.round(sl.value / total * 100) : 0}%)</span>
                <span className="font-semibold text-slate-900">{sl.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-900">Recent Orders</h2></div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 && <p className="px-6 py-8 text-center text-sm text-slate-400">No orders yet</p>}
          {recent.map(o => (
            <div key={o.id} className="px-6 py-3 hover:bg-slate-50 flex items-center justify-between text-sm">
              <span className="font-mono text-xs text-slate-500">#{o.orderId || o.id.slice(-6)}</span>
              <span className="text-slate-700">{o.customer?.name || '—'}</span>
              <span className="font-semibold text-slate-900">{money(o.totalAmount)}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
