import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../data/mockDatabase';
import { connectMongoDB } from '../db/mongodb';
import { DbService } from '../services/dbService';

const app = express();

// Enable CORS for all routes and origin requests
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-user-role',
    'X-User-Role',
    'x-custom-header'
  ],
  credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Explicit fallback CORS header middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-role, X-User-Role');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Auto-connect MongoDB middleware (serverless-safe with cached connection)
app.use(async (_req, _res, next) => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (mongoUri) {
      await connectMongoDB();
    }
  } catch (err) {
    console.error('[MongoDB Middleware Error]', err);
  }
  next();
});

// Health check endpoint (confirms API and Database status)
app.get('/api/health', async (_req, res) => {
  let isConnected = false;
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (mongoUri) {
      isConnected = await connectMongoDB();
    }
  } catch (_) {
    isConnected = false;
  }

  res.json({
    status: 'ok',
    app: 'Anandwan Milk Dairy API',
    database: isConnected || DbService.isMongo() ? 'MongoDB Connected' : 'In-Memory Store (Set MONGODB_URI to switch)',
    time: new Date().toISOString()
  });
});

// JWT Authentication Middleware for all protected /api routes
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const cleanPath = req.path.toLowerCase().replace(/\/$/, '');
  const isPublic =
    cleanPath === '' ||
    cleanPath === '/health' ||
    cleanPath.startsWith('/health/') ||
    cleanPath === '/auth/login' ||
    cleanPath.startsWith('/auth/login/') ||
    cleanPath === '/auth/register' ||
    cleanPath.startsWith('/auth/register/') ||
    cleanPath === '/auth/token' ||
    cleanPath.startsWith('/auth/token/') ||
    (req.method === 'GET' && (cleanPath === '/products' || cleanPath.startsWith('/products/')));

  if (isPublic) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
});

