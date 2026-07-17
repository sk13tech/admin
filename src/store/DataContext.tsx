import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc,
  query, orderBy, collectionGroup, Timestamp, addDoc
} from 'firebase/firestore';
import {
  Product, CarouselItem, Coupon, GiftCard, Order, User,
  SiteSettings, ContactSettings, AboutSettings, SocialSettings, ConfigSettings, Reel,
  initialProducts, initialCarousel, initialCoupons, initialGiftCards,
  initialOrders, initialUsers, initialSiteSettings, initialContactSettings,
  initialAboutSettings, initialSocialSettings, initialConfigSettings, initialReels,
} from './mockData';

interface DataContextType {
  // Data
  products: Product[];
  carousel: CarouselItem[];
  coupons: Coupon[];
  giftCards: GiftCard[];
  orders: Order[];
  users: User[];
  siteSettings: SiteSettings;
  contactSettings: ContactSettings;
  aboutSettings: AboutSettings;
  socialSettings: SocialSettings;
  configSettings: ConfigSettings;
  reels: Reel[];
  
  // Loading states
  loading: boolean;
  
  // Actions
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  updateCarousel: (item: CarouselItem) => Promise<void>;
  
  updateCoupons: (coupons: Coupon[]) => Promise<void>;
  updateGiftCards: (giftCards: GiftCard[]) => Promise<void>;
  
  updateOrderFields: (userId: string, docId: string, fields: Record<string, unknown>) => Promise<void>;
  
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  updateContactSettings: (settings: ContactSettings) => Promise<void>;
  updateAboutSettings: (settings: AboutSettings) => Promise<void>;
  updateSocialSettings: (settings: SocialSettings) => Promise<void>;
  updateConfigSettings: (settings: ConfigSettings) => Promise<void>;
  updateReels: (reels: Reel[]) => Promise<void>;
  
