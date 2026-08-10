export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'DELIVERY_STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  dairyId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  customerId?: string;
  deliveryStaffId?: string;
}

export interface DairyStore {
  id: string;
  name: string;
  ownerName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  razorpayKeyId?: string;
  enableSmsNotifs: boolean;
  enableWhatsappNotifs: boolean;
}

export interface Customer {
  id: string;
  dairyId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  milkType: string;
  quantityPerDay: number; // In Litres or Units
  deliveryTime: 'MORNING' | 'EVENING' | 'BOTH';
  subscriptionStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  monthlyEstimate: number;
  outstandingBalance: number;
  startDate: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  dairyId: string;
  name: string;
  category: 'MILK' | 'DAIRY_PRODUCT' | 'CURD_PANEER' | 'GHEE_BUTTER' | 'SWEETS_DESSERTS' | 'BEVERAGES' | 'BAKERY_SNACKS';
  price: number;
  originalPrice?: number;
  unit: 'L' | 'Kg' | 'Pack' | '500ml' | '250g' | '500g' | '1Kg' | '200g' | '200ml';
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  description?: string;
  icon?: string;
  image?: string;
  rating?: number;
  badge?: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type EcommerceOrderStatus = 'ORDER_PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  dairyId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    icon?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'COD';
  deliverySlot: string;
  status: EcommerceOrderStatus;
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  createdAt: string;
}

export type FrequencyType = 'EVERYDAY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';

export interface PausePeriod {
  id: string;
  subscriptionId: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  reason: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  dairyId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  frequency: FrequencyType;
  deliveryTime: 'MORNING' | 'EVENING' | 'BOTH';
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  pausePeriods: PausePeriod[];
  customDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export type DeliveryStatus = 'SCHEDULED' | 'DELIVERED' | 'SKIPPED' | 'FAILED' | 'PENDING';

export interface DeliveryRecord {
  id: string;
  dairyId: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: 'MORNING' | 'EVENING';
  deliveryDate: string; // YYYY-MM-DD
  status: DeliveryStatus;
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  notes?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  deliveredDaysCount: number;
  skippedDaysCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dairyId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  month: string; // e.g. "August 2026"
  startDate: string;
  endDate: string;
  items: InvoiceItem[];
  subtotal: number;
  adjustments: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentId: string; // e.g. pay_Rzp98234723
  dairyId: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'CASH' | 'BANK_TRANSFER';
  razorpayPaymentId?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  transactionDate: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  dairyId: string;
  recipientRole: UserRole;
  customerId?: string;
  title: string;
  message: string;
  type: 'DELIVERY' | 'BILL' | 'PAYMENT' | 'PAUSE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface DeliveryStaff {
  id: string;
  dairyId: string;
  name: string;
  phone: string;
  assignedArea: string;
  activeDeliveriesCount: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

export interface DashboardOverview {
  todayRevenue: number;
  milkDeliveredLitres: number;
  activeCustomersCount: number;
  pendingDeliveriesCount: number;
  todayDeliveriesCount: number;
  deliveredCount: number;
  skippedCount: number;
  monthlyRevenue: number;
  outstandingBalanceTotal: number;
}

export type TicketCategory = 'MISSING_MILK' | 'QUALITY_ISSUE' | 'CHANGE_ADDRESS' | 'PAUSE_RESUME' | 'BILLING' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  dairyId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: TicketStatus;
  resolutionNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string; // e.g. "Home", "Office"
  addressLine: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  authenticatedAt: string;
}
