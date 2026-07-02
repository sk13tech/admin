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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage customer contacts</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-900">{contacts.length}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone number…" className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm outline-none bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
      </div>
      
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No customers found matching your search</p>
          </div>
        )}
        {filtered.map(c => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-700">{c.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{c.name}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-slate-400">✉️</span> {c.email}
                    </span>
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-slate-400">📱</span> {c.phone}
                    </span>
                  </div>
                  {c.createdAt && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <span>📅</span> Contacted on {fmtDate(c.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
