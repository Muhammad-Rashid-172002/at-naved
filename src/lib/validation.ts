import type { OrderType } from "./types";

export interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  area: string;
  landmark: string;
  notes: string;
  tableNumber: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const PK_MOBILE = /^(?:\+92|0092|92|0)3\d{9}$/;

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export function validateCheckout(form: CheckoutForm, orderType: OrderType): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (form.name.trim().length < 2) e.name = "Enter your full name.";
  else if (form.name.trim().length > 80) e.name = "Name is too long.";
  if (!PK_MOBILE.test(normalizePhone(form.phone))) e.phone = "Enter a mobile number like 0300 1234567.";
  if (orderType === "delivery") {
    if (form.address.trim().length < 5) e.address = "Enter your house, street or building.";
    if (form.area.trim().length < 2) e.area = "Enter your area or mohalla.";
  }
  if (orderType === "dine_in" && !form.tableNumber.trim()) e.tableNumber = "Enter your table number.";
  if (form.notes.length > 300) e.notes = "Keep notes under 300 characters.";
  return e;
}
