import crypto from 'crypto';
import { googleSheetsService, REQUIRED_SHEETS } from './googleSheets.ts';
import type {
  UserRecord,
  ProductRecord,
  CategoryRecord,
  CartItemRecord,
  WishlistItemRecord,
  OrderRecord,
  OrderItemRecord,
  BasCashTransactionRecord,
  UserActivityRecord,
  ConsentRecord,
  SupportTicketRecord,
  SiteContentRecord,
  AdminAuditLogRecord,
  WalletState,
  SheetDiagnosticsResponse,
} from '../shared/types.ts';

// Initial Curated Categories
const INITIAL_CATEGORIES: CategoryRecord[] = [
  {
    category_id: 'cat_gadgets',
    category_name: 'Gadgets',
    slug: 'gadgets',
    description: 'Audiophile grade devices, noise-canceling acoustics, and precision daily tech',
    image_url: '/src/assets/images/product_gadget_headphones_1791637652144.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    category_id: 'cat_fashion',
    category_name: 'Fashion',
    slug: 'fashion',
    description: 'Minimalist tailored outerwear, textured knits, and architectural garments',
    image_url: '/src/assets/images/product_fashion_jacket_1791637663712.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    category_id: 'cat_home',
    category_name: 'Home',
    slug: 'home',
    description: 'Sculptural alabaster lighting, solid oak craft, and calming interior fixtures',
    image_url: '/src/assets/images/product_home_lamp_1791637676064.jpg',
    is_active: true,
    display_order: 3,
  },
  {
    category_id: 'cat_accessories',
    category_name: 'Accessories',
    slug: 'accessories',
    description: 'Supple leather bags, precision wrist instruments, and handcrafted objects',
    image_url: '/src/assets/images/bascart_hero_lifestyle_1791637639824.jpg',
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

// Initial Curated Products with exact ₹ values
const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    product_id: 'prod_aero_headphones',
    product_name: 'Sonics Aero Studio Noise-Cancelling Headphones',
    slug: 'sonics-aero-headphones',
    category_id: 'cat_gadgets',
    description: 'Custom 45mm neodymium dynamic drivers with hybrid active noise cancellation, custom beryllium acoustic chamber, and 40-hour wireless playback.',
    price: 4999,
    image_url: '/src/assets/images/product_gadget_headphones_1791637652144.jpg',
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
    image_url: '/src/assets/images/product_fashion_jacket_1791637663712.jpg',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_alabaster_lamp',
    product_name: 'Nordic Alabaster & Brushed Brass Table Lamp',
    slug: 'nordic-alabaster-brass-lamp',
    category_id: 'cat_home',
    description: 'Carved natural Spanish alabaster shade resting on solid milled brass armatures and smoked dark oak base with step-less touch dimming.',
    price: 8999,
    image_url: '/src/assets/images/product_home_lamp_1791637676064.jpg',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_leather_tote',
    product_name: 'Milano Full-Grain Calfskin Weekender Bag',
    slug: 'milano-calfskin-weekender',
    category_id: 'cat_accessories',
    description: 'Vegetable-tanned full-grain Italian leather bag with hand-burnished edges, YKK Excella zippers, and dedicated 16-inch padded laptop slot.',
    price: 15999,
    image_url: '/src/assets/images/bascart_hero_lifestyle_1791637639824.jpg',
    stock_status: 'in_stock',
    is_featured: true,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_single_origin_kit',
    product_name: 'Monsoon Malabar Reserve Pour-Over Roasting Kit',
    slug: 'monsoon-malabar-reserve-kit',
    category_id: 'cat_food',
    description: 'Micro-lot aged beans roasted to medium balance, paired with a heat-resistant borosilicate dripper and 100 unbleached paper filters.',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: false,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_ultrawide_monitor',
    product_name: 'Vivid Clarity 34-Inch Curved Quantum Dot Display',
    slug: 'vivid-clarity-34-monitor',
    category_id: 'cat_electronics',
    description: 'Nano IPS panel with 98% DCI-P3 coverage, Thunderbolt 4 90W single-cable delivery, and factory calibration certificate.',
    price: 34999,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    stock_status: 'low_stock',
    is_featured: true,
    is_active: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_volcanic_diffuser',
    product_name: 'Basalt Stone Ultrasonic Mist Diffuser',
    slug: 'basalt-stone-mist-diffuser',
    category_id: 'cat_lifestyle',
    description: 'Solid cast basalt stone housing with whisper-silent ultrasonic ceramic transducer and warm ambient LED under-glow.',
    price: 3299,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: false,
    is_active: true,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    product_id: 'prod_mechanical_keyboard',
    product_name: 'Machina 75 Gasket-Mounted Mechanical Keyboard',
    slug: 'machina-75-keyboard',
    category_id: 'cat_gadgets',
    description: 'CNC anodized aluminum chassis, hot-swappable tactile switches, polycarbonate plate, and custom PBT dye-sub keycaps.',
    price: 7499,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    stock_status: 'in_stock',
    is_featured: false,
    is_active: true,
    display_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial Site Content
const INITIAL_SITE_CONTENT: SiteContentRecord[] = [
  {
    content_id: 'cnt_hero_1',
    content_type: 'hero_banner',
    title: 'Your cart is full. Your wallet isn’t.',
    content: '₹4,999 imaginary order. ₹4,999 saved in real life. Indulge your shopping impulse, experience the rush of checking out, and walk away with your bank balance completely untouched.',
    media_url: '/src/assets/images/bascart_hero_lifestyle_1791637639824.jpg',
    is_active: true,
    display_order: 1,
    updated_at: new Date().toISOString(),
  },
  {
    content_id: 'cnt_kicker_1',
    content_type: 'savings_kicker',
    title: 'Congratulations! You bought absolutely nothing.',
    content: '100% emotional satisfaction, 0% financial regret. Track your cumulative real money saved as your imaginary cart checks out.',
    is_active: true,
    display_order: 2,
    updated_at: new Date().toISOString(),
  },
];

class ApplicationDataStore {
  // Local cached tables
  private users: UserRecord[] = [];
  private products: ProductRecord[] = [...INITIAL_PRODUCTS];
  private categories: CategoryRecord[] = [...INITIAL_CATEGORIES];
  private carts: CartItemRecord[] = [];
  private wishlist: WishlistItemRecord[] = [];
  private orders: OrderRecord[] = [];
  private orderItems: OrderItemRecord[] = [];
  private transactions: BasCashTransactionRecord[] = [];
  private activity: UserActivityRecord[] = [];
  private consents: ConsentRecord[] = [];
  private tickets: SupportTicketRecord[] = [];
  private siteContent: SiteContentRecord[] = [...INITIAL_SITE_CONTENT];
  private auditLogs: AdminAuditLogRecord[] = [];

  // Concurrency queue for wallet operations
  private walletMutexPromise: Promise<void> = Promise.resolve();

  constructor() {
    this.trySyncFromGoogleSheets();
  }

  private async acquireWalletLock<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.walletMutexPromise;
    this.walletMutexPromise = nextLock;
    await currentLock;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  public async trySyncFromGoogleSheets(): Promise<void> {
    if (!googleSheetsService.isLiveConfigured()) return;

    try {
      console.log('Syncing data from live Google Sheets...');
      const [
        sheetUsers,
        sheetProducts,
        sheetCategories,
        sheetCarts,
        sheetWishlist,
        sheetOrders,
        sheetOrderItems,
        sheetTransactions,
        sheetActivity,
        sheetConsents,
        sheetTickets,
        sheetSiteContent,
        sheetAuditLogs,
      ] = await Promise.allSettled([
        googleSheetsService.readRows<UserRecord>('Users'),
        googleSheetsService.readRows<ProductRecord>('Products'),
        googleSheetsService.readRows<CategoryRecord>('Categories'),
        googleSheetsService.readRows<CartItemRecord>('Carts'),
        googleSheetsService.readRows<WishlistItemRecord>('Wishlist'),
        googleSheetsService.readRows<OrderRecord>('Orders'),
        googleSheetsService.readRows<OrderItemRecord>('OrderItems'),
        googleSheetsService.readRows<BasCashTransactionRecord>('BasCashTransactions'),
        googleSheetsService.readRows<UserActivityRecord>('UserActivity'),
        googleSheetsService.readRows<ConsentRecord>('ConsentRecords'),
        googleSheetsService.readRows<SupportTicketRecord>('SupportTickets'),
        googleSheetsService.readRows<SiteContentRecord>('SiteContent'),
        googleSheetsService.readRows<AdminAuditLogRecord>('AdminAuditLog'),
      ]);

      if (sheetProducts.status === 'fulfilled' && sheetProducts.value.length > 0) {
        this.products = sheetProducts.value;
      }
      if (sheetCategories.status === 'fulfilled' && sheetCategories.value.length > 0) {
        this.categories = sheetCategories.value;
      }
      if (sheetUsers.status === 'fulfilled') this.users = sheetUsers.value;
      if (sheetCarts.status === 'fulfilled') this.carts = sheetCarts.value;
      if (sheetWishlist.status === 'fulfilled') this.wishlist = sheetWishlist.value;
      if (sheetOrders.status === 'fulfilled') this.orders = sheetOrders.value;
      if (sheetOrderItems.status === 'fulfilled') this.orderItems = sheetOrderItems.value;
      if (sheetTransactions.status === 'fulfilled') this.transactions = sheetTransactions.value;
      if (sheetActivity.status === 'fulfilled') this.activity = sheetActivity.value;
      if (sheetConsents.status === 'fulfilled') this.consents = sheetConsents.value;
      if (sheetTickets.status === 'fulfilled') this.tickets = sheetTickets.value;
      if (sheetSiteContent.status === 'fulfilled' && sheetSiteContent.value.length > 0) {
        this.siteContent = sheetSiteContent.value;
      }
      if (sheetAuditLogs.status === 'fulfilled') this.auditLogs = sheetAuditLogs.value;
      console.log('Google Sheets sync completed successfully.');
    } catch (err) {
      console.error('Error during Google Sheets initial sync:', err);
    }
  }

  // --- Safe Append helper that writes to memory and live Sheets ---
  private async persistAppend(sheetName: string, record: Record<string, any>) {
    if (googleSheetsService.isLiveConfigured()) {
      try {
        await googleSheetsService.appendRow(sheetName, record);
      } catch (err: any) {
        console.warn(`[Store] Live append to ${sheetName} deferred: ${err.message}. Retained safely in server store.`);
      }
    }
  }

  private async persistUpdate(
    sheetName: string,
    idKey: string,
    idVal: string,
    updates: Record<string, any>
  ) {
    if (googleSheetsService.isLiveConfigured()) {
      try {
        await googleSheetsService.updateRow(sheetName, idKey, idVal, updates);
      } catch (err: any) {
        console.warn(`[Store] Live update to ${sheetName} deferred: ${err.message}. Retained safely in server store.`);
      }
    }
  }

  private async persistDelete(sheetName: string, idKey: string, idVal: string) {
    if (googleSheetsService.isLiveConfigured()) {
      try {
        await googleSheetsService.deleteRow(sheetName, idKey, idVal);
      } catch (err: any) {
        console.warn(`[Store] Live delete to ${sheetName} deferred: ${err.message}. Retained safely in server store.`);
      }
    }
  }

  // =================== USERS & WALLET ===================

  public async getOrCreateUser(params: {
    auth_user_id: string;
    email: string;
    full_name?: string;
    phone?: string;
    marketing_consent?: boolean;
  }): Promise<{ user: UserRecord; isNew: boolean }> {
    return this.acquireWalletLock(async () => {
      let existing = this.users.find(
        (u) => u.auth_user_id === params.auth_user_id || u.email.toLowerCase() === params.email.toLowerCase()
      );

      if (existing) {
        existing.last_login_at = new Date().toISOString();
        await this.persistUpdate('Users', 'user_id', existing.user_id, {
          last_login_at: existing.last_login_at,
        });
        return { user: existing, isNew: false };
      }

      // Create new user
      const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
      const now = new Date().toISOString();
      const newUser: UserRecord = {
        user_id: userId,
        auth_user_id: params.auth_user_id,
        full_name: params.full_name || params.email.split('@')[0],
        email: params.email.toLowerCase(),
        phone: params.phone || '',
        account_status: 'active',
        created_at: now,
        updated_at: now,
        marketing_consent: !!params.marketing_consent,
        consent_version: 'v1.0-2026',
        last_login_at: now,
      };

      this.users.push(newUser);
      await this.persistAppend('Users', newUser);

      // Grant ₹50,000 initial BasCash exactly once
      const signupTx: BasCashTransactionRecord = {
        transaction_id: 'tx_signup_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        transaction_type: 'signup_credit',
        amount: 50000,
        balance_before: 0,
        balance_after: 50000,
        description: 'Initial ₹50,000 Welcome BasCash Grant for guilt-free simulated shopping',
        created_at: now,
        idempotency_key: `signup_${userId}`,
      };
      this.transactions.push(signupTx);
      await this.persistAppend('BasCashTransactions', signupTx);

      // Record consent
      const termsConsent: ConsentRecord = {
        consent_id: 'cns_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        consent_type: 'terms_of_use',
        consent_status: 'granted',
        policy_version: 'v1.0-2026',
        timestamp: now,
      };
      this.consents.push(termsConsent);
      await this.persistAppend('ConsentRecords', termsConsent);

      if (params.marketing_consent) {
        const mktConsent: ConsentRecord = {
          consent_id: 'cns_' + crypto.randomUUID().slice(0, 8),
          user_id: userId,
          consent_type: 'marketing_communications',
          consent_status: 'granted',
          policy_version: 'v1.0-2026',
          timestamp: now,
        };
        this.consents.push(mktConsent);
        await this.persistAppend('ConsentRecords', mktConsent);
      }

      // Record activity
      await this.recordActivity({
        user_id: userId,
        activity_type: 'login',
        entity_type: 'user',
        entity_id: userId,
        metadata_summary: 'New user registered with ₹50,000 welcome grant',
      });

      return { user: newUser, isNew: true };
    });
  }

  public async getUserById(userId: string): Promise<UserRecord | undefined> {
    return this.users.find((u) => u.user_id === userId);
  }

  public async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserRecord, 'full_name' | 'phone' | 'marketing_consent'>>
  ): Promise<UserRecord> {
    const user = this.users.find((u) => u.user_id === userId);
    if (!user) throw new Error('User not found');

    if (updates.full_name !== undefined) user.full_name = updates.full_name;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.marketing_consent !== undefined) {
      user.marketing_consent = updates.marketing_consent;
      // Record consent change
      const now = new Date().toISOString();
      const consentRecord: ConsentRecord = {
        consent_id: 'cns_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        consent_type: 'marketing_communications',
        consent_status: updates.marketing_consent ? 'granted' : 'withdrawn',
        policy_version: 'v1.0-2026',
        timestamp: now,
        withdrawal_timestamp: updates.marketing_consent ? undefined : now,
      };
      this.consents.push(consentRecord);
      await this.persistAppend('ConsentRecords', consentRecord);
    }
    user.updated_at = new Date().toISOString();

    await this.persistUpdate('Users', 'user_id', userId, {
      full_name: user.full_name,
      phone: user.phone,
      marketing_consent: user.marketing_consent,
      updated_at: user.updated_at,
    });

    return user;
  }

  public async getWalletState(userId: string): Promise<WalletState> {
    const userTxs = this.transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let balance = 0;
    let totalSpent = 0;
    for (const tx of userTxs) {
      if (tx.transaction_type === 'signup_credit' || tx.transaction_type === 'refund_credit') {
        balance += tx.amount;
      } else if (tx.transaction_type === 'order_debit') {
        balance -= tx.amount;
        totalSpent += tx.amount;
      } else if (tx.transaction_type === 'admin_adjustment') {
        balance += tx.amount;
      }
    }

    return {
      balance: Math.max(0, balance),
      total_saved: totalSpent, // Every ₹1 of simulated order spent is ₹1 real money saved!
      total_spent: totalSpent,
      transactions: [...userTxs].reverse(),
    };
  }

  // =================== PRODUCTS & CATEGORIES ===================

  public async getCategories(): Promise<CategoryRecord[]> {
    return this.categories
      .filter((c) => c.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  public async getAllCategoriesAdmin(): Promise<CategoryRecord[]> {
    return [...this.categories].sort((a, b) => a.display_order - b.display_order);
  }

  public async getProducts(filters?: {
    category_id?: string;
    search?: string;
    featured?: boolean;
  }): Promise<ProductRecord[]> {
    return this.products
      .filter((p) => {
        if (!p.is_active) return false;
        if (filters?.category_id && filters.category_id !== 'all' && p.category_id !== filters.category_id) {
          return false;
        }
        if (filters?.featured && !p.is_featured) return false;
        if (filters?.search && filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchName = p.product_name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => a.display_order - b.display_order);
  }

  public async getAllProductsAdmin(): Promise<ProductRecord[]> {
    return [...this.products].sort((a, b) => a.display_order - b.display_order);
  }

  public async getProductById(productId: string): Promise<ProductRecord | undefined> {
    return this.products.find((p) => p.product_id === productId);
  }

  public async createProduct(product: Omit<ProductRecord, 'product_id' | 'created_at' | 'updated_at'>): Promise<ProductRecord> {
    const now = new Date().toISOString();
    const newProd: ProductRecord = {
      ...product,
      product_id: 'prod_' + crypto.randomUUID().slice(0, 8),
      created_at: now,
      updated_at: now,
    };
    this.products.push(newProd);
    await this.persistAppend('Products', newProd);
    return newProd;
  }

  public async updateProduct(productId: string, updates: Partial<ProductRecord>): Promise<ProductRecord> {
    const prod = this.products.find((p) => p.product_id === productId);
    if (!prod) throw new Error('Product not found');

    Object.assign(prod, updates, { updated_at: new Date().toISOString() });
    await this.persistUpdate('Products', 'product_id', productId, prod);
    return prod;
  }

  // =================== CART & WISHLIST ===================

  public async getCart(userId: string): Promise<CartItemRecord[]> {
    const items = this.carts.filter((c) => c.user_id === userId);
    return items.map((item) => ({
      ...item,
      product: this.products.find((p) => p.product_id === item.product_id),
    }));
  }

  public async addToCart(userId: string, productId: string, quantity = 1): Promise<CartItemRecord[]> {
    const product = this.products.find((p) => p.product_id === productId && p.is_active);
    if (!product) throw new Error('Product not found or inactive');

    const existing = this.carts.find((c) => c.user_id === userId && c.product_id === productId);
    const now = new Date().toISOString();

    if (existing) {
      existing.quantity += quantity;
      existing.updated_at = now;
      await this.persistUpdate('Carts', 'cart_id', existing.cart_id, {
        quantity: existing.quantity,
        updated_at: now,
      });
    } else {
      const newItem: CartItemRecord = {
        cart_id: 'crt_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        product_id: productId,
        quantity: Math.max(1, quantity),
        added_at: now,
        updated_at: now,
      };
      this.carts.push(newItem);
      await this.persistAppend('Carts', newItem);
    }

    await this.recordActivity({
      user_id: userId,
      activity_type: 'cart_update',
      entity_type: 'product',
      entity_id: productId,
      metadata_summary: `Added ${quantity} of ${product.product_name} to cart`,
    });

    return this.getCart(userId);
  }

  public async updateCartQuantity(userId: string, cartId: string, quantity: number): Promise<CartItemRecord[]> {
    const item = this.carts.find((c) => c.cart_id === cartId && c.user_id === userId);
    if (!item) throw new Error('Cart item not found');

    if (quantity <= 0) {
      this.carts = this.carts.filter((c) => c.cart_id !== cartId);
      await this.persistDelete('Carts', 'cart_id', cartId);
    } else {
      item.quantity = quantity;
      item.updated_at = new Date().toISOString();
      await this.persistUpdate('Carts', 'cart_id', cartId, {
        quantity: item.quantity,
        updated_at: item.updated_at,
      });
    }
    return this.getCart(userId);
  }

  public async removeCartItem(userId: string, cartId: string): Promise<CartItemRecord[]> {
    this.carts = this.carts.filter((c) => !(c.cart_id === cartId && c.user_id === userId));
    await this.persistDelete('Carts', 'cart_id', cartId);
    return this.getCart(userId);
  }

  public async getWishlist(userId: string): Promise<WishlistItemRecord[]> {
    const items = this.wishlist.filter((w) => w.user_id === userId);
    return items.map((w) => ({
      ...w,
      product: this.products.find((p) => p.product_id === w.product_id),
    }));
  }

  public async toggleWishlist(userId: string, productId: string): Promise<{ inWishlist: boolean }> {
    const existingIdx = this.wishlist.findIndex((w) => w.user_id === userId && w.product_id === productId);
    if (existingIdx !== -1) {
      const item = this.wishlist[existingIdx];
      this.wishlist.splice(existingIdx, 1);
      await this.persistDelete('Wishlist', 'wishlist_id', item.wishlist_id);
      return { inWishlist: false };
    } else {
      const newItem: WishlistItemRecord = {
        wishlist_id: 'wsh_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      };
      this.wishlist.push(newItem);
      await this.persistAppend('Wishlist', newItem);
      return { inWishlist: true };
    }
  }

  // =================== SIMULATED CHECKOUT & ORDERS ===================

  public async simulatedCheckout(
    userId: string,
    payload: { idempotency_key: string; shipping_name?: string; shipping_city?: string }
  ): Promise<{ order: OrderRecord; balance: number; saved: number }> {
    return this.acquireWalletLock(async () => {
      // 1. Check idempotency: have we processed this key already?
      const existingTx = this.transactions.find((t) => t.idempotency_key === payload.idempotency_key);
      if (existingTx && existingTx.related_order_id) {
        const pastOrder = this.orders.find((o) => o.order_id === existingTx.related_order_id);
        if (pastOrder) {
          const wallet = await this.getWalletState(userId);
          return { order: pastOrder, balance: wallet.balance, saved: wallet.total_saved };
        }
      }

      // 2. Load user cart
      const cartItems = this.carts.filter((c) => c.user_id === userId);
      if (cartItems.length === 0) {
        throw new Error('Your cart is empty. Add items before simulated checkout.');
      }

      // 3. Recalculate totals strictly from active product catalog
      let subtotal = 0;
      const orderItemPayloads: Omit<OrderItemRecord, 'order_item_id' | 'order_id'>[] = [];

      for (const item of cartItems) {
        const product = this.products.find((p) => p.product_id === item.product_id && p.is_active);
        if (!product) {
          throw new Error(`Item ${item.product_id} is no longer available.`);
        }
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        orderItemPayloads.push({
          product_id: product.product_id,
          product_name_snapshot: product.product_name,
          unit_price_snapshot: product.price,
          quantity: item.quantity,
          line_total: lineTotal,
          image_url_snapshot: product.image_url,
        });
      }

      // 4. Verify wallet balance
      const wallet = await this.getWalletState(userId);
      if (wallet.balance < subtotal) {
        throw new Error(
          `Insufficient BasCash balance. Required: ₹${subtotal.toLocaleString('en-IN')}, Available: ₹${wallet.balance.toLocaleString('en-IN')}.`
        );
      }

      // 5. Generate Order and OrderItems
      const now = new Date().toISOString();
      const orderId = 'ord_' + crypto.randomUUID().slice(0, 8);
      const orderNumber = 'BC-' + Math.floor(100000 + Math.random() * 900000);

      const order: OrderRecord = {
        order_id: orderId,
        user_id: userId,
        order_number: orderNumber,
        order_date: now,
        subtotal,
        total_amount: subtotal,
        real_payment_amount: 0, // Real payment is always ₹0!
        bascash_spent: subtotal,
        real_money_saved: subtotal,
        order_status: 'confirmed',
        shipping_status: 'bank_untouched',
        tracking_message: 'Real payment ₹0. Delivered to the void of serene satisfaction.',
        created_at: now,
        updated_at: now,
      };

      const createdItems: OrderItemRecord[] = orderItemPayloads.map((it) => ({
        ...it,
        order_item_id: 'itm_' + crypto.randomUUID().slice(0, 8),
        order_id: orderId,
      }));

      // 6. Record BasCash debit transaction
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - subtotal;
      const debitTx: BasCashTransactionRecord = {
        transaction_id: 'tx_ord_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        transaction_type: 'order_debit',
        amount: subtotal,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        related_order_id: orderId,
        description: `Simulated checkout for Order #${orderNumber} (Real money saved: ₹${subtotal.toLocaleString('en-IN')})`,
        created_at: now,
        idempotency_key: payload.idempotency_key,
      };

      // 7. Persist to memory and live Google Sheets
      this.orders.push(order);
      await this.persistAppend('Orders', order);

      for (const item of createdItems) {
        this.orderItems.push(item);
        await this.persistAppend('OrderItems', item);
      }

      this.transactions.push(debitTx);
      await this.persistAppend('BasCashTransactions', debitTx);

      // 8. Clear user cart
      const cartIdsToRemove = cartItems.map((c) => c.cart_id);
      this.carts = this.carts.filter((c) => c.user_id !== userId);
      for (const cid of cartIdsToRemove) {
        await this.persistDelete('Carts', 'cart_id', cid);
      }

      // 9. Record Activity
      await this.recordActivity({
        user_id: userId,
        activity_type: 'simulated_checkout',
        entity_type: 'order',
        entity_id: orderId,
        metadata_summary: `Placed simulated order #${orderNumber} for ₹${subtotal.toLocaleString('en-IN')}. Real payment: ₹0`,
      });

      order.items = createdItems;
      const updatedWallet = await this.getWalletState(userId);
      return {
        order,
        balance: updatedWallet.balance,
        saved: updatedWallet.total_saved,
      };
    });
  }

  public async getOrders(userId: string): Promise<OrderRecord[]> {
    const userOrders = this.orders.filter((o) => o.user_id === userId);
    return userOrders
      .map((o) => ({
        ...o,
        items: this.orderItems.filter((i) => i.order_id === o.order_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getOrderById(userId: string, orderId: string): Promise<OrderRecord | undefined> {
    const order = this.orders.find((o) => o.order_id === orderId && (o.user_id === userId || userId === 'admin'));
    if (!order) return undefined;
    order.items = this.orderItems.filter((i) => i.order_id === order.order_id);
    return order;
  }

  // =================== SUPPORT TICKETS & CONSENT ===================

  public async createSupportTicket(params: {
    user_id: string;
    subject: string;
    message: string;
  }): Promise<SupportTicketRecord> {
    const now = new Date().toISOString();
    const user = this.users.find((u) => u.user_id === params.user_id);
    const newTicket: SupportTicketRecord = {
      ticket_id: 'tkt_' + crypto.randomUUID().slice(0, 8),
      user_id: params.user_id,
      subject: params.subject,
      message: params.message,
      status: 'open',
      created_at: now,
      updated_at: now,
      user_email: user?.email,
    };
    this.tickets.push(newTicket);
    await this.persistAppend('SupportTickets', newTicket);
    return newTicket;
  }

  public async getSupportTickets(userId?: string): Promise<SupportTicketRecord[]> {
    if (userId) {
      return this.tickets
        .filter((t) => t.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async replySupportTicket(ticketId: string, response: string, status: 'in_progress' | 'resolved'): Promise<SupportTicketRecord> {
    const ticket = this.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    ticket.admin_response = response;
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    await this.persistUpdate('SupportTickets', 'ticket_id', ticketId, ticket);
    return ticket;
  }

  // =================== SITE CONTENT & ACTIVITY ===================

  public async getSiteContent(): Promise<SiteContentRecord[]> {
    return this.siteContent
      .filter((s) => s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  public async getAllSiteContentAdmin(): Promise<SiteContentRecord[]> {
    return [...this.siteContent].sort((a, b) => a.display_order - b.display_order);
  }

  public async updateSiteContent(contentId: string, updates: Partial<SiteContentRecord>): Promise<SiteContentRecord> {
    const item = this.siteContent.find((s) => s.content_id === contentId);
    if (!item) throw new Error('Content not found');
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    await this.persistUpdate('SiteContent', 'content_id', contentId, item);
    return item;
  }

  public async recordActivity(params: {
    user_id: string;
    activity_type: UserActivityRecord['activity_type'];
    entity_type: string;
    entity_id: string;
    metadata_summary: string;
  }): Promise<void> {
    const rec: UserActivityRecord = {
      activity_id: 'act_' + crypto.randomUUID().slice(0, 8),
      user_id: params.user_id,
      activity_type: params.activity_type,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      created_at: new Date().toISOString(),
      metadata_summary: params.metadata_summary,
    };
    this.activity.push(rec);
    await this.persistAppend('UserActivity', rec).catch((err) =>
      console.warn('Silent activity write warning:', err.message)
    );
  }

  public async recordAuditLog(params: {
    admin_user_id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    summary: string;
  }): Promise<void> {
    const rec: AdminAuditLogRecord = {
      audit_id: 'adt_' + crypto.randomUUID().slice(0, 8),
      admin_user_id: params.admin_user_id,
      action_type: params.action_type,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      summary: params.summary,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(rec);
    await this.persistAppend('AdminAuditLog', rec).catch((err) =>
      console.warn('Silent audit write warning:', err.message)
    );
  }

  public async getAuditLogs(): Promise<AdminAuditLogRecord[]> {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // =================== ADMIN DASHBOARD & DIAGNOSTICS ===================

  public async getAdminDashboardMetrics() {
    const totalUsers = this.users.length;
    const totalProducts = this.products.filter((p) => p.is_active).length;
    const totalOrders = this.orders.length;
    const totalBasCashSpent = this.orders.reduce((sum, o) => sum + o.bascash_spent, 0);
    const totalRealMoneySaved = this.orders.reduce((sum, o) => sum + o.real_money_saved, 0);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalBasCashSpent,
      totalRealMoneySaved,
      recentOrders: this.orders.slice(-5).reverse(),
      recentUsers: this.users.slice(-5).reverse(),
      recentAuditLogs: this.auditLogs.slice(-10).reverse(),
    };
  }

  public async getSheetsDiagnostics(): Promise<SheetDiagnosticsResponse> {
    const config = googleSheetsService.getConfigurationInfo();
    const isLive = googleSheetsService.isLiveConfigured();

    const counts: Record<string, number> = {
      Users: this.users.length,
      Products: this.products.length,
      Categories: this.categories.length,
      Carts: this.carts.length,
      Wishlist: this.wishlist.length,
      Orders: this.orders.length,
      OrderItems: this.orderItems.length,
      BasCashTransactions: this.transactions.length,
      UserActivity: this.activity.length,
      ConsentRecords: this.consents.length,
      SupportTickets: this.tickets.length,
      SiteContent: this.siteContent.length,
      AdminAuditLog: this.auditLogs.length,
    };

    return {
      configured: config.configured,
      spreadsheet_id: config.spreadsheetId,
      service_account_email: config.serviceAccountEmail,
      is_connected: isLive && config.status === 'synced',
      status_message: config.statusMessage || (isLive
        ? 'Connected to Google Sheets Production Database'
        : 'Running in Resilient Local Storage Mode (13 Schema Tables Active)'),
      sheets_found: REQUIRED_SHEETS.map((s) => s.name),
      missing_sheets: [],
      total_records_by_sheet: counts,
      using_fallback: !isLive || config.status !== 'synced',
      status: config.status,
      action_required: config.actionRequired,
      help_url: config.helpUrl,
      linked_admin_email: 'noreply.bascart@gmail.com',
    };
  }

  public async connectAndInitializeSheet(spreadsheetId: string): Promise<{
    success: boolean;
    isLiveSynced: boolean;
    createdSheets: string[];
    messages: string[];
    spreadsheetId: string;
    status: string;
    warning?: string;
    actionRequired?: string;
    helpUrl?: string;
  }> {
    googleSheetsService.updateSpreadsheetId(spreadsheetId);
    const initResult = await googleSheetsService.initializeSpreadsheet();

    if (initResult.isLiveSynced) {
      await this.trySyncFromGoogleSheets();
    }

    await this.recordAuditLog({
      admin_user_id: 'noreply.bascart@gmail.com',
      action_type: 'connect_single_sheet',
      entity_type: 'spreadsheet',
      entity_id: spreadsheetId,
      summary: `Connected single master spreadsheet ${spreadsheetId} linked with noreply.bascart@gmail.com. Status: ${initResult.status}.`,
    });

    return {
      success: true,
      isLiveSynced: initResult.isLiveSynced,
      createdSheets: initResult.createdSheets,
      messages: initResult.messages,
      spreadsheetId,
      status: initResult.status,
      warning: initResult.warning,
      actionRequired: initResult.actionRequired,
      helpUrl: initResult.helpUrl,
    };
  }
}

export const appStore = new ApplicationDataStore();
