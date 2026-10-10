export interface UserRecord {
  user_id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  account_status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  marketing_consent: boolean;
  consent_version: string;
  last_login_at: string;
}

export interface ProductRecord {
  product_id: string;
  product_name: string;
  slug: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  video_url?: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  category_id: string;
  category_name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export interface CartItemRecord {
  cart_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  updated_at: string;
  // joined fields
  product?: ProductRecord;
}

export interface WishlistItemRecord {
  wishlist_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // joined fields
  product?: ProductRecord;
}

export interface OrderRecord {
  order_id: string;
  user_id: string;
  order_number: string;
  order_date: string;
  subtotal: number;
  total_amount: number;
  real_payment_amount: number; // always 0
  bascash_spent: number;
  real_money_saved: number;
  order_status: 'confirmed' | 'processing' | 'imaginary_delivery' | 'completed';
  shipping_status: 'void_in_transit' | 'guilt_neutralized' | 'delivered_to_mind' | 'bank_untouched';
  tracking_message: string;
  created_at: string;
  updated_at: string;
  items?: OrderItemRecord[];
}

export interface OrderItemRecord {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  image_url_snapshot?: string;
}

export interface BasCashTransactionRecord {
  transaction_id: string;
  user_id: string;
  transaction_type: 'signup_credit' | 'order_debit' | 'refund_credit' | 'admin_adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  related_order_id?: string;
  description: string;
  created_at: string;
  idempotency_key: string;
}

export interface UserActivityRecord {
  activity_id: string;
  user_id: string;
  activity_type: 'login' | 'product_view' | 'search' | 'cart_update' | 'wishlist_toggle' | 'simulated_checkout' | 'consent_update';
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata_summary: string;
}

export interface ConsentRecord {
  consent_id: string;
  user_id: string;
  consent_type: 'terms_of_use' | 'privacy_notice' | 'marketing_communications';
  consent_status: 'granted' | 'withdrawn';
  policy_version: string;
  timestamp: string;
  withdrawal_timestamp?: string;
}

export interface SupportTicketRecord {
  ticket_id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  admin_response?: string;
  user_email?: string;
}

export interface SiteContentRecord {
  content_id: string;
  content_type: 'hero_banner' | 'announcement' | 'savings_kicker';
  title: string;
  content: string;
  media_url?: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export interface AdminAuditLogRecord {
  audit_id: string;
  admin_user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  timestamp: string;
}

export interface WalletState {
  balance: number;
  total_saved: number;
  total_spent: number;
  transactions: BasCashTransactionRecord[];
}

export interface CheckoutPayload {
  shipping_name: string;
  shipping_city: string;
  shipping_notes?: string;
  idempotency_key: string;
}

export interface SheetDiagnosticsResponse {
  configured: boolean;
  spreadsheet_id?: string;
  service_account_email?: string;
  is_connected: boolean;
  status_message: string;
  sheets_found: string[];
  missing_sheets: string[];
  total_records_by_sheet: Record<string, number>;
  using_fallback: boolean;
  status?: 'synced' | 'api_disabled' | 'permission_denied' | 'not_found' | 'invalid_credentials' | 'local_fallback';
  action_required?: string;
  help_url?: string;
  linked_admin_email?: string;
}

