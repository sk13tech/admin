import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Reel } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSSheet, IOSButton, IOSAlert, IOSEmptyState } from '../components/IOSComponents';
import { Plus, Video, Play, GripVertical } from 'lucide-react';

const ReelsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { reels, updateReels, showToast } = useData();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [fUrl, setFUrl] = useState('');
  const [fOrder, setFOrder] = useState('');

  const sorted = [...reels].sort((a, b) => a.order - b.order);

  const openNew = () => {
    setIsNew(true);
    setFUrl(''); setFOrder(String(reels.length + 1));
    setEditIdx(-1);
  };

  const openEdit = (idx: number) => {
    const r = sorted[idx];
    setIsNew(false);
    setFUrl(r.url); setFOrder(String(r.order));
    setEditIdx(idx);
  };

  const save = async () => {
    if (!fUrl.trim()) { showToast('URL is required'); return; }
    setSaving(true);
    
    const data: Reel = { url: fUrl, order: Number(fOrder) || 0 };
    
    let newReels: Reel[];
    if (isNew) {
      newReels = [...reels, data];
    } else if (editIdx !== null && editIdx >= 0) {
      const oldOrder = sorted[editIdx].order;
      newReels = reels.map(r => r.order === oldOrder ? data : r);
    } else {
      newReels = reels;
    }
    
    await updateReels(newReels);
    setSaving(false);
    setEditIdx(null);
  };

  const handleDelete = async () => {
    if (deleteIdx !== null) {
      setSaving(true);
      const orderToDelete = sorted[deleteIdx].order;
      const newReels = reels.filter(r => r.order !== orderToDelete);
      await updateReels(newReels);
      setDeleteIdx(null);
      setEditIdx(null);
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Videos / Reels" leftAction={{ label: 'Back', onClick: onBack }} rightAction={{ icon: <Plus size={22} />, onClick: openNew }} />
      <div className="pb-[90px]">
        <div className="mx-4 mt-4 p-3 bg-ios-orange/10 rounded-[10px]">
          <p className="text-[13px] text-ios-orange font-medium">⚠️ This section is currently disabled on the live site. Re-enable by adding {"<Reels />"} in App.tsx.</p>
        </div>

        {sorted.length === 0 ? (
          <IOSEmptyState icon={<Video size={48} />} title="No Videos" subtitle="Add your first video reel" />
        ) : (
          <>
            <IOSSectionHeader title={`${sorted.length} Video${sorted.length > 1 ? 's' : ''}`} />
            <IOSCardGroup>
              {sorted.map((reel, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 active:bg-ios-gray5/60 cursor-pointer ${idx < sorted.length - 1 ? 'border-b border-ios-separator/30' : ''}`}
                  onClick={() => openEdit(idx)}
                >
                  <div className="w-12 h-12 rounded-lg bg-ios-dark-bg flex items-center justify-center flex-shrink-0">
                    <Play size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium truncate">{reel.url}</p>
                    <p className="text-[13px] text-ios-gray">Order: {reel.order}</p>
                  </div>
                  <GripVertical size={16} className="text-ios-gray3" />
                </div>
              ))}
            </IOSCardGroup>
          </>
        )}
      </div>

      <IOSSheet open={editIdx !== null} onClose={() => setEditIdx(null)} title={isNew ? 'Add Video' : 'Edit Video'}>
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="URL" value={fUrl} onChange={setFUrl} placeholder="https://youtube.com/shorts/..." />
            <IOSInput label="Order" value={fOrder} onChange={setFOrder} type="number" isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6 flex flex-col gap-3">
            <IOSButton onClick={save}>{saving ? 'Saving...' : isNew ? 'Add Video' : 'Save Changes'}</IOSButton>
            {!isNew && editIdx !== null && editIdx >= 0 && (
              <IOSButton variant="destructive" onClick={() => setDeleteIdx(editIdx)}>Delete Video</IOSButton>
            )}
          </div>
        </div>
      </IOSSheet>

      <IOSAlert
        open={deleteIdx !== null}
        title="Delete Video"
        message="This video will be permanently removed."
        onCancel={() => setDeleteIdx(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};

export default ReelsPage;