  // Legacy setters for compatibility
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCarousel: React.Dispatch<React.SetStateAction<CarouselItem[]>>;
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  setGiftCards: React.Dispatch<React.SetStateAction<GiftCard[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  setContactSettings: React.Dispatch<React.SetStateAction<ContactSettings>>;
  setAboutSettings: React.Dispatch<React.SetStateAction<AboutSettings>>;
  setSocialSettings: React.Dispatch<React.SetStateAction<SocialSettings>>;
  setConfigSettings: React.Dispatch<React.SetStateAction<ConfigSettings>>;
  setReels: React.Dispatch<React.SetStateAction<Reel[]>>;
  
  showToast: (msg: string) => void;
  toast: string;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

// Helper to convert Firestore Timestamp to Date
const toDate = (val: unknown): Date => {
  if (!val) return new Date();
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  if (typeof val === 'object' && val !== null && 'seconds' in val) return new Date((val as { seconds: number }).seconds * 1000);
  return new Date();
};

// Silent error handler — no console.error leaks in production
const silentErr = (_e: unknown) => {};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [carousel, setCarousel] = useState<CarouselItem[]>(initialCarousel);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [contactSettings, setContactSettings] = useState<ContactSettings>(initialContactSettings);
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(initialAboutSettings);
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(initialSocialSettings);
  const [configSettings, setConfigSettings] = useState<ConfigSettings>(initialConfigSettings);
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  // Keep a ref to users so the orders listener can always access latest users
  const usersRef = useRef<User[]>([]);
  useEffect(() => { usersRef.current = users; }, [users]);

  // Subscribe to Firestore collections
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Products
    const productsQuery = query(collection(db, 'products'), orderBy('order', 'asc'));
    unsubscribes.push(onSnapshot(productsQuery, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt),
      } as Product));
      if (data.length > 0) setProducts(data);
    }, silentErr));

    // Carousel
    const carouselQuery = query(collection(db, 'carousel'), orderBy('order', 'asc'));
    unsubscribes.push(onSnapshot(carouselQuery, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CarouselItem));
      if (data.length > 0) setCarousel(data);
    }, silentErr));

    // Settings/site
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      if (snap.exists()) {
        setSiteSettings(snap.data() as SiteSettings);
      }
    }, silentErr));

    // Settings/contact
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setContactSettings(snap.data() as ContactSettings);
      }
    }, silentErr));

    // Settings/about
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'about'), (snap) => {
      if (snap.exists()) {
        setAboutSettings(snap.data() as AboutSettings);
      }
    }, silentErr));

    // Settings/social
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'social'), (snap) => {
      if (snap.exists()) {
        setSocialSettings(snap.data() as SocialSettings);
      }
    }, silentErr));

    // Settings/config
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) {
        setConfigSettings(snap.data() as ConfigSettings);
      }
    }, silentErr));

    // Settings/coupons
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'coupons'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.items && Array.isArray(data.items)) {
          setCoupons(data.items as Coupon[]);
        }
      }
    }, silentErr));

    // Settings/giftCards
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'giftCards'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.items && Array.isArray(data.items)) {
          setGiftCards(data.items as GiftCard[]);
        }
      }
    }, silentErr));

    // Settings/reels
    unsubscribes.push(onSnapshot(doc(db, 'settings', 'reels'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.items && Array.isArray(data.items)) {
          setReels(data.items as Reel[]);
        }
      }
    }, silentErr));

    // Users
    unsubscribes.push(onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs
        .filter(d => d.id !== '_placeholder')
        .map(d => {
          const raw = d.data();
          return {
            id: d.id,
            name: raw.name || '',
            email: raw.email || '',
            phone: raw.phone || '',
            photoURL: raw.photoURL || '',
            createdAt: toDate(raw.createdAt),
            lastLogin: toDate(raw.lastLogin),
            address: raw.address || null,
          } as User;
        });
      if (data.length > 0) setUsers(data);
    }, silentErr));

    // Orders (using collectionGroup) — depends on usersRef for enrichment
    const ordersQuery = collectionGroup(db, 'orders');
    unsubscribes.push(onSnapshot(ordersQuery, async (snap) => {
      const ordersData: Order[] = [];
      // Get current users for enrichment
      const currentUsers = usersRef.current;
      
      for (const orderDoc of snap.docs) {
        const data = orderDoc.data();
        const pathParts = orderDoc.ref.path.split('/');
        const uid = pathParts[1]; // users/{uid}/orders/{docId}
        
        // Enrich with user data from multiple sources
        const matchedUser = currentUsers.find(u => u.id === uid);
        const userName = data.userName || data.address?.name || matchedUser?.name || '';
        const userEmail = data.userEmail || matchedUser?.email || '';
        const userPhoto = data.userPhoto || matchedUser?.photoURL || '';
        
        ordersData.push({
          id: data.orderId || orderDoc.id,   // Use orderId field from data, fallback to doc ID
          docId: orderDoc.id,                // Keep doc ID for Firestore path writes
          userId: uid,                       // Keep UID for Firestore path writes
          userName,
          userEmail,
          userPhoto,
          items: data.items || [],
          subtotal: data.subtotal || 0,
          couponCode: data.couponCode || '',
          couponDiscount: data.couponDiscount || 0,
          giftCardCode: data.giftCardCode || '',
          giftCardUsed: data.giftCardUsed || 0,
          delivery: data.delivery || 0,
          total: data.total || 0,
          amountPaid: data.amountPaid || 0,
          utrNumber: data.utrNumber || '',
          address: data.address ? {
            name: data.address.name || '',
            phone: data.address.phone || '',
            line1: data.address.line1 || '',
            line2: data.address.line2 || '',
            city: data.address.city || '',
            state: data.address.state || '',
            pincode: data.address.pincode || '',
          } : { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' },
          status: data.status || 'pending',
          cancelRemark: data.cancelRemark || '',
          cancelledAt: data.cancelledAt ? toDate(data.cancelledAt) : null,
          refundTxnId: data.refundTxnId || '',
          refundDate: data.refundDate ? toDate(data.refundDate) : null,
          trackingLink: data.trackingLink || '',
          createdAt: toDate(data.createdAt),
        } as Order);
      }
      if (ordersData.length > 0) {
        setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      }
      setLoading(false);
    }, () => { setLoading(false); }));

    // Set loading to false after a timeout if no data
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timeout);
    };
  }, []);

  // Firestore update functions
  const updateProduct = async (product: Product) => {
    try {
      const { id, ...data } = product;
      await setDoc(doc(db, 'products', id), {
        ...data,
        createdAt: Timestamp.fromDate(product.createdAt),
      });
      showToast('Product updated');
    } catch {
      showToast('Error updating product');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.fromDate(new Date()),
      });
      showToast('Product added');
    } catch {
      showToast('Error adding product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Product deleted');
    } catch {
      showToast('Error deleting product');
    }
  };

  const updateCarousel = async (item: CarouselItem) => {
    try {
      const { id, ...data } = item;
      await setDoc(doc(db, 'carousel', id), data);
      showToast('Banner updated');
    } catch {
      showToast('Error updating banner');
    }
  };

  const updateCoupons = async (newCoupons: Coupon[]) => {
    try {
      await setDoc(doc(db, 'settings', 'coupons'), { items: newCoupons });
      showToast('Coupons updated');
    } catch {
      showToast('Error updating coupons');
    }
  };

  const updateGiftCards = async (newGiftCards: GiftCard[]) => {
    try {
      await setDoc(doc(db, 'settings', 'giftCards'), { items: newGiftCards });
      showToast('Gift cards updated');
    } catch {
      showToast('Error updating gift cards');
    }
  };

  // Order field update — only whitelisted fields allowed
  const ALLOWED_ORDER_FIELDS = new Set([
    'status', 'cancelRemark', 'cancelledAt', 'refundTxnId', 'refundDate', 'trackingLink', 'trackingId',
  ]);

  const updateOrderFields = async (userId: string, docId: string, fields: Record<string, unknown>) => {
    try {
      const updateData: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(fields)) {
        if (!ALLOWED_ORDER_FIELDS.has(key)) continue; // skip unknown fields
        if (val instanceof Date) {
          updateData[key] = Timestamp.fromDate(val);
        } else if (val !== undefined) {
          updateData[key] = val;
        }
      }
      if (Object.keys(updateData).length === 0) return;
      await updateDoc(doc(db, 'users', userId, 'orders', docId), updateData);
      showToast('Order updated');
    } catch {
      showToast('Error updating order');
    }
  };

  const updateSiteSettings = async (settings: SiteSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      showToast('Site settings updated');
    } catch {
      showToast('Error updating settings');
    }
  };

  const updateContactSettings = async (settings: ContactSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'contact'), settings);
      showToast('Contact settings updated');
    } catch {
      showToast('Error updating settings');
    }
  };

  const updateAboutSettings = async (settings: AboutSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'about'), settings);
      showToast('About settings updated');
    } catch {
      showToast('Error updating settings');
    }
  };

  const updateSocialSettings = async (settings: SocialSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'social'), settings);
      showToast('Social settings updated');
    } catch {
      showToast('Error updating settings');
    }
  };

  const updateConfigSettings = async (settings: ConfigSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'config'), settings);
      showToast('Config updated');
    } catch {
      showToast('Error updating config');
    }
  };

  const updateReels = async (newReels: Reel[]) => {
    try {
      await setDoc(doc(db, 'settings', 'reels'), { items: newReels });
      showToast('Reels updated');
    } catch {
      showToast('Error updating reels');
    }
  };

  return (
    <DataContext.Provider value={{
      products, carousel, coupons, giftCards, orders, users,
      siteSettings, contactSettings, aboutSettings, socialSettings, configSettings, reels,
      loading,
      updateProduct, addProduct, deleteProduct,
      updateCarousel,
      updateCoupons, updateGiftCards,
      updateOrderFields,
      updateSiteSettings, updateContactSettings, updateAboutSettings,
      updateSocialSettings, updateConfigSettings, updateReels,
      setProducts, setCarousel, setCoupons, setGiftCards, setOrders, setUsers,
      setSiteSettings, setContactSettings, setAboutSettings,
      setSocialSettings, setConfigSettings, setReels,
      showToast, toast,
    }}>
      {children}
    </DataContext.Provider>
  );
};
