import type {
  ProductRecord,
  CategoryRecord,
  CartItemRecord,
  WishlistItemRecord,
  OrderRecord,
  WalletState,
  SupportTicketRecord,
  SiteContentRecord,
  SheetDiagnosticsResponse,
  AdminAuditLogRecord,
  UserRecord,
} from '../shared/types.ts';

const TOKEN_KEY = 'bascart_auth_token';
const USER_KEY = 'bascart_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token: string, user: UserRecord) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): UserRecord | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Public
  getProducts: (category_id?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category_id && category_id !== 'all') params.set('category_id', category_id);
    if (search) params.set('search', search);
    return request<{ products: ProductRecord[] }>(`/api/products?${params.toString()}`);
  },
  getProductById: (id: string) => request<{ product: ProductRecord }>(`/api/products/${id}`),
  getCategories: () => request<{ categories: CategoryRecord[] }>('/api/categories'),
  getContent: () => request<{ content: SiteContentRecord[] }>('/api/content'),

  // OTP Authentication (Dispatched from noreply.bascart@gmail.com)
  sendOtp: (email: string) =>
    request<{
      success: boolean;
      message: string;
      sender: string;
      email: string;
      isAdmin: boolean;
      debug_code: string;
      expires_in_seconds: number;
      email_sent?: boolean;
      email_delivery_error?: string | null;
    }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyOtp: (payload: {
    email: string;
    otp: string;
    full_name?: string;
    phone?: string;
    marketing_consent?: boolean;
  }) =>
    request<{
      success: boolean;
      token: string;
      user: UserRecord;
      isAdmin: boolean;
      isNew: boolean;
      wallet: WalletState;
    }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Auth / Session
  createSession: (payload: { email: string; full_name?: string; role?: string; phone?: string; marketing_consent?: boolean }) =>
    request<{ token: string; user: UserRecord; isNew: boolean; wallet: WalletState }>('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProfile: () => request<{ user: UserRecord; wallet: WalletState; isAdmin: boolean }>('/api/profile'),
  updateProfile: (updates: { full_name?: string; phone?: string; marketing_consent?: boolean }) =>
    request<{ user: UserRecord }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Wallet
  getWallet: () => request<{ wallet: WalletState }>('/api/wallet'),

  // Cart
  getCart: () => request<{ cart: CartItemRecord[] }>('/api/cart'),
  addToCart: (product_id: string, quantity = 1) =>
    request<{ cart: CartItemRecord[] }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
    }),
  updateCartQuantity: (cart_id: string, quantity: number) =>
    request<{ cart: CartItemRecord[] }>(`/api/cart/${cart_id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (cart_id: string) =>
    request<{ cart: CartItemRecord[] }>(`/api/cart/${cart_id}`, {
      method: 'DELETE',
    }),

  // Wishlist
  getWishlist: () => request<{ wishlist: WishlistItemRecord[] }>('/api/wishlist'),
  toggleWishlist: (product_id: string) =>
    request<{ inWishlist: boolean }>('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id }),
    }),

  // Orders
  getOrders: () => request<{ orders: OrderRecord[] }>('/api/orders'),
  getOrderById: (id: string) => request<{ order: OrderRecord }>(`/api/orders/${id}`),
  checkout: (payload: { idempotency_key: string; shipping_name?: string; shipping_city?: string }) =>
    request<{ order: OrderRecord; balance: number; saved: number }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Support
  getSupportTickets: () => request<{ tickets: SupportTicketRecord[] }>('/api/support'),
  createSupportTicket: (payload: { subject: string; message: string }) =>
    request<{ ticket: SupportTicketRecord }>('/api/support', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin
  getAdminDashboard: () =>
    request<{
      totalUsers: number;
      totalProducts: number;
      totalOrders: number;
      totalBasCashSpent: number;
      totalRealMoneySaved: number;
      recentOrders: OrderRecord[];
      recentUsers: UserRecord[];
      recentAuditLogs: AdminAuditLogRecord[];
    }>('/api/admin/dashboard'),
  getAdminSheetsDiagnostics: () => request<SheetDiagnosticsResponse>('/api/admin/sheets-diagnostics'),
  connectSheet: (spreadsheet_id: string) =>
    request<{
      success: boolean;
      message: string;
      result: { success: boolean; createdSheets: string[]; messages: string[] };
      diagnostics: SheetDiagnosticsResponse;
    }>('/api/admin/connect-sheet', {
      method: 'POST',
      body: JSON.stringify({ spreadsheet_id }),
    }),
  initSheets: () =>
    request<{ success: boolean; createdSheets: string[]; existingSheets: string[]; messages: string[] }>(
      '/api/admin/init-sheets',
      { method: 'POST' }
    ),
  getAdminProducts: () => request<{ products: ProductRecord[] }>('/api/admin/products'),
  createAdminProduct: (product: Omit<ProductRecord, 'product_id' | 'created_at' | 'updated_at'>) =>
    request<{ product: ProductRecord }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateAdminProduct: (id: string, updates: Partial<ProductRecord>) =>
    request<{ product: ProductRecord }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  getAdminSupport: () => request<{ tickets: SupportTicketRecord[] }>('/api/admin/support'),
  replyAdminSupport: (id: string, response: string, status: 'in_progress' | 'resolved') =>
    request<{ ticket: SupportTicketRecord }>(`/api/admin/support/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ response, status }),
    }),
  getAdminAuditLogs: () => request<{ logs: AdminAuditLogRecord[] }>('/api/admin/audit-logs'),
  getAdminSmtpStatus: () =>
    request<{
      status: {
        isConfigured: boolean;
        senderEmail: string;
        senderName: string;
        host: string;
        port: number;
        secure: boolean;
        hasPassword: boolean;
        lastDispatchError: string | null;
      };
    }>('/api/admin/smtp-status'),
  saveAdminSmtpConfig: (config: { host?: string; port?: number; secure?: boolean; user?: string; pass?: string }) =>
    request<{ success: boolean; message: string }>('/api/admin/smtp-config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  sendAdminTestEmail: (to_email: string) =>
    request<{ success: boolean; message: string }>('/api/admin/send-test-email', {
      method: 'POST',
      body: JSON.stringify({ to_email }),
    }),
};
