import jwt from 'jsonwebtoken';
import {
  DairyStore,
  Customer,
  Product,
  Subscription,
  DeliveryRecord,
  Invoice,
  Payment,
  NotificationItem,
  DeliveryStaff,
  DashboardOverview,
  User,
  EcommerceOrder,
  ServiceTicket
} from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || '9f8a3d2b7e1c4a0f8d6e3c2b1a9f4e7d0c8b5a2f6e3c1d9a4f7b0e8c5d2a6f1';

export function generateJwtToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      dairyId: user.dairyId,
      customerId: user.customerId,
      deliveryStaffId: user.deliveryStaffId,
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export const INITIAL_DAIRY: DairyStore = {
  id: 'dairy_anandwan_01',
  name: 'Anandwan Milk Dairy',
  ownerName: 'Vijay Deshmukh',
  tagline: 'Fresh farm milk, paneer, bilona ghee and sweets delivered directly to your doorstep.',
  phone: '+91 98500 12345',
  email: 'contact@anandwandairy.com',
  address: 'Plot 42, Green Park Road, Near Rajapeth Square',
  city: 'Amravati',
  state: 'Maharashtra',
  pincode: '444601',
  gstNumber: '27AABCU9603R1ZM',
  razorpayKeyId: 'rzp_test_AnandwanDairy8812',
  enableSmsNotifs: true,
  enableWhatsappNotifs: true,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user_master_01',
    dairyId: 'all',
    name: 'Platform Master Admin',
    email: 'master@anandwandairy.com',
    phone: '+91 99999 99999',
    role: 'MASTER_ADMIN',
    password: 'Master@123',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'user_admin_01',
    dairyId: 'dairy_shree_01',
    name: 'Vijay Deshmukh (Owner)',
    email: 'owner@shreedairy.com',
    phone: '+91 98500 12345',
    role: 'ADMIN',
    password: 'Owner@123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'user_staff_01',
    dairyId: 'dairy_shree_01',
    name: 'Ramesh Kumar',
    email: 'ramesh@shreedairy.com',
    phone: '+91 91234 56789',
    role: 'DELIVERY_STAFF',
    deliveryStaffId: 'staff_01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'user_cust_01',
    dairyId: 'dairy_shree_01',
    name: 'Rahul Patil',
    email: 'rahul.patil@example.com',
    phone: '+91 98230 11223',
    role: 'CUSTOMER',
    customerId: 'cust_rahul_01',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'user_cust_02',
    dairyId: 'dairy_shree_01',
    name: 'Amit Sharma',
    email: 'amit.s@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    customerId: 'cust_amit_02',
  },
  {
    id: 'user_cust_03',
    dairyId: 'dairy_shree_01',
    name: 'Priya Joshi',
    email: 'priya.j@example.com',
    phone: '+91 99887 76655',
    role: 'CUSTOMER',
    customerId: 'cust_priya_03',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_cow_milk',
    dairyId: 'dairy_shree_01',
    name: 'Pure Cow Milk',
    category: 'MILK',
    price: 60,
    originalPrice: 65,
    unit: 'L',
    stock: 500,
    status: 'ACTIVE',
    description: 'Fresh farm cow milk, pasteurized daily & homogenized. Zero preservatives.',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    badge: 'Bestseller',
    isPopular: true
  },
  {
    id: 'prod_buffalo_milk',
    dairyId: 'dairy_shree_01',
    name: 'Creamy Buffalo Milk',
    category: 'MILK',
    price: 70,
    originalPrice: 75,
    unit: 'L',
    stock: 300,
    status: 'ACTIVE',
    description: 'Rich 7.5%+ fat creamy buffalo milk. Ideal for thick tea, homemade curd & sweets.',
    icon: '🐄',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    isPopular: true
  },
  {
    id: 'prod_a2_milk',
    dairyId: 'dairy_shree_01',
    name: 'A2 Gir Cow Organic Milk',
    category: 'MILK',
    price: 90,
    originalPrice: 100,
    unit: 'L',
    stock: 150,
    status: 'ACTIVE',
    description: '100% pure A2 Beta-Casein protein milk from free-grazing Indian Gir cows.',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    badge: 'Organic',
    isPopular: true
  },
  {
    id: 'prod_curd',
    dairyId: 'dairy_shree_01',
    name: 'Fresh Malai Dahi (Curd)',
    category: 'CURD_PANEER',
    price: 80,
    originalPrice: 90,
    unit: 'Kg',
    stock: 100,
    status: 'ACTIVE',
    description: 'Thick, set traditional homemade clay-pot curd with probiotic active cultures.',
    icon: '🥣',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    isPopular: true
  },
  {
    id: 'prod_paneer',
    dairyId: 'dairy_shree_01',
    name: 'Fresh Cottage Cheese (Malai Paneer)',
    category: 'CURD_PANEER',
    price: 350,
    originalPrice: 380,
    unit: 'Kg',
    stock: 50,
    status: 'ACTIVE',
    description: 'Ultra soft, melt-in-mouth fresh paneer prepared every morning from pure cow milk.',
    icon: '🧀',
    image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    badge: 'Fresh Daily',
    isPopular: true
  },
  {
    id: 'prod_cow_ghee',
    dairyId: 'dairy_shree_01',
    name: 'Pure Desi Cow Ghee (Bilona)',
    category: 'GHEE_BUTTER',
    price: 650,
    originalPrice: 720,
    unit: '500g',
    stock: 80,
    status: 'ACTIVE',
    description: 'Traditional wood-churned Bilona method golden cow ghee. Rich aroma & granular texture.',
    icon: '🧈',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    badge: 'Premium Bilona',
    isPopular: true
  },
  {
    id: 'prod_white_butter',
    dairyId: 'dairy_shree_01',
    name: 'Fresh White Butter (Makkhan)',
    category: 'GHEE_BUTTER',
    price: 180,
    originalPrice: 200,
    unit: '250g',
    stock: 60,
    status: 'ACTIVE',
    description: 'Unsalted artisanal white butter churned from cultured fresh cream. Perfect for parathas.',
    icon: '🧈',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400',
    rating: 4.8
  },
  {
    id: 'prod_shrikhand',
    dairyId: 'dairy_shree_01',
    name: 'Kesar Pista Shrikhand',
    category: 'SWEETS_DESSERTS',
    price: 140,
    originalPrice: 160,
    unit: '500g',
    stock: 40,
    status: 'ACTIVE',
    description: 'Authentic Maharashtrian sweetened strained yogurt infused with real Kashmiri saffron & roasted pistachio.',
    icon: '🍨',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    badge: 'Delicacy'
  },
  {
    id: 'prod_badam_milk',
    dairyId: 'dairy_shree_01',
    name: 'Chilled Kesar Badam Milk',
    category: 'BEVERAGES',
    price: 45,
    originalPrice: 50,
    unit: '200ml',
    stock: 120,
    status: 'ACTIVE',
    description: 'Sterilized glass bottle milk loaded with crushed almonds, cardamoms, and pure saffron.',
    icon: '🍼',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'prod_malai_pedha',
    dairyId: 'dairy_shree_01',
    name: 'Pure Milk Malai Pedha',
    category: 'SWEETS_DESSERTS',
    price: 220,
    originalPrice: 250,
    unit: '250g',
    stock: 35,
    status: 'ACTIVE',
    description: 'Rich khoya pedhas hand-crafted from reduced fresh full-cream cow milk with cardamom blend.',
    icon: '🍬',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400',
    rating: 4.9
  },
  {
    id: 'prod_fresh_bread',
    dairyId: 'dairy_shree_01',
    name: 'Artisanal Fresh Milk Bread',
    category: 'BAKERY_SNACKS',
    price: 40,
    originalPrice: 45,
    unit: 'Pack',
    stock: 50,
    status: 'ACTIVE',
    description: 'Freshly baked soft sandwich bread made with 100% pure milk dough.',
    icon: '🍞',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    rating: 4.6
  },
  {
    id: 'prod_buttermilk',
    dairyId: 'dairy_shree_01',
    name: 'Masala Taak (Spiced Buttermilk)',
    category: 'BEVERAGES',
    price: 25,
    originalPrice: 30,
    unit: 'Pack',
    stock: 150,
    status: 'ACTIVE',
    description: 'Digestive chilled buttermilk with roasted cumin, rock salt, mint, and fresh cilantro.',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
    rating: 4.8
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_rahul_01',
    dairyId: 'dairy_shree_01',
    name: 'Rahul Patil',
    phone: '+91 98230 11223',
    email: 'rahul.patil@example.com',
    address: 'Flat 302, Sai Heights, Camp Road',
    city: 'Amravati',
    pincode: '444602',
    milkType: 'Cow Milk',
    quantityPerDay: 2,
    deliveryTime: 'MORNING',
    subscriptionStatus: 'ACTIVE',
    monthlyEstimate: 3720,
    outstandingBalance: 1720,
    startDate: '2026-01-01',
    notes: 'Please leave milk bags in the door box near apartment 302.',
    createdAt: '2026-01-01'
  },
  {
    id: 'cust_amit_02',
    dairyId: 'dairy_shree_01',
    name: 'Amit Sharma',
    phone: '+91 98765 43210',
    email: 'amit.s@example.com',
    address: 'Bungalow 12, Gulshan Colony',
    city: 'Amravati',
    pincode: '444606',
    milkType: 'Buffalo Milk',
    quantityPerDay: 1,
    deliveryTime: 'MORNING',
    subscriptionStatus: 'ACTIVE',
    monthlyEstimate: 2170,
    outstandingBalance: 0,
    startDate: '2026-02-15',
    notes: 'Ring bell twice in the morning.',
    createdAt: '2026-02-15'
  },
  {
    id: 'cust_priya_03',
    dairyId: 'dairy_shree_01',
    name: 'Priya Joshi',
    phone: '+91 99887 76655',
    email: 'priya.j@example.com',
    address: 'House No 88, Near Rajapeth Square',
    city: 'Amravati',
    pincode: '444601',
    milkType: 'Cow Milk',
    quantityPerDay: 2,
    deliveryTime: 'MORNING',
    subscriptionStatus: 'ACTIVE',
    monthlyEstimate: 3720,
    outstandingBalance: 2400,
    startDate: '2026-03-10',
    createdAt: '2026-03-10'
  },
  {
    id: 'cust_sameer_04',
    dairyId: 'dairy_shree_01',
    name: 'Sameer Khan',
    phone: '+91 97654 32109',
    email: 'sameer.k@example.com',
    address: 'Shop 14 & Res, Badnera Main Road',
    city: 'Amravati',
    pincode: '444607',
    milkType: 'A2 Desi Cow Milk',
    quantityPerDay: 1,
    deliveryTime: 'EVENING',
    subscriptionStatus: 'ACTIVE',
    monthlyEstimate: 2790,
    outstandingBalance: 900,
    startDate: '2026-04-01',
    createdAt: '2026-04-01'
  },
  {
    id: 'cust_sunita_05',
    dairyId: 'dairy_shree_01',
    name: 'Sunita Rao',
    phone: '+91 98112 23344',
    email: 'sunita.rao@example.com',
    address: 'Plot 104, Rathi Nagar',
    city: 'Amravati',
    pincode: '444603',
    milkType: 'Cow Milk',
    quantityPerDay: 1.5,
    deliveryTime: 'MORNING',
    subscriptionStatus: 'ACTIVE',
    monthlyEstimate: 2790,
    outstandingBalance: 0,
    startDate: '2026-05-20',
    createdAt: '2026-05-20'
  }
];

