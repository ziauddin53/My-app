
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  points bigint default 0,
  wallet_balance decimal(10, 2) default 0.00,
  admin_points bigint default 0, -- New: Admin's profit share stored here
  device_id text,
  role text default 'user',
  fraud_score integer default 0,
  is_blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_profiles_device_id on profiles(device_id);
alter publication supabase_realtime add table profiles;

-- 2. Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  title text not null,
  reward_points integer not null,
  reward_percentage integer default 100, 
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  payment_method text not null,
  account_number text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table profiles enable row level security;
alter table transactions enable row level security;

create policy "Users can see own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can see all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can see own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
