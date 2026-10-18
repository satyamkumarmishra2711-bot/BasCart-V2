import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Sparkles, Send, Check } from 'lucide-react';
import { api, getStoredUser, setStoredSession, clearStoredSession } from './services/api.ts';
import type {
  UserRecord,
  ProductRecord,
  CategoryRecord,
  CartItemRecord,
  WishlistItemRecord,
  OrderRecord,
  WalletState,
} from './shared/types.ts';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { WalletView } from './components/WalletView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { ImpactView } from './components/ImpactView.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SupportModal } from './components/SupportModal.tsx';
import { PolicyModal } from './components/PolicyModal.tsx';
import { Footer } from './components/Footer.tsx';
import { CustomerLoginPage } from './components/CustomerLoginPage.tsx';
import { AdminLoginPage } from './components/AdminLoginPage.tsx';

export type AppView = 'shop' | 'wallet' | 'orders' | 'impact' | 'admin' | 'customer_login' | 'admin_login';

export function getSubpathBase(): string {
  if (typeof window === 'undefined') return '';
  const p = window.location.pathname.toLowerCase();
  if (p.startsWith('/bascart-v2')) {
    return '/BasCart-V2';
  }
  return '';
}

export function parseViewFromPath(pathname: string, hash = ''): AppView {
  // Check hash route first (e.g. #/login, #/admin/login, #/admin)
  if (hash) {
    const h = hash.replace(/^#/, '').toLowerCase();
    if (h === '/admin/login' || h === 'admin/login') return 'admin_login';
    if (h === '/admin' || h === 'admin') return 'admin';
    if (h === '/login' || h === 'login' || h === '/customer/login' || h === '/customer') return 'customer_login';
    if (h === '/wallet' || h === 'wallet') return 'wallet';
    if (h === '/orders' || h === 'orders') return 'orders';
    if (h === '/impact' || h === 'impact') return 'impact';
  }

  // Normalize pathname by stripping GitHub Pages repo subpath
  let p = pathname.toLowerCase();
  if (p.startsWith('/bascart-v2')) {
    p = p.slice('/bascart-v2'.length);
  }
  p = p.replace(/\/$/, '') || '/';

  if (p === '/admin/login') return 'admin_login';
  if (p === '/admin') return 'admin';
  if (p === '/login' || p === '/customer/login' || p === '/customer') return 'customer_login';
  if (p === '/wallet') return 'wallet';
  if (p === '/orders') return 'orders';
  if (p === '/impact') return 'impact';
  return 'shop';
}

export function getPathFromView(view: AppView): string {
  switch (view) {
    case 'admin_login':
      return '/admin/login';
    case 'customer_login':
      return '/login';
    case 'admin':
      return '/admin';
    case 'wallet':
      return '/wallet';
    case 'orders':
      return '/orders';
    case 'impact':
      return '/impact';
    case 'shop':
    default:
      return '/';
  }
}

export default function App() {
  const [user, setUser] = useState<UserRecord | null>(getStoredUser());
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = getStoredUser();
    if (!stored) return false;
    const email = stored.email.toLowerCase();
    return email === 'noreply.bascart@gmail.com' || email.includes('admin') || email.includes('satyam');
  });

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [cart, setCart] = useState<CartItemRecord[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItemRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const [activeView, setActiveView] = useState<AppView>(() =>
    parseViewFromPath(window.location.pathname, window.location.hash)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<'terms' | 'privacy' | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRecord | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderRecord | null>(null);

  // Inline Sign-up state for unauthenticated welcome page
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const navigate = (pathOrView: string) => {
    let targetView: AppView = 'shop';
    let targetSubpath = '/';
    if (pathOrView.startsWith('/')) {
      targetView = parseViewFromPath(pathOrView, '');
      targetSubpath = pathOrView;
    } else {
      targetView = pathOrView as AppView;
      targetSubpath = getPathFromView(targetView);
    }
    setActiveView(targetView);

    const base = getSubpathBase();
    const finalPath = `${base}${targetSubpath === '/' ? (base ? '/' : '/') : targetSubpath}`;
    if (window.location.pathname !== finalPath) {
      window.history.pushState(null, '', finalPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveView(parseViewFromPath(window.location.pathname, window.location.hash));
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const initSession = async () => {
    try {
      if (getStoredUser()) {
        const profileRes = await api.getProfile();
        setUser(profileRes.user);
        setWallet(profileRes.wallet);
        setIsAdmin(
          profileRes.isAdmin ||
          profileRes.user.email.toLowerCase() === 'noreply.bascart@gmail.com' ||
          profileRes.user.email.toLowerCase().includes('admin')
        );
      }
      // Guest session creation removed so unauthenticated users must sign up first
    } catch (err) {
      console.error('Session init error:', err);
    }
  };

  const loadCatalog = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(catsRes.categories);
      setProducts(prodsRes.products);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    try {
      const [cartRes, wishRes, ordersRes, walletRes] = await Promise.allSettled([
        api.getCart(),
        api.getWishlist(),
        api.getOrders(),
        api.getWallet(),
      ]);
      if (cartRes.status === 'fulfilled') setCart(cartRes.value.cart);
      if (wishRes.status === 'fulfilled') setWishlist(wishRes.value.wishlist);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.orders);
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value.wallet);
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  };

  useEffect(() => {
    initSession();
    loadCatalog();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const requireAuth = (action: () => void) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    action();
  };

  const handleAddToCart = async (product: ProductRecord, quantity = 1) => {
    requireAuth(async () => {
      try {
        const res = await api.addToCart(product.product_id, quantity);
        setCart(res.cart);
      } catch (err: any) {
        alert(err.message || 'Could not add to cart');
      }
    });
  };

  const handleInlineSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim()) return;
    setSignupLoading(true);
    setSignupError(null);
    try {
      await api.sendOtp(signupEmail.trim());
      setSignupStep('otp');
    } catch (err: any) {
      setSignupError(err.message || 'Failed to dispatch OTP');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleInlineVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupOtp.trim()) return;
    setSignupLoading(true);
    setSignupError(null);
    try {
      const res = await api.verifyOtp({
        email: signupEmail.trim(),
        otp: signupOtp.trim(),
        full_name: signupName.trim() || undefined,
        marketing_consent: true,
      });
      handleLoginSuccess(res.user, res.token, res.wallet);
    } catch (err: any) {
      setSignupError(err.message || 'Verification failed');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLoginSuccess = (newUser: UserRecord, token: string, newWallet: WalletState) => {
    setStoredSession(token, newUser);
    setUser(newUser);
    setWallet(newWallet);
    const hasAdminAccess =
      newUser.email.toLowerCase() === 'noreply.bascart@gmail.com' ||
      newUser.email.toLowerCase().includes('admin') ||
      newUser.email.toLowerCase().includes('satyam');
    setIsAdmin(hasAdminAccess);
    loadUserData();
  };

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    setWallet(null);
    setIsAdmin(false);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    navigate('/shop');
  };

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.product_name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.display_order - b.display_order;
    });

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      <Header
        user={user}
        wallet={wallet}
        cartCount={cartTotalItems}
        activeView={activeView}
        onNavigate={navigate}
        onOpenCart={() => requireAuth(() => setIsCartOpen(true))}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAdmin={isAdmin}
      />

      <main className="flex-1">
        {activeView === 'customer_login' && (
          <CustomerLoginPage
            onLoginSuccess={(u, t, w) => {
              handleLoginSuccess(u, t, w);
              navigate('/shop');
            }}
            onNavigate={navigate}
          />
        )}

        {activeView === 'admin_login' && (
          <AdminLoginPage
            onLoginSuccess={(u, t, w) => {
              handleLoginSuccess(u, t, w);
              navigate('/admin');
            }}
            onNavigate={navigate}
          />
        )}

        {activeView === 'shop' && (
          <div>
            {!user ? (
              /* WELCOME / INTRO + SIGNUP VIEW (No product catalog shown prior to sign in) */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Guilt-Free Retail Therapy</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    Your cart is full. <br />
                    <span className="text-stone-500 font-light italic">Your wallet isn't.</span>
                  </h1>
                  <p className="text-base text-stone-600 leading-relaxed">
                    BasCart allows you to satisfy your shopping impulses without touching your real bank balance. Complete sign-up to unlock your <strong className="text-stone-900 font-bold">₹50,000 virtual BasCash grant</strong> and begin browsing luxury catalogs.
                  </p>
                  <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Sign-Up Welcome Grant</span>
                      <span className="font-bold text-amber-600 text-sm">₹50,000 BasCash</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Real Bank Card Charge</span>
                      <span className="font-bold text-emerald-700 text-sm">₹0.00 Guaranteed</span>
                    </div>
                  </div>
                </div>

                {/* SIGN UP FORM ON WELCOME UI */}
                <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900">Create Account & Claim Grant</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Enter your details to receive your single-use verification code and allocate your BasCash balance.
                    </p>
                  </div>

                  {signupError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      {signupError}
                    </div>
                  )}

                  {signupStep === 'form' ? (
                    <form onSubmit={handleInlineSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Satyam Mishra"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. user@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4 text-stone-950" />
                        <span>{signupLoading ? 'Sending OTP...' : 'Sign Up & Claim ₹50,000'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleInlineVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Enter 6-Digit OTP sent to {signupEmail}</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="123456"
                          value={signupOtp}
                          onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-stone-900 font-bold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={signupLoading || signupOtp.length !== 6}
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{signupLoading ? 'Verifying...' : 'Verify OTP & Enter Storefront'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* AUTHENTICATED STOREFRONT CATALOG */
              <div>
                <Hero
                  user={user}
                  wallet={wallet}
                  onExploreClick={() => {
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenWallet={() => navigate('/wallet')}
                  onSignUpClick={() => setIsAuthOpen(true)}
                />
                <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <div className="mb-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                          Curated Imaginary Catalog
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Select items to add to your simulated cart. Real charge: ₹0.00
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-stone-900 w-48 sm:w-64"
                          />
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-700"
                        >
                          <option value="featured">Featured First</option>
                          <option value="price_asc">Price: Low to High</option>
                          <option value="price_desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                        }`}
                      >
                        All Items ({products.length})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.category_id}
                          onClick={() => setSelectedCategory(cat.category_id)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                            selectedCategory === cat.category_id
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                          }`}
                        >
                          {cat.category_name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 bg-white border border-stone-200 rounded-2xl p-8">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                      <p className="text-sm font-semibold text-stone-700">No products found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredProducts.map((product) => {
                        const isWishlisted = wishlist.some((w) => w.product_id === product.product_id);
                        return (
                          <ProductCard
                            key={product.product_id}
                            product={product}
                            isWishlisted={isWishlisted}
                            onAddToCart={(p) => handleAddToCart(p, 1)}
                            onToggleWishlist={(p) => requireAuth(() => api.toggleWishlist(p.product_id))}
                            onViewDetails={(p) => setDetailProduct(p)}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}

        {activeView === 'wallet' && (
          <WalletView
            user={user}
            wallet={wallet}
            onRefresh={loadUserData}
            onStartShopping={() => navigate('/shop')}
            onNavigate={navigate}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            onStartShopping={() => navigate('/shop')}
          />
        )}

        {activeView === 'impact' && (
          <ImpactView
            wallet={wallet}
            orders={orders}
            onStartShopping={() => navigate('/shop')}
          />
        )}

        {activeView === 'admin' && (
          isAdmin ? (
            <AdminPortal />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-amber-950">Administrator Access Required</h3>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 transition-colors shadow-sm"
                >
                  Go to Admin Login (/admin/login)
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <Footer
        onOpenPolicy={(type) => setPolicyModalType(type)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onNavigate={navigate}
        isAdmin={isAdmin}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        wallet={wallet}
        onUpdateQuantity={(cartId, qty) => requireAuth(() => api.updateCartQuantity(cartId, qty))}
        onRemoveItem={(cartId) => requireAuth(() => api.removeCartItem(cartId))}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProductDetailModal
        product={detailProduct}
        isWishlisted={detailProduct ? wishlist.some((w) => w.product_id === detailProduct.product_id) : false}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={(p) => requireAuth(() => api.toggleWishlist(p.product_id))}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        wallet={wallet}
        onConfirmCheckout={async (payload) => {
          const res = await api.checkout(payload);
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
          setSuccessOrder(res.order);
          await loadUserData();
        }}
      />

      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onViewOrders={() => navigate('/orders')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <PolicyModal
        isOpen={policyModalType !== null}
        onClose={() => setPolicyModalType(null)}
        policyType={policyModalType || 'terms'}
      />
    </div>
  );
}