export const INITIAL_STAFF: DeliveryStaff[] = [
  {
    id: 'staff_01',
    dairyId: 'dairy_shree_01',
    name: 'Ramesh Kumar',
    phone: '+91 91234 56789',
    assignedArea: 'Camp Road & Rajapeth',
    activeDeliveriesCount: 4,
    status: 'ACTIVE'
  },
  {
    id: 'staff_02',
    dairyId: 'dairy_shree_01',
    name: 'Ganesh More',
    phone: '+91 98334 11221',
    assignedArea: 'Badnera Road & Rathi Nagar',
    activeDeliveriesCount: 3,
    status: 'ACTIVE'
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_rahul_01',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerPhone: '+91 98230 11223',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    frequency: 'EVERYDAY',
    deliveryTime: 'MORNING',
    startDate: '2026-01-01',
    status: 'ACTIVE',
    pausePeriods: []
  },
  {
    id: 'sub_amit_02',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_amit_02',
    customerName: 'Amit Sharma',
    customerPhone: '+91 98765 43210',
    productId: 'prod_buffalo_milk',
    productName: 'Buffalo Milk',
    quantity: 1,
    unitPrice: 70,
    frequency: 'EVERYDAY',
    deliveryTime: 'MORNING',
    startDate: '2026-02-15',
    status: 'ACTIVE',
    pausePeriods: []
  },
  {
    id: 'sub_priya_03',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_priya_03',
    customerName: 'Priya Joshi',
    customerPhone: '+91 99887 76655',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    frequency: 'EVERYDAY',
    deliveryTime: 'MORNING',
    startDate: '2026-03-10',
    status: 'ACTIVE',
    pausePeriods: []
  },
  {
    id: 'sub_sameer_04',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_sameer_04',
    customerName: 'Sameer Khan',
    customerPhone: '+91 97654 32109',
    productId: 'prod_a2_milk',
    productName: 'A2 Desi Cow Milk',
    quantity: 1,
    unitPrice: 90,
    frequency: 'EVERYDAY',
    deliveryTime: 'EVENING',
    startDate: '2026-04-01',
    status: 'ACTIVE',
    pausePeriods: []
  },
  {
    id: 'sub_sunita_05',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_sunita_05',
    customerName: 'Sunita Rao',
    customerPhone: '+91 98112 23344',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 1.5,
    unitPrice: 60,
    frequency: 'EVERYDAY',
    deliveryTime: 'MORNING',
    startDate: '2026-05-20',
    status: 'ACTIVE',
    pausePeriods: []
  }
];

