import React, { useState, useCallback, useEffect } from 'react';
import { DataProvider, useData } from './store/DataContext';
import { Order, User } from './store/mockData';
import { IOSToast } from './components/IOSComponents';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SiteSettings from './pages/SiteSettings';
import CarouselPage from './pages/Carousel';
import Products from './pages/Products';
import Coupons from './pages/Coupons';
import GiftCards from './pages/GiftCards';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import UsersPage from './pages/Users';
import UserDetail from './pages/UserDetail';
import ReelsPage from './pages/Reels';
import {
  LayoutDashboard, Settings, Image, Package, ShoppingBag,
  Users, Ticket, CreditCard, Video, ChevronRight, LogOut, Ellipsis
} from 'lucide-react';

/* ─── Page type ─── */
type Page =
  | 'home' | 'dashboard' | 'settings' | 'carousel' | 'products'
  | 'coupons' | 'giftcards' | 'orders' | 'order-detail'
  | 'users' | 'user-detail' | 'reels';

/* ─── Menu items ─── */
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-ios-blue', desc: 'Overview & stats' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, color: 'bg-ios-orange', desc: 'Manage orders' },
  { id: 'products', label: 'Products', icon: Package, color: 'bg-ios-green', desc: 'Product catalog' },
  { id: 'users', label: 'Users', icon: Users, color: 'bg-ios-purple', desc: 'Customer list' },
  { id: 'carousel', label: 'Banners', icon: Image, color: 'bg-ios-pink', desc: 'Homepage slides' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-ios-gray', desc: 'Site config' },
  { id: 'coupons', label: 'Coupons', icon: Ticket, color: 'bg-ios-teal', desc: 'Discount codes' },
  { id: 'giftcards', label: 'Gift Cards', icon: CreditCard, color: 'bg-ios-indigo', desc: 'Gift balances' },
  { id: 'reels', label: 'Reels', icon: Video, color: 'bg-ios-red', desc: 'Video content' },
] as const;

/* ─── Loading Screen ─── */
const LoadingScreen: React.FC = () => (
  <div className="h-full bg-ios-bg flex flex-col items-center justify-center">
    <div className="w-[60px] h-[60px] rounded-[15px] bg-gradient-to-br from-ios-blue to-ios-indigo flex items-center justify-center mb-5 shadow-lg shadow-ios-blue/20">
      <div className="w-7 h-7 border-[3px] border-white/25 border-t-white rounded-full animate-spin" />
    </div>
    <p className="text-[15px] text-ios-gray font-[400]">Loading...</p>
  </div>
);

/* ─── App Content ─── */
const AppContent: React.FC = () => {
  const { toast, orders, loading } = useData();
  const [authState, setAuthState] = useState<'loading' | 'logged-in' | 'logged-out'>('loading');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<Order | User | null>(null);
  const [pageHistory, setPageHistory] = useState<{ page: Page; data?: Order | User | null }[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthState(user ? 'logged-in' : 'logged-out');
    });
    return unsub;
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // will be caught by onAuthStateChanged
    }
  }, []);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const navigateTo = useCallback((page: Page, data?: Order | User | null) => {
    setPageHistory(prev => [...prev, { page: currentPage, data: pageData }]);
    setCurrentPage(page);
    setPageData(data || null);
  }, [currentPage, pageData]);

  const goBack = useCallback(() => {
    const prev = pageHistory[pageHistory.length - 1];
    if (prev) {
      setPageHistory(h => h.slice(0, -1));
      setCurrentPage(prev.page);
      setPageData(prev.data || null);
    } else {
      setCurrentPage('home');
      setPageData(null);
    }
  }, [pageHistory]);

  const goHome = useCallback(() => {
    setPageHistory([]);
    setCurrentPage('home');
    setPageData(null);
  }, []);

  const switchTab = useCallback((page: Page) => {
    setPageHistory([]);
    setCurrentPage(page);
    setPageData(null);
  }, []);

  if (authState === 'loading') {
    return <LoadingScreen />;
  }

  if (authState === 'logged-out') {
    return <Login />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={(p, d) => navigateTo(p as Page, d as Order | User | null)} />;
      case 'settings':
        return <SiteSettings onBack={goBack} />;
      case 'carousel':
        return <CarouselPage onBack={goBack} />;
      case 'products':
        return <Products onBack={goBack} />;
      case 'coupons':
        return <Coupons onBack={goBack} />;
      case 'giftcards':
        return <GiftCards onBack={goBack} />;
      case 'orders':
        return <Orders onBack={goBack} onViewOrder={(o: Order) => navigateTo('order-detail', o)} />;
      case 'order-detail':
        return <OrderDetail order={pageData as Order} onBack={goBack} />;
      case 'users':
        return <UsersPage onBack={goBack} onViewUser={(u: User) => navigateTo('user-detail', u)} />;
      case 'user-detail':
        return <UserDetail user={pageData as User} onBack={goBack} onViewOrder={(o: Order) => navigateTo('order-detail', o)} />;
      case 'reels':
        return <ReelsPage onBack={goBack} />;
      case 'home':
      default:
        return (
          <HomePage
            onNavigate={(p) => navigateTo(p as Page)}
            onLogout={handleSignOut}
            pendingCount={pendingCount}
          />
        );
    }
  };

  const isMoreActive = currentPage === 'home' || ['settings', 'carousel', 'coupons', 'giftcards', 'reels'].includes(currentPage);

  return (
    <div className="h-full relative bg-ios-bg">
      {/* Page content — fills entire screen, scrolls behind tab bar */}
      <div className="h-full">
        {renderPage()}
      </div>

      {/* ─── iOS Tab Bar — fixed at bottom, liquid glass ─── */}
      <div className="ios-blur fixed bottom-0 left-0 right-0 z-50 border-t border-ios-separator/30">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          <TabBarItem
            icon={<LayoutDashboard size={21} strokeWidth={1.8} />}
            label="Dashboard"
            active={currentPage === 'dashboard'}
            onClick={() => switchTab('dashboard')}
          />
          <TabBarItem
            icon={<ShoppingBag size={21} strokeWidth={1.8} />}
            label="Orders"
            active={currentPage === 'orders' || currentPage === 'order-detail'}
            badge={pendingCount > 0 ? pendingCount : undefined}
            onClick={() => switchTab('orders')}
          />
          <TabBarItem
            icon={<Package size={21} strokeWidth={1.8} />}
            label="Products"
            active={currentPage === 'products'}
            onClick={() => switchTab('products')}
          />
          <TabBarItem
            icon={<Users size={21} strokeWidth={1.8} />}
            label="Users"
            active={currentPage === 'users' || currentPage === 'user-detail'}
            onClick={() => switchTab('users')}
          />
          <TabBarItem
            icon={<Ellipsis size={21} strokeWidth={2.2} />}
            label="More"
            active={isMoreActive}
            onClick={goHome}
          />
        </div>
        {/* Bottom safe area */}
        <div className="h-[env(safe-area-inset-bottom,12px)] min-h-[12px]" />
      </div>

      <IOSToast message={toast} />
    </div>
  );
};

