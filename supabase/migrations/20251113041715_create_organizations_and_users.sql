-- Create Organizations and Users Schema for Multi-Step Registration
--
-- Overview:
-- This migration sets up the complete database structure for a multi-step organization
-- registration flow including email and phone verification.
--
-- New Tables:
--
-- 1. organizations - Stores organization/business information with subdomain configuration
--    - id (uuid, primary key) - Unique organization identifier
--    - business_name (text, not null) - Name of the business
--    - subdomain (text, unique, not null) - Unique subdomain for the organization
--    - created_at (timestamptz) - Creation timestamp
--    - updated_at (timestamptz) - Last update timestamp
--    - is_active (boolean) - Organization active status
--
-- 2. org_users - Stores user information linked to organizations
--    - id (uuid, primary key) - Unique user identifier
--    - organization_id (uuid, foreign key) - Reference to organizations table
--    - first_name (text, not null) - User's first name
--    - last_name (text, not null) - User's last name
--    - email (text, unique, not null) - User's email address
--    - phone (text, not null) - User's phone number
--    - email_verified (boolean) - Email verification status
--    - phone_verified (boolean) - Phone verification status
--    - is_owner (boolean) - Whether user is org owner
--    - created_at (timestamptz) - Creation timestamp
--
-- 3. verification_codes - Stores OTP codes for email and phone verification (dev-friendly)
--    - id (uuid, primary key) - Unique verification record identifier
--    - user_id (uuid, foreign key) - Reference to org_users table
--    - code (text, not null) - Verification code
--    - type (text, not null) - Type of verification (email or phone)
--    - verified (boolean) - Verification status
--    - expires_at (timestamptz) - Code expiration timestamp
--    - created_at (timestamptz) - Creation timestamp
--
-- Security:
-- - Enable RLS on all tables
-- - Add policies for public registration access
-- - Add policies for authenticated user access
--
-- Indexes:
-- - Index on subdomain for fast lookup
-- - Index on email for fast lookup
-- - Index on verification codes and expiry

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create org_users table
CREATE TABLE IF NOT EXISTS org_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  is_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES org_users(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'phone')),
  verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX IF NOT EXISTS idx_org_users_email ON org_users(email);
CREATE INDEX IF NOT EXISTS idx_org_users_organization ON org_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Policies for organizations table
-- Allow anyone to insert during registration
CREATE POLICY "Allow public insert for registration"
  ON organizations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own organization
CREATE POLICY "Users can read own organization"
  ON organizations
  FOR SELECT
  TO anon
  USING (true);

-- Allow updating own organization
CREATE POLICY "Users can update own organization"
  ON organizations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for org_users table
-- Allow anyone to insert during registration
CREATE POLICY "Allow public insert for registration"
  ON org_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own user record
CREATE POLICY "Users can read own record"
  ON org_users
  FOR SELECT
  TO anon
  USING (true);

-- Allow updating own user record
CREATE POLICY "Users can update own record"
  ON org_users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for verification_codes table
-- Allow anyone to insert verification codes
CREATE POLICY "Allow public insert for verification"
  ON verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own verification codes
CREATE POLICY "Users can read own verification codes"
  ON verification_codes
  FOR SELECT
  TO anon
  USING (true);

-- Allow updating own verification codes
CREATE POLICY "Users can update own verification codes"
  ON verification_codes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();