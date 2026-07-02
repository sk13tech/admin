import { useState, useEffect } from 'react';
import { subscribeProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../firebase';
import { Plus, Trash2, Pencil, X, Loader2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: '', category: '', description: '', longDesc: '', image: '', price: '', mrp: '', stock: '', tags: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { subscribeProducts(setProducts); getCategories().then(setCats); }, []);

  const openNew = () => { setForm({ name: '', category: '', description: '', longDesc: '', image: '', price: '', mrp: '', stock: '', tags: '' }); setEditing(null); setShow(true); };
  const openEdit = (p: any) => { setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' }); setEditing(p); setShow(true); };
  const save = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    const data = { ...form, price: Number(form.price), mrp: Number(form.mrp) || 0, stock: Number(form.stock) || 0, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) };
    if (editing) await updateProduct(editing.id, data); else await createProduct(data);
    setSaving(false); setShow(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
        </div>
        <button onClick={openNew} className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(p => (
          <div key={p.id} className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1">
            {p.image ? (
              <div className="relative overflow-hidden bg-slate-100 h-48">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Pencil className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 flex-1">{p.name}</h3>
                {p.stock > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-semibold">{p.stock} left</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3 capitalize">{p.category}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-bold text-slate-900">₹{p.price}</span>
                {p.mrp > p.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">₹{p.mrp}</span>
                    <span className="text-xs font-semibold text-emerald-600">{Math.round((1 - p.price / p.mrp) * 100)}% OFF</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => { if (confirm('Delete this product?')) deleteProduct(p.id); }} className="h-9 w-9 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Pencil className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No products yet. Click "Add Product" to get started.</p>
          </div>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={() => setShow(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShow(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500">{cats.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Short Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Long Description</label><textarea value={form.longDesc} onChange={e => setForm({ ...form, longDesc: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Image URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Price</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">MRP</label><input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Stock</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
              </div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="organic, fresh, premium" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" /></div>
              <button onClick={save} disabled={saving} className="w-full bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-40 inline-flex items-center justify-center gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Update Product' : 'Create Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
