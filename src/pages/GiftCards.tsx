import { useState, useEffect } from 'react';
import { subscribeGiftCards, createGiftCard, deleteGiftCard } from '../firebase';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function GiftCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeGiftCards(setCards), []);

  const save = async () => {
    if (!code || !balance) return;
    setSaving(true);
    await createGiftCard(code, Number(balance));
    setSaving(false); setShow(false); setCode(''); setBalance('');
  };

  const genCode = () => {
    // Generate format: 7FWW-6WPZ-753S-4736 (alphanumeric with hyphens)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const groups = [];
    for (let i = 0; i < 4; i++) {
      let group = '';
      for (let j = 0; j < 4; j++) {
        group += chars[Math.floor(Math.random() * chars.length)];
      }
      groups.push(group);
    }
    setCode(groups.join('-'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Gift Cards ({cards.length})</h1>
        <button onClick={() => { setShow(true); genCode(); }} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 flex items-center gap-2"><Plus className="h-4 w-4" /> Generate</button>
      </div>

      {show && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 max-w-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">New Gift Card</h3>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Code</label>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-emerald-500" />
              <button onClick={genCode} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Random</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Balance (₹)</label>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="500" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
            <button onClick={() => setShow(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {cards.map(c => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-slate-900">{c.id}</span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.active ? 'Active' : 'Used'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Balance: ₹{c.balance}</p>
            </div>
            <button onClick={() => { if (confirm('Delete?')) deleteGiftCard(c.id); }} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
          </div>
        ))}
        {cards.length === 0 && <p className="text-center py-10 text-sm text-slate-400">No gift cards yet</p>}
      </div>
    </div>
  );
}
