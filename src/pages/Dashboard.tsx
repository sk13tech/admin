import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useData } from '../store/DataContext';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSBadge, IOSEmptyState } from '../components/IOSComponents';
import { STATUS_COLORS } from '../store/mockData';
import { ShoppingCart, Users, Package, IndianRupee, Clock, TrendingUp, GripVertical, ShoppingBag, Pencil } from 'lucide-react';

interface StatCardData {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const STORAGE_KEY = 'dashboard-card-order';
const loadOrder = (): string[] | null => {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
};
const saveOrder = (o: string[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
};

const Dashboard: React.FC<{ onNavigate: (page: string, data?: any) => void }> = ({ onNavigate }) => {
  const { orders, users, products, showToast } = useData();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
  const totalUsers = users.length;
  const totalProducts = products.length;

  const allCards: StatCardData[] = [
    { id: 'orders', label: 'Total Orders', value: totalOrders, icon: <ShoppingCart size={18} strokeWidth={2} />, color: '#007aff' },
    { id: 'pending', label: 'Pending', value: pendingOrders, icon: <Clock size={18} strokeWidth={2} />, color: '#ff9500' },
    { id: 'revenue', label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <IndianRupee size={18} strokeWidth={2} />, color: '#34c759' },
    { id: 'users', label: 'Users', value: totalUsers, icon: <Users size={18} strokeWidth={2} />, color: '#af52de' },
    { id: 'products', label: 'Products', value: totalProducts, icon: <Package size={18} strokeWidth={2} />, color: '#ff2d55' },
    { id: 'avg', label: 'Avg. Order', value: `₹${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}`, icon: <TrendingUp size={18} strokeWidth={2} />, color: '#5856d6' },
  ];

  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const saved = loadOrder();
    return saved && saved.length === 6 ? saved : allCards.map(c => c.id);
  });

  const orderedCards = cardOrder.map(id => allCards.find(c => c.id === id)!).filter(Boolean);

  /* ─── Drag state ─── */
  const [dragMode, setDragMode] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [delta, setDelta] = useState({ x: 0, y: 0 });

  const startPos = useRef({ x: 0, y: 0 });
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Pointer down — only starts drag immediately if in dragMode ── */
  const onStart = useCallback((idx: number, cx: number, cy: number) => {
    if (!dragMode) return;
    startPos.current = { x: cx, y: cy };
    setActiveIdx(idx);
    setOverIdx(null);
    setDelta({ x: 0, y: 0 });
    const el = cardEls.current[idx];
    if (el) {
      const r = el.getBoundingClientRect();
      setGhostPos({ x: r.left, y: r.top, w: r.width, h: r.height });
    }
  }, [dragMode]);

  /* ── Pointer move ── */
  const onMove = useCallback((cx: number, cy: number) => {
    if (activeIdx === null) return;
    setDelta({ x: cx - startPos.current.x, y: cy - startPos.current.y });
    for (let i = 0; i < cardEls.current.length; i++) {
      if (i === activeIdx || !cardEls.current[i]) continue;
      const r = cardEls.current[i]!.getBoundingClientRect();
      const mx = r.left + r.width / 2;
      const my = r.top + r.height / 2;
      if (Math.abs(cx - mx) < r.width / 2 && Math.abs(cy - my) < r.height / 2) {
        setOverIdx(i);
        return;
      }
    }
    setOverIdx(null);
  }, [activeIdx]);

