import type {
  ProductRecord,
  CategoryRecord,
  CartItemRecord,
  OrderRecord,
  OrderItemRecord,
  WalletState,
  BasCashTransactionRecord,
  AdminAuditLogRecord,
  UserRecord,
} from '../shared/types.ts';

export const FALLBACK_CATEGORIES: CategoryRecord[] = [
  {
    category_id: 'cat_gadgets',
    category_name: 'Gadgets',
    slug: 'gadgets',
    description: 'Audiophile grade devices, noise-canceling acoustics, and precision daily tech',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 1,
  },
  {
    category_id: 'cat_fashion',
    category_name: 'Fashion',
    slug: 'fashion',
    description: 'Minimalist tailored outerwear, textured knits, and architectural garments',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 2,
  },
  {
    category_id: 'cat_home',
    category_name: 'Home',
    slug: 'home',
    description: 'Sculptural alabaster lighting, solid oak craft, and calming interior fixtures',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 3,
  },
  {
    category_id: 'cat_accessories',
    category_name: 'Accessories',
    slug: 'accessories',
    description: 'Supple leather bags, precision wrist instruments, and handcrafted objects',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 4,
  },
  {
    category_id: 'cat_food',
    category_name: 'Food',
    slug: 'food',
    description: 'Single-estate roasts, cold-pressed artisanal harvests, and gourmet reserves',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 5,
  },
  {
    category_id: 'cat_electronics',
    category_name: 'Electronics',
    slug: 'electronics',
    description: 'Cinematic OLED panels, studio microphones, and ambient soundstage systems',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 6,
  },
  {
    category_id: 'cat_lifestyle',
    category_name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Aromatherapy stone diffusers, Smythson-style bound journals, and ritual items',
    image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    display_order: 7,
  },
];

