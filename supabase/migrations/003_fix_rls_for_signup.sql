-- Allow the service role (used by triggers) to bypass corporation FK check during signup.
-- The handle_new_user trigger needs to insert into profiles which references corporations.
CREATE POLICY "Service role can view corporations" ON corporations FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can view profiles" ON profiles FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
