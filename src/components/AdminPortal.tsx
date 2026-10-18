import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Database,
  ShoppingBag,
  Users as UsersIcon,
  HelpCircle,
  Activity,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Send,
  KeyRound,
  Lock,
  Image as ImageIcon,
  Upload,
  Trash2,
} from 'lucide-react';
import { api, getStoredLogo, setStoredLogo, clearStoredLogo } from '../services/api.ts';
import type {
  ProductRecord,
  SheetDiagnosticsResponse,
  SupportTicketRecord,
  AdminAuditLogRecord,
  OrderRecord,
} from '../shared/types.ts';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'products' | 'sheets' | 'email' | 'support' | 'audit'>('overview');
  const [currentLogo, setCurrentLogo] = useState<string | null>(() => getStoredLogo());
  const [logoMsg, setLogoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const portalLogoInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePortalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLogoMsg({ type: 'error', text: 'Logo file size must be less than 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoredLogo(reader.result);
        setCurrentLogo(reader.result);
        setLogoMsg({ type: 'success', text: 'Store logo updated successfully! Visible on header, storefront, and login.' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = () => {
    clearStoredLogo();
    setCurrentLogo(null);
    setLogoMsg({ type: 'success', text: 'Store logo reset to default BasCart wordmark.' });
  };
  const [metrics, setMetrics] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<SheetDiagnosticsResponse | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Email / SMTP delivery state
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('noreply.bascart@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [testEmailRecipient, setTestEmailRecipient] = useState('satyamkumarmishra2711@gmail.com');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResultMsg, setSmtpResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('3999');
  const [newProductCat, setNewProductCat] = useState('cat_gadgets');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImg, setNewProductImg] = useState('/src/assets/images/product_gadget_headphones_1791637652144.jpg');

  // Single Sheet Connection form
  const [inputSpreadsheetId, setInputSpreadsheetId] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (emailText: string) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Support reply form
  const [replyText, setReplyText] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, diag, prods, supp, logs, smtpRes] = await Promise.allSettled([
        api.getAdminDashboard(),
        api.getAdminSheetsDiagnostics(),
        api.getAdminProducts(),
        api.getAdminSupport(),
        api.getAdminAuditLogs(),
        api.getAdminSmtpStatus(),
      ]);

      if (dash.status === 'fulfilled') setMetrics(dash.value);
      if (diag.status === 'fulfilled') setDiagnostics(diag.value);
      if (prods.status === 'fulfilled') setProducts(prods.value.products);
      if (supp.status === 'fulfilled') setTickets(supp.value.tickets);
      if (logs.status === 'fulfilled') setAuditLogs(logs.value.logs);
      if (smtpRes.status === 'fulfilled') {
        const s = smtpRes.value.status;
        setSmtpStatus(s);
        if (s.senderEmail) setSmtpUser(s.senderEmail);
        if (s.host) setSmtpHost(s.host);
        if (s.port) setSmtpPort(s.port.toString());
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpTesting(true);
    setSmtpResultMsg(null);
    try {
      const res = await api.saveAdminSmtpConfig({
        host: smtpHost.trim(),
        port: parseInt(smtpPort, 10) || 465,
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
        secure: smtpPort === '465',
      });
      setSmtpResultMsg({ type: 'success', text: res.message });
      setSmtpPass('');
      await loadData();
    } catch (err: any) {
      setSmtpResultMsg({ type: 'error', text: err.message || 'Failed to save SMTP config' });
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient.trim()) return;
    setSmtpTesting(true);
    setSmtpResultMsg(null);
    try {
      const res = await api.sendAdminTestEmail(testEmailRecipient.trim());
      setSmtpResultMsg({ type: 'success', text: res.message });
    } catch (err: any) {
      setSmtpResultMsg({ type: 'error', text: err.message || 'Failed to send test email' });
    } finally {
      setSmtpTesting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitSheets = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.initSheets();
      setActionMessage(
        `Google Sheets Initialized! ${res.messages.join(' · ') || 'All 13 worksheets verified.'}`
      );
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    let sheetId = inputSpreadsheetId.trim();
    if (!sheetId) return;

    // Handle full Google Sheet URL if user pasted the entire link
    if (sheetId.includes('/d/')) {
      const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      }
    }

    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.connectSheet(sheetId);
      setActionMessage(
        `Connected Single Master Sheet linked with noreply.bascart@gmail.com! Auto-created/verified 13 tabs: ${
          res.result.createdSheets.join(', ') || 'All tabs ready'
        }`
      );
      setInputSpreadsheetId('');
      await loadData();
    } catch (err: any) {
      setActionMessage(`Failed to connect sheet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    try {
      const slug = newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await api.createAdminProduct({
        product_name: newProductName,
        slug,
        category_id: newProductCat,
        description: newProductDesc || 'Curated luxury simulated item.',
        price: parseInt(newProductPrice, 10) || 1000,
        image_url: newProductImg,
        stock_status: 'in_stock',
        is_featured: true,
        is_active: true,
        display_order: products.length + 1,
      });

      setNewProductName('');
      setNewProductDesc('');
      setActionMessage('Product created successfully and recorded in inventory.');
      await loadData();
    } catch (err: any) {
      setActionMessage(`Failed to create product: ${err.message}`);
    }
  };

  const handleToggleProductStatus = async (product: ProductRecord) => {
    try {
      await api.updateAdminProduct(product.product_id, {
        is_active: !product.is_active,
      });
      await loadData();
    } catch (err: any) {
      setActionMessage(`Failed to update product: ${err.message}`);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!replyText.trim()) return;
    try {
      await api.replyAdminSupport(ticketId, replyText, 'resolved');
      setReplyText('');
      setSelectedTicketId(null);
      setActionMessage('Response sent to customer support ticket.');
      await loadData();
    } catch (err: any) {
      setActionMessage(`Failed to reply: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Authenticated Administration Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            BasCart Enterprise Operations
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage product catalog, inspect transactions, and monitor Google Sheets synchronization.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-stone-900 text-stone-100 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-stone-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Dashboard KPIs', icon: Activity },
          { id: 'branding', label: 'Store Logo & Brand', icon: ImageIcon },
          { id: 'products', label: 'Product Inventory', icon: ShoppingBag },
          { id: 'sheets', label: 'Google Sheets DB', icon: Database },
          { id: 'email', label: 'Email & OTP Dispatch', icon: Mail },
          { id: 'support', label: 'Support Inquiries', icon: HelpCircle },
          { id: 'audit', label: 'Security Audit Log', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <span className="text-xs text-stone-500">Registered Shoppers</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 tabular-nums">
                {metrics.totalUsers}
              </div>
            </div>
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <span className="text-xs text-stone-500">Active Catalog SKUs</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 tabular-nums">
                {metrics.totalProducts}
              </div>
            </div>
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <span className="text-xs text-stone-500">Simulated Orders</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 tabular-nums">
                {metrics.totalOrders}
              </div>
            </div>
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
              <span className="text-xs text-emerald-800 font-medium">Real Money Saved</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2 tabular-nums">
                ₹{metrics.totalRealMoneySaved.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">Recent Customer Imaginary Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">BasCash Spent</th>
                    <th className="py-2.5 px-4">Real Paid</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {metrics.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-stone-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    metrics.recentOrders.map((ord: OrderRecord) => (
                      <tr key={ord.order_id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{ord.order_number}</td>
                        <td className="py-2.5 px-4 text-stone-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                        <td className="py-2.5 px-4 font-semibold tabular-nums">₹{ord.total_amount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-semibold">₹0.00</td>
                        <td className="py-2.5 px-4 text-stone-600">{ord.order_status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STORE LOGO & BRANDING */}
      {activeTab === 'branding' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Identity & Brand Asset</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">Storefront Logo</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Upload your custom store logo. It will immediately appear in the header navigation bar, storefront, and authentication screens across desktop and mobile.
              </p>
            </div>

            {logoMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  logoMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <span>{logoMsg.text}</span>
                <button
                  type="button"
                  onClick={() => setLogoMsg(null)}
                  className="text-[11px] font-bold underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Live Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-stone-200 bg-white">
                <span className="text-[11px] font-semibold text-stone-500 block mb-3">
                  Light Theme Preview (Storefront Navigation)
                </span>
                <div className="h-20 flex items-center justify-center p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  {currentLogo ? (
                    <img
                      src={currentLogo}
                      alt="Store Logo Preview"
                      className="max-h-12 max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xl font-bold text-stone-900">
                      <span>BasCart</span>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 bg-stone-200 px-1.5 py-0.5 rounded">
                        Virtual
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900 text-white">
                <span className="text-[11px] font-semibold text-stone-400 block mb-3">
                  Dark Theme Preview (Footer / Ticker)
                </span>
                <div className="h-20 flex items-center justify-center p-3 bg-stone-800/80 rounded-xl border border-dashed border-stone-700">
                  {currentLogo ? (
                    <img
                      src={currentLogo}
                      alt="Store Logo Preview"
                      className="max-h-12 max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xl font-bold text-white">
                      <span>BasCart</span>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 bg-stone-700 px-1.5 py-0.5 rounded">
                        Virtual
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-stone-200 hover:border-amber-500 rounded-2xl p-8 text-center bg-stone-50/60 transition-colors">
              <input
                ref={portalLogoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePortalLogoUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Choose Image or Drag & Drop</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Supports PNG, JPG, WebP, SVG, and GIF up to 5MB
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => portalLogoInputRef.current?.click()}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
                  </button>
                  {currentLogo && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-4 py-2.5 border border-stone-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reset to Default Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-1.5">
              <span className="font-bold block">Tips for Best Visual Appearance:</span>
              <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px]">
                <li>Use a transparent PNG or SVG so the logo looks crisp on any background.</li>
                <li>Horizontal logo formats (~200px wide by 50px high) fit most gracefully in the navigation header.</li>
                <li>The uploaded logo is saved in browser storage and will be active immediately on both local dev and GitHub Pages.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          {/* Add Product Form */}
          <form onSubmit={handleCreateProduct} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add New Catalog SKU</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Italian Linen Minimalist Robe"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Virtual Price (₹)</label>
                <input
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Category</label>
                <select
                  value={newProductCat}
                  onChange={(e) => setNewProductCat(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                >
                  <option value="cat_gadgets">Gadgets</option>
                  <option value="cat_fashion">Fashion</option>
                  <option value="cat_home">Home</option>
                  <option value="cat_accessories">Accessories</option>
                  <option value="cat_food">Food</option>
                  <option value="cat_electronics">Electronics</option>
                  <option value="cat_lifestyle">Lifestyle</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Product Description</label>
                <input
                  type="text"
                  placeholder="Materials, specifications, design ethos..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={newProductImg}
                  onChange={(e) => setNewProductImg(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Publish to Catalog
              </button>
            </div>
          </form>

          {/* Products List Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-stone-900">Current Catalog ({products.length} items)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.product_id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.product_name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <span className="font-semibold text-stone-900">{p.product_name}</span>
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px] text-stone-500 font-medium">
                        {p.category_id.replace('cat_', '')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.stock_status}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className="text-xs text-stone-700 hover:text-stone-900 font-medium underline"
                        >
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS DB DIAGNOSTICS & SETUP */}
      {activeTab === 'sheets' && diagnostics && (
        <div className="space-y-8">
          {/* Connect Single Sheet Form linked with noreply.bascart@gmail.com */}
          <form
            onSubmit={handleConnectSheet}
            className="p-6 bg-amber-50/70 border border-amber-200/90 rounded-2xl shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-amber-700" />
                  <h3 className="text-base font-bold text-amber-950">
                    Connect Single Master Google Spreadsheet
                  </h3>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Linked with administrator identity <strong className="font-semibold text-stone-900">noreply.bascart@gmail.com</strong>.
                  Connecting the sheet will automatically create and format all 13 required tabs with standardized column headers!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                placeholder="Paste Spreadsheet ID or full Google Sheet URL..."
                value={inputSpreadsheetId}
                onChange={(e) => setInputSpreadsheetId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-stone-900 focus:outline-stone-900 placeholder:text-stone-400"
                required
              />
              <button
                type="submit"
                disabled={loading || !inputSpreadsheetId.trim()}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors whitespace-nowrap shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect & Auto-Create All 13 Tabs</span>
              </button>
            </div>
          </form>

          {/* Current Live Connection Status */}
          <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      diagnostics.is_connected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <h3 className="text-base font-bold text-stone-900">
                    {diagnostics.is_connected
                      ? 'Live Google Sheets Connection Active'
                      : 'Local Resilient Cache Active (Production Ready)'}
                  </h3>
                </div>
                <p className="text-xs text-stone-500">{diagnostics.status_message}</p>
              </div>

              <div className="flex items-center gap-2">
                {diagnostics.spreadsheet_id && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${diagnostics.spreadsheet_id}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Sheet ↗</span>
                  </a>
                )}
                <button
                  onClick={handleInitSheets}
                  disabled={loading}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify & Sync 13 Tabs</span>
                </button>
              </div>
            </div>

            {/* Troubleshooting & Action Required Callout */}
            {diagnostics.status === 'permission_denied' && diagnostics.service_account_email && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Action Required: Share Spreadsheet with Service Account</span>
                </div>
                <p className="leading-relaxed">
                  To enable live synchronization, please open your Google Spreadsheet, click the blue <strong>"Share"</strong> button at the top right, and invite the Service Account email as an <strong>"Editor"</strong>:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white border border-amber-300 rounded-lg">
                  <span className="font-mono text-xs font-semibold text-stone-800 break-all select-all flex-1">
                    {diagnostics.service_account_email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(diagnostics.service_account_email!)}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>
            )}

            {diagnostics.status === 'api_disabled' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Action Required: Enable Google Sheets API in Google Cloud</span>
                </div>
                <p className="leading-relaxed">
                  The Google Sheets API is currently disabled in your Google Cloud Project. Enable it in one click in the Google Cloud Console:
                </p>
                {diagnostics.help_url && (
                  <a
                    href={diagnostics.help_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                  >
                    <span>Enable Google Sheets API in GCP Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <p className="text-[11px] text-amber-800 pt-1">
                  In the meantime, BasCart is running uninterrupted in local storage mode with all 13 schema tables active.
                </p>
              </div>
            )}

            {/* Config Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
              <div>
                <span className="block text-stone-400 font-medium">Linked Admin Email:</span>
                <span className="font-mono text-stone-800 font-semibold">noreply.bascart@gmail.com</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium">Spreadsheet Target:</span>
                <span className="font-mono text-stone-800 break-all">
                  {diagnostics.spreadsheet_id || 'Not configured in .env (Using simulated schema store)'}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium">Service Account Identity:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-stone-800 break-all text-[11px]">
                    {diagnostics.service_account_email || 'Service account pending in .env'}
                  </span>
                  {diagnostics.service_account_email && (
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(diagnostics.service_account_email!)}
                      title="Copy Service Account Email"
                      className="p-1 text-stone-400 hover:text-stone-800 rounded transition-colors shrink-0"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 13 Worksheets Audit Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                13 Official Google Sheets Schema Tables
              </h3>
              <span className="text-xs text-stone-500">PRD Section 4 Standard</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4">Worksheet Name</th>
                    <th className="py-2.5 px-4">Entity Type</th>
                    <th className="py-2.5 px-4 text-right">Rows / Records</th>
                    <th className="py-2.5 px-4">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {Object.entries(diagnostics.total_records_by_sheet).map(([sheet, count]) => (
                    <tr key={sheet}>
                      <td className="py-2.5 px-4 font-semibold text-stone-900 font-mono">{sheet}</td>
                      <td className="py-2.5 px-4 text-stone-500">Simulated Commerce Record</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums">{count}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Schema Synced</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
            <h4 className="font-bold text-stone-900">How to Connect Your Real Google Spreadsheet:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-600 leading-relaxed">
              <li>Create a new Google Spreadsheet named <code>BasCart Production Database</code>.</li>
              <li>Create a Google Cloud Service Account in your GCP console and generate a JSON key.</li>
              <li>Share the Google Spreadsheet with the Service Account email as <strong>Editor</strong>.</li>
              <li>Add <code>GOOGLE_SHEETS_SPREADSHEET_ID</code>, <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, and <code>GOOGLE_PRIVATE_KEY</code> to your environment variables or Vercel dashboard.</li>
              <li>Click <strong>Initialize & Repair All 13 Worksheets</strong> above to automatically configure all headers!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB: EMAIL & OTP DISPATCH */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">
                    Email OTP Delivery Service
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  Authentication OTP codes are dispatched from <strong className="text-stone-800">noreply.bascart@gmail.com</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    smtpStatus?.isConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      smtpStatus?.isConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>
                    {smtpStatus?.isConfigured
                      ? 'Live SMTP Transport Active'
                      : 'Pending SMTP / Gmail App Password'}
                  </span>
                </span>
              </div>
            </div>

            {smtpResultMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  smtpResultMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {smtpResultMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{smtpResultMsg.text}</span>
              </div>
            )}

            {/* Diagnostics Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100 text-xs">
              <div>
                <span className="block text-stone-400 font-medium">Designated Sender:</span>
                <span className="font-mono text-stone-800 font-semibold">{smtpStatus?.senderEmail || 'noreply.bascart@gmail.com'}</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium">SMTP Host & Port:</span>
                <span className="font-mono text-stone-800">
                  {smtpStatus?.host || 'smtp.gmail.com'}:{smtpStatus?.port || 465}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium">Transport Security:</span>
                <span className="text-stone-800 font-medium">SSL / TLS (Secure: true)</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium">Password Stored:</span>
                <span className={`font-semibold ${smtpStatus?.hasPassword ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {smtpStatus?.hasPassword ? 'Yes (Encrypted/Configured)' : 'No (Needs App Password)'}
                </span>
              </div>
            </div>

            {smtpStatus?.lastDispatchError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold">Latest Dispatch Notice: </span>
                <span>{smtpStatus.lastDispatchError}</span>
              </div>
            )}
          </div>

          {/* Configuration Form & Google App Password Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-stone-700" />
                <span>Configure Gmail / SMTP Credentials</span>
              </h4>
              <p className="text-xs text-stone-500">
                Save credentials to immediately enable live email delivery to real inboxes.
              </p>

              <form onSubmit={handleSaveSmtpConfig} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    SMTP User / Sender
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    placeholder="noreply.bascart@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Gmail App Password (16 characters)
                  </label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                    placeholder="e.g. abcd efgh ijkl mnop"
                    required
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Never uses personal passwords; use an App Password generated by Google.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={smtpTesting || !smtpPass.trim()}
                  className="w-full py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{smtpTesting ? 'Verifying & Connecting...' : 'Save & Verify Connection'}</span>
                </button>
              </form>
            </div>

            {/* Google Guide & Live Test Sender */}
            <div className="space-y-6">
              {/* Live Test Sender */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Send Test Email (Verify Delivery)</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Send a live test verification OTP email to any real inbox to confirm delivery.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                      placeholder="e.g. satyamkumarmishra2711@gmail.com"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={smtpTesting || !testEmailRecipient.trim()}
                    className="w-full py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{smtpTesting ? 'Sending Test Email...' : 'Send Live Test OTP Email'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step instructions for Google App Password */}
              <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-stone-900">How to Create a Gmail App Password:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-600 leading-relaxed">
                  <li>
                    Visit Google Account Security App Passwords:{' '}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      className="text-stone-900 font-bold underline inline-flex items-center gap-1"
                    >
                      myaccount.google.com/apppasswords
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Sign in with your Google Account for <code>noreply.bascart@gmail.com</code>.</li>
                  <li>Enter App Name as <strong>BasCart</strong> and click <strong>Create</strong>.</li>
                  <li>Copy the 16-character code (format: <code>xxxx xxxx xxxx xxxx</code>).</li>
                  <li>Paste it in the form above and click <strong>Save & Verify Connection</strong>!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT INQUIRIES */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 mb-4">Customer Support Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-xs text-stone-400">No support inquiries pending.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.ticket_id} className="p-4 border border-stone-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900">{t.subject}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-100 text-amber-800">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-stone-600">{t.message}</p>
                    <div className="text-[11px] text-stone-400">
                      User: {t.user_email || t.user_id} · {new Date(t.created_at).toLocaleString()}
                    </div>
                    {t.admin_response ? (
                      <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 border border-emerald-200 mt-2">
                        <strong>Admin Response:</strong> {t.admin_response}
                      </div>
                    ) : (
                      <div className="pt-2">
                        {selectedTicketId === t.ticket_id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write helpful response to shopper..."
                              className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReplyTicket(t.ticket_id)}
                                className="px-3 py-1.5 bg-stone-900 text-white rounded-md text-xs font-semibold"
                              >
                                Send Reply & Resolve
                              </button>
                              <button
                                onClick={() => setSelectedTicketId(null)}
                                className="px-3 py-1.5 border border-stone-300 rounded-md text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTicketId(t.ticket_id)}
                            className="text-stone-900 font-semibold underline text-xs"
                          >
                            Reply to customer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900">Administrative Security Audit Trail</h3>
            <span className="text-xs text-stone-400">Tamper-evident operations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                  <th className="py-2.5 px-4">Audit Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-stone-400">
                      No admin actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.audit_id}>
                      <td className="py-2.5 px-4 whitespace-nowrap text-stone-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-stone-900">{log.action_type}</td>
                      <td className="py-2.5 px-4 font-mono text-stone-600">{log.entity_id}</td>
                      <td className="py-2.5 px-4 text-stone-700">{log.summary}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