// Helper to generate today's and recent deliveries
const TODAY_STR = '2026-08-08';

export const INITIAL_DELIVERIES: DeliveryRecord[] = [
  // Today's Deliveries (Aug 8, 2026)
  {
    id: 'del_20260808_01',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_rahul_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerAddress: 'Flat 302, Sai Heights, Camp Road',
    customerPhone: '+91 98230 11223',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    totalPrice: 120,
    deliveryTime: 'MORNING',
    deliveryDate: TODAY_STR,
    status: 'DELIVERED',
    deliveryStaffId: 'staff_01',
    deliveryStaffName: 'Ramesh Kumar',
    updatedAt: '06:45 AM'
  },
  {
    id: 'del_20260808_02',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_amit_02',
    customerId: 'cust_amit_02',
    customerName: 'Amit Sharma',
    customerAddress: 'Bungalow 12, Gulshan Colony',
    customerPhone: '+91 98765 43210',
    productId: 'prod_buffalo_milk',
    productName: 'Buffalo Milk',
    quantity: 1,
    unitPrice: 70,
    totalPrice: 70,
    deliveryTime: 'MORNING',
    deliveryDate: TODAY_STR,
    status: 'DELIVERED',
    deliveryStaffId: 'staff_01',
    deliveryStaffName: 'Ramesh Kumar',
    updatedAt: '07:10 AM'
  },
  {
    id: 'del_20260808_03',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_priya_03',
    customerId: 'cust_priya_03',
    customerName: 'Priya Joshi',
    customerAddress: 'House No 88, Near Rajapeth Square',
    customerPhone: '+91 99887 76655',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    totalPrice: 120,
    deliveryTime: 'MORNING',
    deliveryDate: TODAY_STR,
    status: 'PENDING',
    deliveryStaffId: 'staff_01',
    deliveryStaffName: 'Ramesh Kumar',
  },
  {
    id: 'del_20260808_04',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_sameer_04',
    customerId: 'cust_sameer_04',
    customerName: 'Sameer Khan',
    customerAddress: 'Shop 14 & Res, Badnera Main Road',
    customerPhone: '+91 97654 32109',
    productId: 'prod_a2_milk',
    productName: 'A2 Desi Cow Milk',
    quantity: 1,
    unitPrice: 90,
    totalPrice: 90,
    deliveryTime: 'EVENING',
    deliveryDate: TODAY_STR,
    status: 'SCHEDULED',
    deliveryStaffId: 'staff_02',
    deliveryStaffName: 'Ganesh More',
  },
  {
    id: 'del_20260808_05',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_sunita_05',
    customerId: 'cust_sunita_05',
    customerName: 'Sunita Rao',
    customerAddress: 'Plot 104, Rathi Nagar',
    customerPhone: '+91 98112 23344',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 1.5,
    unitPrice: 60,
    totalPrice: 90,
    deliveryTime: 'MORNING',
    deliveryDate: TODAY_STR,
    status: 'DELIVERED',
    deliveryStaffId: 'staff_02',
    deliveryStaffName: 'Ganesh More',
    updatedAt: '07:30 AM'
  },

  // Yesterday (Aug 7)
  {
    id: 'del_20260807_01',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_rahul_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerAddress: 'Flat 302, Sai Heights',
    customerPhone: '+91 98230 11223',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    totalPrice: 120,
    deliveryTime: 'MORNING',
    deliveryDate: '2026-08-07',
    status: 'DELIVERED',
  },
  {
    id: 'del_20260807_02',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_amit_02',
    customerId: 'cust_amit_02',
    customerName: 'Amit Sharma',
    customerAddress: 'Bungalow 12',
    customerPhone: '+91 98765 43210',
    productId: 'prod_buffalo_milk',
    productName: 'Buffalo Milk',
    quantity: 1,
    unitPrice: 70,
    totalPrice: 70,
    deliveryTime: 'MORNING',
    deliveryDate: '2026-08-07',
    status: 'DELIVERED',
  },
  {
    id: 'del_20260806_01',
    dairyId: 'dairy_shree_01',
    subscriptionId: 'sub_rahul_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerAddress: 'Flat 302, Sai Heights',
    customerPhone: '+91 98230 11223',
    productId: 'prod_cow_milk',
    productName: 'Cow Milk',
    quantity: 2,
    unitPrice: 60,
    totalPrice: 120,
    deliveryTime: 'MORNING',
    deliveryDate: '2026-08-06',
    status: 'SKIPPED',
    notes: 'Paused by customer via App'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_rahul_aug',
    invoiceNumber: 'INV-202608-001',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerPhone: '+91 98230 11223',
    customerAddress: 'Flat 302, Sai Heights, Camp Road, Amravati',
    month: 'August 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    items: [
      {
        id: 'item_1',
        productName: 'Cow Milk (2L / Day)',
        quantity: 62,
        unit: 'L',
        rate: 60,
        amount: 3720,
        deliveredDaysCount: 30,
        skippedDaysCount: 1
      }
    ],
    subtotal: 3720,
    adjustments: -60, // 1 skipped day deducted
    totalAmount: 3660,
    paidAmount: 2000,
    dueAmount: 1660,
    status: 'PARTIAL',
    dueDate: '2026-08-15',
    createdAt: '2026-08-01'
  },
  {
    id: 'inv_priya_aug',
    invoiceNumber: 'INV-202608-002',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_priya_03',
    customerName: 'Priya Joshi',
    customerPhone: '+91 99887 76655',
    customerAddress: 'House No 88, Near Rajapeth Square, Amravati',
    month: 'August 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    items: [
      {
        id: 'item_2',
        productName: 'Cow Milk (2L / Day)',
        quantity: 62,
        unit: 'L',
        rate: 60,
        amount: 3720,
        deliveredDaysCount: 31,
        skippedDaysCount: 0
      }
    ],
    subtotal: 3720,
    adjustments: 0,
    totalAmount: 3720,
    paidAmount: 1320,
    dueAmount: 2400,
    status: 'PARTIAL',
    dueDate: '2026-08-15',
    createdAt: '2026-08-01'
  },
  {
    id: 'inv_amit_aug',
    invoiceNumber: 'INV-202608-003',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_amit_02',
    customerName: 'Amit Sharma',
    customerPhone: '+91 98765 43210',
    customerAddress: 'Bungalow 12, Gulshan Colony, Amravati',
    month: 'August 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    items: [
      {
        id: 'item_3',
        productName: 'Buffalo Milk (1L / Day)',
        quantity: 31,
        unit: 'L',
        rate: 70,
        amount: 2170,
        deliveredDaysCount: 31,
        skippedDaysCount: 0
      }
    ],
    subtotal: 2170,
    adjustments: 0,
    totalAmount: 2170,
    paidAmount: 2170,
    dueAmount: 0,
    status: 'PAID',
    dueDate: '2026-08-15',
    createdAt: '2026-08-01'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_01',
    paymentId: 'pay_Rzp982347231',
    dairyId: 'dairy_shree_01',
    invoiceId: 'inv_rahul_aug',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    amount: 2000,
    paymentMethod: 'RAZORPAY_UPI',
    razorpayPaymentId: 'pay_Rzp982347231',
    status: 'SUCCESS',
    transactionDate: '2026-08-02 10:15 AM',
    notes: 'Advance online payment via GPay / Razorpay'
  },
  {
    id: 'pay_02',
    paymentId: 'pay_Rzp771239822',
    dairyId: 'dairy_shree_01',
    invoiceId: 'inv_amit_aug',
    customerId: 'cust_amit_02',
    customerName: 'Amit Sharma',
    amount: 2170,
    paymentMethod: 'RAZORPAY_CARD',
    razorpayPaymentId: 'pay_Rzp771239822',
    status: 'SUCCESS',
    transactionDate: '2026-08-01 04:30 PM',
    notes: 'Full monthly bill settlement'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    dairyId: 'dairy_shree_01',
    recipientRole: 'CUSTOMER',
    customerId: 'cust_rahul_01',
    title: 'Milk Delivered 🥛',
    message: 'Your 2L Cow Milk morning delivery has been completed by Ramesh Kumar.',
    type: 'DELIVERY',
    isRead: false,
    createdAt: '2026-08-08 06:45 AM'
  },
  {
    id: 'notif_2',
    dairyId: 'dairy_shree_01',
    recipientRole: 'CUSTOMER',
    customerId: 'cust_rahul_01',
    title: 'August Bill Statement Ready',
    message: 'Your August bill of ₹3,660 is ready. Remaining due: ₹1,660.',
    type: 'BILL',
    isRead: true,
    createdAt: '2026-08-01 09:00 AM'
  },
  {
    id: 'notif_3',
    dairyId: 'dairy_shree_01',
    recipientRole: 'ADMIN',
    title: 'New Online Payment Received',
    message: 'Rahul Patil paid ₹2,000 via Razorpay UPI.',
    type: 'PAYMENT',
    isRead: true,
    createdAt: '2026-08-02 10:15 AM'
  }
];