/* ─── Tab Bar Item ─── */
const TabBarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}> = ({ icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center pt-[7px] pb-[3px] relative min-w-[52px] flex-1 active:opacity-50 transition-opacity"
  >
    <div className="relative h-[24px] flex items-center justify-center">
      <div className={active ? 'text-ios-blue' : 'text-ios-gray'}>{icon}</div>
      {badge !== undefined && (
        <div className="absolute -top-[3px] left-[calc(50%+4px)] min-w-[18px] h-[18px] bg-ios-red rounded-full flex items-center justify-center px-[4px] border-[2px] border-white/90">
          <span className="text-[11px] text-white font-[700] leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        </div>
      )}
    </div>
    <span className={`text-[10px] leading-[14px] mt-[1px] ${active ? 'text-ios-blue font-[500]' : 'text-ios-gray font-[400]'}`}>
      {label}
    </span>
  </button>
);

/* ─── Home Page ─── */
const HomePage: React.FC<{
  onNavigate: (page: string) => void;
  onLogout: () => void;
  pendingCount: number;
}> = ({ onNavigate, onLogout, pendingCount }) => {
  const { orders, products, users } = useData();
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      {/* ─── Large Title Header ─── */}
      <div className="ios-blur sticky top-0 z-40 border-b border-ios-separator/30 pt-[env(safe-area-inset-top)]">
        <div className="px-5 py-[12px]">
          <h1 className="text-[34px] font-bold tracking-[0.01em] leading-[41px] text-ios-label">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="pb-[90px]">
        {/* Quick Stats */}
        <div className="flex gap-[10px] px-5 pt-[14px] overflow-x-auto pb-[2px]">
          {[
            { label: 'Revenue', val: `₹${totalRevenue.toLocaleString()}`, from: 'from-ios-blue', to: 'to-ios-indigo' },
            { label: 'Orders', val: String(orders.length), from: 'from-ios-orange', to: 'to-ios-red' },
            { label: 'Products', val: String(products.length), from: 'from-ios-green', to: 'to-ios-teal' },
            { label: 'Users', val: String(users.length), from: 'from-ios-purple', to: 'to-ios-pink' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-[14px] p-[14px] min-w-[120px] flex-shrink-0`}>
              <p className="text-white/65 text-[12px] font-[500] leading-[16px]">{s.label}</p>
              <p className="text-white text-[22px] font-[700] mt-[2px] tracking-[-0.01em] leading-[1]">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Menu List */}
        <div className="px-5 pt-[20px]">
          <h2 className="text-[20px] font-[700] text-ios-label mb-[10px]">Manage</h2>
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-[13px] active:bg-black/[0.04] cursor-pointer ${
                    idx < menuItems.length - 1 ? 'border-b border-ios-separator/20' : ''
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <div className={`w-[30px] h-[30px] rounded-[7px] ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-[400] text-ios-label leading-[22px]">{item.label}</p>
                  </div>
                  {item.id === 'orders' && pendingCount > 0 && (
                    <span className="bg-ios-red text-white text-[12px] font-[700] px-[7px] py-[2px] rounded-full leading-[16px]">
                      {pendingCount}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-ios-gray3/70 flex-shrink-0" strokeWidth={2.5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 pt-[20px] pb-[30px]">
          <button
            onClick={onLogout}
            className="w-full bg-white rounded-[12px] py-[14px] text-ios-red text-[17px] font-[400] active:bg-ios-gray5/80 transition-colors flex items-center justify-center gap-[6px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <DataProvider>
    <AppContent />
  </DataProvider>
);

export default App;
