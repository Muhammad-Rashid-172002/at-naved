export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderType = "delivery" | "takeaway" | "dine_in";
export type OfferType = "percentage" | "fixed" | "product_deal" | "combo";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
}

export interface Variant {
  id: string;
  name: string;
  priceDelta: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  salePrice: number | null;
  image: string;
  available: boolean;
  featured: boolean;
  rating: number;
  /** Minutes */
  preparationTime: number;
  sortOrder: number;
  addons: Addon[];
  variants: Variant[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: OfferType;
  /** percentage → percent off; fixed → rupees off; product_deal → percent off one product; combo → display price */
  value: number;
  code: string | null;
  minOrder: number;
  productId: string | null;
  image: string;
  active: boolean;
  badge: string;
}

export interface OpeningHour {
  days: string;
  hours: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  mapQuery: string;
  openingHours: OpeningHour[];
  deliveryFee: number;
  freeDeliveryAbove: number;
  minOrder: number;
  estimatedDeliveryMins: number;
  socials: { facebook: string; instagram: string; tiktok: string };
  acceptingOrders: boolean;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  offers: Offer[];
  settings: RestaurantSettings;
}

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  variantId: string | null;
  variantName: string | null;
  addons: Addon[];
  /** Base (or sale) price + variant + add-ons, per unit */
  unitPrice: number;
  quantity: number;
  instructions: string;
}

export interface OrderItemAddon {
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  addons: OrderItemAddon[];
  instructions: string;
  lineTotal: number;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  area: string;
  landmark: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber: string | null;
  customer: OrderCustomer;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: "cod";
  promoCode: string | null;
  internalNotes: string;
  statusHistory: StatusEvent[];
  estimatedMinutes: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  addresses: string[];
}

export interface PlaceOrderInput {
  customer: OrderCustomer;
  orderType: OrderType;
  tableNumber: string | null;
  notes: string;
  promoCode: string;
  lines: CartLine[];
}
