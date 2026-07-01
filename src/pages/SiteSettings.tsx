import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, getCategories, updateCategories } from '../firebase';
import { Save, Loader2, Plus, X, Phone, Truck, Play } from 'lucide-react';

type Props = { dark?: boolean };

export default function SiteSettings({ dark = false }: Props) {
  const [cfg, setCfg] = useState<Record<string, any>>({});
  const [cats, setCats] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getSiteConfig(), getCategories()]).then(([c, categories]) => {
      const d: any = c || {};
      ['showHeroTitle', 'showHeroBadge', 'showHeroSubtitle', 'showTestimonials'].forEach(k => { if (d[k] !== undefined) d[k] = String(d[k]); });
      setReels(Array.isArray(d.instagramReels) ? d.instagramReels : []);
      setCfg(d); setCats(categories); setLoading(false);
    });
  }, []);

  const saveCfg = async () => {
    setSaving(true);
    const sd: any = { ...cfg, lastUpdated: new Date().toISOString() };
    ['showHeroTitle', 'showHeroBadge', 'showHeroSubtitle', 'showTestimonials'].forEach(k => { if (sd[k] !== undefined) sd[k] = sd[k] !== 'false'; });
    sd.instagramReels = reels.filter(Boolean).slice(0, 4);
    await updateSiteConfig(sd);
    await updateCategories(cats);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCat = () => { if (newCat.trim() && !cats.includes(newCat.trim())) { setCats([...cats, newCat.trim()]); setNewCat(''); } };
  const removeCat = (i: number) => { const a = [...cats]; a.splice(i, 1); setCats(a); };
  const addReel = () => { if (reels.length < 4) setReels([...reels, '']); };
  const updateReel = (i: number, v: string) => { const a = [...reels]; a[i] = v; setReels(a); };
  const removeReel = (i: number) => { const a = [...reels]; a.splice(i, 1); setReels(a); };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></div>;

  const box = `${dark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-[#e8e6e1] text-[#1c1a16]'} rounded-xl border p-5 space-y-4`;
  const lbl = `block text-xs font-medium uppercase mb-1 ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`;
  const inp = `w-full rounded-lg border px-3 py-2 text-sm outline-none ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'border-[#e8e6e1] bg-white text-[#1c1a16]'} focus:border-emerald-500`;

  const contactFields = [['contactPhone', 'Phone Number'], ['contactEmail', 'Email Address'], ['contactAddress', 'Full Address'], ['contactCity', 'City'], ['contactHours', 'Working Hours'], ['upiId', 'UPI ID'], ['upiName', 'UPI Display Name']];
  const deliveryFields = [['minFreeDelivery', 'Min Order for Free Delivery (₹)'], ['deliveryFee', 'Delivery Fee (₹)']];
  const brandFields = [['siteName', 'Brand Name'], ['logoUrl', 'Logo Icon URL'], ['logoTextUrl', 'Logo with Text URL'], ['heroTitle', 'Hero Title'], ['heroSubtitle', 'Hero Subtitle'], ['heroBadge', 'Hero Badge'], ['heroImage', 'Hero Image URL'], ['upiTemplate', 'UPI Payment Link (use am=0 — amount auto replaced)']];

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-6 ${dark ? 'text-white' : 'text-[#1c1a16]'}`}>Site Settings</h1>
      <div className="max-w-2xl space-y-6">
        <div className={box}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}><Phone className="h-3.5 w-3.5" /> Contact Information</h3>
          {contactFields.map(([k, l]) => <div key={k}><label className={lbl}>{l}</label><input value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>

        <div className={box}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}><Truck className="h-3.5 w-3.5" /> Delivery Settings</h3>
          {deliveryFields.map(([k, l]) => <div key={k}><label className={lbl}>{l}</label><input type="number" value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>

        <div className={box}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}>Branding & Content</h3>
          {brandFields.map(([k, l]) => <div key={k}><label className={lbl}>{l}</label><input value={cfg[k] || ''} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className={inp} /></div>)}
        </div>

        <div className={box}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}>Product Categories</h3>
          <div className="flex flex-wrap gap-2">{cats.map((c, i) => <span key={c} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${dark ? 'bg-slate-700 text-slate-200' : 'border border-[#e8e6e1] bg-[#fafaf8] text-[#625a4f]'}`}>{c}<button onClick={() => removeCat(i)} className="text-[#c0392b] hover:text-red-700"><X className="h-3 w-3" /></button></span>)}</div>
          <div className="flex gap-2"><input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="New category" className={inp} /><button onClick={addCat} className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 ${dark ? 'bg-slate-700 text-slate-200' : 'border border-[#e8e6e1] text-[#625a4f] hover:bg-[#f5f4f2]'}`}><Plus className="h-4 w-4" /> Add</button></div>
        </div>

        <div className={box}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}>Section Visibility</h3>
          {[{ k: 'showHeroTitle', l: 'Hero Title' }, { k: 'showHeroBadge', l: 'Hero Badge' }, { k: 'showHeroSubtitle', l: 'Hero Subtitle' }, { k: 'showTestimonials', l: 'Testimonials' }].map(t => (
            <div key={t.k} className="flex items-center justify-between py-1.5"><span className={`text-sm ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{t.l}</span><button onClick={() => setCfg({ ...cfg, [t.k]: cfg[t.k] === 'false' ? 'true' : cfg[t.k] === 'true' ? 'false' : 'false' })} className={`h-7 w-12 rounded-full p-0.5 transition-colors ${cfg[t.k] !== 'false' ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${cfg[t.k] !== 'false' ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
          ))}
        </div>

        <div className={box}>
          <div className="flex items-center justify-between"><div><h3 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ${dark ? 'text-slate-300' : 'text-[#1c1a16]'}`}><Play className="h-3.5 w-3.5" /> Reels / Shorts</h3><p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`}>Add up to 4 YouTube Shorts or video URLs</p></div><button onClick={addReel} disabled={reels.length >= 4} className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 ${dark ? 'bg-slate-700 text-slate-200' : 'border border-[#e8e6e1] text-[#625a4f]'}`}><Plus className="h-4 w-4" /> Add Reel</button></div>
          {reels.length === 0 && <p className={`text-sm ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`}>No reels added</p>}
          <div className="space-y-3">{reels.map((url, i) => <div key={i} className={`flex items-center gap-3 ${dark ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-3`}><span className="text-xs font-bold text-slate-400 w-6 text-center">{i + 1}</span><input value={url} onChange={e => updateReel(i, e.target.value)} className={`${inp} font-mono text-xs`} placeholder="https://youtube.com/shorts/abc123" /><button onClick={() => removeReel(i)} className="h-9 w-9 rounded-xl hover:bg-red-50 flex items-center justify-center flex-shrink-0"><X className="h-4 w-4 text-red-500" /></button></div>)}</div>
        </div>

        <button onClick={saveCfg} disabled={saving} className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white ${dark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1c1a16] hover:bg-[#332f28]'} disabled:opacity-50 flex items-center gap-2`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Save className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save All Settings</>}
        </button>
        {cfg.lastUpdated && <p className={`text-[10px] ${dark ? 'text-slate-400' : 'text-[#958d7e]'}`}>Last updated: {new Date(cfg.lastUpdated as string).toLocaleString('en-IN')}</p>}
      </div>
    </div>
  );
}
