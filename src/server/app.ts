import express from 'express';
import cors from 'cors';
import { dbStore } from '../data/mockDatabase';
import { connectMongoDB } from '../db/mongodb';

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
    if (process.env.MONGODB_URI) {
      await connectMongoDB();
    }
  } catch (err) {
    console.error('[MongoDB Middleware Error]', err);
  }
  next();
});

// Health check endpoint (confirms API and MongoDB status)
app.get('/api/health', async (_req, res) => {
  let isConnected = false;
  try {
    if (process.env.MONGODB_URI) {
      isConnected = await connectMongoDB();
    }
  } catch (_) {
    isConnected = false;
  }

  res.json({
    status: 'ok',
    app: 'Anandwan Milk Dairy API',
    database: isConnected ? 'MongoDB Connected' : 'In-Memory Store (Set MONGODB_URI to switch)',
    time: new Date().toISOString()
  });
});

// Auth / Me / Switch Role
app.get('/api/auth/me', (req, res) => {
  const roleHeader = (req.headers['x-user-role'] as string) || 'ADMIN';
  const user = dbStore.users.find((u) => u.role === roleHeader) || dbStore.users[0];
  res.json({ user, dairy: dbStore.dairy });
});

// Dairy Store profile
app.get('/api/dairy', (_req, res) => {
  res.json(dbStore.dairy);
});

app.put('/api/dairy', (req, res) => {
  dbStore.dairy = { ...dbStore.dairy, ...req.body };
  res.json(dbStore.dairy);
});

// Customers
app.get('/api/customers', (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  let list = dbStore.customers;
  if (search) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.address.toLowerCase().includes(search) ||
        c.milkType.toLowerCase().includes(search)
    );
  }
  res.json(list);
});

app.get('/api/customers/:id', (req, res) => {
  const cust = dbStore.customers.find((c) => c.id === req.params.id);
  if (!cust) return res.status(404).json({ error: 'Customer not found' });
  const sub = dbStore.subscriptions.find((s) => s.customerId === cust.id);
  const deliveries = dbStore.deliveries.filter((d) => d.customerId === cust.id);
  const invoices = dbStore.invoices.filter((i) => i.customerId === cust.id);
  res.json({ customer: cust, subscription: sub, deliveries, invoices });
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, phone, address, city, pincode, milkType, quantityPerDay, deliveryTime, startDate, email, notes } = req.body;
    if (!name || !phone || !address || !milkType || !quantityPerDay) {
      return res.status(400).json({ error: 'Missing required customer fields' });
    }

    const newCust = dbStore.addCustomer({
      dairyId: dbStore.dairy.id,
      name,
      phone,
      email,
      address,
      city: city || 'Amravati',
      pincode: pincode || '444601',
      milkType,
      quantityPerDay: Number(quantityPerDay),
      deliveryTime: deliveryTime || 'MORNING',
      subscriptionStatus: 'ACTIVE',
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes
    });

    res.status(201).json(newCust);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const idx = dbStore.customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Customer not found' });
  dbStore.customers[idx] = { ...dbStore.customers[idx], ...req.body };
  res.json(dbStore.customers[idx]);
});

// Products
app.get('/api/products', (_req, res) => {
  res.json(dbStore.products);
});

app.post('/api/products', (req, res) => {
  const { name, category, price, unit, stock, description } = req.body;
  const newProd = {
    id: `prod_${Date.now()}`,
    dairyId: dbStore.dairy.id,
    name,
    category: category || 'MILK',
    price: Number(price),
    unit: unit || 'L',
    stock: Number(stock || 100),
    status: 'ACTIVE' as const,
    description,
    icon: category === 'MILK' ? '🥛' : '🧀'
  };
  dbStore.products.unshift(newProd);
  res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const idx = dbStore.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  dbStore.products[idx] = { ...dbStore.products[idx], ...req.body };
  res.json(dbStore.products[idx]);
});

// Subscriptions
app.get('/api/subscriptions', (_req, res) => {
  res.json(dbStore.subscriptions);
});

app.post('/api/subscriptions/:id/pause', (req, res) => {
  const { fromDate, toDate, reason } = req.body;
  if (!fromDate || !toDate) {
    return res.status(400).json({ error: 'From Date and To Date are required for pausing' });
  }
  const updated = dbStore.pauseSubscription(req.params.id, fromDate, toDate, reason || 'Vacation');
  if (!updated) return res.status(404).json({ error: 'Subscription not found' });
  res.json(updated);
});

