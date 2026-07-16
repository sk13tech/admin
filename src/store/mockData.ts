// Mock data simulating Firebase Firestore structure

export interface Product {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  rate: number;
  mrp: number;
  stock: number;
  catagory: string;
  order: number;
  maxQty: number;
  createdAt: Date;
}

export interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount: number;
  active: boolean;
}

export interface GiftCard {
  code: string;
  balance: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;         // Display ID — from orderId field in doc, or doc ID as fallback
  docId: string;      // Firestore document ID — for path operations
  userId: string;     // Firestore user doc ID (UID) — for path operations
  userName: string;
  userEmail: string;
  userPhoto: string;
  items: OrderItem[];
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  giftCardCode: string;
  giftCardUsed: number;
  delivery: number;
  total: number;
  amountPaid: number;
  utrNumber: string;
  address: OrderAddress;
  status: string;
  cancelRemark: string;
  cancelledAt: Date | null;
  refundTxnId: string;
  refundDate: Date | null;
  trackingLink: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  createdAt: Date;
  lastLogin: Date;
  address: OrderAddress | null;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  foundedYear: number;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  businessHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
}

export interface AboutAuthor {
  name: string;
  tagline: string;
  description: string;
  profileImage: string;
}

export interface Offering {
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  order: number;
}

export interface AboutSettings {
  author: AboutAuthor;
  offerings: Offering[];
  team: TeamMember[];
}

export interface SocialPlatform {
  url: string;
  show: boolean;
}

export interface SocialSettings {
  facebook: SocialPlatform;
  instagram: SocialPlatform;
  twitter: SocialPlatform;
  youtube: SocialPlatform;
  telegram: SocialPlatform;
  whatsapp: SocialPlatform;
  linkedin: SocialPlatform;
  github: SocialPlatform;
}

export interface ConfigSettings {
  freeDeliveryMin: number;
  deliveryCharge: number;
  upiId: string;
}

export interface Reel {
  url: string;
  order: number;
}

// Initial mock data (fallback when Firestore has no data)
export const initialProducts: Product[] = [];

export const initialCarousel: CarouselItem[] = [];

export const initialCoupons: Coupon[] = [];

export const initialGiftCards: GiftCard[] = [];

export const initialUsers: User[] = [];

export const initialOrders: Order[] = [];

export const initialSiteSettings: SiteSettings = {
  name: '',
  tagline: '',
  foundedYear: 2024,
};

export const initialContactSettings: ContactSettings = {
  email: '',
  phone: '',
  address: '',
  businessHours: {
    mondayFriday: '',
    saturday: '',
    sunday: '',
  },
};

export const initialAboutSettings: AboutSettings = {
  author: {
    name: '',
    tagline: '',
    description: '',
    profileImage: '',
  },
  offerings: [],
  team: [],
};

export const initialSocialSettings: SocialSettings = {
  facebook: { url: '', show: false },
  instagram: { url: '', show: false },
  twitter: { url: '', show: false },
  youtube: { url: '', show: false },
  telegram: { url: '', show: false },
  whatsapp: { url: '', show: false },
  linkedin: { url: '', show: false },
  github: { url: '', show: false },
};

export const initialConfigSettings: ConfigSettings = {
  freeDeliveryMin: 0,
  deliveryCharge: 0,
  upiId: '',
};

export const initialReels: Reel[] = [];

export const ORDER_STATUSES = [
  'pending', 'placed', 'confirmed', 'processing', 'shipped', 'delivered',
  'cancelled', 'replacement_requested', 'replacement_shipped', 'replacement_delivered'
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: '#ff9500',
  placed: '#007aff',
  confirmed: '#5856d6',
  processing: '#af52de',
  shipped: '#5ac8fa',
  delivered: '#34c759',
  cancelled: '#ff3b30',
  replacement_requested: '#ff2d55',
  replacement_shipped: '#ff9500',
  replacement_delivered: '#34c759',
};
