# AT Naveed Fast Food — Restaurant Ordering System

A complete restaurant product for **AT Naveed Fast Food, Pabbi (Khyber Pakhtunkhwa)**: customer website, online ordering, cart and checkout, live order tracking, admin dashboard, kitchen display, menu/category/offer management, customers, sales analytics and a QR table menu.

Built with **Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase · Lucide · Recharts**.

> This is a portfolio/demo build. All menu items, prices, hours, ratings and reviews are sample data. See [What still needs real restaurant information](#what-still-needs-real-restaurant-information).

---

## Two ways to run it

| | **Demo mode** (default) | **Live mode** (Supabase) |
|---|---|---|
| When | `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` empty | Both set |
| Data | Stored in the browser (localStorage), shared across tabs of one browser | Postgres on Supabase, shared across every device |
| Admin login | `admin@atnaveed.demo` / `Demo@1234` | Your Supabase Auth user with `role = 'admin'` |
| Order pricing | Recomputed in the browser | Recomputed **on the server** in `place_order()` |
| Use it for | Presenting the product, quick demos | Real restaurant use |

Demo mode is perfect for showing the owner: open the website on one tab and `/admin` or `/kitchen` on another, place an order and watch it appear and update live.

---

## Run locally

Requirements: Node.js 18.18+ (20 LTS recommended).

```bash
npm install
cp .env.example .env.local     # optional in demo mode
npm run dev                    # http://localhost:3000
```

Quality checks:

```bash
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit, strict mode
npm run build       # production build
npm start           # serve the production build
```

### Demo admin credentials

- URL: `/admin` (kitchen screen: `/kitchen`)
- Email: `admin@atnaveed.demo`
- Password: `Demo@1234`

The login page has a "Fill in demo login" button. Demo login is disabled automatically once Supabase is configured. **The demo cookie is not a security boundary** — it exists only for demos.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | Public URL for sitemap, canonical links, Open Graph and QR codes |
| `NEXT_PUBLIC_SUPABASE_URL` | Live mode | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live mode | Supabase **anon/public** key (safe in the browser; RLS protects data) |
| `NEXT_PUBLIC_RESTAURANT_PHONE` | Optional | Default call number (can also be set in Admin → Settings) |
| `NEXT_PUBLIC_RESTAURANT_WHATSAPP` | Optional | Default WhatsApp number |
| `NEXT_PUBLIC_SHOW_DEMO_NOTICE` | Optional | `false` hides the "sample content" notices once details are confirmed |

**Never** add the Supabase `service_role` key to this app. Nothing in the code needs it.

---

## Supabase setup (live mode)

1. Create a project at [supabase.com](https://supabase.com) (choose a region close to Pakistan, e.g. Mumbai or Singapore).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → Run.
   This creates tables, enums, triggers, Row Level Security policies, the `place_order` and `get_order_public` functions, Realtime on `orders`, and the public `menu-images` storage bucket. It is safe to re-run.
3. New query → paste `supabase/seed.sql` → Run. This loads the demo menu, offers and settings.
   (After editing `src/data/seed.json` you can regenerate it with `npm run db:seed-sql`.)
4. **Authentication → Users → Add user** → create the owner's email and password (tick "Auto confirm").
5. Make that user an admin:
   ```sql
   update public.profiles set role = 'admin'
    where id = (select id from auth.users where email = 'owner@example.com');
   ```
6. **Authentication → Providers → Email**: turn off public sign-ups if only staff should have accounts.
7. **Project Settings → API**: copy the Project URL and the `anon` key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
8. Restart `npm run dev` and sign in at `/admin` with the owner account.

### How security works

- **Customers never write to tables directly.** Orders are created only through `place_order(payload)`, a `security definer` function that validates input, re-prices every line from the database (sale price, variant, add-ons), applies offers and delivery fees, upserts the customer, and writes the order. A tampered browser cannot change prices.
- **Tracking** uses `get_order_public(id)`: orders are looked up by an unguessable UUID, staff notes are excluded and the phone number is masked.
- **RLS**: menu tables are public read / admin write. `orders`, `order_items`, `customers` are readable only by admins or by the signed-in customer who placed them (`user_id = auth.uid()`). Only admins can update orders.
- **Admin routes**: `src/middleware.ts` verifies the Supabase session server-side and checks `profiles.role = 'admin'` before rendering `/admin/*` or `/kitchen`. Even if bypassed, RLS still blocks data access.
- **Images**: the `menu-images` bucket is public-read, admin-write only.

The schema and functions were tested on PostgreSQL 16 with stand-ins for Supabase's `auth`/`storage` schemas: server totals match the browser cart exactly, anonymous users see zero orders, and invalid orders are rejected with readable messages.

### Database schema (summary)

```
profiles(id → auth.users, full_name, phone, role: admin|customer)
categories(id, slug unique, name, description, image, enabled, sort_order)
products(id, category_id → categories, name, description, price, sale_price, image,
         available, featured, rating, preparation_time, sort_order)
product_variants(id, product_id → products, name, price_delta, sort_order)
addons(id, product_id → products, name, price, sort_order)
offers(id, title, description, type: percentage|fixed|product_deal|combo, value,
       code unique, min_order, product_id → products, image, badge, active)
customers(id, user_id → auth.users, name, phone unique, addresses[], total_orders,
          total_spent, last_order_at)
orders(id uuid, order_number serial from 1001, customer_id → customers, user_id,
       customer_name, customer_phone, address, area, landmark, notes,
       order_type: delivery|takeaway|dine_in, table_number,
       status: pending|confirmed|preparing|ready|out_for_delivery|delivered|cancelled,
       subtotal, delivery_fee, discount, total, payment_method, promo_code,
       internal_notes, status_history jsonb, estimated_minutes, timestamps)
order_items(id, order_id → orders, product_id → products, name, variant_name,
            unit_price, quantity, instructions, line_total)
order_item_addons(id, order_item_id → order_items, name, price)
restaurant_settings(id = 1, data jsonb)
```

---

## Deploy (Vercel)

1. Push the project to GitHub.
2. Import it in [Vercel](https://vercel.com) → Framework: Next.js (auto-detected).
3. Add the environment variables above (set `NEXT_PUBLIC_SITE_URL` to the final domain, e.g. `https://atnaveed.pk`).
4. Deploy. Add the custom domain under Project → Domains.
5. In Supabase → Authentication → URL Configuration, set the Site URL to the same domain.
6. Print QR codes from **Admin → QR codes** only after `NEXT_PUBLIC_SITE_URL` points to the live domain.

Any Node host works too: `npm run build && npm start` (port 3000, or `PORT=8080 npm start`).

---

## Project structure

```
src/
  app/
    (site)/                 Customer website (shared navbar/footer)
      page.tsx              Home
      menu/ menu/[category]/ product/[id]/
      cart/ checkout/ order-success/[id]/ track-order/ track-order/[id]/
      offers/ about/ contact/
    qr-menu/                Mobile table menu (?table=N)
    admin/login/            Admin sign-in
    admin/(panel)/          Dashboard, orders, orders/[id], menu, categories,
                            offers, customers, analytics, qr, settings
    kitchen/                Kitchen display (New / Preparing / Ready)
    sitemap.ts robots.ts opengraph-image.tsx icon.svg not-found.tsx error.tsx
  components/
    admin/ cart/ home/ menu/ offers/ order/ qr/ site/ ui/ brand/ providers/
  config/
    site.ts                 Name, SEO keywords, demo login, env overrides
    images.ts               Central image registry
    content.ts              Marketing copy, nav, sample reviews
  data/
    seed.json               Demo menu, offers, settings (source for seed.sql)
    seed.ts demo-orders.ts  Demo loaders and sample order generator
  hooks/use-orders.ts       Live order/customer hooks
  lib/
    data/                   Repository layer: demo-repo, supabase-repo, mappers, server catalog
    supabase/client.ts      Browser client (anon key only)
    pricing.ts              Cart maths (mirrored by place_order on the server)
    analytics.ts status.ts validation.ts format.ts auth.ts types.ts
  middleware.ts             Protects /admin and /kitchen
public/images/food/         Bundled food illustrations (no external images)
supabase/schema.sql         Tables, RLS, functions, triggers, storage
supabase/seed.sql           Generated demo data
scripts/generate-seed-sql.mjs
```

---

## Features completed

**Customer website**
- Home: hero, categories, most-ordered items, live deals, why us, how ordering works, reviews, map, WhatsApp/Call buttons, footer with hours and links
- Full menu with sticky category tabs and search; category pages; product page with sizes/options, add-ons, special instructions, quantity, related items
- Cart: multiple items, quantities, remove, delivery/takeaway, promo codes, automatic offers, free-delivery hint, minimum order
- Checkout: validated form (Pakistani mobile format), cash on delivery, remembers returning customers
- Order confirmation with ETA and "send to WhatsApp"; live tracking timeline that updates automatically; recent orders list
- Offers page (combos add to cart, codes copy and apply)
- About and Contact (hours, map, WhatsApp message form)
- QR table menu: mobile layout, category tabs that follow scrolling, option sheet, dine-in orders tagged with the table number

**Admin**
- Secure login, protected routes, sign out
- Dashboard: today's orders and sales, pending, completed, customers; daily sales, orders by status, popular products; recent orders
- Orders: filters, search, detail page with accept/reject, next-step and manual status, customer contact, address, items, totals, internal notes, history
- Kitchen display: tablet layout, three columns, elapsed timers, late highlighting, new-order beep, full screen
- Menu items: add/edit/delete, price and sale price, photo upload or built-in image, available/featured toggles, category, options and extras
- Categories: create, rename, URL name, image, show/hide, reorder, guarded delete
- Offers: percentage, fixed, single-item deal, combo; codes, minimum order, pause/resume
- Customers: name, phone, orders, total spent, last order, addresses, search
- Analytics: today/7-day/30-day sales, total orders, average order value, best sellers, sales by category, busiest hours
- QR codes: general and per-table codes, print layout
- Settings: accepting orders switch, delivery fee, free-delivery threshold, minimum order, delivery time, contact details, map, socials, opening hours, demo reset

**Quality**
- Mobile-first and responsive; keyboard focus styles; reduced-motion support; skeleton loaders, empty and error states
- SEO: per-page titles/descriptions, Open Graph image, Restaurant and MenuItem JSON-LD, sitemap, robots, local keywords
- `npm run lint` and `npm run build` pass with no warnings

## What still needs real restaurant information

| Item | Where to change it |
|---|---|
| Phone and WhatsApp numbers | Admin → Settings, or `NEXT_PUBLIC_RESTAURANT_PHONE` / `_WHATSAPP` |
| Street address and map pin | Admin → Settings (address, map search text) |
| Opening hours | Admin → Settings |
| Real menu, prices, options | Admin → Menu items (or `src/data/seed.json` then `npm run db:seed-sql`) |
| Food photos and category images | Admin → Menu items / Categories → Upload photo |
| Delivery fee, free-delivery limit, minimum order, delivery areas | Admin → Settings |
| Offers and promo codes | Admin → Offers |
| Logo (current one is a text treatment) | `src/components/brand/logo.tsx`, `src/app/icon.svg` |
| Social media links, email | Admin → Settings |
| Customer reviews and ratings | `src/config/content.ts`, product ratings in Admin → Menu items |
| About page story | `src/app/(site)/about/page.tsx` |
| Domain name | `NEXT_PUBLIC_SITE_URL` |

When everything is confirmed, set `NEXT_PUBLIC_SHOW_DEMO_NOTICE=false`.

## Known limits

- Demo mode keeps data in one browser. Use live mode for staff on other devices.
- Payment is cash only; an online gateway (JazzCash, Easypaisa, card) is not included.
- Customer accounts exist in the database (role `customer`) but the site has no customer sign-up screen; guests order with name and phone and track by link.
- Rate limiting for `place_order` is not built in; add Supabase/Vercel rate limits or a captcha before heavy public traffic.
