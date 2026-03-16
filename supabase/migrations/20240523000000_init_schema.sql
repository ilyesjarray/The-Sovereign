-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  commander_rank text default 'Novice' check (commander_rank in ('Novice', 'Sovereign', 'Empire')),
  empire_level int default 1,
  xp int default 0,
  preferred_language text default 'en' check (preferred_language in ('en', 'ar', 'fr')),
  stripe_customer_id text,
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- SAVED INTEL TABLE
create table public.saved_intel (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  summary_en text,
  summary_ar text,
  summary_fr text,
  source_url text,
  key_takeaways jsonb, -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.saved_intel enable row level security;

create policy "Users can view own saved intel."
  on saved_intel for select
  using ( auth.uid() = user_id );

create policy "Users can insert own saved intel."
  on saved_intel for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own saved intel."
  on saved_intel for delete
  using ( auth.uid() = user_id );

-- TRIGGERS
-- Handle new user signup -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
