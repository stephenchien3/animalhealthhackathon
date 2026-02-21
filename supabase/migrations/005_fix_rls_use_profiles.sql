-- ============================================================
-- Fix RLS policies to use profiles table instead of JWT claims.
-- The JWT does not contain corporation_id at the top level,
-- so all previous RLS checks were silently returning no rows.
-- ============================================================

-- Drop existing broken policies
DROP POLICY IF EXISTS "View own corporation" ON corporations;
DROP POLICY IF EXISTS "View own sheds" ON sheds;
DROP POLICY IF EXISTS "Create own sheds" ON sheds;
DROP POLICY IF EXISTS "Update own sheds" ON sheds;
DROP POLICY IF EXISTS "Delete own sheds" ON sheds;

-- Helper: look up corporation_id from the profiles table
-- This is reliable regardless of how the user signed up.

-- Corporation policies
CREATE POLICY "View own corporation" ON corporations FOR SELECT
  USING (id = (SELECT p.corporation_id FROM profiles p WHERE p.user_id = auth.uid()));

-- Shed policies using profiles lookup
CREATE POLICY "View own sheds" ON sheds FOR SELECT
  USING (corporation_id = (SELECT p.corporation_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Create own sheds" ON sheds FOR INSERT
  WITH CHECK (corporation_id = (SELECT p.corporation_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Update own sheds" ON sheds FOR UPDATE
  USING (corporation_id = (SELECT p.corporation_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Delete own sheds" ON sheds FOR DELETE
  USING (corporation_id = (SELECT p.corporation_id FROM profiles p WHERE p.user_id = auth.uid()));
