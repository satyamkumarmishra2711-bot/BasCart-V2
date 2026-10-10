# BasCart — Google Sheets Data Architecture & Simulated Shopping Platform

> **“Your cart is full. Your wallet isn’t.”**  
> *₹4,999 imaginary order. ₹4,999 saved in real life. Congratulations! You bought absolutely nothing.*

---

## 1. Project Overview

**BasCart** is a simulated luxury retail therapy platform designed to satisfy impulse shopping cravings without financial detriment. Users receive an auditable **₹50,000 in virtual BasCash**, browse curated products across 7 categories, add items to their cart, and execute simulated checkouts.

### Key Guarantees
- **Real Bank Card Payment:** Permanent **₹0.00**. No payment gateways or banking credentials are ever collected.
- **Real Money Saved Tracker:** Every rupee of simulated checkout is calculated and tracked as money preserved in the user's actual bank account.
- **Google Sheets Primary Database:** All business data (users, products, categories, carts, wishlists, orders, transactions, activity logs, consents, support tickets, and site content) is persisted in a Google Spreadsheet named `BasCart Production Database`.
- **Server-Side Security:** Zero Google Service Account credentials or private keys are exposed to client-side code. All spreadsheet operations occur through server-side APIs with concurrency locks and idempotency keys.

---

## 2. Mandatory Google Sheets Database Schema (13 Worksheets)

The application communicates with a single Google Spreadsheet divided into 13 worksheets:

| Sheet Name | Key Columns | Description |
| :--- | :--- | :--- |
| **Users** | `user_id, auth_user_id, full_name, email, phone, account_status, created_at, updated_at, marketing_consent, consent_version, last_login_at` | Customer profiles and status |
| **Products** | `product_id, product_name, slug, category_id, description, price, image_url, video_url, stock_status, is_featured, is_active, display_order, created_at, updated_at` | Active catalog items with numeric prices |
| **Categories** | `category_id, category_name, slug, description, image_url, is_active, display_order` | Food, Fashion, Gadgets, Electronics, Home, Accessories, Lifestyle |
| **Carts** | `cart_id, user_id, product_id, quantity, added_at, updated_at` | Persistent user shopping carts |
| **Wishlist** | `wishlist_id, user_id, product_id, created_at` | User saved favorites |
| **Orders** | `order_id, user_id, order_number, order_date, subtotal, total_amount, real_payment_amount, bascash_spent, real_money_saved, order_status, shipping_status, tracking_message, created_at, updated_at` | Simulated order header with ₹0 real payment |
| **OrderItems** | `order_item_id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total` | Immutable historical snapshots of purchased items |
| **BasCashTransactions** | `transaction_id, user_id, transaction_type, amount, balance_before, balance_after, related_order_id, description, created_at, idempotency_key` | Auditable ledger (`signup_credit`, `order_debit`, `refund_credit`, `admin_adjustment`) |
| **UserActivity** | `activity_id, user_id, activity_type, entity_type, entity_id, created_at, metadata_summary` | Privacy-compliant user actions |
| **ConsentRecords** | `consent_id, user_id, consent_type, consent_status, policy_version, timestamp, withdrawal_timestamp` | Required policy agreement and optional marketing consent |
| **SupportTickets** | `ticket_id, user_id, subject, message, status, created_at, updated_at, admin_response` | Inquiries and admin responses |
| **SiteContent** | `content_id, content_type, title, content, media_url, is_active, display_order, updated_at` | Editable homepage banners and announcements |
| **AdminAuditLog** | `audit_id, admin_user_id, action_type, entity_type, entity_id, summary, timestamp` | Tamper-evident admin actions |

---

## 3. OTP-Based Authentication & Admin Access

- **Official Dispatcher Email:** All verification codes (OTP) are dispatched using `noreply.bascart@gmail.com`.
- **Master Admin Access:** Logging in with `noreply.bascart@gmail.com` automatically grants full **Master Administrator** rights across the entire system (product catalog, orders, support tickets, audit logs, and Google Sheets).
- **Customer Shopper Access:** Any customer email can request a 6-digit OTP to log in and automatically receives the **₹50,000 welcome grant**.
- **Secure Expiry:** Codes are valid for 5 minutes and single-use with rate limiting.

---

## 4. Single Master Google Sheet Connection & Auto-Tab Creation

You only need **one single spreadsheet** for everything.

1. Create a Google Spreadsheet (e.g. titled `BasCart Production Database`) linked to or owned by `noreply.bascart@gmail.com`.
2. Share the spreadsheet with your service account email as **Editor** (or link it in the admin console).
3. In the **Admin Portal** $\to$ **Google Sheets DB** tab:
   - Paste your Spreadsheet ID or Google Sheet URL.
   - Click **Connect & Auto-Create All 13 Tabs**.
4. The system will automatically:
   - Link the sheet to `noreply.bascart@gmail.com`.
   - Automatically create all 13 worksheets (`Users`, `Products`, `Categories`, `Carts`, `Wishlist`, `Orders`, `OrderItems`, `BasCashTransactions`, `UserActivity`, `ConsentRecords`, `SupportTickets`, `SiteContent`, and `AdminAuditLog`).
   - Write standard column headers and freeze the header row.
   - Begin synchronizing all data immediately.

---

## 4. Environment Variables

Create `.env` using `.env.example`:

```env
# Google Sheets Integration
GOOGLE_SHEETS_SPREADSHEET_ID="your_google_sheets_spreadsheet_id_here"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase Auth Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Admin Access Control
ADMIN_EMAILS="satyamkumarmishra2711@gmail.com,admin@bascart.com"

# Server Port
PORT=3000
```

> **Note on Resilient Fallback:** If `GOOGLE_SERVICE_ACCOUNT_EMAIL` or `GOOGLE_PRIVATE_KEY` are not set during local prototyping, the backend automatically runs in a local storage fallback mode so the application remains 100% interactive out of the box.

---

## 5. Wallet Concurrency & Idempotency Architecture

Because Google Sheets does not support row-level locks or multi-statement ACID transactions, the server implements:
1. **Server-Side Operation Queue:** All wallet mutations (balance checks, signup grants, checkout deductions) acquire a server-side mutex to serialize balance modifications.
2. **Idempotency Keys:** Every checkout and credit carries a unique `idempotency_key`. Repeating a request returns the previously generated order rather than charging the user twice.
3. **Strict Price Recalculation:** The server never trusts client-supplied totals. Order subtotals are calculated by resolving active product SKUs from the database.

---

## 6. GitHub & Vercel Deployment

1. Commit all files to your GitHub repository (secrets are excluded by `.gitignore`).
2. Link the repository to your **Vercel Project**.
3. In Vercel Project Settings $\to$ **Environment Variables**, configure:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (ensure `\n` linebreaks are preserved)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - `ADMIN_EMAILS`
4. Deploy! The full-stack build script builds Vite client assets while the server handles `/api/*` endpoints.

---

## 7. Acceptance Criteria Verification

- [x] New user registers and receives exactly ₹50,000 virtual BasCash grant once.
- [x] Login and logout function with session preservation.
- [x] Products and categories load from database schemas.
- [x] Simulated ₹4,999 checkout debits wallet to ₹45,001. Real payment remains ₹0.00.
- [x] Cumulative real money saved increments accurately.
- [x] Cart and wishlist persist across sessions.
- [x] Admin Portal enables product CRUD, diagnostics, support replies, and sheet initialization.
- [x] Security: Non-admin users cannot call administrative routes.
