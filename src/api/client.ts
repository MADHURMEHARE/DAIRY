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
  AuthSession,
  CartItem,
  UserAddress
} from '../types';

export class ApiClient {
  private static userRole: string = 'CUSTOMER';
  private static baseUrl: string = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
  private static jwtToken: string = typeof localStorage !== 'undefined' ? (localStorage.getItem('dairy_jwt_token') || '') : '';

  public static setRole(role: string) {
    this.userRole = role;
  }

  public static getRole(): string {
    return this.userRole;
  }

  public static setToken(token: string) {
    this.jwtToken = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('dairy_jwt_token', token);
      } else {
        localStorage.removeItem('dairy_jwt_token');
      }
    }
  }

  public static getToken(): string {
    if (!this.jwtToken && typeof localStorage !== 'undefined') {
      this.jwtToken = localStorage.getItem('dairy_jwt_token') || '';
    }
    return this.jwtToken;
  }

  public static logout() {
    this.jwtToken = '';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dairy_jwt_token');
    }
  }

  public static setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public static getBaseUrl(): string {
    return this.baseUrl;
  }

  private static getUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (typeof window !== 'undefined') {
      if (!this.baseUrl || this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1') || this.baseUrl === window.location.origin) {
        return cleanPath;
      }
    }
    if (!this.baseUrl) return cleanPath;
    return `${this.baseUrl}${cleanPath}`;
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Role': this.userRole
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static async request<T = any>(path: string, options?: RequestInit, retryCount = 0): Promise<T> {
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
      if (typeof window !== 'undefined' && retryCount === 0) {
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

  public static async getAuthMe(): Promise<{ user: User; customer: Customer | null; dairy: DairyStore }> {
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

  // User Cart API
  public static async getCart(): Promise<CartItem[]> {
    return this.request('/api/cart');
  }

  public static async addToCart(product: Product, quantity = 1): Promise<CartItem[]> {
    return this.request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product, quantity })
    });
  }

  public static async updateCartQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    return this.request(`/api/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  public static async removeFromCart(productId: string): Promise<CartItem[]> {
    return this.request(`/api/cart/items/${productId}`, {
      method: 'DELETE'
    });
  }

  public static async clearCart(): Promise<CartItem[]> {
    return this.request('/api/cart', {
      method: 'DELETE'
    });
  }

  // Wishlist API
  public static async getWishlist(): Promise<string[]> {
    return this.request('/api/wishlist');
  }

  public static async toggleWishlist(productId: string): Promise<string[]> {
    return this.request('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  // Address API
  public static async getAddresses(): Promise<UserAddress[]> {
    return this.request('/api/addresses');
  }

  public static async createAddress(data: { label: string; addressLine: string; city?: string; pincode?: string }): Promise<UserAddress> {
    return this.request('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async deleteAddress(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  // Profile API
  public static async getProfile(): Promise<{ user: User; customer: Customer | null }> {
    return this.request('/api/profile');
  }

  public static async updateProfile(data: Partial<Customer & User>): Promise<{ user: User; customer: Customer | null }> {
    return this.request('/api/profile', {
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
    if (!params) return this.request('/api/deliveries');
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
        cleanParams[key] = String(val);
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(query ? `/api/deliveries?${query}` : '/api/deliveries');
  }

  public static async updateDeliveryStatus(id: string, status: string, notes?: string): Promise<DeliveryRecord> {
    return this.request(`/api/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  public static async getInvoices(customerId?: string): Promise<Invoice[]> {
    const validId = customerId && customerId !== 'undefined' ? customerId : '';
    const query = validId ? `?customerId=${encodeURIComponent(validId)}` : '';
    return this.request(`/api/invoices${query}`);
  }

  public static async getPayments(customerId?: string): Promise<Payment[]> {
    const validId = customerId && customerId !== 'undefined' ? customerId : '';
    const query = validId ? `?customerId=${encodeURIComponent(validId)}` : '';
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
    const validId = customerId && customerId !== 'undefined' ? customerId : '';
    const query = validId ? `?customerId=${encodeURIComponent(validId)}` : '';
    return this.request(`/api/notifications${query}`);
  }

  public static async markNotificationRead(id: string): Promise<void> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  public static async getEcommerceOrders(customerId?: string): Promise<EcommerceOrder[]> {
    const validId = customerId && customerId !== 'undefined' ? customerId : '';
    const query = validId ? `?customerId=${encodeURIComponent(validId)}` : '';
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
  public static async generateToken(role = 'ADMIN', phone = ''): Promise<{ token: string; user: User }> {
    const query = phone ? `role=${encodeURIComponent(role)}&phone=${encodeURIComponent(phone)}` : `role=${encodeURIComponent(role)}`;
    const res = await this.request(`/api/auth/token?${query}`);
    if (res && res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public static async login(phoneOrEmail: string, role?: string, otp?: string, password?: string): Promise<AuthSession> {
    const session: AuthSession = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneOrEmail, role, otp, password })
    });
    if (session && session.token) {
      this.setToken(session.token);
    }
    if (session && session.user && session.user.role) {
      this.setRole(session.user.role);
    }
    return session;
  }

  public static async registerCustomer(data: { name: string; phone: string; email?: string; password?: string; address: string; milkType: string; quantity: number }): Promise<{ user: User; customer: Customer; token?: string }> {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res && res.token) {
      this.setToken(res.token);
    }
    if (res && res.user && res.user.role) {
      this.setRole(res.user.role);
    }
    return res;
  }

  // Service Tickets / Helpdesk API
  public static async getServiceTickets(customerId?: string): Promise<ServiceTicket[]> {
    const validId = customerId && customerId !== 'undefined' ? customerId : '';
    const query = validId ? `?customerId=${encodeURIComponent(validId)}` : '';
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