// --- AUTH & PROFILE ROUTES ---
app.get('/api/auth/me', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let authUser: any = (req as any).user;

    if (!authUser && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        authUser = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        // Invalid token
      }
    }

    if (!authUser || !authUser.userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
    }

    const authMe = await DbService.getAuthMe(authUser.userId);
    if (!authMe) {
      return res.status(401).json({ error: 'User account not found' });
    }

    res.json(authMe);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const {
      phoneOrEmail,
      role,
      password,
    } = req.body;

    if (!phoneOrEmail) {
      return res.status(400).json({
        error: 'Mobile number or email is required',
      });
    }

    if (!role) {
      return res.status(400).json({
        error: 'Role is required',
      });
    }

    if (!['CUSTOMER', 'OWNER', 'STAFF', 'MASTER_ADMIN'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
      });
    }

    const authResult = await DbService.loginUser(
      phoneOrEmail,
      role,
      password
    );

    return res.json(authResult);
  } catch (err: any) {
    return res.status(401).json({
      error: err.message || 'Login failed',
    });
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, phone, email, password, address, milkType, quantity } = req.body;
    if (!name || !phone || !address) {
      return res.status(400).json({ error: 'Name, phone, and delivery address are required' });
    }

    const registered = await DbService.registerCustomer({ name, phone, email, password, address, milkType, quantity });
    res.status(201).json(registered);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.get('/api/auth/token', async (req, res, next) => {
  try {
    const role = (req.query.role as string) || 'ADMIN';
    const phone = (req.query.phone as string) || '9823012345';
    const authResult = await DbService.loginUser(phone, role);
    res.json(authResult);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/token', async (req, res, next) => {
  try {
    const { phoneOrEmail, role } = req.body;
    const authResult = await DbService.loginUser(phoneOrEmail || '9823012345', role);
    res.json(authResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Token generation failed' });
  }
});

app.get('/api/profile', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (!authUser?.userId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await DbService.getProfile(authUser.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

app.put('/api/profile', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (!authUser?.userId) return res.status(401).json({ error: 'Unauthorized' });

    const updated = await DbService.updateProfile(authUser.userId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// --- DAIRY STORE PROFILE ---
app.get('/api/dairy', async (_req, res, next) => {
  try {
    const dairy = await DbService.getDairy();
    res.json(dairy);
  } catch (err) {
    next(err);
  }
});

app.put('/api/dairy', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role !== 'ADMIN' && authUser?.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const dairy = await DbService.updateDairy(req.body);
    res.json(dairy);
  } catch (err) {
    next(err);
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (_req, res, next) => {
  try {
    const products = await DbService.getProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role !== 'ADMIN' && authUser?.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const product = await DbService.createProduct(authUser.dairyId, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role !== 'ADMIN' && authUser?.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const updated = await DbService.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role !== 'ADMIN' && authUser?.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const deleted = await DbService.deleteProduct(req.params.id);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
});

// --- CART ROUTES ---
app.get('/api/cart', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const cart = await DbService.getCart(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.post('/api/cart/items', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { product, productId, quantity } = req.body;
    let targetProduct = product;

    if (!targetProduct && productId) {
      const products = await DbService.getProducts();
      targetProduct = products.find((p: any) => p.id === productId);
    }

    if (!targetProduct) return res.status(404).json({ error: 'Product not found' });

    const cart = await DbService.addToCart(userId, targetProduct, Number(quantity || 1));
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.put('/api/cart/items/:productId', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { quantity } = req.body;
    const cart = await DbService.updateCartQuantity(userId, req.params.productId, Number(quantity));
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/cart/items/:productId', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const cart = await DbService.removeFromCart(userId, req.params.productId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/cart', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const cart = await DbService.clearCart(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// --- WISHLIST ROUTES ---
app.get('/api/wishlist', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const wishlist = await DbService.getWishlist(userId);
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
});

app.post('/api/wishlist/toggle', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const wishlist = await DbService.toggleWishlist(userId, productId);
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
});

// --- ADDRESSES ROUTES ---
app.get('/api/addresses', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const addresses = await DbService.getAddresses(userId);
    res.json(addresses);
  } catch (err) {
    next(err);
  }
});

app.post('/api/addresses', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { label, addressLine, city, pincode } = req.body;
    if (!addressLine) return res.status(400).json({ error: 'Address line is required' });

    const addr = await DbService.addAddress(userId, { label, addressLine, city, pincode });
    res.status(201).json(addr);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/addresses/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await DbService.deleteAddress(userId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- CUSTOMERS ROUTES ---
app.get('/api/customers', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const search = (req.query.search as string) || '';
    const custId = authUser?.customerId || authUser?.userId;

    const customers = await DbService.getCustomers(authUser?.dairyId, authUser?.role, custId, search);
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

app.get('/api/customers/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      if (req.params.id !== custId && req.params.id !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Access denied to another customer\'s details' });
      }
    }

    const details = await DbService.getCustomerDetails(req.params.id);
    res.json(details);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Customer not found' });
  }
});

app.put('/api/customers/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      if (req.params.id !== custId) {
        return res.status(403).json({ error: 'Forbidden: Cannot update another customer\'s record' });
      }
    }

    const updated = await DbService.updateCustomer(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Customer not found' });
  }
});

// --- SUBSCRIPTIONS ROUTES ---
app.get('/api/subscriptions', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getSubscriptions(authUser?.dairyId, authUser?.role, custId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/api/subscriptions/:id/pause', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const { fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'From Date and To Date are required for pausing' });
    }

    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      const sub = (await DbService.getSubscriptions(undefined, 'CUSTOMER', custId)).find((s: any) => s.id === req.params.id);
      if (!sub) {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another customer\'s subscription' });
      }
    }

    const updated = await DbService.pauseSubscription(req.params.id, fromDate, toDate, reason || 'Vacation');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to pause subscription' });
  }
});

app.post('/api/subscriptions/:id/resume', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      const sub = (await DbService.getSubscriptions(undefined, 'CUSTOMER', custId)).find((s: any) => s.id === req.params.id);
      if (!sub) {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another customer\'s subscription' });
      }
    }

    const updated = await DbService.resumeSubscription(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to resume subscription' });
  }
});

app.put('/api/subscriptions/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      const sub = (await DbService.getSubscriptions(undefined, 'CUSTOMER', custId)).find((s: any) => s.id === req.params.id);
      if (!sub) {
        return res.status(403).json({ error: 'Forbidden: You cannot update another customer\'s subscription' });
      }
    }

    const updated = await DbService.updateSubscription(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update subscription' });
  }
});

// --- DELIVERIES ROUTES ---
app.get('/api/deliveries', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getDeliveries(authUser?.dairyId, authUser?.role, custId, req.query);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.put('/api/deliveries/:id/status', async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await DbService.updateDeliveryStatus(req.params.id, status, notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update delivery status' });
  }
});

