import type { Catalog, Category, Customer, Offer, Order, OrderStatus, PlaceOrderInput, Product, RestaurantSettings } from "@/lib/types";

export type Topic = "catalog" | "orders";

export interface DataRepo {
  mode: "demo" | "supabase";
  getCatalog(): Promise<Catalog>;
  saveProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  saveCategory(category: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  reorderCategories(ids: string[]): Promise<void>;
  saveOffer(offer: Offer): Promise<void>;
  deleteOffer(id: string): Promise<void>;
  saveSettings(settings: RestaurantSettings): Promise<void>;
  uploadImage(file: File): Promise<string>;
  placeOrder(input: PlaceOrderInput): Promise<{ id: string; orderNumber: number }>;
  /** Public lookup used by order confirmation and tracking pages. */
  getOrder(id: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
  updateInternalNotes(id: string, notes: string): Promise<void>;
  listCustomers(): Promise<Customer[]>;
  subscribe(topic: Topic, cb: () => void): () => void;
}

export class RepoError extends Error {}
