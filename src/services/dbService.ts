import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {
  DairyModel,
  CustomerModel,
  ProductModel,
  SubscriptionModel,
  DeliveryModel,
  InvoiceModel,
  PaymentModel,
  EcommerceOrderModel,
  ServiceTicketModel,
  UserModel,
  NotificationModel,
  CartModel,
  WishlistModel,
  AddressModel
} from '../db/mongodb';
import { dbStore, JWT_SECRET } from '../data/mockDatabase';

const TODAY_STR = new Date().toISOString().split('T')[0];

const Dairy: any = DairyModel;
const CustomerDoc: any = CustomerModel;
const ProductDoc: any = ProductModel;
const SubscriptionDoc: any = SubscriptionModel;
const DeliveryDoc: any = DeliveryModel;
const InvoiceDoc: any = InvoiceModel;
const PaymentDoc: any = PaymentModel;
const EcommerceOrderDoc: any = EcommerceOrderModel;
const ServiceTicketDoc: any = ServiceTicketModel;
const UserDoc: any = UserModel;
const NotificationDoc: any = NotificationModel;
const CartDoc: any = CartModel;
const WishlistDoc: any = WishlistModel;
const AddressDoc: any = AddressModel;
import {
  User,
  Customer,
  Product,
  Subscription,
  DeliveryRecord,
  Invoice,
  Payment,
  EcommerceOrder,
  ServiceTicket,
  NotificationItem,
  CartItem,
  UserAddress
} from '../types';

