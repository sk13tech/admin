import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Package, ShoppingCart, IndianRupee, Mail, Clock, CheckCircle, TrendingUp, Users, AlertTriangle, X } from 'lucide-react';

function money(n: number) { return `₹${(n || 0).toLocaleString('en-IN')}`; }

type Props = { goTo: (page: string) => void; dark?: boolean };

export default function Dashboard({ goTo, dark = false }: Props) {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalContacts: 0, totalRevenue: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, replacement: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dupTxns, setDupTxns] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let productCount = 0;
    let contactCount = 0;
    Promise.all([getDocs(collection(db, 'products')), getDocs(collection(db, 'contacts'))]).then(([p, c]) => {
      productCount = p.size; contactCount = c.size;
    });

    return onSnapshot(collection(db, 'orders'), snap => {
      const s: any = { totalOrders: snap.size, totalProducts: productCount, totalContacts: contactCount, totalRevenue: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, replacement: 0 };
      const all: any[] = [];
      const txns: Record<string, number> = {};
      snap.forEach(d => {
        const x = d.data();
        if (x.transactionId === 'AWAITING_PAYMENT' || x.transactionId === 'AUTO_CANCELLED_UNPAID') return;
        if (x.status !== 'cancelled') {
          s.totalRevenue += x.totalAmount || 0;
          s[x.status] = (s[x.status] || 0) + 1;
        }
        if (x.replacementRequested && x.replacementStatus !== 'reshipped') s.replacement++;
        all.push({ id: d.id, ...x });
        if (x.transactionId && x.transactionId !== 'GIFTCARD' && x.status !== 'cancelled') txns[x.transactionId] = (txns[x.transactionId] || 0) + 1;
      });
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecent(all.slice(0, 5));
      setStats(s);
      setDupTxns(Object.entries(txns).filter(([_, c]) => c > 1).map(([t]) => t));
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Revenue', value: money(stats.totalRevenue), icon: TrendingUp, page: 'orders', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, page: 'orders', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Pending', value: stats.pending, icon: Clock, page: 'orders', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, page: 'orders', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Products', value: stats.totalProducts, icon: Package, page: 'products', color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300' },
    { label: 'Customers', value: stats.totalContacts, icon: Users, page: 'customers', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300' },
  ];

  const allSlices = [
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Confirmed', value: stats.confirmed, color: '#3b82f6' },
    { label: 'Processing', value: stats.processing, color: '#14b8a6' },
    { label: 'Shipped', value: stats.shipped, color: '#6366f1' },
    { label: 'Delivered', value: stats.delivered, color: '#10b981' },
    { label: 'Replacement', value: stats.replacement, color: '#8b5cf6' },
  ];
  const slices = allSlices.filter(s => s.value > 0);
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let acc = 0;
  const paths = slices.map(s => {
    const start = acc / total;
    const end = (acc + s.value) / total;
    acc += s.value;
    const sa = start * 2 * Math.PI - Math.PI / 2;
    const ea = end * 2 * Math.PI - Math.PI / 2;
    const large = s.value / total > 0.5 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(sa), y1 = 50 + 40 * Math.sin(sa);
    const x2 = 50 + 40 * Math.cos(ea), y2 = 50 + 40 * Math.sin(ea);
    return { ...s, d: slices.length === 1 ? 'M50,10 A40,40 0 1,1 49.99,10 Z' : `M50,50 L${x1},${y1} A40,40 0 ${large},1 ${x2},${y2} Z`, pct: Math.round(s.value / total * 100) };
  });

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1c1a16]'}`}>Dashboard</h1>

      {dupTxns.length > 0 && !dismissed && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-5 py-4">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1"><p className="text-sm font-semibold text-red-800 dark:text-red-300">Duplicate Transaction IDs</p><p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{dupTxns.join(', ')}</p></div>
          <button onClick={() => setDismissed(true)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-800/30"><X className="h-4 w-4 text-red-400" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <button key={c.label} onClick={() => goTo(c.page)} className={`rounded-2xl border ${dark ? 'border-slate-700 bg-slate-800' : 'border-[#e8e6e1] bg-white'} p-5 text-left hover:shadow-md transition-all`}>
            <div className={`h-10 w-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}><c.icon className="h-5 w-5" /></div>
            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1c1a16]'}`}>{loading ? '—' : c.value}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`}>{c.label}</p>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${dark ? 'text-slate-200' : 'text-[#1c1a16]'}`}>Business Overview</h2>
        </div>
        <div className={`rounded-2xl border ${dark ? 'border-slate-700 bg-slate-800' : 'border-[#e8e6e1] bg-white'} p-6 flex flex-col sm:flex-row items-center gap-6`}>
          <svg viewBox="0 0 100 100" className="h-36 w-36 flex-shrink-0" style={{ animation: 'pieSpinIn 0.8s ease-out' }}>
            {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} style={{ animation: `pieFadeIn 0.5s ease-out ${i * 0.1}s both` }} />)}
            <circle cx="50" cy="50" r="22" className={dark ? 'fill-slate-800' : 'fill-white'} />
            <text x="50" y="47" textAnchor="middle" className={`text-[10px] font-bold ${dark ? 'fill-white' : 'fill-slate-900'}`}>{total}</text>
            <text x="50" y="57" textAnchor="middle" className="text-[5px] fill-slate-400 uppercase tracking-widest">orders</text>
          </svg>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {allSlices.map((sl, i) => (
              <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${dark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color, opacity: sl.value > 0 ? 1 : 0.2 }} />
                <div><p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{sl.value} <span className="text-slate-400 font-normal text-xs">({total > 0 ? Math.round(sl.value / total * 100) : 0}%)</span></p><p className="text-[10px] text-slate-400">{sl.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
