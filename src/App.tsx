import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
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

export function parseViewFromPath(pathname: string): AppView {
  const p = pathname.toLowerCase();
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
  // App state
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

  // Navigation & View synchronized with URL
  const [activeView, setActiveView] = useState<AppView>(() => parseViewFromPath(window.location.pathname));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<'terms' | 'privacy' | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRecord | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderRecord | null>(null);

  // URL Navigation helper
  const navigate = (pathOrView: string) => {
    let targetView: AppView = 'shop';
    let targetPath = '/';

    if (pathOrView.startsWith('/')) {
      targetView = parseViewFromPath(pathOrView);
      targetPath = pathOrView;
    } else {
      targetView = pathOrView as AppView;
      targetPath = getPathFromView(targetView);
    }

    setActiveView(targetView);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveView(parseViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize or fetch user session
  const initSession = async () => {
    try {
      if (getStoredUser()) {
        const profileRes = await api.getProfile();
        setUser(profileRes.user);
        setWallet(profileRes.wallet);
        const adminStatus =
          profileRes.isAdmin ||
          profileRes.user.email.toLowerCase() === 'noreply.bascart@gmail.com' ||
          profileRes.user.email.toLowerCase().includes('admin');
        setIsAdmin(adminStatus);
      } else {
        // Automatically provide demo shopper session if on home storefront
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath !== '/admin/login' && currentPath !== '/login' && currentPath !== '/customer/login') {
          const guestRes = await api.createSession({
            email: 'shopper.demo@bascart.com',
            full_name: 'Anya Sharma',
            role: 'customer',
            marketing_consent: true,
          });
          setStoredSession(guestRes.token, guestRes.user);
          setUser(guestRes.user);
          setWallet(guestRes.wallet);
          setIsAdmin(guestRes.user.email.includes('admin') || guestRes.user.email.toLowerCase() === 'noreply.bascart@gmail.com');
        }
      }
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

  // Handlers
  const handleAddToCart = async (product: ProductRecord, quantity = 1) => {
    try {
      const res = await api.addToCart(product.product_id, quantity);
      setCart(res.cart);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    }
  };

  const handleUpdateCartQuantity = async (cartId: string, qty: number) => {
    try {
      const res = await api.updateCartQuantity(cartId, qty);
      setCart(res.cart);
    } catch (err: any) {
      console.error('Update quantity error:', err);
    }
  };

  const handleRemoveCartItem = async (cartId: string) => {
    try {
      const res = await api.removeCartItem(cartId);
      setCart(res.cart);
    } catch (err: any) {
      console.error('Remove cart item error:', err);
    }
  };

  const handleToggleWishlist = async (product: ProductRecord) => {
    try {
      await api.toggleWishlist(product.product_id);
      const res = await api.getWishlist();
      setWishlist(res.wishlist);
    } catch (err: any) {
      console.error('Wishlist error:', err);
    }
  };

  const handleConfirmCheckout = async (payload: {
    idempotency_key: string;
    shipping_name: string;
    shipping_city: string;
  }) => {
    const res = await api.checkout(payload);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setSuccessOrder(res.order);
    await loadUserData();
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

  // Filter & Sort Products
  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
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
      {/* Top Header */}
      <Header
        user={user}
        wallet={wallet}
        cartCount={cartTotalItems}
        activeView={activeView}
        onNavigate={navigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* CUSTOMER LOGIN PAGE (/login & /customer/login) */}
        {activeView === 'customer_login' && (
          <CustomerLoginPage
            onLoginSuccess={(u, t, w) => {
              handleLoginSuccess(u, t, w);
              navigate('/shop');
            }}
            onNavigate={navigate}
          />
        )}

        {/* ADMIN LOGIN PAGE (/admin/login) */}
        {activeView === 'admin_login' && (
          <AdminLoginPage
            onLoginSuccess={(u, t, w) => {
              handleLoginSuccess(u, t, w);
              navigate('/admin');
            }}
            onNavigate={navigate}
          />
        )}

        {/* STOREFRONT CATALOG (/) */}
        {activeView === 'shop' && (
          <div>
            {/* Hero Section */}
            <Hero
              wallet={wallet}
              onExploreClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenWallet={() => navigate('/wallet')}
            />

            {/* Catalog Section */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              {/* Category Filter & Search Strip */}
              <div className="mb-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                      Curated Imaginary Catalog
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Select items to add to your simulated cart. Real charge: ₹0.
                    </p>
                  </div>

                  {/* Search and Sort */}
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

                {/* Category Segmented Filter Buttons */}
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

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-stone-400 bg-white border border-stone-200 rounded-2xl p-8">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                  <p className="text-sm font-semibold text-stone-700">No products found</p>
                  <p className="text-xs text-stone-500 mt-1">Try adjusting your search or category filter.</p>
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
                        onToggleWishlist={handleToggleWishlist}
                        onViewDetails={(p) => setDetailProduct(p)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* WALLET VIEW (/wallet) */}
        {activeView === 'wallet' && (
          <WalletView
            wallet={wallet}
            onRefresh={loadUserData}
            onStartShopping={() => navigate('/shop')}
          />
        )}

        {/* ORDERS VIEW (/orders) */}
        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            onStartShopping={() => navigate('/shop')}
          />
        )}

        {/* IMPACT VIEW (/impact) */}
        {activeView === 'impact' && (
          <ImpactView
            wallet={wallet}
            orders={orders}
            onStartShopping={() => navigate('/shop')}
          />
        )}

        {/* ADMIN PORTAL (/admin) */}
        {activeView === 'admin' && (
          isAdmin ? (
            <AdminPortal />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-amber-950">
                  Administrator Authentication Required
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed max-w-md mx-auto">
                  Access to the Google Sheets Data Engine and Admin Operations Console requires authorized credentials.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 transition-colors shadow-sm"
                  >
                    Go to Admin Login (/admin/login)
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPolicy={(type) => setPolicyModalType(type)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onNavigate={navigate}
        isAdmin={isAdmin}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        wallet={wallet}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        isWishlisted={detailProduct ? wishlist.some((w) => w.product_id === detailProduct.product_id) : false}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        wallet={wallet}
        onConfirmCheckout={handleConfirmCheckout}
      />

      {/* Order Success Celebration Modal */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onViewOrders={() => navigate('/orders')}
      />

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      {/* Customer Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Policy & Terms Modal */}
      <PolicyModal
        isOpen={policyModalType !== null}
        onClose={() => setPolicyModalType(null)}
        policyType={policyModalType || 'terms'}
      />
    </div>
  );
}