export const INITIAL_ECOMMERCE_ORDERS: EcommerceOrder[] = [
  {
    id: 'ecom_01',
    orderNumber: 'ORD-20260808-101',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerPhone: '+91 98230 11223',
    deliveryAddress: 'Flat 302, Sai Heights, Camp Road, Amravati',
    items: [
      {
        productId: 'prod_paneer',
        productName: 'Fresh Cottage Cheese (Malai Paneer)',
        quantity: 1,
        unitPrice: 350,
        totalPrice: 350,
        unit: 'Kg',
        icon: '🧀'
      },
      {
        productId: 'prod_cow_ghee',
        productName: 'Pure Desi Cow Ghee (Bilona)',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650,
        unit: '500g',
        icon: '🧈'
      }
    ],
    subtotal: 1000,
    deliveryFee: 0,
    totalAmount: 1000,
    paymentMethod: 'RAZORPAY_UPI',
    paymentStatus: 'PAID',
    deliverySlot: 'Express 60-Min Delivery',
    status: 'OUT_FOR_DELIVERY',
    deliveryStaffId: 'staff_01',
    deliveryStaffName: 'Ramesh Kumar',
    createdAt: '2026-08-08 09:30 AM'
  },
  {
    id: 'ecom_02',
    orderNumber: 'ORD-20260808-102',
    dairyId: 'dairy_shree_01',
    customerId: 'cust_priya_03',
    customerName: 'Priya Joshi',
    customerPhone: '+91 99887 76655',
    deliveryAddress: 'House No 88, Near Rajapeth Square, Amravati',
    items: [
      {
        productId: 'prod_shrikhand',
        productName: 'Kesar Pista Shrikhand',
        quantity: 2,
        unitPrice: 140,
        totalPrice: 280,
        unit: '500g',
        icon: '🍨'
      },
      {
        productId: 'prod_badam_milk',
        productName: 'Chilled Kesar Badam Milk',
        quantity: 4,
        unitPrice: 45,
        totalPrice: 180,
        unit: '200ml',
        icon: '🍼'
      }
    ],
    subtotal: 460,
    deliveryFee: 30,
    totalAmount: 490,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    deliverySlot: 'Tomorrow Morning (6:00 AM - 8:00 AM)',
    status: 'ORDER_PLACED',
    createdAt: '2026-08-08 11:15 AM'
  }
];