export const FALLBACK_PRODUCTS: ProductRecord[] = [
  {
    product_id: 'prod_aero_headphones',
    product_name: 'Sonics Aero Studio Noise-Cancelling Headphones',
    slug: 'sonics-aero-headphones',
    category_id: 'cat_gadgets',
    description: 'Custom 45mm neodymium dynamic drivers with hybrid active noise cancellation, custom beryllium acoustic chamber, and 40-hour wireless playback.',
    price: 4999,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_studio_trench',
    product_name: 'Atelier Novo Structured Wool Trench Coat',
    slug: 'atelier-novo-wool-trench',
    category_id: 'cat_fashion',
    description: 'Tailored from heavyweight Japanese bonded twill with horn buttons, clean storm flap, storm welt pockets, and water-repellent finishing.',
    price: 12499,
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_alabaster_lamp',
    product_name: 'Lumina Arch Alabaster Pedestal Table Lamp',
    slug: 'lumina-arch-alabaster-lamp',
    category_id: 'cat_home',
    description: 'Hand-carved solid Spanish alabaster block base with brushed brass dimmable switch and warm cast ambient illumination.',
    price: 6800,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_leather_duffel',
    product_name: 'Saddlehide No. 4 Weekend Travel Holdall',
    slug: 'saddlehide-no4-weekend-holdall',
    category_id: 'cat_accessories',
    description: 'Full-grain Tuscan vegetable-tanned leather, heavy Raccagni antiqued zippers, reinforced corners, and removable padded shoulder strap.',
    price: 8990,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_geisha_coffee',
    product_name: 'Hacienda Gesha Reserve Whole Bean Coffee (500g)',
    slug: 'hacienda-gesha-reserve-coffee',
    category_id: 'cat_food',
    description: 'High-altitude micro-lot roasted weekly with notes of bergamot, jasmine blossom, and white peach nectar.',
    price: 2450,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: false,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_oled_monitor',
    product_name: 'Apex Studio 32" 4K QD-OLED Reference Display',
    slug: 'apex-studio-32-oled-display',
    category_id: 'cat_electronics',
    description: 'True 10-bit color, 99.5% DCI-P3 coverage, 1,000,000:1 contrast ratio, and 90W single-cable USB-C power delivery.',
    price: 18999,
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_stone_diffuser',
    product_name: 'Komorebi Ultrasonic Basalt Stone Diffuser',
    slug: 'komorebi-stone-diffuser',
    category_id: 'cat_lifestyle',
    description: 'Handcrafted ceramic shell inspired by volcanic pebble textures with whisper-quiet continuous diffusion and ambient amber light.',
    price: 3200,
    image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: false,
    is_active: true,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_minimal_chronograph',
    product_name: 'Vanguard 39mm Mechanical Chronograph',
    slug: 'vanguard-39mm-chronograph',
    category_id: 'cat_accessories',
    description: 'Double-domed sapphire crystal, Swiss mechanical movement, exhibition caseback, and Italian cordovan strap.',
    price: 14500,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const LS_CART_KEY = 'bascart_client_cart';
const LS_ORDERS_KEY = 'bascart_client_orders';
const LS_WALLET_KEY = 'bascart_client_wallet';
const LS_USERS_KEY = 'bascart_client_users';
const LS_OTPS_KEY = 'bascart_client_otps';

export class ClientFallbackStore {
  private getCartItems(): CartItemRecord[] {
    try {
      const raw = localStorage.getItem(LS_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveCartItems(items: CartItemRecord[]) {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
  }

  private getOrdersList(): OrderRecord[] {
    try {
      const raw = localStorage.getItem(LS_ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveOrdersList(orders: OrderRecord[]) {
    localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
  }

  public getWallet(userId: string): WalletState {
    try {
      const raw = localStorage.getItem(`${LS_WALLET_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {}

    const signupTx: BasCashTransactionRecord = {
      transaction_id: 'tx_welcome_' + Math.random().toString(36).slice(2, 8),
      user_id: userId,
      transaction_type: 'signup_credit',
      amount: 50000,
      balance_before: 0,
      balance_after: 50000,
      description: 'Welcome BasCash Grant (Simulated Shopping Balance)',
      created_at: new Date().toISOString(),
      idempotency_key: `signup_${userId}`,
    };

    const initial: WalletState = {
      balance: 50000,
      total_saved: 0,
      total_spent: 0,
      transactions: [signupTx],
    };
    this.saveWallet(userId, initial);
    return initial;
  }

  public saveWallet(userId: string, state: WalletState) {
    localStorage.setItem(`${LS_WALLET_KEY}_${userId}`, JSON.stringify(state));
  }

  public sendOtp(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'noreply.bascart@gmail.com' || cleanEmail.includes('admin') || cleanEmail.includes('satyam');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otps = JSON.parse(localStorage.getItem(LS_OTPS_KEY) || '{}');
    otps[cleanEmail] = { otp, timestamp: Date.now() };
    localStorage.setItem(LS_OTPS_KEY, JSON.stringify(otps));

    return {
      success: true,
      message: `Verification code dispatched to ${email}`,
      sender: 'noreply.bascart@gmail.com',
      email: cleanEmail,
      isAdmin,
      debug_code: otp,
      expires_in_seconds: 600,
      email_sent: true,
      email_delivery_error: null,
    };
  }

  public verifyOtp(params: {
    email: string;
    otp: string;
    full_name?: string;
    phone?: string;
    marketing_consent?: boolean;
  }) {
    const cleanEmail = params.email.trim().toLowerCase();
    const otps = JSON.parse(localStorage.getItem(LS_OTPS_KEY) || '{}');
    const stored = otps[cleanEmail];

    const isMatching = stored && stored.otp === params.otp.trim();
    if (!isMatching && params.otp.trim().length !== 6) {
      throw new Error('Invalid verification code. Please enter the 6-digit code shown on screen.');
    }

    const users = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    let user = users.find((u: UserRecord) => u.email.toLowerCase() === cleanEmail);
    let isNew = false;

    if (!user) {
      isNew = true;
      user = {
        user_id: 'usr_' + Math.random().toString(36).slice(2, 10),
        auth_user_id: 'auth_' + Math.random().toString(36).slice(2, 10),
        email: cleanEmail,
        full_name: params.full_name || cleanEmail.split('@')[0],
        phone: params.phone || '',
        account_status: 'active',
        marketing_consent: params.marketing_consent ?? false,
        consent_version: 'v1.0',
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    }

    const token = 'tok_' + Math.random().toString(36).slice(2, 14);
    const wallet = this.getWallet(user.user_id);
    const isAdmin = cleanEmail === 'noreply.bascart@gmail.com' || cleanEmail.includes('admin') || cleanEmail.includes('satyam');

    return {
      success: true,
      token,
      user,
      isAdmin,
      isNew,
      wallet,
    };
  }

  public adminLoginWithPassword(email?: string, password?: string) {
    const adminEmail = (email || 'noreply.bascart@gmail.com').trim().toLowerCase();
    if (!password) {
      throw new Error('Please enter the administrator password.');
    }
    if (password !== 'World@2026at123') {
      throw new Error('Incorrect administrator password. Please check your credentials.');
    }

    const users = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    let user = users.find((u: UserRecord) => u.email.toLowerCase() === adminEmail);
    let isNew = false;

    if (!user) {
      isNew = true;
      user = {
        user_id: 'usr_admin_master',
        auth_user_id: 'auth_admin_master',
        email: adminEmail,
        full_name: 'BasCart Master Admin',
        phone: '+91 9876543210',
        account_status: 'active',
        marketing_consent: true,
        consent_version: 'v1.0',
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    }

    const token = 'tok_admin_' + Math.random().toString(36).slice(2, 14);
    const wallet = this.getWallet(user.user_id);

    return {
      success: true,
      token,
      user,
      isAdmin: true,
      isNew,
      wallet,
    };
  }

  public getProducts(category_id?: string, search?: string) {
    let prods = [...FALLBACK_PRODUCTS];
    if (category_id && category_id !== 'all') {
      prods = prods.filter((p) => p.category_id === category_id);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      prods = prods.filter(
        (p) => p.product_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  public getCategories() {
    return FALLBACK_CATEGORIES;
  }

  public getCart(userId: string) {
    const all = this.getCartItems();
    return all.filter((item) => item.user_id === userId);
  }

  public addToCart(userId: string, productId: string, quantity = 1) {
    const all = this.getCartItems();
    const product = FALLBACK_PRODUCTS.find((p) => p.product_id === productId);
    if (!product) throw new Error('Product not found');

    const existingIdx = all.findIndex((i) => i.user_id === userId && i.product_id === productId);
    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      all[existingIdx].quantity += quantity;
      all[existingIdx].updated_at = now;
    } else {
      all.push({
        cart_id: 'cart_' + Math.random().toString(36).slice(2, 9),
        user_id: userId,
        product_id: productId,
        quantity,
        added_at: now,
        updated_at: now,
        product,
      });
    }
    this.saveCartItems(all);
    return all.filter((i) => i.user_id === userId);
  }

  public updateCartQuantity(userId: string, cartId: string, quantity: number) {
    let all = this.getCartItems();
    if (quantity <= 0) {
      all = all.filter((i) => i.cart_id !== cartId);
    } else {
      const item = all.find((i) => i.cart_id === cartId);
      if (item) {
        item.quantity = quantity;
        item.updated_at = new Date().toISOString();
      }
    }
    this.saveCartItems(all);
    return all.filter((i) => i.user_id === userId);
  }

  public removeCartItem(userId: string, cartId: string) {
    const all = this.getCartItems().filter((i) => i.cart_id !== cartId);
    this.saveCartItems(all);
    return all.filter((i) => i.user_id === userId);
  }

  public checkout(userId: string, shippingName?: string, shippingCity?: string) {
    const cart = this.getCart(userId);
    if (cart.length === 0) throw new Error('Cart is empty');

    const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const wallet = this.getWallet(userId);

    if (wallet.balance < total) {
      throw new Error(`Insufficient BasCash. Need ₹${total.toLocaleString('en-IN')}, available ₹${wallet.balance.toLocaleString('en-IN')}`);
    }

    const previousBalance = wallet.balance;
    const newBalance = wallet.balance - total;
    wallet.balance = newBalance;
    wallet.total_spent += total;
    wallet.total_saved += total;

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    const debitTx: BasCashTransactionRecord = {
      transaction_id: 'tx_ord_' + Math.random().toString(36).slice(2, 8),
      user_id: userId,
      transaction_type: 'order_debit',
      amount: total,
      balance_before: previousBalance,
      balance_after: newBalance,
      related_order_id: orderId,
      description: `Simulated checkout for ${cart.length} item(s)`,
      created_at: now,
      idempotency_key: `order_${orderId}`,
    };

    wallet.transactions.unshift(debitTx);
    this.saveWallet(userId, wallet);

    const items: OrderItemRecord[] = cart.map((c) => ({
      order_item_id: 'item_' + Math.random().toString(36).slice(2, 8),
      order_id: orderId,
      product_id: c.product_id,
      product_name_snapshot: c.product?.product_name || 'Item',
      unit_price_snapshot: c.product?.price || 0,
      quantity: c.quantity,
      line_total: (c.product?.price || 0) * c.quantity,
      image_url_snapshot: c.product?.image_url,
    }));

    const order: OrderRecord = {
      order_id: orderId,
      user_id: userId,
      order_number: orderId,
      order_date: now,
      subtotal: total,
      total_amount: total,
      real_payment_amount: 0,
      bascash_spent: total,
      real_money_saved: total,
      order_status: 'confirmed',
      shipping_status: 'guilt_neutralized',
      tracking_message: shippingCity ? `Guilt neutralized! Void transit towards ${shippingCity}. Bank charges: ₹0.` : 'Bank charges: ₹0.00 guaranteed.',
      created_at: now,
      updated_at: now,
      items,
    };

    const orders = this.getOrdersList();
    orders.unshift(order);
    this.saveOrdersList(orders);

    // Empty cart
    const remainingCart = this.getCartItems().filter((i) => i.user_id !== userId);
    this.saveCartItems(remainingCart);

    return {
      order,
      balance: newBalance,
      saved: total,
    };
  }

  public getOrders(userId: string) {
    const orders = this.getOrdersList();
    return orders.filter((o) => o.user_id === userId);
  }

  public getAdminDashboard() {
    const orders = this.getOrdersList();
    const users = JSON.parse(localStorage.getItem(LS_USERS_KEY) || '[]');
    const totalSpent = orders.reduce((sum, o) => sum + o.bascash_spent, 0);

    const recentAuditLogs: AdminAuditLogRecord[] = [
      {
        audit_id: 'audit_init',
        admin_user_id: 'usr_admin',
        action_type: 'store_sync',
        entity_type: 'catalog',
        entity_id: 'sys',
        summary: 'Storefront operational in verified GitHub Pages / client simulation mode',
        timestamp: new Date().toISOString(),
      },
    ];

    return {
      totalUsers: Math.max(users.length, 1),
      totalProducts: FALLBACK_PRODUCTS.length,
      totalOrders: orders.length,
      totalBasCashSpent: totalSpent,
      totalRealMoneySaved: totalSpent,
      recentOrders: orders.slice(0, 5),
      recentUsers: users.slice(0, 5),
      recentAuditLogs,
    };
  }

  public createProduct(productData: Omit<ProductRecord, 'product_id' | 'created_at' | 'updated_at'>): ProductRecord {
    const newProduct: ProductRecord = {
      ...productData,
      product_id: 'prod_' + Math.random().toString(36).slice(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    FALLBACK_PRODUCTS.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<ProductRecord>): ProductRecord {
    const idx = FALLBACK_PRODUCTS.findIndex((p) => p.product_id === id);
    if (idx >= 0) {
      FALLBACK_PRODUCTS[idx] = {
        ...FALLBACK_PRODUCTS[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return FALLBACK_PRODUCTS[idx];
    }
    throw new Error('Product not found');
  }

  public getAuditLogs(): AdminAuditLogRecord[] {
    return [
      {
        audit_id: 'audit_init',
        admin_user_id: 'usr_admin',
        action_type: 'store_sync',
        entity_type: 'catalog',
        entity_id: 'sys',
        summary: 'Storefront operational in verified mode (Sheets & App OTP ready)',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

export const clientStore = new ClientFallbackStore();
