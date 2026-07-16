import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Coupon } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSSheet, IOSButton, IOSAlert, IOSEmptyState, IOSListRow } from '../components/IOSComponents';
import { Plus, Ticket } from 'lucide-react';

const Coupons: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { coupons, updateCoupons, showToast } = useData();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [fCode, setFCode] = useState('');
  const [fType, setFType] = useState<'percent' | 'flat'>('percent');
  const [fValue, setFValue] = useState('');
  const [fMinOrder, setFMinOrder] = useState('');
  const [fMaxDiscount, setFMaxDiscount] = useState('');
  const [fActive, setFActive] = useState(true);

  const openNew = () => {
    setIsNew(true);
    setFCode(''); setFType('percent'); setFValue(''); setFMinOrder(''); setFMaxDiscount(''); setFActive(true);
    setEditIdx(-1);
  };

  const openEdit = (idx: number) => {
    const c = coupons[idx];
    setIsNew(false);
    setFCode(c.code); setFType(c.type); setFValue(String(c.value));
    setFMinOrder(String(c.minOrder)); setFMaxDiscount(String(c.maxDiscount)); setFActive(c.active);
    setEditIdx(idx);
  };

  const save = async () => {
    if (!fCode.trim()) { showToast('Code is required'); return; }
    setSaving(true);
    
    const data: Coupon = {
      code: fCode.toUpperCase(), type: fType, value: Number(fValue) || 0,
      minOrder: Number(fMinOrder) || 0, maxDiscount: Number(fMaxDiscount) || 0, active: fActive,
    };
    
    let newCoupons: Coupon[];
    if (isNew) {
      newCoupons = [...coupons, data];
    } else if (editIdx !== null && editIdx >= 0) {
      newCoupons = coupons.map((c, i) => i === editIdx ? data : c);
    } else {
      newCoupons = coupons;
    }
    
    await updateCoupons(newCoupons);
    setSaving(false);
    setEditIdx(null);
  };

  const toggleActive = async (idx: number) => {
    const newCoupons = coupons.map((c, i) => i === idx ? { ...c, active: !c.active } : c);
    await updateCoupons(newCoupons);
  };

  const handleDelete = async () => {
    if (deleteIdx !== null) {
      setSaving(true);
      const newCoupons = coupons.filter((_, i) => i !== deleteIdx);
      await updateCoupons(newCoupons);
      setDeleteIdx(null);
      setEditIdx(null);
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Coupons" leftAction={{ label: 'Back', onClick: onBack }} rightAction={{ icon: <Plus size={22} />, onClick: openNew }} />
      <div className="pb-[90px]">
        {coupons.length === 0 ? (
          <IOSEmptyState icon={<Ticket size={48} />} title="No Coupons" subtitle="Create your first coupon code" />
        ) : (
          <>
            <IOSSectionHeader title={`${coupons.length} Coupon${coupons.length > 1 ? 's' : ''}`} />
            <IOSCardGroup>
              {coupons.map((c, idx) => (
                <div
                  key={idx}
                  className={`flex items-center px-4 py-3 active:bg-ios-gray5/60 cursor-pointer ${idx < coupons.length - 1 ? 'border-b border-ios-separator/30' : ''}`}
                  onClick={() => openEdit(idx)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold font-mono tracking-wide">{c.code}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.active ? 'bg-ios-green/15 text-ios-green' : 'bg-ios-gray5 text-ios-gray'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[13px] text-ios-gray mt-0.5">
                      {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`} · Min ₹{c.minOrder} · Max ₹{c.maxDiscount}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="ios-switch"
                    checked={c.active}
                    onChange={(e) => { e.stopPropagation(); toggleActive(idx); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </IOSCardGroup>
          </>
        )}
      </div>

      <IOSSheet open={editIdx !== null} onClose={() => setEditIdx(null)} title={isNew ? 'Add Coupon' : 'Edit Coupon'}>
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="Code" value={fCode} onChange={(v) => setFCode(v.toUpperCase())} placeholder="SAVE10" />
            <IOSListRow
              label="Type"
              value={
                <div className="flex gap-2">
                  <button
                    onClick={() => setFType('percent')}
                    className={`px-3 py-1 rounded-full text-[13px] font-medium ${fType === 'percent' ? 'bg-ios-blue text-white' : 'bg-ios-gray5 text-ios-label'}`}
                  >Percent %</button>
                  <button
                    onClick={() => setFType('flat')}
                    className={`px-3 py-1 rounded-full text-[13px] font-medium ${fType === 'flat' ? 'bg-ios-blue text-white' : 'bg-ios-gray5 text-ios-label'}`}
                  >Flat ₹</button>
                </div>
              }
            />
            <IOSInput label="Value" value={fValue} onChange={setFValue} type="number" />
            <IOSInput label="Min Order ₹" value={fMinOrder} onChange={setFMinOrder} type="number" />
            <IOSInput label="Max Disc ₹" value={fMaxDiscount} onChange={setFMaxDiscount} type="number" />
            <IOSListRow label="Active" toggle={{ checked: fActive, onChange: setFActive }} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6 flex flex-col gap-3">
            <IOSButton onClick={save}>{saving ? 'Saving...' : isNew ? 'Add Coupon' : 'Save Changes'}</IOSButton>
            {!isNew && editIdx !== null && editIdx >= 0 && (
              <IOSButton variant="destructive" onClick={() => setDeleteIdx(editIdx)}>Delete Coupon</IOSButton>
            )}
          </div>
        </div>
      </IOSSheet>

      <IOSAlert
        open={deleteIdx !== null}
        title="Delete Coupon"
        message="This coupon will be permanently removed."
        onCancel={() => setDeleteIdx(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};

export default Coupons;
