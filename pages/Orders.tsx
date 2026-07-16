import React, { useState, useMemo } from 'react';
import { useData } from '../store/DataContext';
import { ORDER_STATUSES, STATUS_COLORS, Order } from '../store/mockData';
import { IOSNavBar, IOSSearchBar, IOSBadge, IOSEmptyState, IOSCardGroup } from '../components/IOSComponents';
import { ShoppingBag } from 'lucide-react';

const Orders: React.FC<{ onBack: () => void; onViewOrder: (order: Order) => void }> = ({ onBack, onViewOrder }) => {
  const { orders } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.userEmail || '').toLowerCase().includes(q) ||
        (o.userName || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list;
  }, [orders, statusFilter, search]);

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Orders" leftAction={{ label: 'Back', onClick: onBack }} />
      <IOSSearchBar value={search} onChange={setSearch} placeholder="Search by ID, name, or email..." />

      {/* Status Filter */}
      <div className="flex gap-[6px] px-5 pb-[8px] overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-[10px] py-[5px] rounded-full text-[13px] font-[500] whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-ios-blue text-white'
              : 'bg-white text-ios-label shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]'
          }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-[10px] py-[5px] rounded-full text-[13px] font-[500] whitespace-nowrap capitalize transition-colors ${
                statusFilter === s
                  ? 'text-white'
                  : 'bg-white text-ios-label shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]'
              }`}
              style={statusFilter === s ? { backgroundColor: STATUS_COLORS[s] } : undefined}
            >
              {s.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      <div className="pb-[90px]">
        {filtered.length === 0 ? (
          <IOSEmptyState icon={<ShoppingBag size={44} />} title="No Orders" subtitle="No orders match your filters" />
        ) : (
          <IOSCardGroup className="mt-[4px]">
            {filtered.map((order, idx) => (
              <div
                key={order.docId}
                className={`flex items-center px-4 py-[10px] active:bg-black/[0.04] cursor-pointer ${
                  idx < filtered.length - 1 ? 'border-b border-ios-separator/20' : ''
                }`}
                onClick={() => onViewOrder(order)}
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
        <div className="px-5 pt-[12px] pb-[4px]">
          <p className="text-[13px] text-ios-gray text-center">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
