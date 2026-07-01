import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Save, Loader2, Play } from 'lucide-react';

type Props = { dark?: boolean };

export default function Reels({ dark = false }: Props) {
  const [reels, setReels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'config', 'site')).then(s => {
      if (s.exists()) {
        const d = s.data();
        setReels(Array.isArray(d.instagramReels) ? d.instagramReels : []);
      }
      setLoading(false);
    });
  }, []);

  const addReel = () => { if (reels.length < 4) setReels([...reels, '']); };
  const updateReel = (i: number, v: string) => { const a = [...reels]; a[i] = v; setReels(a); };
  const removeReel = (i: number) => { const a = [...reels]; a.splice(i, 1); setReels(a); };
  const save = async () => {
    setSaving(true);
    try { await setDoc(doc(db, 'config', 'site'), { instagramReels: reels.filter(Boolean).slice(0, 4) }, { merge: true }); }
    catch { alert('Save failed'); }
    setSaving(false);
  };

  const card = `${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border`;
  const input = `${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono text-xs`;

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Reels</h1>
          <p className="text-xs text-slate-400 mt-1">Add up to 4 YouTube Shorts or video URLs</p>
        </div>
        <button onClick={addReel} disabled={reels.length >= 4} className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Reel</button>
      </div>

      {reels.length === 0 && (
        <div className={`${card} p-10 text-center`}>
          <Play className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No reels added yet</p>
        </div>
      )}

      <div className="space-y-3">
        {reels.map((url, i) => (
          <div key={i} className={`${card} p-4 flex items-center gap-3`}>
            <span className="text-xs font-bold text-slate-400 w-6 text-center flex-shrink-0">{i + 1}</span>
            <input value={url} onChange={e => updateReel(i, e.target.value)} className={input} placeholder="https://youtube.com/shorts/abc123" />
            <button onClick={() => removeReel(i)} className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center flex-shrink-0"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ))}
      </div>

      {reels.length > 0 && (
        <button onClick={save} disabled={saving} className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Reels
        </button>
      )}
    </div>
  );
}
