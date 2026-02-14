-- Create a table for storing user reflections
create table reflections (
  id uuid default uuid_generate_v4() primary key,
  email text,
  selected_protocol text not null,
  user_input text not null,
  sync_score integer not null,
  identity_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) if needed, currently open for demo or restricted to authenticated
alter table reflections enable row level security;

-- Policy to allow authenticated users to insert their own data
create policy "Allow authenticated inserts" on reflections
  for insert with check (auth.role() = 'authenticated');

-- Policy to allow users to read their own data
create policy "Allow users to read own data" on reflections
  for select using (auth.jwt() ->> 'email' = email);
