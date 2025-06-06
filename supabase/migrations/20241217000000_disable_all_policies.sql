-- Migration: Disable all RLS policies for flashcards, generations, and generation_error_logs tables
-- Purpose: Remove all existing RLS policies to allow unrestricted access
-- Affected tables: flashcards, generations, generation_error_logs
-- Special considerations: This will disable all row-level security policies

-- ================================================================
-- DROP POLICIES FOR GENERATIONS TABLE
-- ================================================================

-- Drop all policies for generations table
drop policy if exists "Users can select their own generations" on public.generations;
drop policy if exists "Users can insert their own generations" on public.generations;
drop policy if exists "Users can update their own generations" on public.generations;
drop policy if exists "Users can delete their own generations" on public.generations;

-- ================================================================
-- DROP POLICIES FOR FLASHCARDS TABLE
-- ================================================================

-- Drop all policies for flashcards table
drop policy if exists "Users can select their own flashcards" on public.flashcards;
drop policy if exists "Users can insert their own flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;
drop policy if exists "Users can delete their own flashcards" on public.flashcards;

-- ================================================================
-- DROP POLICIES FOR GENERATION_ERROR_LOGS TABLE
-- ================================================================

-- Drop all policies for generation_error_logs table
drop policy if exists "Users can select their own error logs" on public.generation_error_logs;
drop policy if exists "Users can insert their own error logs" on public.generation_error_logs;
drop policy if exists "Users can update their own error logs" on public.generation_error_logs;
drop policy if exists "Users can delete their own error logs" on public.generation_error_logs;

-- ================================================================
-- DISABLE ROW LEVEL SECURITY (OPTIONAL)
-- ================================================================
-- Note: Uncomment the lines below if you also want to disable RLS entirely on these tables
-- This will allow unrestricted access without any row-level security checks

-- alter table public.generations disable row level security;
-- alter table public.flashcards disable row level security;
-- alter table public.generation_error_logs disable row level security; 