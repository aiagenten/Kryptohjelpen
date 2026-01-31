const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Using fallback mode.');
}

// Public client (for frontend operations)
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Service client (for admin/backend operations - bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

/**
 * Database abstraction layer for Supabase
 * Provides methods that mirror the SQLite interface for easy migration
 */
class SupabaseDB {
  constructor() {
    this.client = supabaseAdmin || supabase;
  }

  // Products
  async getProducts({ category, search, limit = 50, offset = 0, activeOnly = true } = {}) {
    let query = this.client
      .from('products')
      .select('*', { count: 'exact' });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      products: data,
      total: count,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + data.length < count
      }
    };
  }

  async getProductBySlug(slug) {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getProductById(id) {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllProducts() {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createProduct(product) {
    const { data, error } = await this.client
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price_nok: product.price,
        image_url: product.imageUrl,
        category: product.category,
        tags: product.tags,
        stock: product.stock,
        is_active: product.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProduct(id, product) {
    const updateData = {};
    if (product.name !== undefined) updateData.name = product.name;
    if (product.slug !== undefined) updateData.slug = product.slug;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.price !== undefined) updateData.price_nok = product.price;
    if (product.imageUrl !== undefined) updateData.image_url = product.imageUrl;
    if (product.category !== undefined) updateData.category = product.category;
    if (product.tags !== undefined) updateData.tags = product.tags;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.isActive !== undefined) updateData.is_active = product.isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.client
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(id) {
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Categories
  async getCategories() {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  // Orders
  async createOrder(order) {
    const { data, error } = await this.client
      .from('orders')
      .insert({
        order_number: order.orderNumber,
        customer_email: order.customerEmail,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        total_nok: order.totalNok,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus || 'pending',
        order_status: order.orderStatus || 'processing',
        shipping_address: order.shippingAddress,
        notes: order.notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrderByNumber(orderNumber) {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getOrderById(id) {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllOrders() {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateOrderStatus(id, { paymentStatus, orderStatus }) {
    const updateData = { updated_at: new Date().toISOString() };
    if (paymentStatus) updateData.payment_status = paymentStatus;
    if (orderStatus) updateData.order_status = orderStatus;

    const { data, error } = await this.client
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Order Items
  async createOrderItems(orderId, items) {
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName || item.name,
      price_nok: item.priceNok || item.price,
      quantity: item.quantity
    }));

    const { data, error } = await this.client
      .from('order_items')
      .insert(orderItems)
      .select();

    if (error) throw error;
    return data;
  }

  async getOrderItems(orderId) {
    const { data, error } = await this.client
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data;
  }

  // Payment Transactions
  async createTransaction(transaction) {
    const { data, error } = await this.client
      .from('payment_transactions')
      .insert({
        order_id: transaction.orderId,
        transaction_id: transaction.transactionId,
        payment_method: transaction.paymentMethod,
        amount_nok: transaction.amountNok,
        amount_eth: transaction.amountEth,
        eth_tx_hash: transaction.ethTxHash,
        vipps_transaction_id: transaction.vippsTransactionId,
        status: transaction.status || 'pending',
        raw_response: transaction.rawResponse ? JSON.stringify(transaction.rawResponse) : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTransactionsByOrderId(orderId) {
    const { data, error } = await this.client
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data;
  }

  async updateTransactionStatus(transactionId, status, additionalData = {}) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await this.client
      .from('payment_transactions')
      .update(updateData)
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Admin Users
  async getAdminByUsername(username) {
    const { data, error } = await this.client
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateAdminLastLogin(id) {
    const { error } = await this.client
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Analytics
  async getAnalytics() {
    // Total sales
    const { data: salesData } = await this.client
      .from('orders')
      .select('total_nok')
      .eq('payment_status', 'completed');

    const totalSales = salesData?.reduce((sum, o) => sum + (o.total_nok || 0), 0) || 0;

    // Orders by status
    const { data: statusData } = await this.client
      .from('orders')
      .select('order_status');

    const ordersByStatus = {};
    statusData?.forEach(o => {
      ordersByStatus[o.order_status] = (ordersByStatus[o.order_status] || 0) + 1;
    });

    const ordersByStatusArray = Object.entries(ordersByStatus).map(([status, count]) => ({
      order_status: status,
      count
    }));

    // Recent orders
    const { data: recentOrders } = await this.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Low stock products
    const { data: lowStock } = await this.client
      .from('products')
      .select('*')
      .eq('is_active', true)
      .lt('stock', 10)
      .order('stock');

    // Top products (simplified - would need a join in real implementation)
    const { data: orderItems } = await this.client
      .from('order_items')
      .select('product_name, quantity, price_nok');

    const productStats = {};
    orderItems?.forEach(item => {
      if (!productStats[item.product_name]) {
        productStats[item.product_name] = { name: item.product_name, total_sold: 0, revenue: 0 };
      }
      productStats[item.product_name].total_sold += item.quantity;
      productStats[item.product_name].revenue += item.price_nok * item.quantity;
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalSales,
      ordersByStatus: ordersByStatusArray,
      recentOrders: recentOrders || [],
      lowStock: lowStock || [],
      topProducts
    };
  }

  // Update stock after purchase
  async decrementStock(productId, quantity) {
    const { data: product } = await this.client
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      await this.client
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
    }
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  SupabaseDB,
  db: new SupabaseDB()
};
