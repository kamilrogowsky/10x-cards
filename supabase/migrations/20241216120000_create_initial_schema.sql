-- Migration: Create initial schema for 10xCards application
-- Purpose: Create flashcards, generations, and generation_error_logs tables with proper RLS policies
-- Affected tables: flashcards, generations, generation_error_logs
-- Special considerations: RLS enabled on all tables, triggers for updated_at column

-- ================================================================
-- CREATE FUNCTIONS
-- ================================================================

-- Function to automatically update updated_at column
-- This function will be used by triggers on multiple tables
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ================================================================
-- CREATE TABLES (in dependency order)
-- ================================================================

-- Create generations table first (no dependencies except auth.users)
-- Tracks AI generation sessions and their statistics
create table public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create flashcards table (depends on generations)  
-- Stores individual flashcards with front/back content and metadata
create table public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references public.generations(id) on delete set null,
    user_id uuid not null references auth.users(id)
);

-- Create generation_error_logs table (independent of other tables)
-- Logs errors that occur during AI generation process
create table public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- ================================================================
-- CREATE INDEXES
-- ================================================================

-- Indexes for generations table
create index idx_generations_user_id on public.generations(user_id);

-- Indexes for flashcards table
create index idx_flashcards_user_id on public.flashcards(user_id);
create index idx_flashcards_generation_id on public.flashcards(generation_id);

-- Indexes for generation_error_logs table  
create index idx_generation_error_logs_user_id on public.generation_error_logs(user_id);

-- ================================================================
-- CREATE TRIGGERS
-- ================================================================

-- Trigger for generations table to automatically update updated_at
create trigger update_generations_updated_at
    before update on public.generations
    for each row
    execute function public.update_updated_at_column();

-- Trigger for flashcards table to automatically update updated_at
create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.update_updated_at_column();

-- ================================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS on all tables
alter table public.generations enable row level security;
alter table public.flashcards enable row level security;
alter table public.generation_error_logs enable row level security;

-- ================================================================
-- CREATE RLS POLICIES FOR GENERATIONS TABLE
-- ================================================================

-- Policy for authenticated users to select their own generations
create policy "Users can select their own generations" on public.generations
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own generations
create policy "Users can insert their own generations" on public.generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own generations
create policy "Users can update their own generations" on public.generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own generations
create policy "Users can delete their own generations" on public.generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ================================================================
-- CREATE RLS POLICIES FOR FLASHCARDS TABLE
-- ================================================================

-- Policy for authenticated users to select their own flashcards
create policy "Users can select their own flashcards" on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can insert their own flashcards" on public.flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update their own flashcards" on public.flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards" on public.flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ================================================================
-- CREATE RLS POLICIES FOR GENERATION_ERROR_LOGS TABLE
-- ================================================================

-- Policy for authenticated users to select their own error logs
create policy "Users can select their own error logs" on public.generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own error logs
create policy "Users can insert their own error logs" on public.generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own error logs
create policy "Users can update their own error logs" on public.generation_error_logs
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own error logs
create policy "Users can delete their own error logs" on public.generation_error_logs
    for delete
    to authenticated
    using (auth.uid() = user_id); 