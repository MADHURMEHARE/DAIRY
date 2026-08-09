import {
  User,
  DairyStore,
  Customer,
  Product,
  Subscription,
  DeliveryRecord,
  Invoice,
  Payment,
  NotificationItem,
  DashboardOverview,
  EcommerceOrder,
  ServiceTicket,
  AuthSession
} from '../types';

export class ApiClient {
  private static userRole: string = 'ADMIN';
  private static baseUrl: string = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

  public static setRole(role: string) {
    this.userRole = role;
  }

  public static getRole(): string {
    return this.userRole;
  }

  public static setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public static getBaseUrl(): string {
    return this.baseUrl;
  }

  private static getUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-User-Role': this.userRole
    };
  }

  public static async getHealth(): Promise<{ status: string; app: string; database: string; time: string }> {
    const res = await fetch(this.getUrl('/api/health'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async getAuthMe(): Promise<{ user: User; dairy: DairyStore }> {
    const res = await fetch(this.getUrl('/api/auth/me'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async getDairy(): Promise<DairyStore> {
    const res = await fetch(this.getUrl('/api/dairy'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async updateDairy(data: Partial<DairyStore>): Promise<DairyStore> {
    const res = await fetch(this.getUrl('/api/dairy'), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getCustomers(search = ''): Promise<Customer[]> {
    const res = await fetch(this.getUrl(`/api/customers?search=${encodeURIComponent(search)}`), {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getCustomerDetails(id: string): Promise<{
    customer: Customer;
    subscription?: Subscription;
    deliveries: DeliveryRecord[];
    invoices: Invoice[];
  }> {
    const res = await fetch(this.getUrl(`/api/customers/${id}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async createCustomer(data: any): Promise<Customer> {
    const res = await fetch(this.getUrl('/api/customers'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create customer');
    }
    return res.json();
  }

  public static async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(this.getUrl(`/api/customers/${id}`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getProducts(): Promise<Product[]> {
    const res = await fetch(this.getUrl('/api/products'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(this.getUrl('/api/products'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(this.getUrl(`/api/products/${id}`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getSubscriptions(): Promise<Subscription[]> {
    const res = await fetch(this.getUrl('/api/subscriptions'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async pauseSubscription(id: string, fromDate: string, toDate: string, reason: string): Promise<Subscription> {
    const res = await fetch(this.getUrl(`/api/subscriptions/${id}/pause`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fromDate, toDate, reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to pause subscription');
    }
    return res.json();
  }

  public static async resumeSubscription(id: string): Promise<Subscription> {
    const res = await fetch(this.getUrl(`/api/subscriptions/${id}/resume`), {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const res = await fetch(this.getUrl(`/api/subscriptions/${id}`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getDeliveries(params?: { date?: string; status?: string; customerId?: string; time?: string }): Promise<DeliveryRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(this.getUrl(`/api/deliveries?${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async updateDeliveryStatus(id: string, status: string, notes?: string): Promise<DeliveryRecord> {
    const res = await fetch(this.getUrl(`/api/deliveries/${id}/status`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  }

  public static async getInvoices(customerId?: string): Promise<Invoice[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(this.getUrl(`/api/invoices${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async getPayments(customerId?: string): Promise<Payment[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(this.getUrl(`/api/payments${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async recordPayment(invoiceId: string, amount: number, paymentMethod: string, notes?: string): Promise<{ payment: Payment; invoice: Invoice }> {
    const res = await fetch(this.getUrl('/api/payments'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ invoiceId, amount, paymentMethod, notes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment failed');
    }
    return res.json();
  }

  public static async getReports(): Promise<{
    overview: DashboardOverview;
    dailyRevenueSeries: Array<{ day: string; revenue: number; volume: number }>;
    milkTypeDistribution: Array<{ name: string; percentage: number; volumeL: number; price: number }>;
  }> {
    const res = await fetch(this.getUrl('/api/reports'), { headers: this.getHeaders() });
    return res.json();
  }

  public static async getNotifications(customerId?: string): Promise<NotificationItem[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(this.getUrl(`/api/notifications${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async markNotificationRead(id: string): Promise<void> {
    await fetch(this.getUrl(`/api/notifications/${id}/read`), { method: 'PUT', headers: this.getHeaders() });
  }

  public static async getEcommerceOrders(customerId?: string): Promise<EcommerceOrder[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(this.getUrl(`/api/ecommerce/orders${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async createEcommerceOrder(orderData: any): Promise<EcommerceOrder> {
    const res = await fetch(this.getUrl('/api/ecommerce/orders'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  }

  public static async updateEcommerceOrderStatus(id: string, status: string, staffId?: string, staffName?: string): Promise<EcommerceOrder> {
    const res = await fetch(this.getUrl(`/api/ecommerce/orders/${id}/status`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, staffId, staffName })
    });
    return res.json();
  }

  // Auth API
  public static async login(phoneOrEmail: string, role?: string, otp?: string, password?: string): Promise<AuthSession> {
    const res = await fetch(this.getUrl('/api/auth/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phoneOrEmail, role, otp, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  }

  public static async registerCustomer(data: { name: string; phone: string; email?: string; address: string; milkType: string; quantity: number }): Promise<{ user: User; customer: Customer }> {
    const res = await fetch(this.getUrl('/api/auth/register'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  }

  // Service Tickets / Helpdesk API
  public static async getServiceTickets(customerId?: string): Promise<ServiceTicket[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(this.getUrl(`/api/service-tickets${query}`), { headers: this.getHeaders() });
    return res.json();
  }

  public static async createServiceTicket(data: any): Promise<ServiceTicket> {
    const res = await fetch(this.getUrl('/api/service-tickets'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit service request');
    }
    return res.json();
  }

  public static async updateServiceTicketStatus(id: string, status: string, resolutionNote?: string): Promise<ServiceTicket> {
    const res = await fetch(this.getUrl(`/api/service-tickets/${id}/status`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, resolutionNote })
    });
    return res.json();
  }
}

