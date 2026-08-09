import mongoose, { Schema } from 'mongoose';
import {
  INITIAL_DAIRY,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_DELIVERIES,
  INITIAL_PAYMENTS,
  INITIAL_ECOMMERCE_ORDERS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS
} from '../data/mockDatabase';

// Schemas
const DairySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  ownerName: String,
  tagline: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  gstNumber: String,
  razorpayKeyId: String,
  enableSmsNotifs: Boolean,
  enableWhatsappNotifs: Boolean,
}, { timestamps: true });

const CustomerSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  name: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  pincode: String,
  milkType: String,
  quantityPerDay: Number,
  deliveryTime: String,
  subscriptionStatus: String,
  monthlyEstimate: Number,
  outstandingBalance: Number,
  startDate: String,
  createdAt: String,
}, { timestamps: true });

const ProductSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  name: String,
  category: String,
  price: Number,
  originalPrice: Number,
  unit: String,
  stock: Number,
  status: String,
  description: String,
  imageUrl: String,
  badgeText: String,
  isSubscriptionEligible: Boolean,
}, { timestamps: true });

const SubscriptionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  customerId: String,
  customerName: String,
  customerPhone: String,
  address: String,
  productName: String,
  quantity: Number,
  deliveryTime: String,
  frequency: String,
  customDays: [String],
  pricePerUnit: Number,
  status: String,
  startDate: String,
  endDate: String,
  nextDeliveryDate: String,
}, { timestamps: true });

const DeliverySchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  date: String,
  customerId: String,
  customerName: String,
  address: String,
  phone: String,
  productName: String,
  quantity: Number,
  deliveryTime: String,
  assignedStaffId: String,
  assignedStaffName: String,
  status: String,
  deliveredAt: String,
  notes: String,
}, { timestamps: true });

const PaymentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  customerId: String,
  customerName: String,
  amount: Number,
  billingMonth: String,
  paymentDate: String,
  method: String,
  status: String,
  razorpayPaymentId: String,
  receiptUrl: String,
}, { timestamps: true });

const EcommerceOrderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: String,
  dairyId: String,
  customerId: String,
  customerName: String,
  customerPhone: String,
  deliveryAddress: String,
  items: Schema.Types.Mixed,
  totalAmount: Number,
  paymentStatus: String,
  orderStatus: String,
  paymentMethod: String,
  deliverySlot: String,
  createdAt: String,
}, { timestamps: true });

const ServiceTicketSchema = new Schema({
  id: { type: String, required: true, unique: true },
  ticketNumber: String,
  dairyId: String,
  customerId: String,
  customerName: String,
  customerPhone: String,
  category: String,
  subject: String,
  description: String,
  priority: String,
  status: String,
  resolutionNote: String,
  createdAt: String,
  updatedAt: String,
}, { timestamps: true });

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  name: String,
  email: String,
  phone: String,
  role: String,
  customerId: String,
  deliveryStaffId: String,
}, { timestamps: true });

const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  dairyId: String,
  recipientRole: String,
  customerId: String,
  title: String,
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: String,
}, { timestamps: true });

// Models
export const DairyModel = mongoose.models.Dairy || mongoose.model('Dairy', DairySchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const SubscriptionModel = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export const DeliveryModel = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const EcommerceOrderModel = mongoose.models.EcommerceOrder || mongoose.model('EcommerceOrder', EcommerceOrderSchema);
export const ServiceTicketModel = mongoose.models.ServiceTicket || mongoose.model('ServiceTicket', ServiceTicketSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

let cachedPromise: Promise<boolean> | null = null;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    return false;
  }

  // Reuse active connection if ready
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Return ongoing connection promise if present
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log('[MongoDB] Successfully connected to MongoDB database!');

      // Seed initial collections if empty
      await seedDatabaseIfEmpty();
      return true;
    } catch (err: any) {
      cachedPromise = null; // Clear cached promise on failure so next request can retry
      console.warn('[MongoDB] Unable to connect to MongoDB Atlas cluster.');
      if (err?.name === 'MongooseServerSelectionError' || err?.message?.includes('whitelist')) {
        console.warn('💡 HINT for MongoDB Atlas: Ensure 0.0.0.0/0 is added to your MongoDB Atlas Network Access / IP Whitelist.');
      } else {
        console.warn(`[MongoDB Detail]: ${err?.message || err}`);
      }
      console.log('🔄 Falling back to high-performance in-memory database store.');

      try {
        await mongoose.disconnect();
      } catch (_) {}

      return false;
    }
  })();

  return cachedPromise;
}

async function seedDatabaseIfEmpty() {
  try {
    const dairyCount = await DairyModel.countDocuments();
    if (dairyCount === 0) {
      console.log('[MongoDB] Seeding initial Anandwan Milk Dairy data into MongoDB...');
      await DairyModel.create(INITIAL_DAIRY as any);
      await CustomerModel.insertMany(INITIAL_CUSTOMERS as any[]);
      await ProductModel.insertMany(INITIAL_PRODUCTS as any[]);
      await SubscriptionModel.insertMany(INITIAL_SUBSCRIPTIONS as any[]);
      await DeliveryModel.insertMany(INITIAL_DELIVERIES as any[]);
      await PaymentModel.insertMany(INITIAL_PAYMENTS as any[]);
      await EcommerceOrderModel.insertMany(INITIAL_ECOMMERCE_ORDERS as any[]);
      await ServiceTicketModel.insertMany(INITIAL_SERVICE_TICKETS as any[]);
      await UserModel.insertMany(INITIAL_USERS as any[]);
      await NotificationModel.insertMany(INITIAL_NOTIFICATIONS as any[]);
      console.log('[MongoDB] Database seeding completed successfully!');
    }
  } catch (e) {
    console.error('[MongoDB] Failed to seed database:', e);
  }
}
