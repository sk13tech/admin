import React, { useState, useMemo } from 'react';
import { useData } from '../store/DataContext';
import { User } from '../store/mockData';
import { IOSNavBar, IOSSearchBar, IOSSectionHeader, IOSCardGroup, IOSEmptyState, IOSUserAvatar } from '../components/IOSComponents';
import { Users as UsersIcon, ChevronRight } from 'lucide-react';

const UsersPage: React.FC<{ onBack: () => void; onViewUser: (user: User) => void }> = ({ onBack, onViewUser }) => {
  const { users } = useData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Users" leftAction={{ label: 'Back', onClick: onBack }} />
      <IOSSearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
      <div className="pb-[90px]">
        {filtered.length === 0 ? (
          <IOSEmptyState icon={<UsersIcon size={44} />} title="No Users Found" subtitle="Try a different search" />
        ) : (
          <>
            <IOSSectionHeader title={`${filtered.length} User${filtered.length > 1 ? 's' : ''}`} />
            <IOSCardGroup>
              {filtered.map((user, idx) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-[12px] px-4 py-[10px] active:bg-black/[0.04] cursor-pointer ${
                    idx < filtered.length - 1 ? 'border-b border-ios-separator/20' : ''
                  }`}
                  onClick={() => onViewUser(user)}
                >
                  <IOSUserAvatar
                    name={user.name}
                    photoURL={user.photoURL}
                    size={44}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-[600] truncate text-ios-label">{user.name || user.email || 'Unknown'}</p>
                    <p className="text-[13px] text-ios-gray truncate leading-[18px]">{user.email || user.phone || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-[4px]">
                    <p className="text-[12px] text-ios-gray leading-[16px]">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '—'}
                    </p>
                    <ChevronRight size={16} className="text-ios-gray3/70" strokeWidth={2.5} />
                  </div>
                </div>
              ))}
            </IOSCardGroup>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
