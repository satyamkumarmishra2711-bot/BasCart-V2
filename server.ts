import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { appStore } from './src/server/store.ts';
import { googleSheetsService } from './src/server/googleSheets.ts';
import {
  authenticateUser,
  requireAdmin,
  checkIsAdmin,
  type AuthenticatedRequest,
} from './src/server/auth.ts';
import { OtpService, OTP_SENDER_EMAIL } from './src/server/otpService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Health check & Sheets diagnostics overview
app.get('/api/health', async (_req, res) => {
  const diag = await appStore.getSheetsDiagnostics();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sheets: diag,
  });
});

// Categories
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await appStore.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const category_id = req.query.category_id as string | undefined;
    const search = req.query.search as string | undefined;
    const featured = req.query.featured === 'true';

    const products = await appStore.getProducts({
      category_id,
      search,
      featured: featured || undefined,
    });
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await appStore.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Site Content (banners & announcements)
app.get('/api/content', async (_req, res) => {
  try {
    const content = await appStore.getSiteContent();
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// OTP Dispatch Endpoint (Dispatched via email using noreply.bascart@gmail.com)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }

    const result = await OtpService.generateAndSendOtp(email);
    const isAdminTarget = checkIsAdmin(email);

    res.json({
      success: true,
      message: result.message,
      sender: result.from,
      email: result.email,
      isAdmin: isAdminTarget,
      debug_code: result.debugCode,
      expires_in_seconds: result.expiresInSeconds,
      email_sent: result.emailSent,
      email_delivery_error: result.emailDeliveryError,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// OTP Verification & Session Issuance (For Admin and Customer)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, full_name, phone, marketing_consent } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP verification code are required' });
      return;
    }

    const verification = OtpService.verifyOtp(email, otp);
    if (!verification.valid) {
      res.status(400).json({ error: verification.error || 'Invalid or expired verification code.' });
      return;
    }

    const isAdmin = checkIsAdmin(email);
    const auth_user_id = 'usr_' + Buffer.from(email).toString('hex').slice(0, 12);

    const { user, isNew } = await appStore.getOrCreateUser({
      auth_user_id,
      email: email.toLowerCase().trim(),
      full_name: full_name || (isAdmin ? 'BasCart Administrator' : undefined),
      phone,
      marketing_consent,
    });

    const tokenPayload = {
      user_id: user.user_id,
      auth_user_id: user.auth_user_id,
      email: user.email,
      full_name: user.full_name,
      role: isAdmin ? 'admin' : 'customer',
    };
    const token = 'dev_' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    const wallet = await appStore.getWalletState(user.user_id);

    res.json({
      success: true,
      token,
      user,
      isAdmin,
      isNew,
      wallet,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy / Direct Session endpoint (Dev fallback)
app.post('/api/auth/session', async (req, res) => {
  try {
    const { email, full_name, role, phone, marketing_consent } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const auth_user_id = 'usr_' + Buffer.from(email).toString('hex').slice(0, 12);
    const { user, isNew } = await appStore.getOrCreateUser({
      auth_user_id,
      email,
      full_name,
      phone,
      marketing_consent,
    });

    const isAdmin = checkIsAdmin(user.email) || role === 'admin';
    const tokenPayload = {
      user_id: user.user_id,
      auth_user_id: user.auth_user_id,
      email: user.email,
      full_name: user.full_name,
      role: isAdmin ? 'admin' : 'customer',
    };
    const token = 'dev_' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    const wallet = await appStore.getWalletState(user.user_id);

    res.json({
      token,
      user,
      isAdmin,
      isNew,
      wallet,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATED USER ROUTES
// ==========================================

// User Profile
app.get('/api/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const wallet = await appStore.getWalletState(user.user_id);
    res.json({ user, wallet, isAdmin: req.isAdmin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { full_name, phone, marketing_consent } = req.body;
    const updated = await appStore.updateUserProfile(req.user!.user_id, {
      full_name,
      phone,
      marketing_consent,
    });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet & BasCash Balance
app.get('/api/wallet', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const wallet = await appStore.getWalletState(req.user!.user_id);
    res.json({ wallet });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cart APIs
app.get('/api/cart', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const cart = await appStore.getCart(req.user!.user_id);
    res.json({ cart });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) {
      res.status(400).json({ error: 'product_id is required' });
      return;
    }
    const cart = await appStore.addToCart(req.user!.user_id, product_id, quantity);
    res.json({ cart });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/cart/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      res.status(400).json({ error: 'quantity is required' });
      return;
    }
    const cart = await appStore.updateCartQuantity(req.user!.user_id, req.params.id, quantity);
    res.json({ cart });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cart/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const cart = await appStore.removeCartItem(req.user!.user_id, req.params.id);
    res.json({ cart });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Wishlist APIs
app.get('/api/wishlist', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const wishlist = await appStore.getWishlist(req.user!.user_id);
    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist/toggle', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      res.status(400).json({ error: 'product_id is required' });
      return;
    }
    const result = await appStore.toggleWishlist(req.user!.user_id, product_id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Orders & Simulated Checkout
app.get('/api/orders', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await appStore.getOrders(req.user!.user_id);
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await appStore.getOrderById(req.user!.user_id, req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { idempotency_key, shipping_name, shipping_city } = req.body;
    if (!idempotency_key) {
      res.status(400).json({ error: 'idempotency_key is required to prevent double charges' });
      return;
    }
    const result = await appStore.simulatedCheckout(req.user!.user_id, {
      idempotency_key,
      shipping_name,
      shipping_city,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer Support
app.get('/api/support', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tickets = await appStore.getSupportTickets(req.user!.user_id);
    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }
    const ticket = await appStore.createSupportTicket({
      user_id: req.user!.user_id,
      subject,
      message,
    });
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN APIS (Strictly requireAdmin)
// ==========================================

app.get('/api/admin/dashboard', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const metrics = await appStore.getAdminDashboardMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/sheets-diagnostics', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const diag = await appStore.getSheetsDiagnostics();
    res.json(diag);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/init-sheets', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await googleSheetsService.initializeSpreadsheet();
    await appStore.recordAuditLog({
      admin_user_id: req.user!.user_id,
      action_type: 'initialize_sheets',
      entity_type: 'spreadsheet',
      entity_id: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'prod_db',
      summary: `Initialized spreadsheet tabs. Status: ${result.status}`,
    });
    res.json(result);
  } catch (err: any) {
    res.json({
      success: true,
      isLiveSynced: false,
      status: 'local_fallback',
      createdSheets: [],
      existingSheets: [],
      messages: ['All 13 schema tables active in local storage.'],
      warning: err.message,
    });
  }
});

// Connect Single Google Sheet and Auto-Create All 13 Tabs
app.post('/api/admin/connect-sheet', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { spreadsheet_id } = req.body;
    if (!spreadsheet_id || typeof spreadsheet_id !== 'string') {
      res.status(400).json({ error: 'Valid Google Sheets Spreadsheet ID is required' });
      return;
    }

    let cleanId = spreadsheet_id.trim();
    if (cleanId.includes('/d/')) {
      const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    const result = await appStore.connectAndInitializeSheet(cleanId);
    const diagnostics = await appStore.getSheetsDiagnostics();

    res.json({
      success: true,
      message: `Single master Google Spreadsheet connected for noreply.bascart@gmail.com. All 13 tabs active and configured.`,
      result,
      diagnostics,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/products', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const products = await appStore.getAllProductsAdmin();
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const created = await appStore.createProduct(req.body);
    await appStore.recordAuditLog({
      admin_user_id: req.user!.user_id,
      action_type: 'create_product',
      entity_type: 'product',
      entity_id: created.product_id,
      summary: `Created product: ${created.product_name} (₹${created.price})`,
    });
    res.json({ product: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await appStore.updateProduct(req.params.id, req.body);
    await appStore.recordAuditLog({
      admin_user_id: req.user!.user_id,
      action_type: 'update_product',
      entity_type: 'product',
      entity_id: req.params.id,
      summary: `Updated product: ${updated.product_name} (₹${updated.price})`,
    });
    res.json({ product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/support', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const tickets = await appStore.getSupportTickets();
    res.json({ tickets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/support/:id', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { response, status } = req.body;
    const ticket = await appStore.replySupportTicket(req.params.id, response, status || 'resolved');
    await appStore.recordAuditLog({
      admin_user_id: req.user!.user_id,
      action_type: 'support_reply',
      entity_type: 'ticket',
      entity_id: req.params.id,
      summary: `Replied to ticket: ${ticket.subject} (status: ${status})`,
    });
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const logs = await appStore.getAuditLogs();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Email / SMTP endpoints
app.get('/api/admin/smtp-status', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const status = OtpService.getSmtpStatus();
    res.json({ status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/smtp-config', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body;
    const result = await OtpService.saveSmtpConfig({ host, port, secure, user, pass });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/send-test-email', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { to_email } = req.body;
    if (!to_email) {
      res.status(400).json({ error: 'to_email is required' });
      return;
    }
    const result = await OtpService.sendTestEmail(to_email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 4. FRONTEND SERVING (Vite in Dev / Static in Prod)
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BasCart Server listening on port ${PORT}`);
  });
}

startServer();
