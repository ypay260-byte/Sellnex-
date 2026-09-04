export type Currency = 'UZS' | 'USD';
export type Language = 'uz' | 'ru' | 'en';

export type UserRole = 'seller' | 'admin';

export interface OnboardingData {
  sellCategory: string;
  sellMarket: string;
  customerChannels: string[];
  hasProducts: string;
  storeName: string;
  storeSlug: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export type PlanType = 'free' | 'starter' | 'full' | 'premium' | 'premium_pro' | 'pro' | 'business' | 'trial' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  storeId?: string;
  plan: PlanType;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt?: string;
  subscriptionExpiresAt?: string;
  trialEndsAt?: string;
  isStarterRenewedDiscount?: boolean;
  onboarding?: OnboardingData;
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'modern' | 'minimal' | 'bold';
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  buttonText: string;
  announcementText?: string;
  showAnnouncement: boolean;
  productCardStyle: 'card' | 'flat' | 'bordered';
  footerText: string;
  instagramUrl?: string;
  telegramUrl?: string;
  phone?: string;
}

export type StoreVisibility = 'PUBLIC' | 'PRIVATE' | 'public' | 'private';

export interface Store {
  id: string;
  storeId?: string;
  ownerId: string;
  name: string;
  storeName?: string;
  slug: string;
  domain: string;
  currency: Currency;
  targetMarket: 'Uzbekistan' | 'Central Asia' | 'Global';
  sellType: 'Dropshipping' | 'My own products' | 'Both';
  logo: string;
  theme: StoreTheme;
  visibility?: StoreVisibility;
  published: boolean;
  announcement?: string;
  primaryColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroBanner?: string;
  description?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  instagram?: string;
  customDomain?: string;
  status?: 'published' | 'draft' | 'private' | 'suspended';
  isTrustedSeller?: boolean;
  directPayoutApproved?: boolean;
  sellerCardNumber?: string;
  sellerCardHolder?: string;
  sellerBankName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BusinessMode = 'personal' | 'dropshipping';

export interface ProductVariant {
  id: string;
  name: string;
  options: string[]; // e.g. ["Black", "White", "Silver"] or sizes
  priceAdjustment?: number;
}

export type ProductModerationStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'FLAGGED' | 'BLOCKED' | 'ARCHIVED';

export interface Product {
  id: string;
  storeId: string;
  ownerId?: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  businessMode?: BusinessMode;
  productUrl?: string;
  supplier: 'Amazon' | 'Alibaba' | 'Uzum Market' | 'Custom Supplier' | 'Local Warehouse';
  supplierUrl?: string;
  supplierCost: number; // in UZS
  shippingCost: number; // in UZS
  paymentFeePercent: number; // typically 1.5%
  platformFeePercent: number; // 0% for now
  profitType: 'fixed' | 'percentage';
  profitValue: number; // fixed amount or %
  calculatedProfit: number;
  sellingPrice: number; // in UZS
  oldPrice?: number;
  stock: number;
  status: 'Draft' | 'Published' | 'Out of stock';
  moderationStatus?: ProductModerationStatus;
  sku: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  featured: boolean;
  createdAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Supplier Ordered'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'
  | 'Disputed';

export type PaymentMethod = 'Click' | 'Payme' | 'Uzum Bank' | 'Cash on Delivery' | 'P2P Card Transfer';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  variant?: string;
  quantity: number;
  supplierCost: number;
  sellingPrice: number;
  profit: number;
  supplier: string;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  country: string;
  region: string;
  district: string;
  streetAddress: string;
  apartment?: string;
  deliveryNotes?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #SL-1024
  storeId: string;
  ownerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  paymentFee: number;
  totalAmount: number;
  totalSupplierCost: number;
  totalProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  escrowStatus?: 'pending_payment' | 'paid_held_in_escrow' | 'delivery_submitted' | 'payout_released' | 'refunded';
  deliveryProofNote?: string;
  deliveryProofPhoto?: string;
  deliverySubmittedAt?: string;
  payoutReleasedAt?: string;
  payoutTxId?: string;
  payoutCardNumber?: string;
  receiptTxNumber?: string;
  trackingNumber?: string;
  deliveryCourier?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  partnerLinkId?: string;
}

export interface Customer {
  id: string;
  storeId: string;
  ownerId?: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'VIP' | 'Inactive';
}

export interface Supplier {
  id: string;
  name: string;
  type: 'Amazon' | 'Alibaba' | 'Uzum Market' | 'Custom Supplier';
  status: 'Connected' | 'Demo Integration' | 'Available' | 'Disconnected';
  apiUrl?: string;
  apiKey?: string;
  defaultShippingCost: number;
  averageDeliveryDays: string;
  autoOrderSupported: boolean;
}

export interface AutomationSettings {
  autoSupplierOrder: boolean;
  autoInventorySync: boolean;
  autoCustomerNotification: boolean;
  autoOrderStatusUpdate: boolean;
  notifyOnTelegram: boolean;
  telegramChatId?: string;
  minProfitMarginThreshold: number;
}

export interface PartnerLink {
  id: string;
  storeId: string;
  ownerId?: string;
  title: string;
  slug: string;
  url: string;
  targetProductTitle?: string;
  clicks: number;
  visitors: number;
  orders: number;
  revenue: number;
  profit: number;
  createdAt: string;
}

export interface DeviceLog {
  id?: string;
  deviceType: 'phone' | 'computer' | string;
  date: string;
  userId: string;
  storeId: string;
  userAgent?: string;
  timestamp: string;
}

export interface IntegrationCredentials {
  service: 'click' | 'payme' | 'uzumbank' | 'uzum_market';
  connected: boolean;
  merchantId?: string;
  serviceId?: string;
  secretKey?: string;
  apiKey?: string;
  testMode: boolean;
  connectedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'system' | 'delivery' | 'p2p_payment' | 'dispute';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface CartItem {
  product: Product;
  selectedVariant?: string;
  quantity: number;
}

// === P2P PAYMENT SYSTEM ===
export type P2PPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'pending' | 'approved' | 'rejected' | 'expired';

export interface P2PPayment {
  id: string;
  paymentNumber?: string; // e.g. SLX-PAY-92831
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  storeId?: string;
  planId?: string;
  planRequested?: string;
  planName?: string;
  durationMonths?: number;
  amount: number; // e.g. 65000 or 99000
  currency?: Currency;
  senderName?: string;
  paymentMethod?: string; // e.g. 'P2P Card Transfer'
  paymentDateTime?: string;
  screenshotUrl?: string;
  status: P2PPaymentStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

// === PROMO CODE SYSTEM ===
export type PromoDiscountType = 'percentage' | 'fixed' | 'percent' | 'free_months' | 'trial_days';
export type PromoRewardType = 'discount' | 'free_subscription' | 'extra_trial_days';

export interface PromoCode {
  id: string;
  code: string; // e.g. SELLNEX50, SELLNEX100, WELCOME7
  type?: 'percent' | 'fixed' | 'free_months' | 'trial_days';
  discountType?: PromoDiscountType;
  discountValue?: number; // e.g. 50 (%) or 50000 (UZS)
  value?: number;
  rewardType?: PromoRewardType;
  extraTrialDays?: number; // e.g. 7
  applicablePlans?: string[]; // ['all', 'starter', 'full', 'premium', 'premium_pro']
  applicablePlan?: string;
  expirationDate?: string;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser?: number;
  minSubscriptionDurationMonths?: number;
  active?: boolean;
  isActive?: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

// === AUDIT LOG SYSTEM ===
export interface AuditLog {
  id: string;
  adminId?: string;
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
  details?: string;
  timestamp: string;
  userAgent?: string;
}

// === DISPUTES & REFUNDS ===
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'open' | 'under_review' | 'resolved' | 'rejected';

export interface Dispute {
  id: string;
  orderId?: string;
  orderNumber?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  sellerId?: string;
  sellerName?: string;
  storeId?: string;
  storeName?: string;
  amount?: number;
  currency?: Currency;
  reason?: string;
  description?: string;
  evidenceUrl?: string;
  status: DisputeStatus;
  adminNotes?: string;
  adminDecision?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  refundApproved?: boolean;
  refundAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

// === DYNAMIC SUBSCRIPTION PLANS ===
export interface DynamicPlan {
  id: string; // 'starter' | 'full' | 'premium' | 'premium_pro'
  name: string;
  tagline?: string;
  priceUSD?: number;
  priceUZS?: number;
  priceMonthlyUSD?: number;
  priceMonthlyUZS?: number;
  renewalDiscountPercent?: number;
  renewalDiscountUSD?: number;
  renewalDiscountUZS?: number;
  billingPeriod?: string;
  trialDays?: number;
  badge?: string;
  productLimit?: number;
  maxProducts?: number;
  storeLimit?: number;
  maxStores?: number;
  platformFeePercent?: number;
  features?: string[];
  popular?: boolean;
  active?: boolean;
  isActive?: boolean;
  updatedAt?: string;
}

// === ADMIN SETTINGS & INSTRUCTIONS ===
export interface AdminSettings {
  platformName?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportTelegram?: string;
  defaultCurrency?: Currency;
  trialDurationDays?: number;
  renewalDiscountPercent?: number;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  allowRegistration?: boolean;
  usdToUzsRate?: number;
  p2pCardNumber?: string;
  p2pCardHolder?: string;
  p2pBankName?: string;
  p2pPhoneNumber?: string;
  p2pInstructions?: string;
  telegramBotToken?: string;
  telegramAdminChatId?: string;
  notifyOnNewUser?: boolean;
  notifyOnP2P?: boolean;
  notifyOnOrder?: boolean;
  updatedAt?: string;
}
