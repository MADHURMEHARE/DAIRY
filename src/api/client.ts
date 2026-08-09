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
    if (!this.baseUrl) return cleanPath;
    // If baseUrl matches current window origin, prefer relative path for maximum reliability
    if (typeof window !== 'undefined' && this.baseUrl === window.location.origin) {
      return cleanPath;
    }
    return `${this.baseUrl}${cleanPath}`;
  }

  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-User-Role': this.userRole
    };
  }

  private static async request<T = any>(path: string, options?: RequestInit): Promise<T> {
    try {
      const url = this.getUrl(path);
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options?.headers || {})
        }
      });

      if (!res.ok) {
        let errMessage = `HTTP error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      return await res.json();
    } catch (err: any) {
      // If fetching external baseUrl failed, attempt fallback to relative URL on current origin
      if (this.baseUrl && typeof window !== 'undefined') {
        try {
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          const fallbackRes = await fetch(cleanPath, {
            ...options,
            headers: {
              ...this.getHeaders(),
              ...(options?.headers || {})
            }
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch (_) {}
      }
      console.error(`[API Client Error on ${path}]:`, err?.message || err);
      throw err;
    }
  }

  public static async getHealth(): Promise<{ status: string; app: string; database: string; time: string }> {
    return this.request('/api/health');
  }

  public static async getAuthMe(): Promise<{ user: User; dairy: DairyStore }> {
    return this.request('/api/auth/me');
  }

  public static async getDairy(): Promise<DairyStore> {
    return this.request('/api/dairy');
  }

  public static async updateDairy(data: Partial<DairyStore>): Promise<DairyStore> {
    return this.request('/api/dairy', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getCustomers(search = ''): Promise<Customer[]> {
    return this.request(`/api/customers?search=${encodeURIComponent(search)}`);
  }

  public static async getCustomerDetails(id: string): Promise<{
    customer: Customer;
    subscription?: Subscription;
    deliveries: DeliveryRecord[];
    invoices: Invoice[];
  }> {
    return this.request(`/api/customers/${id}`);
  }

  public static async createCustomer(data: any): Promise<Customer> {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getProducts(): Promise<Product[]> {
    return this.request('/api/products');
  }

  public static async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getSubscriptions(): Promise<Subscription[]> {
    return this.request('/api/subscriptions');
  }

  public static async pauseSubscription(id: string, fromDate: string, toDate: string, reason: string): Promise<Subscription> {
    return this.request(`/api/subscriptions/${id}/pause`, {
      method: 'POST',
      body: JSON.stringify({ fromDate, toDate, reason })
    });
  }

  public static async resumeSubscription(id: string): Promise<Subscription> {
    return this.request(`/api/subscriptions/${id}/resume`, {
      method: 'POST'
    });
  }

  public static async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    return this.request(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getDeliveries(params?: { date?: string; status?: string; customerId?: string; time?: string }): Promise<DeliveryRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/deliveries?${query}`);
  }

  public static async updateDeliveryStatus(id: string, status: string, notes?: string): Promise<DeliveryRecord> {
    return this.request(`/api/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  public static async getInvoices(customerId?: string): Promise<Invoice[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return this.request(`/api/invoices${query}`);
  }

  public static async getPayments(customerId?: string): Promise<Payment[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return this.request(`/api/payments${query}`);
  }

  public static async recordPayment(invoiceId: string, amount: number, paymentMethod: string, notes?: string): Promise<{ payment: Payment; invoice: Invoice }> {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, amount, paymentMethod, notes })
    });
  }

  public static async getReports(): Promise<{
    overview: DashboardOverview;
    dailyRevenueSeries: Array<{ day: string; revenue: number; volume: number }>;
    milkTypeDistribution: Array<{ name: string; percentage: number; volumeL: number; price: number }>;
  }> {
    return this.request('/api/reports');
  }

  public static async getNotifications(customerId?: string): Promise<NotificationItem[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return this.request(`/api/notifications${query}`);
  }

  public static async markNotificationRead(id: string): Promise<void> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  public static async getEcommerceOrders(customerId?: string): Promise<EcommerceOrder[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return this.request(`/api/ecommerce/orders${query}`);
  }

  public static async createEcommerceOrder(orderData: any): Promise<EcommerceOrder> {
    return this.request('/api/ecommerce/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  public static async updateEcommerceOrderStatus(id: string, status: string, staffId?: string, staffName?: string): Promise<EcommerceOrder> {
    return this.request(`/api/ecommerce/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, staffId, staffName })
    });
  }

  // Auth API
  public static async login(phoneOrEmail: string, role?: string, otp?: string, password?: string): Promise<AuthSession> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneOrEmail, role, otp, password })
    });
  }

  public static async registerCustomer(data: { name: string; phone: string; email?: string; address: string; milkType: string; quantity: number }): Promise<{ user: User; customer: Customer }> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Service Tickets / Helpdesk API
  public static async getServiceTickets(customerId?: string): Promise<ServiceTicket[]> {
    const query = customerId ? `?customerId=${customerId}` : '';
    return this.request(`/api/service-tickets${query}`);
  }

  public static async createServiceTicket(data: any): Promise<ServiceTicket> {
    return this.request('/api/service-tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateServiceTicketStatus(id: string, status: string, resolutionNote?: string): Promise<ServiceTicket> {
    return this.request(`/api/service-tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNote })
    });
  }
}

