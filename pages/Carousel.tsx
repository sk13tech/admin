import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSTextArea, IOSSheet, IOSButton, IOSEmptyState } from '../components/IOSComponents';
import { Image } from 'lucide-react';

const CarouselPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { carousel, updateCarousel } = useData();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedCarousel = [...carousel].sort((a, b) => a.order - b.order);

  const openEdit = (idx: number) => {
    const item = sortedCarousel[idx];
    setEditUrl(item.imageUrl);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditIdx(idx);
  };

  const saveEdit = async () => {
    if (editIdx === null) return;
    setSaving(true);
    const item = sortedCarousel[editIdx];
    await updateCarousel({
      id: item.id,
      imageUrl: editUrl,
      title: editTitle,
      description: editDesc,
      order: item.order,
    });
    setSaving(false);
    setEditIdx(null);
  };

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Banners" leftAction={{ label: 'Back', onClick: onBack }} />
      <div className="pb-[90px]">
        <IOSSectionHeader title="Homepage Banners" />
        {sortedCarousel.length === 0 ? (
          <IOSEmptyState icon={<Image size={48} />} title="No Banners" subtitle="Banners will appear here" />
        ) : (
          <div className="px-4 space-y-4">
            {sortedCarousel.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-[14px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => openEdit(idx)}
              >
                <div className="relative h-44 bg-ios-gray5">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/70 text-[12px] font-medium uppercase tracking-wider">Banner {item.order}</p>
                    <h3 className="text-white text-[20px] font-bold">{item.title || 'No Title'}</h3>
                    <p className="text-white/80 text-[14px]">{item.description || 'No description'}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-ios-gray">Tap to edit</span>
                  <span className="text-[13px] text-ios-blue font-medium">Edit →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IOSSheet open={editIdx !== null} onClose={() => setEditIdx(null)} title={`Edit Banner ${editIdx !== null ? sortedCarousel[editIdx]?.order : ''}`}>
        <div className="pt-4">
          {editUrl && (
            <div className="mx-5 mb-4 h-40 rounded-[12px] overflow-hidden bg-ios-gray5">
              <img src={editUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <IOSCardGroup>
            <IOSInput label="Image URL" value={editUrl} onChange={setEditUrl} />
            <IOSInput label="Title" value={editTitle} onChange={setEditTitle} />
            <IOSTextArea label="Description" value={editDesc} onChange={setEditDesc} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveEdit}>{saving ? 'Saving...' : 'Save Banner'}</IOSButton>
          </div>
        </div>
      </IOSSheet>
    </div>
  );
};

export default CarouselPage;
