import { useState, useEffect } from 'react';
import { subscribeOrders, updateOrderStatus } from '../firebase';
import { Package } from 'lucide-react';

function money(v: number) { return '₹' + v.toLocaleString('en-IN'); }
function fmt(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

export default function Replacements() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => subscribeOrders(o => setOrders(o.filter(x => x.replacementRequested))), []);

  const updateReplacement = async (id: string, status: string) => {
    await updateOrderStatus(id, 'delivered');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Replacement Requests ({orders.length})</h1>
      <div className="space-y-2">
        {orders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Package className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No replacement requests</p>
          </div>
        )}
        {orders.map(o => {
          const rs = o.replacementStatus || 'requested';
          return (
            <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-slate-900">#{o.orderId || o.id.slice(-6)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${rs === 'requested' ? 'bg-amber-100 text-amber-700' : rs === 'accepted' ? 'bg-blue-100 text-blue-700' : rs === 'reshipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{rs}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{o.customer?.name} · {money(o.totalAmount)}</p>
                  <p className="text-xs text-slate-400 mt-1">Requested: {o.replacementRequestedAt ? fmt(o.replacementRequestedAt) : '—'}</p>
                </div>
                <div className="flex gap-2">
                  {rs === 'requested' && <><button onClick={() => updateReplacement(o.id, 'accepted')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Accept</button><button onClick={() => updateReplacement(o.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Reject</button></>}
                  {rs === 'accepted' && <button onClick={() => updateReplacement(o.id, 'reshipped')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Mark Shipped</button>}
                  {rs === 'reshipped' && <span className="text-xs font-semibold text-emerald-600">Shipped ✓</span>}
                  {rs === 'rejected' && <span className="text-xs font-semibold text-red-600">Closed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
