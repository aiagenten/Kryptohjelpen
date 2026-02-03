-- Add Vipps Login support to customers table

-- Add vipps_sub column for Vipps user identifier
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vipps_sub TEXT UNIQUE;

-- Make email nullable (Vipps users might not have email)
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;

-- Make password_hash nullable (Vipps users don't need password)
ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL;

-- Add index for vipps_sub
CREATE INDEX IF NOT EXISTS idx_customers_vipps_sub ON customers(vipps_sub);

-- Add index for phone (for Vipps lookup)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