  /* ── Pointer end ── */
  const onEnd = useCallback(() => {
    if (activeIdx !== null && overIdx !== null && activeIdx !== overIdx) {
      setCardOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(activeIdx, 1);
        next.splice(overIdx, 0, moved);
        saveOrder(next);
        return next;
      });
      showToast('Card moved');
    }
    setActiveIdx(null);
    setOverIdx(null);
    setDelta({ x: 0, y: 0 });
  }, [activeIdx, overIdx, showToast]);

  /* ── Global listeners while dragging ── */
  useEffect(() => {
    if (activeIdx === null) return;
    const handleMove = (e: PointerEvent | TouchEvent) => {
      e.preventDefault();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
      onMove(cx, cy);
    };
    const handleEnd = () => onEnd();
    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [activeIdx, onMove, onEnd]);

  const toggleDragMode = () => {
    if (dragMode) {
      setDragMode(false);
      setActiveIdx(null);
      setOverIdx(null);
    } else {
      setDragMode(true);
    }
  };

  const recentOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
  const activeCard = activeIdx !== null ? orderedCards[activeIdx] : null;

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce" style={{ touchAction: activeIdx !== null ? 'none' : undefined }}>
      <IOSNavBar
        title="Dashboard"
        large
        rightAction={{
          label: dragMode ? 'Done' : undefined,
          icon: dragMode ? undefined : <Pencil size={18} strokeWidth={2} />,
          onClick: toggleDragMode,
        }}
      />

      <div className="pb-[90px]">

        {/* Stats Grid */}
        <div className="px-5 pt-2 grid grid-cols-2 gap-[10px]">
          {orderedCards.map((card, idx) => {
            const isDragging = activeIdx === idx;
            const isTarget = overIdx === idx && activeIdx !== null && activeIdx !== idx;

            return (
              <div
                key={card.id}
                ref={el => { cardEls.current[idx] = el; }}
                className={`select-none transition-all duration-150 ${
                  dragMode ? 'touch-none' : ''
                } ${
                  isDragging ? 'opacity-0 scale-95' : ''
                } ${isTarget ? 'scale-[0.92] opacity-50 rounded-[14px] ring-2 ring-ios-blue/40' : ''} ${
                  dragMode && !isDragging ? 'animate-ios-wiggle' : ''
                }`}
                onPointerDown={e => {
                  if (!dragMode) return;
                  e.preventDefault();
                  onStart(idx, e.clientX, e.clientY);
                }}
              >
                <div
                  className={`bg-white rounded-[14px] p-[14px] flex flex-col justify-between shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)] ${
                    dragMode ? 'cursor-grab' : ''
                  }`}
                  style={{ minHeight: 110 }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
                      style={{ backgroundColor: card.color + '16' }}
                    >
                      <div style={{ color: card.color }}>{card.icon}</div>
                    </div>
                    {dragMode && <GripVertical size={16} className="text-ios-gray3" />}
                  </div>
                  <div className="mt-auto pt-2">
                    <p className="text-[24px] font-[700] tracking-[-0.01em] leading-[1] text-ios-label">{card.value}</p>
                    <p className="text-[13px] text-ios-gray leading-[18px] mt-[3px] font-[400]">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating ghost card */}
        {activeIdx !== null && activeCard && (
          <div
            className="fixed z-[999] pointer-events-none"
            style={{
              left: ghostPos.x,
              top: ghostPos.y,
              width: ghostPos.w,
              transform: `translate(${delta.x}px, ${delta.y}px) scale(1.08)`,
              transition: 'transform 0.02s linear',
            }}
          >
            <div
              className="bg-white rounded-[14px] p-[14px] flex flex-col justify-between shadow-[0_16px_48px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.06)]"
              style={{ minHeight: 110 }}
            >
              <div
                className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center"
                style={{ backgroundColor: activeCard.color + '16' }}
              >
                <div style={{ color: activeCard.color }}>{activeCard.icon}</div>
              </div>
              <div className="mt-auto pt-2">
                <p className="text-[24px] font-[700] tracking-[-0.01em] leading-[1] text-ios-label">{activeCard.value}</p>
                <p className="text-[13px] text-ios-gray leading-[18px] mt-[3px] font-[400]">{activeCard.label}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <IOSSectionHeader title="Recent Orders" action={{ label: 'See All', onClick: () => onNavigate('orders') }} />
        {recentOrders.length === 0 ? (
          <IOSCardGroup>
            <IOSEmptyState icon={<ShoppingBag size={36} />} title="No Orders Yet" />
          </IOSCardGroup>
        ) : (
          <IOSCardGroup>
            {recentOrders.map((order, idx) => (
              <div
                key={order.docId}
                className={`flex items-center px-4 py-[10px] active:bg-black/[0.04] cursor-pointer ${
                  idx < recentOrders.length - 1 ? 'border-b border-ios-separator/20' : ''
                }`}
                onClick={() => onNavigate('order-detail', order)}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-[600] text-ios-label">{order.id}</span>
                  <div className="mt-[3px]">
                    <IOSBadge label={order.status} color={STATUS_COLORS[order.status] || '#8e8e93'} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-[15px] font-[600] text-ios-label">₹{(order.total || 0).toLocaleString()}</p>
                  <p className="text-[12px] text-ios-gray leading-[16px] mt-[2px]">
                    {order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{', '}
                    {order.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            ))}
          </IOSCardGroup>
        )}

        {/* Status Breakdown */}
        <IOSSectionHeader title="Order Status Breakdown" />
        <IOSCardGroup>
          {(['pending', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'replacement_requested', 'replacement_shipped', 'replacement_delivered'] as const).map((status, idx, arr) => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <div
                key={status}
                className={`flex items-center px-4 py-[10px] ${idx < arr.length - 1 ? 'border-b border-ios-separator/20' : ''}`}
              >
                <div className="w-[10px] h-[10px] rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                <span className="text-[15px] flex-1 capitalize text-ios-label">{status.replace(/_/g, ' ')}</span>
                <span className="text-[15px] font-[600] text-ios-gray tabular-nums">{count}</span>
              </div>
            );
          })}
        </IOSCardGroup>
      </div>
    </div>
  );
};

export default Dashboard;
