import { useState, useEffect } from 'react';
import { subscribeContacts } from '../firebase';
import { Search } from 'lucide-react';

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function Customers() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => subscribeContacts(setContacts), []);

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.includes(s));
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Customers ({contacts.length})</h1>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…" className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm outline-none bg-slate-50 border border-slate-200 text-slate-800" />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center py-12 text-sm text-slate-400">No customers found</p>}
        {filtered.map(c => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500 mt-1">{c.email} · {c.phone}</p>
                {c.createdAt && <p className="text-xs text-slate-400 mt-1">Contacted on {fmtDate(c.createdAt)}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
