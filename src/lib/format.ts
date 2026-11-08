const rupee = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return `Rs. ${rupee.format(Math.round(value))}`;
}

export function formatOrderNumber(n: number): string {
  return `#${n}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export function minutesSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function timeAgo(iso: string, now = Date.now()): string {
  const m = minutesSince(iso, now);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

/** Turns a Pakistani number like 0300 1234567 into 923001234567 for wa.me / tel links. */
export function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(number: string, message?: string): string {
  const n = toInternational(number);
  if (!n) return "";
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telLink(number: string): string {
  const n = toInternational(number);
  return n ? `tel:+${n}` : "";
}
