import React, { useState, useMemo } from 'react';
import { useData } from '../store/DataContext';
import { Product } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSTextArea, IOSSheet, IOSButton, IOSSearchBar, IOSAlert, IOSSegmentedControl, IOSEmptyState } from '../components/IOSComponents';
import { Plus, Package, SlidersHorizontal } from 'lucide-react';

const Products: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { products, updateProduct, addProduct, deleteProduct, showToast } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'order' | 'rate' | 'stock'>('order');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fImage, setFImage] = useState('');
  const [fRate, setFRate] = useState('');
  const [fMrp, setFMrp] = useState('');
  const [fStock, setFStock] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fOrder, setFOrder] = useState('');
  const [fMaxQty, setFMaxQty] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.catagory).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryFilter !== 'all') list = list.filter(p => p.catagory === categoryFilter);
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      if (sortBy === 'rate') return a.rate - b.rate;
      if (sortBy === 'stock') return a.stock - b.stock;
      return a.order - b.order;
    });
    return list;
  }, [products, categoryFilter, search, sortBy]);

  const openNew = () => {
    setIsNew(true);
    setFTitle(''); setFDesc(''); setFImage(''); setFRate(''); setFMrp('');
    setFStock(''); setFCategory(''); setFOrder(String(products.length + 1)); setFMaxQty('5');
    setEditProduct({} as Product);
  };

  const openEdit = (p: Product) => {
    setIsNew(false);
    setFTitle(p.title); setFDesc(p.description); setFImage(p.imageUrl);
    setFRate(String(p.rate)); setFMrp(String(p.mrp)); setFStock(String(p.stock));
    setFCategory(p.catagory); setFOrder(String(p.order)); setFMaxQty(String(p.maxQty));
    setEditProduct(p);
  };

  const save = async () => {
    if (!fTitle.trim()) { showToast('Title is required'); return; }
    setSaving(true);
    try {
      if (isNew) {
        await addProduct({
          title: fTitle, description: fDesc, imageUrl: fImage,
          rate: Number(fRate) || 0, mrp: Number(fMrp) || 0, stock: Number(fStock) || 0,
          catagory: fCategory, order: Number(fOrder) || 0, maxQty: Number(fMaxQty) || 5,
          createdAt: new Date(),
        });
      } else {
        await updateProduct({
          id: editProduct!.id, title: fTitle, description: fDesc, imageUrl: fImage,
          rate: Number(fRate) || 0, mrp: Number(fMrp) || 0, stock: Number(fStock) || 0,
          catagory: fCategory, order: Number(fOrder) || 0, maxQty: Number(fMaxQty) || 5,
          createdAt: editProduct!.createdAt,
        });
      }
      setEditProduct(null);
    } catch { /* handled by toast */ }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      setSaving(true);
      await deleteProduct(deleteId);
      setDeleteId(null); setEditProduct(null); setSaving(false);
    }
  };

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Products" leftAction={{ label: 'Back', onClick: onBack }} rightAction={{ icon: <Plus size={22} strokeWidth={2} />, onClick: openNew }} />
      <IOSSearchBar value={search} onChange={setSearch} placeholder="Search products..." />

      <div className="flex gap-[6px] px-5 pb-[8px] overflow-x-auto flex-shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-[10px] py-[5px] rounded-full text-[13px] font-[500] whitespace-nowrap transition-colors ${
              categoryFilter === cat ? 'bg-ios-blue text-white' : 'bg-white text-ios-label shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-[10px] py-[5px] rounded-full text-[13px] font-[500] bg-white text-ios-label flex items-center gap-[4px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]"
        >
          <SlidersHorizontal size={12} /> Sort
        </button>
      </div>

      {showFilter && (
        <IOSSegmentedControl options={['order', 'rate', 'stock']} selected={sortBy} onChange={(v) => { setSortBy(v as typeof sortBy); setShowFilter(false); }} />
      )}

      <div className="pb-[90px]">
        {filtered.length === 0 ? (
          <IOSEmptyState icon={<Package size={44} />} title="No Products" subtitle="Add your first product" />
        ) : (
          <div className="px-5 space-y-[6px] pt-[4px]">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-[12px] flex items-center p-[10px] gap-[10px] active:bg-ios-gray5/40 transition-colors cursor-pointer shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]"
                onClick={() => openEdit(p)}
              >
                <div className="w-[52px] h-[52px] rounded-[10px] overflow-hidden bg-ios-gray5 flex-shrink-0">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-[600] truncate text-ios-label">{p.title}</h3>
                  <div className="flex items-center gap-[6px] mt-[2px]">
                    <span className="text-[14px] font-[600] text-ios-blue">₹{p.rate}</span>
                    {p.mrp > p.rate && <span className="text-[12px] text-ios-gray line-through">₹{p.mrp}</span>}
                  </div>
                  <div className="flex items-center gap-[6px] mt-[2px]">
                    <span className={`text-[12px] font-[500] ${p.stock > 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                    {p.catagory && <span className="text-[12px] text-ios-gray">· {p.catagory}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ios-gray3/70 flex-shrink-0" strokeWidth={2.5} />
              </div>
            ))}
          </div>
        )}
        <div className="px-5 pt-[12px] pb-[4px]">
          <p className="text-[13px] text-ios-gray text-center">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <IOSSheet open={editProduct !== null} onClose={() => setEditProduct(null)} title={isNew ? 'Add Product' : 'Edit Product'}>
        <div className="pt-4">
          {fImage && (
            <div className="mx-5 mb-4 h-40 rounded-[12px] overflow-hidden bg-ios-gray5">
              <img src={fImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <IOSSectionHeader title="Product Details" />
          <IOSCardGroup>
            <IOSInput label="Title" value={fTitle} onChange={setFTitle} />
            <IOSInput label="Image URL" value={fImage} onChange={setFImage} />
            <IOSTextArea label="Description" value={fDesc} onChange={setFDesc} />
            <IOSInput label="Category" value={fCategory} onChange={setFCategory} isLast />
          </IOSCardGroup>
          <IOSSectionHeader title="Pricing & Stock" />
          <IOSCardGroup>
            <IOSInput label="Rate ₹" value={fRate} onChange={setFRate} type="number" />
            <IOSInput label="MRP ₹" value={fMrp} onChange={setFMrp} type="number" />
            <IOSInput label="Stock" value={fStock} onChange={setFStock} type="number" />
            <IOSInput label="Max Qty" value={fMaxQty} onChange={setFMaxQty} type="number" />
            <IOSInput label="Order" value={fOrder} onChange={setFOrder} type="number" isLast />
          </IOSCardGroup>
          <div className="px-5 mt-6 flex flex-col gap-[10px]">
            <IOSButton onClick={save}>{saving ? 'Saving...' : isNew ? 'Add Product' : 'Save Changes'}</IOSButton>
            {!isNew && <IOSButton variant="destructive" onClick={() => setDeleteId(editProduct!.id)}>Delete Product</IOSButton>}
          </div>
        </div>
      </IOSSheet>

      <IOSAlert open={deleteId !== null} title="Delete Product" message="This action cannot be undone." onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} confirmLabel="Delete" destructive />
    </div>
  );
};

// Need this import for the chevron in product rows
import { ChevronRight } from 'lucide-react';

export default Products;
