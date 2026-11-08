/**
 * Central site configuration.
 * Restaurant details that change often (phone, hours, delivery fee…) live in
 * `src/data/seed.json` → settings, and can be edited from Admin → Settings.
 */
export const siteConfig = {
  name: "AT Naveed Fast Food",
  shortName: "AT Naveed",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_PK",
  currency: "PKR",
  locality: "Pabbi",
  region: "Khyber Pakhtunkhwa",
  country: "PK",
  description:
    "Order burgers, pizza, shawarma and fried chicken online from AT Naveed Fast Food in Pabbi, Khyber Pakhtunkhwa. Fast delivery, takeaway and cash on delivery.",
  keywords: [
    "AT Naveed Fast Food",
    "Fast food in Pabbi",
    "Restaurant in Pabbi",
    "Food delivery Pabbi",
    "Burgers Pabbi",
    "Pizza Pabbi",
    "Shawarma Pabbi",
    "Zinger burger Pabbi",
  ],
  /** Shows small notices on content that is not confirmed by the restaurant yet. */
  showDemoNotice: process.env.NEXT_PUBLIC_SHOW_DEMO_NOTICE !== "false",
};

/** Env overrides for contact numbers. Empty means "not configured yet". */
export const envContact = {
  phone: process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "",
  whatsapp: process.env.NEXT_PUBLIC_RESTAURANT_WHATSAPP ?? "",
};

/** Demo-mode admin login. Disabled automatically when Supabase is configured. */
export const DEMO_ADMIN = { email: "admin@atnaveed.demo", password: "Demo@1234" };
export const DEMO_COOKIE = "atn_demo_admin";
