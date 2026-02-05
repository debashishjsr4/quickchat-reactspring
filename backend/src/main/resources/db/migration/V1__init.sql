create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  name varchar(120) not null,
  email varchar(180) not null unique,
  password_hash varchar(255) not null,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  is_group boolean not null default false,
  title varchar(120),
  created_at timestamptz not null default now()
);

create table conversation_members (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  last_read_message_id uuid null,
  joined_at timestamptz not null default now(),
  unique(conversation_id, user_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_conv_created on messages(conversation_id, created_at desc);
