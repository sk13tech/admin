import { useState, useEffect } from 'react';
import { getDocs, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, Box, UsersRound, AlertCircle, X } from 'lucide-react';

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
    { label: 'Revenue', value: money(stats.totalRevenue), icon: DollarSign, page: 'orders' as Page, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, page: 'orders' as Page, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, page: 'orders' as Page, color: 'text-amber-600 bg-amber-50' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, page: 'orders' as Page, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Products', value: stats.totalProducts, icon: Box, page: 'products' as Page, color: 'text-violet-600 bg-violet-50' },
    { label: 'Customers', value: stats.totalContacts, icon: UsersRound, page: 'customers' as Page, color: 'text-sky-600 bg-sky-50' },
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
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <strong className="font-bold text-amber-900 text-sm">⚠️ Duplicate Transaction IDs Detected</strong>
            <p className="text-amber-700 text-sm mt-1">The following transaction IDs appear multiple times: <span className="font-mono font-semibold">{dupTxns.join(', ')}</span></p>
          </div>
          <button onClick={() => setDismissed(true)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-amber-100 transition-colors flex-shrink-0"><X className="h-4 w-4 text-amber-600" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <button key={c.label} onClick={() => goTo(c.page)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left hover:shadow-lg hover:scale-105 transition-all duration-200 hover:border-slate-300">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.color} mb-4 group-hover:scale-110 transition-transform`}><c.icon className="h-6 w-6" strokeWidth={2.5} /></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status Overview</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-lg">
                {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} className="transition-all hover:opacity-80" />)}
                <circle cx="50" cy="50" r="35" fill="white" />
                <text x="50" y="47" textAnchor="middle" className="fill-slate-900 text-[12px] font-bold">{total}</text>
                <text x="50" y="57" textAnchor="middle" className="fill-slate-500 text-[7px] uppercase tracking-wider">Total Orders</text>
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {allSlices.map((sl, i) => (
              <div key={i} className="flex items-center gap-3 text-sm group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <div className="h-4 w-4 rounded flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: sl.color, opacity: sl.value > 0 ? 1 : 0.2 }} />
                <span className="font-semibold text-slate-900 min-w-[120px]">{sl.label}</span>
                <span className="text-slate-600 flex-1">{sl.value} orders</span>
                <span className="font-bold text-slate-900 min-w-[45px] text-right">{total > 0 ? Math.round(sl.value / total * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          <p className="text-xs text-slate-500 mt-1">Latest {recent.length} orders</p>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 && (
            <div className="px-6 py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No orders yet</p>
            </div>
          )}
          {recent.map(o => (
            <div key={o.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#{o.orderId || o.id.slice(-6)}</span>
                  <span className="text-slate-900 font-medium truncate">{o.customer?.name || '—'}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-slate-900 min-w-[80px] text-right">{money(o.totalAmount)}</span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize min-w-[90px] text-center ${
                    o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                    o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    o.status === 'processing' ? 'bg-teal-100 text-teal-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{o.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
