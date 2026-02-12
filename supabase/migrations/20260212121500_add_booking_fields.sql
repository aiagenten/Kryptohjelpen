-- Add booking_time and vipps_user_info columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS booking_time TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vipps_user_info JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Add index for booking queries
CREATE INDEX IF NOT EXISTS idx_orders_booking_time ON orders(booking_time);