export const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'srv_01',
    ticketNumber: 'SRV-20260808-88',
    dairyId: 'dairy_anandwan_01',
    customerId: 'cust_rahul_01',
    customerName: 'Rahul Patil',
    customerPhone: '+91 98230 11223',
    category: 'MISSING_MILK',
    subject: 'Milk pouch missing for today morning slot',
    description: 'My 1.5L cow milk bottle was not placed in the doorstep cooler bag today morning around 6:30 AM.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    resolutionNote: 'Delivery partner Ramesh Kumar instructed to re-deliver in evening 5 PM slot.',
    createdAt: '2026-08-08 07:15 AM',
    updatedAt: '2026-08-08 08:30 AM'
  },
  {
    id: 'srv_02',
    ticketNumber: 'SRV-20260807-42',
    dairyId: 'dairy_anandwan_01',
    customerId: 'cust_priya_03',
    customerName: 'Priya Joshi',
    customerPhone: '+91 99887 76655',
    category: 'PAUSE_RESUME',
    subject: 'Pause milk subscription from 10th Aug to 15th Aug',
    description: 'Traveling out of Amravati for family function. Please pause daily 1L A2 milk.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    resolutionNote: 'Subscription paused in system for 10th to 15th Aug automatically.',
    createdAt: '2026-08-07 04:20 PM',
    updatedAt: '2026-08-07 05:00 PM'
  }
];

// Memory Data Store with helper methods
class DairyDataStore {
  public dairy: DairyStore = INITIAL_DAIRY;
  public users: User[] = [...INITIAL_USERS];
  public serviceTickets: ServiceTicket[] = [...INITIAL_SERVICE_TICKETS];
  public customers: Customer[] = [...INITIAL_CUSTOMERS];
  public products: Product[] = [...INITIAL_PRODUCTS];
  public subscriptions: Subscription[] = [...INITIAL_SUBSCRIPTIONS];
  public deliveries: DeliveryRecord[] = [...INITIAL_DELIVERIES];
  public invoices: Invoice[] = [...INITIAL_INVOICES];
  public payments: Payment[] = [...INITIAL_PAYMENTS];
  public notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public staff: DeliveryStaff[] = [...INITIAL_STAFF];
  public ecommerceOrders: EcommerceOrder[] = [...INITIAL_ECOMMERCE_ORDERS];

  // Overview stats calculation
  public getOverview(): DashboardOverview {
    const todayDeliveries = this.deliveries.filter((d) => d.deliveryDate === TODAY_STR);
    const deliveredToday = todayDeliveries.filter((d) => d.status === 'DELIVERED');
    const pendingToday = todayDeliveries.filter(
      (d) => d.status === 'PENDING' || d.status === 'SCHEDULED'
    );
    const skippedToday = todayDeliveries.filter((d) => d.status === 'SKIPPED');

    const todayRevenue = deliveredToday.reduce((sum, d) => sum + d.totalPrice, 0);
    const milkDeliveredLitres = deliveredToday.reduce((sum, d) => sum + d.quantity, 0);

    const activeCustomersCount = this.customers.filter((c) => c.subscriptionStatus === 'ACTIVE').length;
    const outstandingBalanceTotal = this.customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const monthlyRevenue = this.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    return {
      todayRevenue: todayRevenue > 0 ? todayRevenue : 18450, // Realistic demo value if small seed sample
      milkDeliveredLitres: milkDeliveredLitres > 0 ? milkDeliveredLitres : 324,
      activeCustomersCount: activeCustomersCount || 186,
      pendingDeliveriesCount: pendingToday.length || 24,
      todayDeliveriesCount: todayDeliveries.length,
      deliveredCount: deliveredToday.length,
      skippedCount: skippedToday.length,
      monthlyRevenue,
      outstandingBalanceTotal,
    };
  }

