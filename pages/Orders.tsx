import { useState, useEffect } from 'react';
import { subscribeOrders, updateOrderStatus } from '../firebase';
import { Search, ChevronRight, X } from 'lucide-react';

function money(v: number) { return '₹' + v.toLocaleString('en-IN'); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => subscribeOrders(setOrders), []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (o.orderId?.toLowerCase().includes(s) || o.customer?.name?.toLowerCase().includes(s) || o.customer?.phone?.includes(s));
  });

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const statusColors: any = { pending: 'amber', confirmed: 'blue', processing: 'teal', shipped: 'indigo', delivered: 'emerald' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Orders ({orders.length})</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800" />
        </div>
        {statuses.map(st => (<button key={st} onClick={() => setFilter(st)} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === st ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{st} {st === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === st).length})`}</button>))}
      </div>

      <div className="space-y-2">
        {filtered.map(o => (
          <button key={o.id} onClick={() => setSel(o)} className="w-full rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-900">#{o.orderId || o.id.slice(-8).toUpperCase()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold bg-${statusColors[o.status] || 'slate'}-100 text-${statusColors[o.status] || 'slate'}-700`}>{o.status}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{o.customer?.name} · {money(o.totalAmount)} · {fmtDate(o.createdAt)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center py-12 text-sm text-slate-400">No orders found</p>}
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={() => setSel(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
              <button onClick={() => setSel(null)} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-semibold text-slate-900">#{sel.orderId || sel.id.slice(-8).toUpperCase()}</span>
                  <span className="text-xs text-slate-500">{fmtDate(sel.createdAt)}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Customer</p>
                <p className="text-sm font-semibold text-slate-900">{sel.customer?.name}</p>
                <p className="text-xs text-slate-600 mt-1">{sel.customer?.address}, {sel.customer?.city}, {sel.customer?.state} - {sel.customer?.pincode}</p>
                <p className="text-xs text-slate-600 mt-1">{sel.customer?.phone} · {sel.customer?.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Items</p>
                {sel.items?.map((it: any, i: number) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1"><p className="text-sm font-medium text-slate-900">{it.name}</p><p className="text-xs text-slate-500">{it.qty} x ₹{it.price}</p></div>
                    <p className="text-sm font-semibold text-slate-900">₹{it.price * it.qty}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 text-sm">
                {sel.mrpTotal && <div className="flex justify-between"><span className="text-slate-600">MRP</span><span className="text-slate-900">₹{sel.mrpTotal}</span></div>}
                {sel.productDiscount > 0 && <div className="flex justify-between"><span className="text-slate-600">Discount</span><span className="text-emerald-600">-₹{sel.productDiscount}</span></div>}
                {sel.couponCode && <div className="flex justify-between"><span className="text-slate-600">Coupon ({sel.couponCode})</span><span className="text-emerald-600">-₹{sel.couponDiscount}</span></div>}
                {sel.giftCardCode && <div className="flex justify-between"><span className="text-slate-600">Gift Card ({sel.giftCardCode})</span><span className="text-emerald-600">-₹{sel.giftCardUsed}</span></div>}
                {sel.transactionId && <div className="flex justify-between"><span className="text-slate-600">Txn ID</span><span className="text-xs font-mono text-slate-500">{sel.transactionId}</span></div>}
                <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-semibold text-slate-900">Paid</span><span className="font-bold text-slate-900">₹{sel.totalAmount}</span></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(st => (
                  <button key={st} onClick={() => { updateOrderStatus(sel.id, st); setSel({ ...sel, status: st }); }} disabled={sel.status === st} className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${sel.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}>{st}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