// --- INVOICES & PAYMENTS ---
app.get(
  '/api/invoices/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const authUser = (req as any).user;

      if (!authUser) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const invoice = await DbService.getInvoiceById(
        req.params.id
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      if (authUser.role === 'CUSTOMER') {
        const customerId =
          authUser.customerId || authUser.userId;

        if (invoice.customerId !== customerId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }

      return res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
);

app.get('/api/invoices/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const inv = await DbService.getInvoiceById(req.params.id);

    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      if (inv.customerId !== custId) {
        return res.status(403).json({ error: 'Forbidden: Access denied to another customer\'s invoice' });
      }
    }

    res.json(inv);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Invoice not found' });
  }
});

app.get('/api/payments', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getPayments(authUser?.dairyId, authUser?.role, custId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/api/payments', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const { invoiceId, amount, paymentMethod, notes } = req.body;
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing invoiceId, amount or paymentMethod' });
    }

    const inv = await DbService.getInvoiceById(invoiceId);
    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      if (inv.customerId !== custId) {
        return res.status(403).json({ error: 'Forbidden: Access denied to another customer\'s invoice' });
      }
    }

    const result = await DbService.recordPayment(invoiceId, Number(amount), paymentMethod, notes);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment recording failed' });
  }
});

// --- E-COMMERCE ORDERS ROUTES ---
app.get('/api/ecommerce/orders', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getEcommerceOrders(authUser?.dairyId, authUser?.role, custId, authUser?.userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.get('/api/ecommerce/orders/:id', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const order = await DbService.getEcommerceOrderById(req.params.id);

    if (authUser?.role === 'CUSTOMER') {
      const custId = authUser.customerId || authUser.userId;
      if (order.customerId !== custId && (order as any).userId !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Access denied to another customer\'s order' });
      }
    }

    res.json(order);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Order not found' });
  }
});

app.post('/api/ecommerce/orders', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (!authUser?.userId) return res.status(401).json({ error: 'Unauthorized' });

    const custId = authUser.customerId || authUser.userId;
    const { deliveryAddress, items, subtotal, deliveryFee, totalAmount, paymentMethod, paymentStatus, deliverySlot } = req.body;

    if (!items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required e-commerce order details' });
    }

    const orderData = {
      dairyId: authUser.dairyId || 'dairy_anandwan_01',
      customerId: custId,
      customerName: authUser.name || 'Customer',
      customerPhone: authUser.phone || '',
      deliveryAddress,
      items,
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || 'RAZORPAY_UPI',
      paymentStatus: paymentStatus || 'PAID',
      deliverySlot: deliverySlot || 'Express 60-Min Delivery',
      status: 'ORDER_PLACED'
    };

    const order = await DbService.createEcommerceOrder(orderData, authUser.userId);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

app.put('/api/ecommerce/orders/:id/status', async (req, res, next) => {
  try {
    const { status, staffId, staffName } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await DbService.updateEcommerceOrderStatus(req.params.id, status, staffId, staffName);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
});

// --- SERVICE TICKETS / SUPPORT DESK ROUTES ---
app.get('/api/service-tickets', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getServiceTickets(authUser?.dairyId, authUser?.role, custId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/api/service-tickets', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

    const custId = authUser.customerId || authUser.userId;
    const { category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ error: 'Category, subject, and description are required' });
    }

    const ticketData = {
      dairyId: authUser.dairyId || 'dairy_anandwan_01',
      customerId: custId,
      customerName: authUser.name || 'Customer',
      customerPhone: authUser.phone || '',
      category,
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN'
    };

    const ticket = await DbService.createServiceTicket(ticketData);
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create ticket' });
  }
});

app.put('/api/service-tickets/:id/status', async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await DbService.updateServiceTicketStatus(req.params.id, status, resolutionNote);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update ticket status' });
  }
});

// --- NOTIFICATIONS ROUTES ---
app.get('/api/notifications', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    const custId = authUser?.customerId || authUser?.userId;

    const list = await DbService.getNotifications(authUser?.role, custId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.put('/api/notifications/:id/read', async (req, res, next) => {
  try {
    const result = await DbService.markNotificationRead(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- REPORTS / ANALYTICS ---
app.get('/api/reports', async (req, res, next) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.role !== 'ADMIN' && authUser?.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const reports = await DbService.getReports();
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// Fallback 404 for API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler returning JSON
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Internal Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

export { app };
export default app;
