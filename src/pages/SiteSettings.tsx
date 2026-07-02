import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getCategories, updateCategories } from '../firebase';
import { Save, Loader2, Plus, X } from 'lucide-react';

export default function SiteSettings() {
  const [cfg, setCfg] = useState<any>({});
  const [cats, setCats] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [reels, setReels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getSiteConfig(), getCategories()]).then(([c, cat]) => {
      setCfg(c);
      setCats(cat);
      setReels(Array.isArray(c.instagramReels) ? c.instagramReels : []);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await Promise.all([
      updateSiteConfig({ ...cfg, instagramReels: reels.filter(Boolean).slice(0, 4), lastUpdated: new Date().toISOString() }),
      updateCategories(cats),
    ]);
    setSaving(false);
  };

  const addCat = () => { if (newCat.trim() && !cats.includes(newCat.trim())) { setCats([...cats, newCat.trim()]); setNewCat(''); } };
  const removeCat = (i: number) => { const a = [...cats]; a.splice(i, 1); setCats(a); };
  const updateReel = (i: number, v: string) => { const a = [...reels]; a[i] = v; setReels(a); };
  const addReel = () => { if (reels.length < 4) setReels([...reels, '']); };
  const removeReel = (i: number) => { const a = [...reels]; a.splice(i, 1); setReels(a); };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></div>;

  const card = 'bg-white border-slate-200 rounded-2xl border p-6';
  const inp = 'bg-slate-50 border-slate-200 text-slate-800 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

  const contactFields: [string, string][] = [['email', 'Email'], ['phone', 'Phone'], ['whatsapp', 'WhatsApp'], ['address', 'Address']];
  const deliveryFields: [string, string][] = [['freeShippingAbove', 'Free Shipping Above (₹)'], ['deliveryCharge', 'Delivery Charge (₹)']];
  const brandFields: [string, string][] = [['heroTitle', 'Hero Title'], ['heroBadge', 'Hero Badge'], ['heroSubtitle', 'Hero Subtitle']];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
        <button onClick={save} disabled={saving} className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
        </button>
      </div>

      <div className={card}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>
        <div className="space-y-3">
          {contactFields.map(([k, l]) => <div key={k}><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{l}</label><input value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Settings</h2>
        <div className="grid grid-cols-2 gap-3">
          {deliveryFields.map(([k, l]) => <div key={k}><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{l}</label><input type="number" value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Branding & Content</h2>
        <div className="space-y-3">
          {brandFields.map(([k, l]) => <div key={k}><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{l}</label><input value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Product Categories</h2>
        <div className="space-y-2 mb-3">
          {cats.map((c, i) => <div key={i} className="flex items-center gap-2"><input value={c} readOnly className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-700" /><button onClick={() => removeCat(i)} className="h-9 w-9 rounded-lg hover:bg-red-50 flex items-center justify-center"><X className="h-4 w-4 text-red-500" /></button></div>)}
        </div>
        <div className="flex gap-2"><input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="New category" className={inp} /><button onClick={addCat} className="h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center flex-shrink-0"><Plus className="h-4 w-4" /></button></div>
      </div>

      <div className={card}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Section Visibility</h2>
        <div className="space-y-2">
          {[{ k: 'showHeroTitle', l: 'Hero Title' }, { k: 'showHeroBadge', l: 'Hero Badge' }, { k: 'showHeroSubtitle', l: 'Hero Subtitle' }, { k: 'showTestimonials', l: 'Testimonials' }].map(t => (
            <label key={t.k} className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={cfg[t.k] !== false} onChange={e => setCfg({ ...cfg, [t.k]: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm text-slate-700">{t.l}</span></label>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-lg font-bold text-slate-900">Reels / Shorts</h2><p className="text-xs text-slate-400 mt-1">Add up to 4 YouTube Shorts or video URLs</p></div>
          <button onClick={addReel} disabled={reels.length >= 4} className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
        </div>
        {reels.length === 0 && <p className="text-center py-6 text-sm text-slate-400">No reels added</p>}
        <div className="space-y-2">
          {reels.map((url, i) => <div key={i} className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-6 text-center flex-shrink-0">{i + 1}</span><input value={url} onChange={e => updateReel(i, e.target.value)} className={`${inp} font-mono text-xs`} placeholder="https://youtube.com/shorts/abc123" /><button onClick={() => removeReel(i)} className="h-9 w-9 rounded-lg hover:bg-red-50 flex items-center justify-center"><X className="h-4 w-4 text-red-500" /></button></div>)}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="w-full bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center justify-center gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save All Settings
      </button>

      {cfg.lastUpdated && <p className="text-xs text-center text-slate-400">Last updated: {new Date(cfg.lastUpdated as string).toLocaleString('en-IN')}</p>}
    </div>
  );
}