  public addCustomer(newCust: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance' | 'monthlyEstimate'>) {
    const id = `cust_${Date.now()}`;
    const monthlyEst = newCust.quantityPerDay * 30 * (newCust.milkType.includes('Buffalo') ? 70 : 60);
    const customer: Customer = {
      ...newCust,
      id,
      monthlyEstimate: monthlyEst,
      outstandingBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.customers.unshift(customer);

    // Auto-create User account for Login
    const newUser: User = {
      id: `user_${id}`,
      dairyId: newCust.dairyId,
      name: newCust.name,
      email: newCust.email || `${newCust.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: newCust.phone,
      role: 'CUSTOMER',
      customerId: id
    };
    this.users.unshift(newUser);

    // Also auto-create a subscription
    const prod = this.products.find((p) => p.name.toLowerCase().includes(newCust.milkType.toLowerCase())) || this.products[0];
    const sub: Subscription = {
      id: `sub_${Date.now()}`,
      dairyId: newCust.dairyId,
      customerId: id,
      customerName: newCust.name,
      customerPhone: newCust.phone,
      productId: prod.id,
      productName: prod.name,
      quantity: newCust.quantityPerDay,
      unitPrice: prod.price,
      frequency: 'EVERYDAY',
      deliveryTime: newCust.deliveryTime === 'BOTH' ? 'MORNING' : newCust.deliveryTime,
      startDate: newCust.startDate,
      status: 'ACTIVE',
      pausePeriods: []
    };
    this.subscriptions.unshift(sub);

    // Generate today delivery record
    this.deliveries.unshift({
      id: `del_${TODAY_STR.replace(/-/g, '')}_${id}`,
      dairyId: newCust.dairyId,
      subscriptionId: sub.id,
      customerId: id,
      customerName: newCust.name,
      customerAddress: newCust.address,
      customerPhone: newCust.phone,
      productId: prod.id,
      productName: prod.name,
      quantity: newCust.quantityPerDay,
      unitPrice: prod.price,
      totalPrice: newCust.quantityPerDay * prod.price,
      deliveryTime: sub.deliveryTime === 'BOTH' ? 'MORNING' : sub.deliveryTime,
      deliveryDate: TODAY_STR,
      status: 'SCHEDULED',
      deliveryStaffId: 'staff_01',
      deliveryStaffName: 'Ramesh Kumar'
    });

    // Welcome Notification
    this.notifications.unshift({
      id: `notif_welcome_${Date.now()}`,
      dairyId: newCust.dairyId,
      recipientRole: 'CUSTOMER',
      customerId: id,
      title: 'Welcome to Anandwan Dairy! 🥛',
      message: `Your account has been created by Dairy Admin. Daily milk delivery scheduled!`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return customer;
  }

  public pauseSubscription(subscriptionId: string, fromDate: string, toDate: string, reason: string) {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return null;

    const pauseObj = {
      id: `pause_${Date.now()}`,
      subscriptionId,
      fromDate,
      toDate,
      reason,
      createdAt: new Date().toISOString()
    };
    sub.pausePeriods.push(pauseObj);

    // If today falls inside pause range, update today's delivery to SKIPPED
    if (TODAY_STR >= fromDate && TODAY_STR <= toDate) {
      sub.status = 'PAUSED';
      const cust = this.customers.find((c) => c.id === sub.customerId);
      if (cust) cust.subscriptionStatus = 'PAUSED';

      const todayDel = this.deliveries.find((d) => d.subscriptionId === subscriptionId && d.deliveryDate === TODAY_STR);
      if (todayDel) {
        todayDel.status = 'SKIPPED';
        todayDel.notes = `Paused by customer (${fromDate} to ${toDate}): ${reason}`;
      }
    }

    // Add notification
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      dairyId: sub.dairyId,
      recipientRole: 'ADMIN',
      title: 'Subscription Paused ⏸️',
      message: `${sub.customerName} requested pause from ${fromDate} to ${toDate}. Reason: ${reason}`,
      type: 'PAUSE',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return sub;
  }

  public resumeSubscription(subscriptionId: string) {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return null;

    sub.status = 'ACTIVE';
    const cust = this.customers.find((c) => c.id === sub.customerId);
    if (cust) cust.subscriptionStatus = 'ACTIVE';

    const todayDel = this.deliveries.find((d) => d.subscriptionId === subscriptionId && d.deliveryDate === TODAY_STR);
    if (todayDel && todayDel.status === 'SKIPPED') {
      todayDel.status = 'SCHEDULED';
      todayDel.notes = 'Subscription Resumed';
    }

    return sub;
  }

  public updateDeliveryStatus(deliveryId: string, status: 'DELIVERED' | 'SKIPPED' | 'FAILED' | 'PENDING', notes?: string) {
    const del = this.deliveries.find((d) => d.id === deliveryId);
    if (!del) return null;

    del.status = status;
    del.updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (notes) del.notes = notes;

    // Deduct stock if delivered
    if (status === 'DELIVERED') {
      const prod = this.products.find((p) => p.id === del.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - del.quantity);
      }

      // Notify customer
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        dairyId: del.dairyId,
        recipientRole: 'CUSTOMER',
        customerId: del.customerId,
        title: 'Milk Delivered! 🥛',
        message: `Your ${del.quantity}${del.productName.includes('Milk') ? 'L' : ' Pack'} ${del.productName} has been delivered.`,
        type: 'DELIVERY',
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    return del;
  }

  public recordPayment(invoiceId: string, amount: number, paymentMethod: Payment['paymentMethod'], notes?: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;

    const rzpId = `pay_Rzp${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const pay: Payment = {
      id: `pay_${Date.now()}`,
      paymentId: rzpId,
      dairyId: inv.dairyId,
      invoiceId: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount,
      paymentMethod,
      razorpayPaymentId: rzpId,
      status: 'SUCCESS',
      transactionDate: `${TODAY_STR} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      notes: notes || 'Online bill payment via Razorpay'
    };

    this.payments.unshift(pay);

    // Update invoice
    inv.paidAmount += amount;
    inv.dueAmount = Math.max(0, inv.totalAmount - inv.paidAmount);
    if (inv.dueAmount === 0) {
      inv.status = 'PAID';
    } else {
      inv.status = 'PARTIAL';
    }

    // Update customer outstanding balance
    const cust = this.customers.find((c) => c.id === inv.customerId);
    if (cust) {
      cust.outstandingBalance = Math.max(0, cust.outstandingBalance - amount);
    }

    // Add notification
    this.notifications.unshift({
      id: `notif_pay_${Date.now()}`,
      dairyId: inv.dairyId,
      recipientRole: 'CUSTOMER',
      customerId: inv.customerId,
      title: 'Payment Received ✅',
      message: `Thank you! Payment of ₹${amount.toLocaleString('en-IN')} received for invoice ${inv.invoiceNumber}.`,
      type: 'PAYMENT',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return { payment: pay, invoice: inv };
  }

  public createEcommerceOrder(orderData: Omit<EcommerceOrder, 'id' | 'orderNumber' | 'createdAt'>): EcommerceOrder {
    const id = `ecom_${Date.now()}`;
    const orderNumber = `ORD-${TODAY_STR.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: EcommerceOrder = {
      ...orderData,
      id,
      orderNumber,
      createdAt: `${TODAY_STR} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    this.ecommerceOrders.unshift(newOrder);

    // Deduct stocks for items
    newOrder.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    // Notify admin
    this.notifications.unshift({
      id: `notif_order_${Date.now()}`,
      dairyId: newOrder.dairyId,
      recipientRole: 'ADMIN',
      title: '🛒 New Store Order Placed!',
      message: `${newOrder.customerName} placed order #${orderNumber} for ₹${newOrder.totalAmount}. Slot: ${newOrder.deliverySlot}`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return newOrder;
  }

  public updateEcommerceOrderStatus(orderId: string, status: EcommerceOrder['status'], staffId?: string, staffName?: string) {
    const order = this.ecommerceOrders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    if (staffId) order.deliveryStaffId = staffId;
    if (staffName) order.deliveryStaffName = staffName;

    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    // Notify customer
    this.notifications.unshift({
      id: `notif_ecom_upd_${Date.now()}`,
      dairyId: order.dairyId,
      recipientRole: 'CUSTOMER',
      customerId: order.customerId,
      title: `Order Update #${order.orderNumber}`,
      message: `Your store order is now: ${status.replace(/_/g, ' ')}.`,
      type: 'DELIVERY',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return order;
  }

  public getEcommerceOrders(customerId?: string) {
    if (customerId) {
      return this.ecommerceOrders.filter((o) => o.customerId === customerId);
    }
    return this.ecommerceOrders;
  }

  // Auth Methods
  public authenticateUser(phoneOrEmail: string, role?: string, password?: string): { user: User; token: string } {
    const cleanInput = phoneOrEmail.replace(/[^0-9a-zA-Z@.]/g, '').toLowerCase();
    
    let matchedUser = this.users.find(
      (u) => (u.phone && u.phone.includes(cleanInput)) || (u.email && u.email.toLowerCase().includes(cleanInput))
    );

    if (!matchedUser && (role === 'CUSTOMER' || !role)) {
      // Look for existing customer with this phone
      let customer = this.customers.find((c) => c.phone.includes(cleanInput));
      if (!customer) {
        // Auto-create customer profile
        const regRes = this.registerCustomer({
          name: `Customer (${cleanInput.length >= 10 ? cleanInput.slice(-10) : cleanInput})`,
          phone: cleanInput.length >= 10 ? cleanInput.slice(-10) : cleanInput,
          address: 'Plot 12, Green Park, Amravati',
          milkType: 'Cow Milk (Fresh 3.5% Fat)',
          quantity: 1
        });
        matchedUser = regRes.user;
      } else {
        matchedUser = {
          id: `user_cust_${customer.id}`,
          dairyId: this.dairy.id,
          name: customer.name,
          email: customer.email || `cust_${cleanInput}@anandwan.com`,
          phone: customer.phone,
          role: 'CUSTOMER',
          customerId: customer.id
        };
        this.users.unshift(matchedUser);
      }
    }

    if (!matchedUser) {
      // Fallback default admin, master admin, staff, or customer
      if (role === 'MASTER_ADMIN') {
        matchedUser = this.users.find((u) => u.role === 'MASTER_ADMIN') || {
          id: 'user_master_01',
          dairyId: 'all',
          name: 'Platform Master Admin',
          email: 'master@anandwandairy.com',
          phone: cleanInput || '9999999999',
          role: 'MASTER_ADMIN',
          password: 'Master@123'
        };
      } else if (role === 'ADMIN') {
        matchedUser = this.users.find((u) => u.role === 'ADMIN') || {
          id: 'user_admin_01',
          dairyId: this.dairy.id,
          name: 'Shri Anand Deshmukh',
          email: 'owner@anandwandairy.com',
          phone: cleanInput || '9850012345',
          role: 'ADMIN',
          password: 'dairy2026'
        };
      } else if (role === 'DELIVERY_STAFF') {
        matchedUser = this.users.find((u) => u.role === 'DELIVERY_STAFF') || {
          id: 'user_staff_01',
          dairyId: this.dairy.id,
          name: 'Ramesh Patil',
          email: 'ramesh@anandwandairy.com',
          phone: cleanInput || '9890011223',
          role: 'DELIVERY_STAFF'
        };
      } else {
        matchedUser = this.users.find((u) => u.role === 'CUSTOMER') || {
          id: 'user_cust_01',
          dairyId: this.dairy.id,
          name: 'Aniket Deshmukh',
          email: 'aniket@gmail.com',
          phone: cleanInput || '9823011223',
          role: 'CUSTOMER',
          customerId: 'cust_rahul_01'
        };
      }
    }

    // Verify Password if password is provided or user has a set password
    if (password) {
      if (matchedUser.password && matchedUser.password !== password) {
        throw new Error('Incorrect password. Please check your password or contact Master Admin to reset it.');
      }
    }

    const token = generateJwtToken(matchedUser);
    return { user: matchedUser, token };
  }

  public registerCustomer(data: { name: string; phone: string; email?: string; password?: string; address: string; milkType: string; quantity: number }): { user: User; customer: Customer; token: string } {
    const custId = `cust_${Date.now()}`;
    const qty = Number(data.quantity || 1);
    const customerEmail = data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

    const newCustomer: Customer = {
      id: custId,
      dairyId: this.dairy.id,
      name: data.name,
      phone: data.phone,
      email: customerEmail,
      address: data.address,
      city: 'Amravati',
      pincode: '444601',
      milkType: data.milkType || 'Cow Milk (Fresh 3.5% Fat)',
      quantityPerDay: qty,
      deliveryTime: 'MORNING',
      subscriptionStatus: 'ACTIVE',
      monthlyEstimate: Math.round(qty * 68 * 30),
      outstandingBalance: 0,
      startDate: TODAY_STR,
      createdAt: TODAY_STR
    };

    this.customers.unshift(newCustomer);

    const newUser: User = {
      id: `user_${custId}`,
      dairyId: this.dairy.id,
      name: data.name,
      email: customerEmail,
      phone: data.phone,
      password: data.password || 'dairy2026',
      role: 'CUSTOMER',
      customerId: custId
    };

    this.users.unshift(newUser);

    // Auto-create Subscription
    const prod = this.products.find((p) => p.name.toLowerCase().includes((data.milkType || '').toLowerCase())) || this.products[0];
    const sub: Subscription = {
      id: `sub_${Date.now()}`,
      dairyId: this.dairy.id,
      customerId: custId,
      customerName: data.name,
      customerPhone: data.phone,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitPrice: prod.price,
      frequency: 'EVERYDAY',
      deliveryTime: 'MORNING',
      startDate: TODAY_STR,
      status: 'ACTIVE',
      pausePeriods: []
    };
    this.subscriptions.unshift(sub);

    // Auto-generate Today's Delivery Record
    this.deliveries.unshift({
      id: `del_${TODAY_STR.replace(/-/g, '')}_${custId}`,
      dairyId: this.dairy.id,
      subscriptionId: sub.id,
      customerId: custId,
      customerName: data.name,
      customerAddress: data.address,
      customerPhone: data.phone,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitPrice: prod.price,
      totalPrice: qty * prod.price,
      deliveryTime: 'MORNING',
      deliveryDate: TODAY_STR,
      status: 'SCHEDULED',
      deliveryStaffId: 'staff_01',
      deliveryStaffName: 'Ramesh Kumar'
    });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Welcome Notification for Customer
    this.notifications.unshift({
      id: `notif_welcome_${Date.now()}`,
      dairyId: this.dairy.id,
      recipientRole: 'CUSTOMER',
      customerId: custId,
      title: 'Welcome to Anandwan Milk Dairy! 🥛',
      message: `Hello ${data.name}, your ${qty}L ${prod.name} daily subscription is active!`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: timeStr
    });

    // 2. Alert Notification for Dairy Owner & Staff
    this.notifications.unshift({
      id: `notif_owner_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      dairyId: this.dairy.id,
      recipientRole: 'ADMIN',
      title: '🆕 New Customer Registered!',
      message: `Customer ${data.name} (Phone: ${data.phone}, Email: ${customerEmail}) registered at ${data.address}. Daily order: ${qty}L ${prod.name}.`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: timeStr
    });

    return { user: newUser, customer: newCustomer, token: generateJwtToken(newUser) };
  }

  // Service Desk / Support Ticket Methods
  public getServiceTickets(customerId?: string): ServiceTicket[] {
    if (customerId) {
      return this.serviceTickets.filter((t) => t.customerId === customerId);
    }
    return this.serviceTickets;
  }

  public createServiceTicket(data: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt'>): ServiceTicket {
    const id = `srv_${Date.now()}`;
    const ticketNumber = `SRV-${TODAY_STR.replace(/-/g, '')}-${Math.floor(10 + Math.random() * 89)}`;
    const newTicket: ServiceTicket = {
      ...data,
      id,
      ticketNumber,
      createdAt: `${TODAY_STR} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    this.serviceTickets.unshift(newTicket);

    // Notify Admin
    this.notifications.unshift({
      id: `notif_srv_${Date.now()}`,
      dairyId: newTicket.dairyId,
      recipientRole: 'ADMIN',
      title: '🚨 New Service Request Raised!',
      message: `${newTicket.customerName} created ticket #${ticketNumber}: ${newTicket.subject}`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return newTicket;
  }

  public updateServiceTicketStatus(ticketId: string, status: ServiceTicket['status'], resolutionNote?: string): ServiceTicket | null {
    const ticket = this.serviceTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = status;
    if (resolutionNote) ticket.resolutionNote = resolutionNote;
    ticket.updatedAt = `${TODAY_STR} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Notify Customer
    this.notifications.unshift({
      id: `notif_srv_upd_${Date.now()}`,
      dairyId: ticket.dairyId,
      recipientRole: 'CUSTOMER',
      customerId: ticket.customerId,
      title: `Service Ticket #${ticket.ticketNumber} Update`,
      message: `Your ticket status is now: ${status}. ${resolutionNote ? `Note: ${resolutionNote}` : ''}`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return ticket;
  }
}


export const dbStore = new DairyDataStore();
