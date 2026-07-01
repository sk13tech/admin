import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Download, ChevronRight, ArrowLeft } from 'lucide-react';

function money(n: number) { return `₹${(n || 0).toLocaleString('en-IN')}`; }
function fmt(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

type Props = { dark?: boolean };

export default function Customers({ dark = false }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<any>(null);

  useEffect(() => onSnapshot(collection(db, 'orders'), s => {
    const a: any[] = [];
    s.forEach(d => a.push({ id: d.id, ...d.data() }));
    setOrders(a);
  }), []);

  const customers = useMemo(() => {
    const map: Record<string, { name: string; email: string; phone: string; orders: number; totalSpent: number; lastOrder: string }> = {};
    orders.forEach(o => {
      if (o.transactionId === 'AWAITING_PAYMENT' || o.transactionId === 'AUTO_CANCELLED_UNPAID') return;
      const key = o.customer?.email || o.userEmail || o.userId;
      if (!key) return;
      if (!map[key]) map[key] = { name: o.customer?.name || o.userName || '', email: o.customer?.email || o.userEmail || '', phone: o.customer?.phone || '', orders: 0, totalSpent: 0, lastOrder: '' };
      map[key].orders++;
      map[key].totalSpent += o.totalAmount || 0;
      if (!map[key].lastOrder || o.createdAt > map[key].lastOrder) map[key].lastOrder = o.createdAt;
    });
    return Object.values(map).sort((a, b) => b.orders - a.orders);
  }, [orders]);

  const filtered = customers.filter(c => !search || [c.name, c.email, c.phone].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  const exportCSV = () => {
    const rows = filtered.map(c => ({ Name: c.name, Email: c.email, Phone: c.phone, Orders: c.orders, TotalSpent: c.totalSpent, LastOrder: c.lastOrder }));
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String((r as any)[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customers.csv'; a.click();
  };

  if (sel) {
    const custOrders = orders.filter(o => (o.customer?.email || o.userEmail) === sel.email && o.transactionId !== 'AWAITING_PAYMENT' && o.transactionId !== 'AUTO_CANCELLED_UNPAID').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return (
      <div className="space-y-4">
        <button onClick={() => setSel(null)} className={`flex items-center gap-1.5 text-sm ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}><ArrowLeft className="h-4 w-4" /> All Customers</button>
        <div className={`rounded-2xl border p-6 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">{sel.name.charAt(0)}</div>
            <div>
              <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{sel.name}</p>
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{sel.email}</p>
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{sel.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={`${dark ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-3 text-center`}><p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{sel.orders}</p><p className="text-[10px] text-slate-400 uppercase">Orders</p></div>
            <div className={`${dark ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-3 text-center`}><p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{money(sel.totalSpent)}</p><p className="text-[10px] text-slate-400 uppercase">Spent</p></div>
            <div className={`${dark ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-3 text-center`}><p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{money(Math.round(sel.totalSpent / Math.max(sel.orders,1)))}</p><p className="text-[10px] text-slate-400 uppercase">Avg</p></div>
          </div>
        </div>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${dark ? 'text-slate-200' : 'text-slate-900'}`}>Order History</h2>
        <div className={`rounded-2xl border overflow-hidden divide-y ${dark ? 'bg-slate-800 border-slate-700 divide-slate-700' : 'bg-white border-slate-200 divide-slate-100'}`}>
          {custOrders.map(o => (
            <div key={o.id} className="px-5 py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-xs text-slate-400 w-20">#{o.orderId || o.id.slice(-6)}</span>
              <span className={`flex-1 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{o.items?.length} items</span>
              <span className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{money(o.totalAmount)}</span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              <span className="text-xs text-slate-400">{fmt(o.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Customers ({customers.length})</h1>
        <button onClick={exportCSV} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><Download className="h-4 w-4" /> Export</button>
      </div>
      <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…" className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm outline-none ${dark ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'}`} /></div>
      <div className={`rounded-2xl border overflow-hidden divide-y ${dark ? 'bg-slate-800 border-slate-700 divide-slate-700' : 'bg-white border-slate-200 divide-slate-100'}`}>
        {filtered.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No customers found</p>}
        {filtered.map(c => (
          <button key={c.email} onClick={() => setSel(c)} className={`w-full text-left px-5 py-3.5 flex items-center gap-3 ${dark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'}`}>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0">{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className={`text-sm font-semibold truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{c.name}</p><p className="text-xs text-slate-400">{c.email} · {c.phone}</p></div>
            <div className="text-right flex-shrink-0"><p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{c.orders} orders</p><p className="text-xs text-slate-400">{money(c.totalSpent)}</p></div>
            <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