app.post('/api/subscriptions/:id/resume', (req, res) => {
  const updated = dbStore.resumeSubscription(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Subscription not found' });
  res.json(updated);
});

app.put('/api/subscriptions/:id', (req, res) => {
  const idx = dbStore.subscriptions.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Subscription not found' });
  dbStore.subscriptions[idx] = { ...dbStore.subscriptions[idx], ...req.body };
  res.json(dbStore.subscriptions[idx]);
});

// Deliveries
app.get('/api/deliveries', (req, res) => {
  const { date, status, customerId, time } = req.query;
  let list = dbStore.deliveries;
  if (date) list = list.filter((d) => d.deliveryDate === date);
  if (status) list = list.filter((d) => d.status === status);
  if (customerId) list = list.filter((d) => d.customerId === customerId);
  if (time) list = list.filter((d) => d.deliveryTime === time);
  res.json(list);
});

app.put('/api/deliveries/:id/status', (req, res) => {
  const { status, notes } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = dbStore.updateDeliveryStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Delivery record not found' });
  res.json(updated);
});

// Invoices & Bills
app.get('/api/invoices', (req, res) => {
  const { customerId } = req.query;
  let list = dbStore.invoices;
  if (customerId) list = list.filter((i) => i.customerId === customerId);
  res.json(list);
});

app.get('/api/invoices/:id', (req, res) => {
  const inv = dbStore.invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  res.json(inv);
});

// Payments
app.get('/api/payments', (req, res) => {
  const { customerId } = req.query;
  let list = dbStore.payments;
  if (customerId) list = list.filter((p) => p.customerId === customerId);
  res.json(list);
});

app.post('/api/payments', (req, res) => {
  const { invoiceId, amount, paymentMethod, notes } = req.body;
  if (!invoiceId || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Missing invoiceId, amount or paymentMethod' });
  }
  const result = dbStore.recordPayment(invoiceId, Number(amount), paymentMethod, notes);
  if (!result) return res.status(404).json({ error: 'Invoice not found' });
  res.status(201).json(result);
});

// Reports
app.get('/api/reports', (_req, res) => {
  const overview = dbStore.getOverview();
  const dailyRevenueSeries = [
    { day: '01 Aug', revenue: 16800, volume: 290 },
    { day: '02 Aug', revenue: 17200, volume: 300 },
    { day: '03 Aug', revenue: 17500, volume: 305 },
    { day: '04 Aug', revenue: 18100, volume: 315 },
    { day: '05 Aug', revenue: 17900, volume: 310 },
    { day: '06 Aug', revenue: 18200, volume: 320 },
    { day: '07 Aug', revenue: 18350, volume: 322 },
    { day: '08 Aug', revenue: overview.todayRevenue, volume: overview.milkDeliveredLitres },
  ];

  const milkTypeDistribution = [
    { name: 'Cow Milk', percentage: 60, volumeL: 195, price: 60 },
    { name: 'Buffalo Milk', percentage: 25, volumeL: 80, price: 70 },
    { name: 'A2 Milk', percentage: 15, volumeL: 49, price: 90 },
  ];

  res.json({
    overview,
    dailyRevenueSeries,
    milkTypeDistribution,
  });
});

// E-Commerce Orders
app.get('/api/ecommerce/orders', (req, res) => {
  const { customerId } = req.query;
  const list = dbStore.getEcommerceOrders(customerId as string | undefined);
  res.json(list);
});

app.post('/api/ecommerce/orders', (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus,
      deliverySlot
    } = req.body;

    if (!items || items.length === 0 || !customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required e-commerce order details' });
    }

    const order = dbStore.createEcommerceOrder({
      dairyId: dbStore.dairy.id,
      customerId: customerId || 'cust_rahul_01',
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || 'RAZORPAY_UPI',
      paymentStatus: paymentStatus || 'PAID',
      deliverySlot: deliverySlot || 'Express 60-Min Delivery',
      status: 'ORDER_PLACED'
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

app.put('/api/ecommerce/orders/:id/status', (req, res) => {
  const { status, staffId, staffName } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const order = dbStore.updateEcommerceOrderStatus(req.params.id, status, staffId, staffName);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { phoneOrEmail, role, password } = req.body;
    if (!phoneOrEmail) return res.status(400).json({ error: 'Mobile number or email is required' });

    const authResult = dbStore.authenticateUser(phoneOrEmail, role, password);
    res.json(authResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Login failed' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, phone, email, address, milkType, quantity } = req.body;
    if (!name || !phone || !address) {
      return res.status(400).json({ error: 'Name, phone, and delivery address are required' });
    }

    const registered = dbStore.registerCustomer({ name, phone, email, address, milkType, quantity });
    res.status(201).json(registered);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Service Tickets / Customer Support Desk Routes
app.get('/api/service-tickets', (req, res) => {
  const { customerId } = req.query;
  const tickets = dbStore.getServiceTickets(customerId as string | undefined);
  res.json(tickets);
});

app.post('/api/service-tickets', (req, res) => {
  try {
    const { customerId, customerName, customerPhone, category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ error: 'Category, subject, and description are required' });
    }

    const ticket = dbStore.createServiceTicket({
      dairyId: dbStore.dairy.id,
      customerId: customerId || 'cust_rahul_01',
      customerName: customerName || 'Rahul Patil',
      customerPhone: customerPhone || '+91 98230 11223',
      category,
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN'
    });

    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create ticket' });
  }
});

app.put('/api/service-tickets/:id/status', (req, res) => {
  const { status, resolutionNote } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const ticket = dbStore.updateServiceTicketStatus(req.params.id, status, resolutionNote);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const { customerId, role } = req.query;
  let list = dbStore.notifications;
  if (customerId) list = list.filter((n) => n.customerId === customerId);
  if (role) list = list.filter((n) => n.recipientRole === role || n.recipientRole === 'CUSTOMER');
  res.json(list);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = dbStore.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
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
