import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { GiftCard } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSSheet, IOSButton, IOSAlert, IOSEmptyState, IOSListRow } from '../components/IOSComponents';
import { Plus, CreditCard } from 'lucide-react';

const GiftCards: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { giftCards, updateGiftCards, showToast } = useData();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [fCode, setFCode] = useState('');
  const [fBalance, setFBalance] = useState('');
  const [fActive, setFActive] = useState(true);

  const openNew = () => {
    setIsNew(true);
    setFCode(''); setFBalance(''); setFActive(true);
    setEditIdx(-1);
  };

  const openEdit = (idx: number) => {
    const g = giftCards[idx];
    setIsNew(false);
    setFCode(g.code); setFBalance(String(g.balance)); setFActive(g.active);
    setEditIdx(idx);
  };

  const save = async () => {
    if (!fCode.trim()) { showToast('Code is required'); return; }
    setSaving(true);
    
    const balance = Number(fBalance) || 0;
    const data: GiftCard = {
      code: fCode.toUpperCase(), balance, active: balance > 0 ? fActive : false,
    };
    
    let newGiftCards: GiftCard[];
    if (isNew) {
      newGiftCards = [...giftCards, data];
    } else if (editIdx !== null && editIdx >= 0) {
      newGiftCards = giftCards.map((g, i) => i === editIdx ? data : g);
    } else {
      newGiftCards = giftCards;
    }
    
    await updateGiftCards(newGiftCards);
    setSaving(false);
    setEditIdx(null);
  };

  const handleDelete = async () => {
    if (deleteIdx !== null) {
      setSaving(true);
      const newGiftCards = giftCards.filter((_, i) => i !== deleteIdx);
      await updateGiftCards(newGiftCards);
      setDeleteIdx(null);
      setEditIdx(null);
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Gift Cards" leftAction={{ label: 'Back', onClick: onBack }} rightAction={{ icon: <Plus size={22} />, onClick: openNew }} />
      <div className="pb-[90px]">
        {giftCards.length === 0 ? (
          <IOSEmptyState icon={<CreditCard size={48} />} title="No Gift Cards" subtitle="Create your first gift card" />
        ) : (
          <>
            <IOSSectionHeader title={`${giftCards.length} Gift Card${giftCards.length > 1 ? 's' : ''}`} />
            <div className="px-4 space-y-3">
              {giftCards.map((g, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[14px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => openEdit(idx)}
                >
                  <div className={`h-2 ${g.active ? 'bg-gradient-to-r from-ios-blue to-ios-purple' : 'bg-ios-gray4'}`} />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] font-bold font-mono tracking-widest">{g.code}</span>
                      <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${g.active ? 'bg-ios-green/15 text-ios-green' : 'bg-ios-gray5 text-ios-gray'}`}>
                        {g.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[12px] text-ios-gray uppercase tracking-wider">Balance</p>
                        <p className="text-[28px] font-bold tracking-tight">₹{g.balance.toLocaleString()}</p>
                      </div>
                      <CreditCard size={24} className="text-ios-gray3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <IOSSheet open={editIdx !== null} onClose={() => setEditIdx(null)} title={isNew ? 'Add Gift Card' : 'Edit Gift Card'}>
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="Code" value={fCode} onChange={(v) => setFCode(v.toUpperCase())} placeholder="GIFT001" />
            <IOSInput label="Balance ₹" value={fBalance} onChange={setFBalance} type="number" />
            <IOSListRow label="Active" toggle={{ checked: fActive, onChange: setFActive }} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-2">
            <p className="text-[12px] text-ios-gray">Balance is deducted via Firestore transaction when used. If balance reaches 0, active auto-sets to false.</p>
          </div>
          <div className="px-4 mt-6 flex flex-col gap-3">
            <IOSButton onClick={save}>{saving ? 'Saving...' : isNew ? 'Add Gift Card' : 'Save Changes'}</IOSButton>
            {!isNew && editIdx !== null && editIdx >= 0 && (
              <IOSButton variant="destructive" onClick={() => setDeleteIdx(editIdx)}>Delete Gift Card</IOSButton>
            )}
          </div>
        </div>
      </IOSSheet>

      <IOSAlert
        open={deleteIdx !== null}
        title="Delete Gift Card"
        message="This gift card will be permanently removed."
        onCancel={() => setDeleteIdx(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};

export default GiftCards;
