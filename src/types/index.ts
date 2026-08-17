export interface Company {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  image: string;
  basePrice?: number;
  salePrice?: number;
  featured?: boolean;
  stockQuantity?: number;
  variants?: ProductVariant[];
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  keywords?: string[];
}

export interface ProductVariant {
  id?: string;
  label: string;
  value: string;
  price?: number;
  stockQuantity?: number;
  sku?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  image: string;
  type: 'head-office' | 'retail';
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    basePrice: number;
    salePrice?: number;
    stockQuantity: number;
    category: { name: string };
    images: { url: string }[];
  };
  variant?: {
    id: string;
    label: string;
    value: string;
    price?: number;
    stockQuantity: number;
  };
}

export interface Customer {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label?: string;
  region: string;
  city: string;
  area: string;
  street: string;
  additional?: string;
  contactPhone: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference?: string;
  deliveryMethod: string;
  deliveryFee: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  currency: string;
  deliveryRegion?: string;
  deliveryCity?: string;
  deliveryArea?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: {
    images: { url: string }[];
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string;
  providerRef?: string;
  metadata?: any;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface DashboardStats {
  sales: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    total: number;
    new: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  image: string;
  description: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
  items: number;
  shippingAddress: string;
  notes?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spending: number;
  status: 'active' | 'inactive';
  joined: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  productsCount: number;
  status: 'active' | 'inactive';
}

export interface AdminService {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  features: string[];
  status: 'active' | 'inactive';
  featured: boolean;
}

export interface AdminLocation {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  image: string;
  type: 'head-office' | 'retail';
  status: 'active' | 'inactive';
}

export interface Settings {
  company: Company;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  currency: {
    code: string;
    symbol: string;
    rate: number;
  };
  delivery: {
    freeDeliveryThreshold: number;
    standardDeliveryFee: number;
    expressDeliveryFee: number;
    estimatedDays: string;
  };
  payment: {
    acceptCashOnDelivery: boolean;
    acceptBankTransfer: boolean;
    acceptMobileMoney: boolean;
    acceptCard: boolean;
  };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