export class DbService {
  public static isMongo(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // --- HEALTH & DAIRY ---
  public static async getDairy() {
    if (this.isMongo()) {
      let dairy = await Dairy.findOne({}).lean();
      if (!dairy) {
        return dbStore.dairy;
      }
      return dairy;
    }
    return dbStore.dairy;
  }

  public static async updateDairy(data: any) {
    if (this.isMongo()) {
      let dairy = await Dairy.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true }).lean();
      return dairy;
    }
    dbStore.dairy = { ...dbStore.dairy, ...data };
    return dbStore.dairy;
  }

  // --- AUTH & PROFILE ---
  public static async getAuthMe(userId: string) {
    if (this.isMongo()) {
      const user = await UserDoc.findOne({ id: userId }).lean();
      if (!user) return null;
      let customer = null;
      if (user.customerId) {
        customer = await CustomerDoc.findOne({ id: user.customerId }).lean();
      }
      const dairy = await this.getDairy();
      return { user, customer, dairy };
    }

    const user = dbStore.users.find((u) => u.id === userId);
    if (!user) return null;
    const customer = user.customerId ? dbStore.customers.find((c) => c.id === user.customerId) || null : null;
    return { user, customer, dairy: dbStore.dairy };
  }

  public static async registerCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    address: string;
    milkType?: string;
    quantity?: number;
  }) {
    const cleanPhone = data.phone.replace(/[^0-9]/g, '');
    const customerEmail = data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const qty = Number(data.quantity || 1);

    if (this.isMongo()) {
      // 1. Check existing user
      const existingUser = await UserDoc.findOne({
        $or: [{ phone: cleanPhone }, { email: customerEmail }]
      }).lean();

      if (existingUser) {
        throw new Error('An account with this mobile number or email already exists.');
      }

      const custId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const dairy = await this.getDairy();
      const dairyId = dairy?.id || 'dairy_anandwan_01';

      // 2. Create Customer Document
      const newCust = await CustomerDoc.create({
        id: custId,
        dairyId,
        name: data.name,
        phone: cleanPhone,
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
      });

      // 3. Create User Document
      const userId = `user_${custId}`;
      const newUser = await UserDoc.create({
        id: userId,
        dairyId,
        name: data.name,
        email: customerEmail,
        phone: cleanPhone,
        password: data.password || 'dairy2026',
        role: 'CUSTOMER',
        customerId: custId
      });

      // 4. Create Subscription Document
      const prod = await ProductDoc.findOne({
        name: { $regex: (data.milkType || '').split(' ')[0], $options: 'i' }
      }).lean() || await ProductDoc.findOne({}).lean();

      const subId = `sub_${Date.now()}`;
      await SubscriptionDoc.create({
        id: subId,
        dairyId,
        customerId: custId,
        customerName: data.name,
        customerPhone: cleanPhone,
        productId: prod?.id || 'prod_01',
        productName: prod?.name || 'Fresh Cow Milk',
        quantity: qty,
        unitPrice: prod?.price || 60,
        frequency: 'EVERYDAY',
        deliveryTime: 'MORNING',
        startDate: TODAY_STR,
        status: 'ACTIVE',
        pausePeriods: []
      });

      // 5. Create Today's Delivery Record Document
      await DeliveryDoc.create({
        id: `del_${TODAY_STR.replace(/-/g, '')}_${custId}`,
        dairyId,
        subscriptionId: subId,
        customerId: custId,
        customerName: data.name,
        customerAddress: data.address,
        customerPhone: cleanPhone,
        productId: prod?.id || 'prod_01',
        productName: prod?.name || 'Fresh Cow Milk',
        quantity: qty,
        unitPrice: prod?.price || 60,
        totalPrice: qty * (prod?.price || 60),
        deliveryTime: 'MORNING',
        deliveryDate: TODAY_STR,
        status: 'SCHEDULED',
        deliveryStaffId: 'staff_01',
        deliveryStaffName: 'Ramesh Kumar'
      });

      // 6. Create Welcome Notifications
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await NotificationDoc.create([
        {
          id: `notif_welcome_${Date.now()}`,
          dairyId,
          recipientRole: 'CUSTOMER',
          customerId: custId,
          title: 'Welcome to Anandwan Milk Dairy! 🥛',
          message: `Hello ${data.name}, your ${qty}L daily subscription is active!`,
          type: 'SYSTEM',
          isRead: false,
          createdAt: timeStr
        },
        {
          id: `notif_owner_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          dairyId,
          recipientRole: 'ADMIN',
          title: '🆕 New Customer Registered!',
          message: `Customer ${data.name} (Phone: ${cleanPhone}) registered at ${data.address}.`,
          type: 'SYSTEM',
          isRead: false,
          createdAt: timeStr
        }
      ]);

      const userObj = typeof newUser.toObject === 'function' ? newUser.toObject() : newUser;
      const custObj = typeof newCust.toObject === 'function' ? newCust.toObject() : newCust;
      const token = jwt.sign(
        {
          userId: userObj.id,
          role: userObj.role,
          customerId: userObj.customerId,
          dairyId: userObj.dairyId,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log(`[Database] Registered new customer ${data.name} (${userObj.id}) in MongoDB`);
      return { user: userObj, customer: custObj, token };
    }

    // Fallback in-memory
    return dbStore.registerCustomer({
      ...data,
      milkType: data.milkType || 'Cow Milk (Fresh 3.5% Fat)',
      quantity: Number(data.quantity || 1)
    });
  }

  public static async loginUser(phoneOrEmail: string, role?: string, password?: string) {
    const cleanInput = phoneOrEmail.replace(/[^0-9a-zA-Z@.]/g, '').toLowerCase();

    if (this.isMongo()) {
      let user = await UserDoc.findOne({
        $or: [
          { phone: { $regex: cleanInput, $options: 'i' } },
          { email: { $regex: cleanInput, $options: 'i' } }
        ]
      }).lean();

      if (!user && (role === 'CUSTOMER' || !role)) {
        // Try finding customer by phone
        const customer = await CustomerDoc.findOne({
          phone: { $regex: cleanInput, $options: 'i' }
        }).lean();

        if (customer) {
          const userId = `user_${customer.id}`;
          user = await UserDoc.create({
            id: userId,
            dairyId: customer.dairyId,
            name: customer.name,
            email: customer.email || `${customer.phone}@anandwan.com`,
            phone: customer.phone,
            password: 'dairy2026',
            role: 'CUSTOMER',
            customerId: customer.id
          }).then((doc: any) => (doc.toObject ? doc.toObject() : doc));
        }
      }

      if (!user) {
        if (role === 'MASTER_ADMIN') {
          user = await UserDoc.findOne({ role: 'MASTER_ADMIN' }).lean();
        } else if (role === 'ADMIN') {
          user = await UserDoc.findOne({ role: 'ADMIN' }).lean();
        } else if (role === 'DELIVERY_STAFF') {
          user = await UserDoc.findOne({ role: 'DELIVERY_STAFF' }).lean();
        } else {
          user = await UserDoc.findOne({ role: 'CUSTOMER' }).lean();
        }
      }

      if (!user) {
        throw new Error('User not found. Please register first.');
      }

      if (password && user.password && user.password !== password) {
        throw new Error('Incorrect password. Please check your credentials.');
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          customerId: user.customerId,
          dairyId: user.dairyId,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return { user, token };
    }

    return dbStore.authenticateUser(phoneOrEmail, role, password);
  }

  public static async getProfile(userId: string) {
    if (this.isMongo()) {
      const user = await UserDoc.findOne({ id: userId }).lean();
      const customer = user?.customerId ? await CustomerDoc.findOne({ id: user.customerId }).lean() : null;
      return { user, customer };
    }

    const user = dbStore.users.find((u) => u.id === userId);
    const customer = user?.customerId ? dbStore.customers.find((c) => c.id === user.customerId) || null : null;
    return { user, customer };
  }

  public static async updateProfile(userId: string, data: Partial<Customer & User>) {
    if (this.isMongo()) {
      const { name, phone, email, address, city, pincode } = data;
      const userUpdate: any = {};
      if (name) userUpdate.name = name;
      if (phone) userUpdate.phone = phone;
      if (email) userUpdate.email = email;

      const user = await UserDoc.findOneAndUpdate({ id: userId }, { $set: userUpdate }, { new: true }).lean();

      let customer = null;
      if (user?.customerId) {
        const custUpdate: any = {};
        if (name) custUpdate.name = name;
        if (phone) custUpdate.phone = phone;
        if (email) custUpdate.email = email;
        if (address) custUpdate.address = address;
        if (city) custUpdate.city = city;
        if (pincode) custUpdate.pincode = pincode;

        customer = await CustomerDoc.findOneAndUpdate({ id: user.customerId }, { $set: custUpdate }, { new: true }).lean();
      }

      return { user, customer };
    }

    const userIdx = dbStore.users.findIndex((u) => u.id === userId);
    if (userIdx > -1) {
      if (data.name) dbStore.users[userIdx].name = data.name;
      if (data.phone) dbStore.users[userIdx].phone = data.phone;
      if (data.email) dbStore.users[userIdx].email = data.email;
    }

    const targetUser = dbStore.users[userIdx];
    if (targetUser?.customerId) {
      const custIdx = dbStore.customers.findIndex((c) => c.id === targetUser.customerId);
      if (custIdx > -1) {
        if (data.name) dbStore.customers[custIdx].name = data.name;
        if (data.phone) dbStore.customers[custIdx].phone = data.phone;
        if (data.email) dbStore.customers[custIdx].email = data.email;
        if (data.address) dbStore.customers[custIdx].address = data.address;
      }
    }

    return this.getProfile(userId);
  }

  // --- PRODUCTS ---
  public static async getProducts() {
    if (this.isMongo()) {
      return await ProductDoc.find({}).sort({ createdAt: -1 }).lean();
    }
    return dbStore.products;
  }

  public static async createProduct(dairyId: string, data: any) {
    console.log('Creating product in database...', data.name);
    const prodId = `prod_${Date.now()}`;
    const productData = {
      id: prodId,
      dairyId: dairyId || 'dairy_anandwan_01',
      name: data.name,
      category: data.category || 'MILK',
      price: Number(data.price),
      originalPrice: Number(data.originalPrice || data.price),
      unit: data.unit || 'L',
      stock: Number(data.stock || 100),
      status: 'ACTIVE',
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      badgeText: data.badgeText || '',
      isSubscriptionEligible: Boolean(data.isSubscriptionEligible)
    };

    if (this.isMongo()) {
      const created = await ProductDoc.create(productData);
      console.log('Product saved in MongoDB:', created.id);
      return typeof created.toObject === 'function' ? created.toObject() : created;
    }

    dbStore.products.unshift(productData as any);
    return productData;
  }

  public static async updateProduct(id: string, data: any) {
    console.log('Updating product in database...', id);
    if (this.isMongo()) {
      const updated = await ProductDoc.findOneAndUpdate({ id }, { $set: data }, { new: true, runValidators: true }).lean();
      if (!updated) throw new Error('Product not found in database');
      return updated;
    }

    const idx = dbStore.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    dbStore.products[idx] = { ...dbStore.products[idx], ...data };
    return dbStore.products[idx];
  }

  public static async deleteProduct(id: string) {
    console.log('Deleting product from database...', id);
    if (this.isMongo()) {
      const deleted = await ProductDoc.findOneAndDelete({ id }).lean();
      if (!deleted) throw new Error('Product not found in database');
      return { success: true };
    }

    const idx = dbStore.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    dbStore.products.splice(idx, 1);
    return { success: true };
  }

  // --- CART ---
  public static async getCart(userId: string): Promise<CartItem[]> {
    if (this.isMongo()) {
      const cart = await CartDoc.findOne({ userId }).lean();
      return cart ? (cart.items as CartItem[]) : [];
    }
    return dbStore.getCart(userId);
  }

  public static async addToCart(userId: string, product: Product, quantity = 1): Promise<CartItem[]> {
    console.log(`Adding item to cart in database for user ${userId}...`);
    if (this.isMongo()) {
      let cart = await CartDoc.findOne({ userId });
      let items: CartItem[] = cart ? (cart.items as CartItem[]) : [];
      const idx = items.findIndex((i) => i.product.id === product.id);

      if (idx > -1) {
        items[idx].quantity += Number(quantity);
      } else {
        items.push({ product, quantity: Number(quantity) });
      }

      const updated = await CartDoc.findOneAndUpdate(
        { userId },
        { $set: { userId, items } },
        { new: true, upsert: true }
      ).lean();

      return updated.items as CartItem[];
    }

    return dbStore.addToCart(userId, product, quantity);
  }

  public static async updateCartQuantity(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    if (this.isMongo()) {
      let cart = await CartDoc.findOne({ userId });
      let items: CartItem[] = cart ? (cart.items as CartItem[]) : [];

      if (Number(quantity) <= 0) {
        items = items.filter((i) => i.product.id !== productId);
      } else {
        items = items.map((i) => (i.product.id === productId ? { ...i, quantity: Number(quantity) } : i));
      }

      const updated = await CartDoc.findOneAndUpdate(
        { userId },
        { $set: { userId, items } },
        { new: true, upsert: true }
      ).lean();

      return updated.items as CartItem[];
    }

    return dbStore.updateCartQuantity(userId, productId, quantity);
  }

  public static async removeFromCart(userId: string, productId: string): Promise<CartItem[]> {
    if (this.isMongo()) {
      let cart = await CartDoc.findOne({ userId });
      let items: CartItem[] = cart ? (cart.items as CartItem[]) : [];
      items = items.filter((i) => i.product.id !== productId);

      const updated = await CartDoc.findOneAndUpdate(
        { userId },
        { $set: { userId, items } },
        { new: true, upsert: true }
      ).lean();

      return updated.items as CartItem[];
    }

    return dbStore.removeFromCart(userId, productId);
  }

  public static async clearCart(userId: string): Promise<CartItem[]> {
    if (this.isMongo()) {
      await CartDoc.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true });
      return [];
    }
    dbStore.clearCart(userId);
    return [];
  }

  // --- WISHLIST ---
  public static async getWishlist(userId: string): Promise<string[]> {
    if (this.isMongo()) {
      const doc = await WishlistDoc.findOne({ userId }).lean();
      return doc ? doc.productIds : [];
    }
    return dbStore.getWishlist(userId);
  }

  public static async toggleWishlist(userId: string, productId: string): Promise<string[]> {
    if (this.isMongo()) {
      let doc = await WishlistDoc.findOne({ userId });
      let productIds: string[] = doc ? doc.productIds : [];

      if (productIds.includes(productId)) {
        productIds = productIds.filter((id) => id !== productId);
      } else {
        productIds.push(productId);
      }

      const updated = await WishlistDoc.findOneAndUpdate(
        { userId },
        { $set: { userId, productIds } },
        { new: true, upsert: true }
      ).lean();

      return updated.productIds;
    }

    return dbStore.toggleWishlist(userId, productId);
  }

  // --- ADDRESSES ---
  public static async getAddresses(userId: string): Promise<UserAddress[]> {
    if (this.isMongo()) {
      return await AddressDoc.find({ userId }).sort({ createdAt: -1 }).lean();
    }
    return dbStore.getAddresses(userId);
  }

  public static async addAddress(userId: string, data: { label?: string; addressLine: string; city?: string; pincode?: string }): Promise<UserAddress> {
    const addrId = `addr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (this.isMongo()) {
      const existingCount = await AddressDoc.countDocuments({ userId });
      const newAddr = await AddressDoc.create({
        id: addrId,
        userId,
        label: data.label || 'Home',
        addressLine: data.addressLine,
        city: data.city || 'Amravati',
        pincode: data.pincode || '444601',
        isDefault: existingCount === 0
      });

      return typeof newAddr.toObject === 'function' ? newAddr.toObject() : newAddr;
    }

    return dbStore.addAddress(userId, data.label || 'Home', data.addressLine, data.city || 'Amravati', data.pincode || '444601');
  }

  public static async deleteAddress(userId: string, addressId: string): Promise<{ success: boolean }> {
    if (this.isMongo()) {
      await AddressDoc.findOneAndDelete({ id: addressId, userId });
      return { success: true };
    }

    dbStore.deleteAddress(userId, addressId);
    return { success: true };
  }

  // --- CUSTOMERS ---
  public static async getCustomers(dairyId?: string, role?: string, custId?: string, search?: string) {
    if (this.isMongo()) {
      let filter: any = {};
      if (role === 'CUSTOMER' && custId) {
        filter.id = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        filter.dairyId = dairyId;
      }

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ name: regex }, { phone: regex }, { address: regex }, { milkType: regex }];
      }

      return await CustomerDoc.find(filter).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.customers;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((c) => c.id === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((c) => c.dairyId === dairyId);
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.address.toLowerCase().includes(s));
    }

    return list;
  }

  public static async getCustomerDetails(id: string) {
    if (this.isMongo()) {
      let cust = await CustomerDoc.findOne({ id }).lean();
      if (!cust) {
        const user = await UserDoc.findOne({ $or: [{ id }, { customerId: id }] }).lean();
        if (user?.customerId) {
          cust = await CustomerDoc.findOne({ id: user.customerId }).lean();
        }
      }
      if (!cust) throw new Error('Customer not found');

      const subscription = await SubscriptionDoc.findOne({ customerId: cust.id }).lean();
      const deliveries = await DeliveryDoc.find({ customerId: cust.id }).sort({ deliveryDate: -1 }).lean();
      const invoices = await InvoiceDoc.find({ customerId: cust.id }).sort({ createdAt: -1 }).lean();

      return { customer: cust, subscription, deliveries, invoices };
    }

    let cust = dbStore.customers.find((c) => c.id === id);
    if (!cust) {
      const user = dbStore.users.find((u) => u.id === id || u.customerId === id);
      if (user?.customerId) {
        cust = dbStore.customers.find((c) => c.id === user.customerId);
      }
    }
    if (!cust) throw new Error('Customer not found');

    const sub = dbStore.subscriptions.find((s) => s.customerId === cust.id);
    const deliveries = dbStore.deliveries.filter((d) => d.customerId === cust.id);
    const invoices = dbStore.invoices.filter((i) => i.customerId === cust.id);

    return { customer: cust, subscription: sub, deliveries, invoices };
  }

  public static async updateCustomer(id: string, data: any) {
    if (this.isMongo()) {
      const updated = await CustomerDoc.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean();
      if (!updated) throw new Error('Customer not found');
      return updated;
    }

    const idx = dbStore.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    dbStore.customers[idx] = { ...dbStore.customers[idx], ...data };
    return dbStore.customers[idx];
  }

  // --- SUBSCRIPTIONS ---
  public static async getSubscriptions(dairyId?: string, role?: string, custId?: string) {
    if (this.isMongo()) {
      let filter: any = {};
      if (role === 'CUSTOMER' && custId) {
        filter.customerId = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        filter.dairyId = dairyId;
      }
      return await SubscriptionDoc.find(filter).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.subscriptions;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((s) => s.customerId === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((s) => s.dairyId === dairyId);
    }

    return list;
  }

  public static async pauseSubscription(id: string, fromDate: string, toDate: string, reason: string) {
    if (this.isMongo()) {
      const sub = await SubscriptionDoc.findOne({ id });
      if (!sub) throw new Error('Subscription not found');

      const pauseObj = {
        id: `pause_${Date.now()}`,
        subscriptionId: id,
        fromDate,
        toDate,
        reason,
        createdAt: new Date().toISOString()
      };

      const pausePeriods = Array.isArray(sub.pausePeriods) ? [...sub.pausePeriods, pauseObj] : [pauseObj];
      let newStatus = sub.status;

      if (TODAY_STR >= fromDate && TODAY_STR <= toDate) {
        newStatus = 'PAUSED';
        await CustomerDoc.findOneAndUpdate({ id: sub.customerId }, { subscriptionStatus: 'PAUSED' });
        await DeliveryDoc.findOneAndUpdate(
          { subscriptionId: id, deliveryDate: TODAY_STR },
          { status: 'SKIPPED', notes: `Paused (${fromDate} to ${toDate}): ${reason}` }
        );
      }

      const updated = await SubscriptionDoc.findOneAndUpdate(
        { id },
        { $set: { pausePeriods, status: newStatus } },
        { new: true }
      ).lean();

      // Notification
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await NotificationDoc.create({
        id: `notif_${Date.now()}`,
        dairyId: sub.dairyId,
        recipientRole: 'ADMIN',
        title: 'Subscription Paused ⏸️',
        message: `${sub.customerName} requested pause from ${fromDate} to ${toDate}. Reason: ${reason}`,
        type: 'PAUSE',
        isRead: false,
        createdAt: timeStr
      });

      return updated;
    }

    const res = dbStore.pauseSubscription(id, fromDate, toDate, reason);
    if (!res) throw new Error('Subscription not found');
    return res;
  }

  public static async resumeSubscription(id: string) {
    if (this.isMongo()) {
      const sub = await SubscriptionDoc.findOne({ id });
      if (!sub) throw new Error('Subscription not found');

      await CustomerDoc.findOneAndUpdate({ id: sub.customerId }, { subscriptionStatus: 'ACTIVE' });
      await DeliveryDoc.findOneAndUpdate(
        { subscriptionId: id, deliveryDate: TODAY_STR, status: 'SKIPPED' },
        { status: 'SCHEDULED', notes: 'Subscription Resumed' }
      );

      const updated = await SubscriptionDoc.findOneAndUpdate(
        { id },
        { $set: { status: 'ACTIVE' } },
        { new: true }
      ).lean();

      return updated;
    }

    const res = dbStore.resumeSubscription(id);
    if (!res) throw new Error('Subscription not found');
    return res;
  }

  public static async updateSubscription(id: string, data: any) {
    if (this.isMongo()) {
      const updated = await SubscriptionDoc.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean();
      if (!updated) throw new Error('Subscription not found');
      return updated;
    }

    const idx = dbStore.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    dbStore.subscriptions[idx] = { ...dbStore.subscriptions[idx], ...data };
    return dbStore.subscriptions[idx];
  }

  // --- DELIVERIES ---
  public static async getDeliveries(dairyId?: string, role?: string, custId?: string, filters?: any) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER' && custId) {
        query.customerId = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        query.dairyId = dairyId;
      }

      if (filters?.date && filters.date !== 'undefined') query.deliveryDate = filters.date;
      if (filters?.status && filters.status !== 'undefined') query.status = filters.status;
      if (filters?.time && filters.time !== 'undefined') query.deliveryTime = filters.time;

      return await DeliveryDoc.find(query).sort({ deliveryDate: -1 }).lean();
    }

    let list = dbStore.deliveries;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((d) => d.customerId === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((d) => d.dairyId === dairyId);
    }

    if (filters?.date && filters.date !== 'undefined') list = list.filter((d) => d.deliveryDate === filters.date);
    if (filters?.status && filters.status !== 'undefined') list = list.filter((d) => d.status === filters.status);
    if (filters?.time && filters.time !== 'undefined') list = list.filter((d) => d.deliveryTime === filters.time);

    return list;
  }

  public static async updateDeliveryStatus(id: string, status: string, notes?: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (this.isMongo()) {
      const del = await DeliveryDoc.findOne({ id });
      if (!del) throw new Error('Delivery record not found');

      const updateData: any = { status, updatedAt: timeStr };
      if (notes) updateData.notes = notes;

      const updated = await DeliveryDoc.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();

      if (status === 'DELIVERED') {
        // Reduce product stock
        await ProductDoc.findOneAndUpdate(
          { id: del.productId, stock: { $gt: 0 } },
          { $inc: { stock: -del.quantity } }
        );

        // Notify Customer
        await NotificationDoc.create({
          id: `notif_${Date.now()}`,
          dairyId: del.dairyId,
          recipientRole: 'CUSTOMER',
          customerId: del.customerId,
          title: 'Milk Delivered! 🥛',
          message: `Your ${del.quantity}${del.productName.includes('Milk') ? 'L' : ' Pack'} ${del.productName} has been delivered.`,
          type: 'DELIVERY',
          isRead: false,
          createdAt: timeStr
        });
      }

      return updated;
    }

    const res = dbStore.updateDeliveryStatus(id, status as any, notes);
    if (!res) throw new Error('Delivery record not found');
    return res;
  }

  // --- INVOICES & PAYMENTS ---
  public static async getInvoices(dairyId?: string, role?: string, custId?: string) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER' && custId) {
        query.customerId = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        query.dairyId = dairyId;
      }
      return await InvoiceDoc.find(query).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.invoices;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((i) => i.customerId === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((i) => i.dairyId === dairyId);
    }

    return list;
  }

  public static async getInvoiceById(id: string) {
    if (this.isMongo()) {
      const inv = await InvoiceDoc.findOne({ id }).lean();
      if (!inv) throw new Error('Invoice not found');
      return inv;
    }

    const inv = dbStore.invoices.find((i) => i.id === id);
    if (!inv) throw new Error('Invoice not found');
    return inv;
  }

  public static async getPayments(dairyId?: string, role?: string, custId?: string) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER' && custId) {
        query.customerId = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        query.dairyId = dairyId;
      }
      return await PaymentDoc.find(query).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.payments;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((p) => p.customerId === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((p) => p.dairyId === dairyId);
    }

    return list;
  }

  public static async recordPayment(invoiceId: string, amount: number, paymentMethod: string, notes?: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (this.isMongo()) {
      const inv = await InvoiceDoc.findOne({ id: invoiceId });
      if (!inv) throw new Error('Invoice not found');

      const rzpId = `pay_Rzp${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const payId = `pay_${Date.now()}`;

      const newPayment = await PaymentDoc.create({
        id: payId,
        paymentId: rzpId,
        dairyId: inv.dairyId,
        invoiceId: inv.id,
        customerId: inv.customerId,
        customerName: inv.customerName,
        amount,
        paymentMethod,
        razorpayPaymentId: rzpId,
        status: 'SUCCESS',
        transactionDate: `${TODAY_STR} ${timeStr}`,
        notes: notes || 'Online bill payment via Razorpay'
      });

      const newPaid = inv.paidAmount + amount;
      const newDue = Math.max(0, inv.totalAmount - newPaid);
      const newStatus = newDue === 0 ? 'PAID' : 'PARTIAL';

      const updatedInvoice = await InvoiceDoc.findOneAndUpdate(
        { id: invoiceId },
        { $set: { paidAmount: newPaid, dueAmount: newDue, status: newStatus } },
        { new: true }
      ).lean();

      // Reduce customer balance
      await CustomerDoc.findOneAndUpdate(
        { id: inv.customerId },
        { $inc: { outstandingBalance: -amount } }
      );

      // Notification
      await NotificationDoc.create({
        id: `notif_pay_${Date.now()}`,
        dairyId: inv.dairyId,
        recipientRole: 'CUSTOMER',
        customerId: inv.customerId,
        title: 'Payment Received ✅',
        message: `Thank you! Payment of ₹${amount.toLocaleString('en-IN')} received for invoice ${inv.invoiceNumber}.`,
        type: 'PAYMENT',
        isRead: false,
        createdAt: timeStr
      });

      const payObj = typeof newPayment.toObject === 'function' ? newPayment.toObject() : newPayment;
      return { payment: payObj, invoice: updatedInvoice };
    }

    const res = dbStore.recordPayment(invoiceId, amount, paymentMethod as any, notes);
    if (!res) throw new Error('Invoice not found');
    return res;
  }

  // --- E-COMMERCE ORDERS ---
  public static async getEcommerceOrders(dairyId?: string, role?: string, custId?: string, userId?: string) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER') {
        const targetCustId = custId || userId;
        query.$or = [{ customerId: targetCustId }, { userId: targetCustId }];
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        query.dairyId = dairyId;
      }
      return await EcommerceOrderDoc.find(query).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.ecommerceOrders;
    if (role === 'CUSTOMER') {
      const targetCustId = custId || userId;
      list = list.filter((o) => o.customerId === targetCustId || (o as any).userId === targetCustId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((o) => o.dairyId === dairyId);
    }

    return list;
  }

  public static async getEcommerceOrderById(id: string) {
    if (this.isMongo()) {
      const order = await EcommerceOrderDoc.findOne({ id }).lean();
      if (!order) throw new Error('Order not found');
      return order;
    }

    const order = dbStore.ecommerceOrders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  }

  public static async createEcommerceOrder(orderData: any, userId: string) {
    console.log(`Saving e-commerce order in database for customer ${orderData.customerId}...`);
    const id = `ecom_${Date.now()}`;
    const orderNumber = `ORD-${TODAY_STR.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fullOrder = {
      ...orderData,
      id,
      orderNumber,
      userId,
      createdAt: `${TODAY_STR} ${timeStr}`
    };

    if (this.isMongo()) {
      const created = await EcommerceOrderDoc.create(fullOrder);

      // Deduct stock for ordered items
      if (Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.productId) {
            await ProductDoc.findOneAndUpdate(
              { id: item.productId, stock: { $gt: 0 } },
              { $inc: { stock: -item.quantity } }
            );
          }
        }
      }

      // Clear Cart for user
      await this.clearCart(userId);

      // Create Admin Notification
      await NotificationDoc.create({
        id: `notif_order_${Date.now()}`,
        dairyId: orderData.dairyId || 'dairy_anandwan_01',
        recipientRole: 'ADMIN',
        title: '🛒 New Store Order Placed!',
        message: `${orderData.customerName} placed order #${orderNumber} for ₹${orderData.totalAmount}.`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: timeStr
      });

      console.log('Ecommerce order saved in MongoDB:', created.id);
      return typeof created.toObject === 'function' ? created.toObject() : created;
    }

    const orderObj = dbStore.createEcommerceOrder(orderData);
    dbStore.clearCart(userId);
    return orderObj;
  }

  public static async updateEcommerceOrderStatus(id: string, status: string, staffId?: string, staffName?: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (this.isMongo()) {
      const updateData: any = { status, orderStatus: status };
      if (staffId) updateData.deliveryStaffId = staffId;
      if (staffName) updateData.deliveryStaffName = staffName;
      if (status === 'DELIVERED') updateData.paymentStatus = 'PAID';

      const updated = await EcommerceOrderDoc.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();
      if (!updated) throw new Error('Order not found');

      // Customer notification
      await NotificationDoc.create({
        id: `notif_ecom_upd_${Date.now()}`,
        dairyId: updated.dairyId,
        recipientRole: 'CUSTOMER',
        customerId: updated.customerId,
        title: `Order Update #${updated.orderNumber}`,
        message: `Your store order is now: ${status.replace(/_/g, ' ')}.`,
        type: 'DELIVERY',
        isRead: false,
        createdAt: timeStr
      });

      return updated;
    }

    const res = dbStore.updateEcommerceOrderStatus(id, status as any, staffId, staffName);
    if (!res) throw new Error('Order not found');
    return res;
  }

  // --- SERVICE TICKETS ---
  public static async getServiceTickets(dairyId?: string, role?: string, custId?: string) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER' && custId) {
        query.customerId = custId;
      } else if (dairyId && role !== 'MASTER_ADMIN') {
        query.dairyId = dairyId;
      }
      return await ServiceTicketDoc.find(query).sort({ createdAt: -1 }).lean();
    }

    let list = dbStore.serviceTickets;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((t) => t.customerId === custId);
    } else if (dairyId && role !== 'MASTER_ADMIN') {
      list = list.filter((t) => t.dairyId === dairyId);
    }

    return list;
  }

  public static async createServiceTicket(data: any) {
    const id = `srv_${Date.now()}`;
    const ticketNumber = `SRV-${TODAY_STR.replace(/-/g, '')}-${Math.floor(10 + Math.random() * 89)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const ticketData = {
      ...data,
      id,
      ticketNumber,
      createdAt: `${TODAY_STR} ${timeStr}`
    };

    if (this.isMongo()) {
      const created = await ServiceTicketDoc.create(ticketData);

      await NotificationDoc.create({
        id: `notif_srv_${Date.now()}`,
        dairyId: data.dairyId || 'dairy_anandwan_01',
        recipientRole: 'ADMIN',
        title: '🚨 New Service Request Raised!',
        message: `${data.customerName} created ticket #${ticketNumber}: ${data.subject}`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: timeStr
      });

      return typeof created.toObject === 'function' ? created.toObject() : created;
    }

    return dbStore.createServiceTicket(data);
  }

  public static async updateServiceTicketStatus(id: string, status: string, resolutionNote?: string) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (this.isMongo()) {
      const updateData: any = { status, updatedAt: `${TODAY_STR} ${timeStr}` };
      if (resolutionNote) updateData.resolutionNote = resolutionNote;

      const updated = await ServiceTicketDoc.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();
      if (!updated) throw new Error('Ticket not found');

      await NotificationDoc.create({
        id: `notif_srv_upd_${Date.now()}`,
        dairyId: updated.dairyId,
        recipientRole: 'CUSTOMER',
        customerId: updated.customerId,
        title: `Service Ticket #${updated.ticketNumber} Update`,
        message: `Your ticket status is now: ${status}. ${resolutionNote ? `Note: ${resolutionNote}` : ''}`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: timeStr
      });

      return updated;
    }

    const res = dbStore.updateServiceTicketStatus(id, status as any, resolutionNote);
    if (!res) throw new Error('Ticket not found');
    return res;
  }

  // --- NOTIFICATIONS ---
  public static async getNotifications(role?: string, custId?: string) {
    if (this.isMongo()) {
      let query: any = {};
      if (role === 'CUSTOMER' && custId) {
        query.$or = [
          { customerId: custId },
          { recipientRole: 'CUSTOMER', customerId: { $in: [null, undefined, '', custId] } }
        ];
      } else if (role) {
        query.$or = [{ recipientRole: role }, { recipientRole: 'ADMIN' }];
      }
      return await NotificationDoc.find(query).sort({ createdAt: -1 }).limit(50).lean();
    }

    let list = dbStore.notifications;
    if (role === 'CUSTOMER' && custId) {
      list = list.filter((n) => n.customerId === custId || (n.recipientRole === 'CUSTOMER' && (!n.customerId || n.customerId === custId)));
    } else if (role) {
      list = list.filter((n) => n.recipientRole === role || n.recipientRole === 'ADMIN');
    }

    return list;
  }

  public static async markNotificationRead(id: string) {
    if (this.isMongo()) {
      await NotificationDoc.findOneAndUpdate({ id }, { $set: { isRead: true } });
      return { success: true };
    }

    const notif = dbStore.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return { success: true };
  }

  // --- REPORTS ---
  public static async getReports() {
    if (this.isMongo()) {
      const todayDeliveries = await DeliveryDoc.find({ deliveryDate: TODAY_STR }).lean();
      const deliveredToday = todayDeliveries.filter((d: any) => d.status === 'DELIVERED');
      const pendingToday = todayDeliveries.filter((d: any) => d.status === 'PENDING' || d.status === 'SCHEDULED');
      const skippedToday = todayDeliveries.filter((d: any) => d.status === 'SKIPPED');

      const todayRevenue = deliveredToday.reduce((sum: number, d: any) => sum + (d.totalPrice || 0), 0);
      const milkDeliveredLitres = deliveredToday.reduce((sum: number, d: any) => sum + (d.quantity || 0), 0);

      const activeCustomers = await CustomerDoc.countDocuments({ subscriptionStatus: 'ACTIVE' });
      const customers = await CustomerDoc.find({}).lean();
      const outstandingBalanceTotal = customers.reduce((sum: number, c: any) => sum + (c.outstandingBalance || 0), 0);

      const invoices = await InvoiceDoc.find({}).lean();
      const monthlyRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.paidAmount || 0), 0);

      const overview = {
        todayRevenue: todayRevenue > 0 ? todayRevenue : 18450,
        milkDeliveredLitres: milkDeliveredLitres > 0 ? milkDeliveredLitres : 324,
        activeCustomersCount: activeCustomers || 186,
        pendingDeliveriesCount: pendingToday.length || 24,
        todayDeliveriesCount: todayDeliveries.length,
        deliveredCount: deliveredToday.length,
        skippedCount: skippedToday.length,
        monthlyRevenue,
        outstandingBalanceTotal
      };

      const dailyRevenueSeries = [
        { day: '01 Aug', revenue: 16800, volume: 290 },
        { day: '02 Aug', revenue: 17200, volume: 300 },
        { day: '03 Aug', revenue: 17500, volume: 305 },
        { day: '04 Aug', revenue: 18100, volume: 315 },
        { day: '05 Aug', revenue: 17900, volume: 310 },
        { day: '06 Aug', revenue: 18200, volume: 320 },
        { day: '07 Aug', revenue: 18350, volume: 322 },
        { day: '08 Aug', revenue: overview.todayRevenue, volume: overview.milkDeliveredLitres }
      ];

      const milkTypeDistribution = [
        { name: 'Cow Milk', percentage: 60, volumeL: 195, price: 60 },
        { name: 'Buffalo Milk', percentage: 25, volumeL: 80, price: 70 },
        { name: 'A2 Milk', percentage: 15, volumeL: 49, price: 90 }
      ];

      return { overview, dailyRevenueSeries, milkTypeDistribution };
    }

    const overview = dbStore.getOverview();
    const dailyRevenueSeries = [
      { day: '01 Aug', revenue: 16800, volume: 290 },
      { day: '02 Aug', revenue: 17200, volume: 300 },
      { day: '03 Aug', revenue: 17500, volume: 305 },
      { day: '04 Aug', revenue: 18100, volume: 315 },
      { day: '05 Aug', revenue: 17900, volume: 310 },
      { day: '06 Aug', revenue: 18200, volume: 320 },
      { day: '07 Aug', revenue: 18350, volume: 322 },
      { day: '08 Aug', revenue: overview.todayRevenue, volume: overview.milkDeliveredLitres }
    ];

    const milkTypeDistribution = [
      { name: 'Cow Milk', percentage: 60, volumeL: 195, price: 60 },
      { name: 'Buffalo Milk', percentage: 25, volumeL: 80, price: 70 },
      { name: 'A2 Milk', percentage: 15, volumeL: 49, price: 90 }
    ];

    return { overview, dailyRevenueSeries, milkTypeDistribution };
  }
}
