import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for our tables
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_nok: number;
  image_url: string | null;
  category: string | null;
  tags: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  total_nok: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price_nok: number;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  price_nok: number;
  order_id: number | null;
  payment_status: string;
  status: string;
  notes: string | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  aeo_question: string | null;
  aeo_answer: string | null;
  aeo_schema_type: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: number;
  session_id: string;
  customer_email: string | null;
  order_id: number | null;
  has_access: boolean;
  access_expires_at: string | null;
  pending_product_choice: boolean;
  selected_product: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default supabase;
