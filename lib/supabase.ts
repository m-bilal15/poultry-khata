import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema SQL (run this in Supabase SQL editor):
/*
create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text default '',
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists daily_entries (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops(id) on delete cascade,
  date date not null,
  live_weight_kg numeric default 0,
  purchase_cost numeric default 0,
  meat_sold_kg numeric default 0,
  cash_collected numeric default 0,
  created_at timestamptz default now(),
  unique(shop_id, date)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops(id) on delete cascade,
  date date not null,
  category text check (category in ('rent','generator','labor','misc')) default 'misc',
  amount numeric default 0,
  note text default '',
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  phone text default '',
  type text check (type in ('individual','restaurant')) default 'individual',
  created_at timestamptz default now()
);

create table if not exists udhaar_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  date date not null,
  debit numeric default 0,
  credit numeric default 0,
  note text default '',
  balance numeric default 0,
  created_at timestamptz default now()
);

create table if not exists restaurant_daily (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  shop_id uuid references shops(id),
  date date not null,
  kg numeric default 0,
  rate_per_kg numeric default 0,
  amount numeric default 0,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  date date not null,
  amount numeric default 0,
  note text default '',
  created_at timestamptz default now()
);
*/
