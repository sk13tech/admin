import React from 'react';
import { useData } from '../store/DataContext';
import { User, Order, STATUS_COLORS } from '../store/mockData';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSListRow, IOSBadge, IOSEmptyState, IOSUserAvatar } from '../components/IOSComponents';
import { ShoppingBag, Heart } from 'lucide-react';

const UserDetail: React.FC<{
  user: User;
  onBack: () => void;
  onViewOrder: (order: Order) => void;
}> = ({ user, onBack, onViewOrder }) => {
  const { orders, products } = useData();
  const userOrders = orders
    .filter(o => o.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const wishlistItems = products.slice(0, 2);

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="User Details" leftAction={{ label: 'Back', onClick: onBack }} />
      <div className="pb-[90px]">
        {/* Profile Card */}
        <div className="mx-5 mt-[14px] bg-white rounded-[14px] p-[24px] text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]">
          <div className="flex justify-center mb-[12px]">
            <IOSUserAvatar
              name={user.name}
              photoURL={user.photoURL}
              size={80}
            />
          </div>
          <h2 className="text-[22px] font-[700] text-ios-label">{user.name || user.email || 'Unknown'}</h2>
          <p className="text-[15px] text-ios-gray mt-[2px]">{user.email || ''}</p>
          {user.phone && <p className="text-[15px] text-ios-gray mt-[1px]">{user.phone}</p>}
        </div>

        <IOSSectionHeader title="Account Info" />
        <IOSCardGroup>
          <IOSListRow label="Email" value={user.email || '—'} />
          <IOSListRow label="Phone" value={user.phone || '—'} />
          <IOSListRow
            label="Joined"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          />
          <IOSListRow
            label="Last Login"
            value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            isLast
          />
        </IOSCardGroup>

        <IOSSectionHeader title="Saved Address" />
        <IOSCardGroup>
          {user.address ? (
            <div className="px-4 py-[12px]">
              <p className="text-[15px] font-[600] text-ios-label">{user.address.name || ''}</p>
              <p className="text-[14px] text-ios-gray mt-[3px] leading-[20px]">
                {user.address.line1 || ''}
                {user.address.line2 && `, ${user.address.line2}`}
              </p>
              <p className="text-[14px] text-ios-gray leading-[20px]">
                {user.address.city || ''}{user.address.state ? `, ${user.address.state}` : ''}{user.address.pincode ? ` - ${user.address.pincode}` : ''}
              </p>
              {user.address.phone && <p className="text-[14px] text-ios-gray mt-[3px]">📞 {user.address.phone}</p>}
            </div>
          ) : (
            <div className="px-4 py-[20px] text-center text-ios-gray text-[15px]">No address saved</div>
          )}
        </IOSCardGroup>

        <IOSSectionHeader title={`Wishlist (${wishlistItems.length})`} />
        {wishlistItems.length === 0 ? (
          <IOSCardGroup>
            <IOSEmptyState icon={<Heart size={28} />} title="Empty Wishlist" />
          </IOSCardGroup>
        ) : (
          <IOSCardGroup>
            {wishlistItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center gap-[10px] px-4 py-[10px] ${idx < wishlistItems.length - 1 ? 'border-b border-ios-separator/20' : ''}`}>
                <div className="w-[36px] h-[36px] rounded-[8px] overflow-hidden bg-ios-gray5 flex-shrink-0">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-[500] truncate text-ios-label">{item.title}</p>
                  <p className="text-[13px] text-ios-gray">₹{item.rate} · {item.catagory}</p>
                </div>
              </div>
            ))}
          </IOSCardGroup>
        )}

        <IOSSectionHeader title={`Orders (${userOrders.length})`} />
        {userOrders.length === 0 ? (
          <IOSCardGroup>
            <IOSEmptyState icon={<ShoppingBag size={28} />} title="No Orders" />
          </IOSCardGroup>
        ) : (
          <IOSCardGroup>
            {userOrders.map((order, idx) => (
              <div
                key={order.id}
                className={`flex items-center gap-3 px-4 py-[10px] active:bg-black/[0.04] cursor-pointer ${
                  idx < userOrders.length - 1 ? 'border-b border-ios-separator/20' : ''
                }`}
                onClick={() => onViewOrder(order)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[15px] font-[600] text-ios-label">{order.id}</span>
                    <IOSBadge label={order.status} color={STATUS_COLORS[order.status] || '#8e8e93'} />
                  </div>
                  <p className="text-[13px] text-ios-gray mt-[2px]">
                    {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''} · {order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-[15px] font-[600] text-ios-label">₹{(order.total || 0).toLocaleString()}</span>
              </div>
            ))}
          </IOSCardGroup>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
