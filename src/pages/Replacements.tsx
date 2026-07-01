import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RotateCcw, Truck } from 'lucide-react';

const badge = (color: string) => `inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color}`;
const replColors: Record<string, string> = { requested: 'bg-amber-100 text-amber-700', accepted: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', reshipped: 'bg-blue-100 text-blue-700' };
function money(n: number) { return `₹${(n || 0).toLocaleString('en-IN')}`; }
function fmt(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

type Props = { dark?: boolean };

export default function Replacements({ dark = false }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [updating, setUpdating] = useState('');
  useEffect(() => onSnapshot(collection(db, 'orders'), s => { const a: any[] = []; s.forEach(d => a.push({ id: d.id, ...d.data() })); setOrders(a); }), []);
  const replacements = orders.filter(o => o.replacementRequested).sort((a, b) => new Date(b.replacementRequestedAt || b.createdAt).getTime() - new Date(a.replacementRequestedAt || a.createdAt).getTime());
  const changeReplStatus = async (id: string, status: string) => { setUpdating(id); await updateDoc(doc(db, 'orders', id), { replacementStatus: status, [`replacement_${status}_at`]: new Date().toISOString() }); setUpdating(''); };

  return (
    <div className="space-y-4">
      <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1c1a16]'}`}>Replacements ({replacements.length})</h1>
      <div className={`rounded-2xl border ${dark ? 'border-slate-700 bg-slate-800 divide-slate-700' : 'border-[#e8e6e1] bg-white divide-slate-100'} overflow-hidden divide-y`}>
        {replacements.length === 0 && <p className={`p-10 text-center text-sm ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`}>No replacement requests</p>}
        {replacements.map(o => {
          const rs = o.replacementStatus || 'requested';
          return (
            <div key={o.id} className="px-5 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-slate-400">#{o.orderId || o.id.slice(-6)}</span><span className={badge(replColors[rs] || 'bg-slate-100 text-slate-600')}>{rs}</span></div>
                  <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{o.customer?.name} · {money(o.totalAmount)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Requested: {o.replacementRequestedAt ? fmt(o.replacementRequestedAt) : '—'}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {rs === 'requested' && <><button onClick={() => changeReplStatus(o.id, 'accepted')} disabled={updating === o.id} className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-emerald-100 disabled:opacity-50">Accept</button><button onClick={() => changeReplStatus(o.id, 'rejected')} disabled={updating === o.id} className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-red-100 disabled:opacity-50">Reject</button></>}
                  {rs === 'accepted' && <button onClick={() => changeReplStatus(o.id, 'reshipped')} disabled={updating === o.id} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-100 disabled:opacity-50"><Truck className="h-3 w-3 inline mr-1" />Reship</button>}
                  {rs === 'reshipped' && <span className="text-xs text-emerald-600 font-semibold">Shipped ✓</span>}
                  {rs === 'rejected' && <span className="text-xs text-red-500 font-semibold">Closed</span>}
                </div>
              </div>
              {o.replacementReason && <div className={`${dark ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl px-3 py-2`}><p className="text-[10px] text-slate-400 font-semibold uppercase">Reason</p><p className={`text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{o.replacementReason}</p></div>}
              <p className="text-xs text-slate-400">Items: {o.items?.map((i: any) => i.name).join(', ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
