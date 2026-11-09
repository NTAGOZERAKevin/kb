-- Beauty Oil Market schema for Supabase Postgres.
-- Safe to run more than once: every statement is idempotent.

create table if not exists users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  phone text,
  address jsonb,
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on users (role);
create index if not exists users_created_at_idx on users (created_at desc);

create table if not exists products (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  description text not null,
  benefits jsonb not null default '[]'::jsonb,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  image text not null,
  images jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  tag text,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_is_active_idx on products (is_active);
create index if not exists products_created_at_idx on products (created_at desc);

create table if not exists reviews (
  id uuid primary key,
  product_id uuid not null references products (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on reviews (product_id);

create table if not exists orders (
  id uuid primary key,
  order_number text not null unique,
  user_id uuid references users (id) on delete set null,
  items jsonb not null,
  customer jsonb not null,
  shipping_address jsonb not null,
  payment_method text not null default 'mtn_momo'
    check (payment_method in ('mtn_momo', 'airtel_money', 'card', 'cash_on_delivery')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_reference text,
  paid_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  notes text,
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_at_idx on orders (created_at desc);

create table if not exists notifications (
  id uuid primary key,
  type text not null default 'system'
    check (type in ('order_placed', 'order_status', 'payment', 'system')),
  title text not null,
  message text not null,
  order_id uuid references orders (id) on delete set null,
  customer_id uuid references users (id) on delete set null,
  channels jsonb not null default '[]'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_is_read_idx on notifications (is_read);
create index if not exists notifications_created_at_idx on notifications (created_at desc);

create table if not exists activity_logs (
  id uuid primary key,
  user_id uuid references users (id) on delete set null,
  action text not null,
  ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_idx on activity_logs (user_id);
create index if not exists activity_logs_action_idx on activity_logs (action);
create index if not exists activity_logs_created_at_idx on activity_logs (created_at desc);
