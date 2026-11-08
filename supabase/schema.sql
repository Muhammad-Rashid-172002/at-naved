-- =====================================================================
-- AT Naveed Fast Food — Supabase schema
-- Run once in Supabase → SQL Editor (or `supabase db push`), then run seed.sql.
-- Safe to re-run: objects are created with IF NOT EXISTS / OR REPLACE where possible.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Enums ----------
do $$ begin create type public.app_role     as enum ('admin', 'customer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_type   as enum ('delivery','takeaway','dine_in'); exception when duplicate_object then null; end $$;
do $$ begin create type public.offer_type   as enum ('percentage','fixed','product_deal','combo'); exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text not null default '',
  role        public.app_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          text primary key default gen_random_uuid()::text,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null check (length(name) between 1 and 60),
  description text not null default '',
  image       text not null default '',
  enabled     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id               text primary key default gen_random_uuid()::text,
  category_id      text not null references public.categories(id) on delete restrict,
  name             text not null check (length(name) between 1 and 120),
  description      text not null default '',
  price            int  not null check (price >= 0),
  sale_price       int  check (sale_price is null or sale_price >= 0),
  image            text not null default '',
  available        boolean not null default true,
  featured         boolean not null default false,
  rating           numeric(2,1) not null default 4.5 check (rating between 0 and 5),
  preparation_time int not null default 15 check (preparation_time between 1 and 240),
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.product_variants (
  id          text primary key default gen_random_uuid()::text,
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  price_delta int  not null default 0,
  sort_order  int  not null default 0
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.addons (
  id          text primary key default gen_random_uuid()::text,
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  price       int  not null default 0 check (price >= 0),
  sort_order  int  not null default 0
);
create index if not exists addons_product_idx on public.addons(product_id);

create table if not exists public.offers (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text not null default '',
  type        public.offer_type not null,
  value       int  not null default 0 check (value >= 0),
  code        text unique check (code is null or code ~ '^[A-Z0-9]{3,20}$'),
  min_order   int  not null default 0 check (min_order >= 0),
  product_id  text references public.products(id) on delete set null,
  image       text not null default '',
  badge       text not null default '',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  name          text not null,
  phone         text not null unique,
  addresses     text[] not null default '{}',
  total_orders  int not null default 0,
  total_spent   int not null default 0,
  last_order_at timestamptz,
  created_at    timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      bigint not null unique default nextval('public.order_number_seq'),
  customer_id       uuid references public.customers(id) on delete set null,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_phone    text not null,
  address           text not null default '',
  area              text not null default '',
  landmark          text not null default '',
  notes             text not null default '',
  order_type        public.order_type not null default 'delivery',
  table_number      text,
  status            public.order_status not null default 'pending',
  subtotal          int not null,
  delivery_fee      int not null default 0,
  discount          int not null default 0,
  total             int not null,
  payment_method    text not null default 'cod',
  promo_code        text,
  internal_notes    text not null default '',
  status_history    jsonb not null default '[]'::jsonb,
  estimated_minutes int not null default 30,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_user_idx    on public.orders(user_id);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    text references public.products(id) on delete set null,
  name          text not null,
  variant_name  text,
  unit_price    int not null,
  quantity      int not null check (quantity between 1 and 50),
  instructions  text not null default '',
  line_total    int not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.order_item_addons (
  id            uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  name          text not null,
  price         int not null
);
create index if not exists order_item_addons_item_idx on public.order_item_addons(order_item_id);

-- Single-row settings table (id is always 1). `data` mirrors RestaurantSettings in src/lib/types.ts.
create table if not exists public.restaurant_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- Helper functions ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Create a profile row for every new auth user (role defaults to customer).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh and append to status_history whenever an order's status changes.
create or replace function public.orders_before_update()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    new.status_history := old.status_history || jsonb_build_array(jsonb_build_object('status', new.status, 'at', now()));
  end if;
  return new;
end $$;

drop trigger if exists orders_before_update on public.orders;
create trigger orders_before_update before update on public.orders
  for each row execute function public.orders_before_update();

-- ---------- place_order: the ONLY way customers create orders ----------
-- Prices, discounts and delivery fee are recomputed here from the database,
-- so a tampered browser cannot change what an order costs. Mirrors src/lib/pricing.ts.
create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s              jsonb;
  v_type         public.order_type;
  v_name         text := btrim(coalesce(payload #>> '{customer,name}', ''));
  v_phone        text := regexp_replace(coalesce(payload #>> '{customer,phone}', ''), '[\s-]', '', 'g');
  v_address      text := btrim(coalesce(payload #>> '{customer,address}', ''));
  v_area         text := btrim(coalesce(payload #>> '{customer,area}', ''));
  v_landmark     text := btrim(coalesce(payload #>> '{customer,landmark}', ''));
  v_table        text := nullif(btrim(coalesce(payload ->> 'table_number', '')), '');
  v_notes        text := left(btrim(coalesce(payload ->> 'notes', '')), 300);
  v_code         text := upper(nullif(btrim(coalesce(payload ->> 'promo_code', '')), ''));
  item           jsonb;
  p              record;
  a              record;
  o              record;
  v_variant_name text;
  v_variant_delta int;
  v_addons       jsonb;
  v_addon_total  int;
  v_unit         int;
  v_qty          int;
  v_lines        jsonb := '[]'::jsonb;
  v_subtotal     int := 0;
  v_prod_disc    int := 0;
  v_after        int;
  v_order_disc   int := 0;
  v_applied      boolean := false;
  v_net          int;
  v_fee          int := 0;
  v_total        int;
  v_prep         int := 0;
  v_est          int;
  v_customer     uuid;
  v_order        uuid;
  v_number       bigint;
  v_item         uuid;
  v_full_addr    text;
begin
  select data into s from restaurant_settings where id = 1;
  if s is null then raise exception 'Restaurant settings are missing'; end if;
  if coalesce((s ->> 'acceptingOrders')::boolean, true) = false then
    raise exception 'The restaurant is not taking orders right now.';
  end if;

  begin
    v_type := coalesce(payload ->> 'order_type', 'delivery')::public.order_type;
  exception when others then
    raise exception 'Invalid order type.';
  end;

  if length(v_name) < 2 or length(v_name) > 80 then raise exception 'Enter your full name.'; end if;
  if v_phone !~ '^(\+92|0092|92|0)3[0-9]{9}$' then raise exception 'Enter a valid mobile number.'; end if;
  if v_type = 'delivery' and (length(v_address) < 5 or length(v_area) < 2) then raise exception 'Enter your delivery address and area.'; end if;
  if v_type = 'dine_in' and v_table is null then raise exception 'Enter your table number.'; end if;
  if jsonb_typeof(payload -> 'items') <> 'array' or jsonb_array_length(payload -> 'items') = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_array_length(payload -> 'items') > 40 then raise exception 'Too many items in one order.'; end if;

  for item in select * from jsonb_array_elements(payload -> 'items') loop
    select pr.* into p
      from products pr join categories c on c.id = pr.category_id
     where pr.id = item ->> 'product_id' and pr.available and c.enabled;
    if not found then raise exception 'An item in your cart is no longer available. Remove it to continue.'; end if;

    v_unit := case when p.sale_price is not null and p.sale_price > 0 and p.sale_price < p.price then p.sale_price else p.price end;

    v_variant_name := null; v_variant_delta := 0;
    if coalesce(item ->> 'variant_id', '') <> '' then
      select name, price_delta into v_variant_name, v_variant_delta
        from product_variants where id = item ->> 'variant_id' and product_id = p.id;
      if not found then raise exception 'An option in your cart is no longer available.'; end if;
    elsif exists (select 1 from product_variants where product_id = p.id) then
      select name, price_delta into v_variant_name, v_variant_delta
        from product_variants where product_id = p.id order by sort_order limit 1;
    end if;

    v_addons := '[]'::jsonb; v_addon_total := 0;
    for a in
      select ad.name, ad.price from addons ad
       where ad.product_id = p.id
         and ad.id in (select jsonb_array_elements_text(coalesce(item -> 'addon_ids', '[]'::jsonb)))
       order by ad.sort_order
    loop
      v_addons := v_addons || jsonb_build_array(jsonb_build_object('name', a.name, 'price', a.price));
      v_addon_total := v_addon_total + a.price;
    end loop;

    v_qty  := greatest(1, least(50, coalesce((item ->> 'quantity')::int, 1)));
    v_unit := v_unit + v_variant_delta + v_addon_total;
    v_subtotal := v_subtotal + v_unit * v_qty;
    v_prep := greatest(v_prep, p.preparation_time);

    select v_prod_disc + coalesce(sum(round(v_unit * v_qty * od.value / 100.0)), 0)::int into v_prod_disc
      from offers od where od.active and od.type = 'product_deal' and od.product_id = p.id;

    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', p.id, 'name', p.name, 'variant_name', v_variant_name,
      'unit_price', v_unit, 'quantity', v_qty,
      'instructions', left(btrim(coalesce(item ->> 'instructions', '')), 200),
      'addons', v_addons));
  end loop;

  if v_type = 'delivery' and v_subtotal < coalesce((s ->> 'minOrder')::int, 0) then
    raise exception 'Minimum order for delivery is Rs. %.', s ->> 'minOrder';
  end if;

  v_after := greatest(0, v_subtotal - v_prod_disc);

  if v_code is not null then
    select * into o from offers
     where active and type in ('percentage','fixed') and upper(code) = v_code;
    if found and v_after >= o.min_order then
      v_applied := true;
      v_order_disc := case when o.type = 'percentage' then round(v_after * o.value / 100.0)::int else least(o.value, v_after) end;
    else
      v_code := null;
    end if;
  end if;

  if not v_applied then
    select coalesce(max(case when type = 'percentage' then round(v_after * value / 100.0)::int else least(value, v_after) end), 0)
      into v_order_disc
      from offers
     where active and type in ('percentage','fixed') and coalesce(code, '') = '' and v_after >= min_order;
  end if;

  v_net := greatest(0, v_subtotal - v_prod_disc - v_order_disc);
  if v_type = 'delivery' then
    v_fee := coalesce((s ->> 'deliveryFee')::int, 0);
    if coalesce((s ->> 'freeDeliveryAbove')::int, 0) > 0 and v_net >= (s ->> 'freeDeliveryAbove')::int then v_fee := 0; end if;
  end if;
  v_total := v_net + v_fee;
  v_est := case when v_type = 'delivery'
                then greatest(coalesce((s ->> 'estimatedDeliveryMins')::int, 40), v_prep + 15)
                else v_prep + 5 end;

  v_full_addr := nullif(concat_ws(', ', nullif(v_address, ''), nullif(v_area, '')), '');

  insert into customers (name, phone, addresses, total_orders, total_spent, last_order_at, user_id)
  values (v_name, v_phone, case when v_full_addr is null then '{}'::text[] else array[v_full_addr] end, 1, v_total, now(), auth.uid())
  on conflict (phone) do update set
    name          = excluded.name,
    addresses     = case when v_full_addr is null or v_full_addr = any(customers.addresses) then customers.addresses
                         else customers.addresses || v_full_addr end,
    total_orders  = customers.total_orders + 1,
    total_spent   = customers.total_spent + v_total,
    last_order_at = now()
  returning id into v_customer;

  insert into orders (customer_id, user_id, customer_name, customer_phone, address, area, landmark, notes,
                      order_type, table_number, subtotal, delivery_fee, discount, total, promo_code,
                      estimated_minutes, status_history)
  values (v_customer, auth.uid(), v_name, v_phone,
          case when v_type = 'delivery' then v_address else '' end,
          case when v_type = 'delivery' then v_area else '' end,
          case when v_type = 'delivery' then v_landmark else '' end,
          v_notes, v_type, case when v_type = 'dine_in' then left(v_table, 10) end,
          v_subtotal, v_fee, v_prod_disc + v_order_disc, v_total, v_code, v_est,
          jsonb_build_array(jsonb_build_object('status', 'pending', 'at', now())))
  returning id, order_number into v_order, v_number;

  for item in select * from jsonb_array_elements(v_lines) loop
    insert into order_items (order_id, product_id, name, variant_name, unit_price, quantity, instructions, line_total)
    values (v_order, item ->> 'product_id', item ->> 'name', item ->> 'variant_name',
            (item ->> 'unit_price')::int, (item ->> 'quantity')::int, item ->> 'instructions',
            (item ->> 'unit_price')::int * (item ->> 'quantity')::int)
    returning id into v_item;

    insert into order_item_addons (order_item_id, name, price)
    select v_item, x ->> 'name', (x ->> 'price')::int from jsonb_array_elements(item -> 'addons') x;
  end loop;

  return jsonb_build_object('id', v_order, 'order_number', v_number);
end $$;

-- ---------- get_order_public: tracking by unguessable order id ----------
-- Returns one order without staff notes and with the phone number masked.
create or replace function public.get_order_public(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', o.id, 'order_number', o.order_number, 'created_at', o.created_at, 'updated_at', o.updated_at,
    'status', o.status, 'order_type', o.order_type, 'table_number', o.table_number,
    'customer_name', o.customer_name,
    'customer_phone', left(o.customer_phone, 4) || repeat('*', greatest(length(o.customer_phone) - 6, 0)) || right(o.customer_phone, 2),
    'address', o.address, 'area', o.area, 'landmark', o.landmark, 'notes', o.notes,
    'subtotal', o.subtotal, 'delivery_fee', o.delivery_fee, 'discount', o.discount, 'total', o.total,
    'payment_method', o.payment_method, 'promo_code', o.promo_code,
    'status_history', o.status_history, 'estimated_minutes', o.estimated_minutes,
    'order_items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'product_id', i.product_id, 'name', i.name, 'variant_name', i.variant_name,
        'unit_price', i.unit_price, 'quantity', i.quantity, 'instructions', i.instructions, 'line_total', i.line_total,
        'order_item_addons', coalesce((select jsonb_agg(jsonb_build_object('name', ad.name, 'price', ad.price))
                                         from order_item_addons ad where ad.order_item_id = i.id), '[]'::jsonb)))
      from order_items i where i.order_id = o.id), '[]'::jsonb))
  from orders o where o.id = p_id;
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.get_order_public(uuid) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.get_order_public(uuid) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.addons              enable row level security;
alter table public.offers              enable row level security;
alter table public.customers           enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.order_item_addons   enable row level security;
alter table public.restaurant_settings enable row level security;

-- Drop old policies so the file can be re-run.
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Profiles: users read their own; only admins read all or change roles.
create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles admin update"      on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Public menu data: anyone can read; only admins write.
create policy "categories public read" on public.categories for select using (enabled or public.is_admin());
create policy "categories admin write" on public.categories for all    using (public.is_admin()) with check (public.is_admin());
create policy "products public read"   on public.products   for select using (true);
create policy "products admin write"   on public.products   for all    using (public.is_admin()) with check (public.is_admin());
create policy "variants public read"   on public.product_variants for select using (true);
create policy "variants admin write"   on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "addons public read"     on public.addons for select using (true);
create policy "addons admin write"     on public.addons for all using (public.is_admin()) with check (public.is_admin());
create policy "offers public read"     on public.offers for select using (active or public.is_admin());
create policy "offers admin write"     on public.offers for all using (public.is_admin()) with check (public.is_admin());
create policy "settings public read"   on public.restaurant_settings for select using (true);
create policy "settings admin write"   on public.restaurant_settings for all using (public.is_admin()) with check (public.is_admin());

-- Customers & orders: admins see everything; signed-in customers see only their own.
-- Nobody inserts directly: orders are created through place_order().
create policy "customers own or admin read" on public.customers for select using (public.is_admin() or user_id = auth.uid());
create policy "customers admin write"       on public.customers for all    using (public.is_admin()) with check (public.is_admin());
create policy "orders own or admin read"    on public.orders    for select using (public.is_admin() or user_id = auth.uid());
create policy "orders admin update"         on public.orders    for update using (public.is_admin()) with check (public.is_admin());
create policy "orders admin delete"         on public.orders    for delete using (public.is_admin());
create policy "order items read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (public.is_admin() or o.user_id = auth.uid())));
create policy "order item addons read" on public.order_item_addons for select using (
  exists (select 1 from public.order_items i join public.orders o on o.id = i.order_id
          where i.id = order_item_id and (public.is_admin() or o.user_id = auth.uid())));

-- ---------- Realtime (admin dashboard + kitchen) ----------
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- ---------- Storage bucket for menu photos ----------
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "menu images public read"  on storage.objects;
drop policy if exists "menu images admin insert" on storage.objects;
drop policy if exists "menu images admin update" on storage.objects;
drop policy if exists "menu images admin delete" on storage.objects;
create policy "menu images public read"  on storage.objects for select using (bucket_id = 'menu-images');
create policy "menu images admin insert" on storage.objects for insert with check (bucket_id = 'menu-images' and public.is_admin());
create policy "menu images admin update" on storage.objects for update using (bucket_id = 'menu-images' and public.is_admin());
create policy "menu images admin delete" on storage.objects for delete using (bucket_id = 'menu-images' and public.is_admin());

-- ---------- Make yourself admin (run after creating your user in Auth → Users) ----------
-- update public.profiles set role = 'admin'
--  where id = (select id from auth.users where email = 'owner@example.com');
