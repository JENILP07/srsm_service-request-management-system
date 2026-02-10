-- Add password hash to profiles for credential-based auth
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
