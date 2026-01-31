const axios = require('axios');
const crypto = require('crypto');

/**
 * VIPS Payment Provider Integration
 * Norwegian payment gateway for card payments
 */
class VIPSPayment {
  constructor(config) {
    this.merchantId = config.merchantId;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.callbackUrl = config.callbackUrl;
    this.mode = config.mode || 'test'; // 'test' or 'production'
    
    // VIPS API endpoints
    this.baseUrl = this.mode === 'production' 
      ? 'https://api.vips.no/v1'
      : 'https://api-test.vips.no/v1';
  }

  /**
   * Create a payment session
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment session details
   */
  async createPayment(paymentData) {
    const { orderId, amount, currency = 'NOK', customerEmail, returnUrl } = paymentData;

    try {
      const payload = {
        merchantId: this.merchantId,
        orderId: orderId,
        amount: Math.round(amount * 100), // Convert to øre (smallest currency unit)
        currency: currency,
        customerEmail: customerEmail,
        callbackUrl: this.callbackUrl,
        returnUrl: returnUrl || `${process.env.SITE_URL}/order-confirmation`,
        timestamp: new Date().toISOString()
      };

      // Generate signature for request authentication
      const signature = this.generateSignature(payload);

      const response = await axios.post(`${this.baseUrl}/payments`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-VIPS-Signature': signature,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        paymentUrl: response.data.paymentUrl,
        sessionId: response.data.sessionId
      };

    } catch (error) {
      console.error('VIPS payment creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment creation failed'
      };
    }
  }

  /**
   * Verify payment callback from VIPS
   * @param {Object} callbackData - Data from VIPS webhook
   * @returns {Object} Verified payment status
   */
  verifyCallback(callbackData) {
    const { signature, ...data } = callbackData;

    // Verify signature
    const expectedSignature = this.generateSignature(data);
    
    if (signature !== expectedSignature) {
      console.error('VIPS callback signature mismatch');
      return {
        valid: false,
        error: 'Invalid signature'
      };
    }

    return {
      valid: true,
      transactionId: data.transactionId,
      orderId: data.orderId,
      status: data.status, // 'AUTHORIZED', 'CAPTURED', 'FAILED', etc.
      amount: data.amount / 100, // Convert from øre to NOK
      timestamp: data.timestamp
    };
  }

  /**
   * Capture an authorized payment
   * @param {string} transactionId - VIPS transaction ID
   * @param {number} amount - Amount to capture in NOK
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(transactionId, amount) {
    try {
      const payload = {
        transactionId: transactionId,
        amount: Math.round(amount * 100),
        timestamp: new Date().toISOString()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.baseUrl}/payments/${transactionId}/capture`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-VIPS-Signature': signature,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        captureId: response.data.captureId,
        status: response.data.status
      };

    } catch (error) {
      console.error('VIPS capture failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Capture failed'
      };
    }
  }

  /**
   * Refund a captured payment
   * @param {string} transactionId - VIPS transaction ID
   * @param {number} amount - Amount to refund in NOK
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(transactionId, amount) {
    try {
      const payload = {
        transactionId: transactionId,
        amount: Math.round(amount * 100),
        timestamp: new Date().toISOString()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.baseUrl}/payments/${transactionId}/refund`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-VIPS-Signature': signature,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        refundId: response.data.refundId,
        status: response.data.status
      };

    } catch (error) {
      console.error('VIPS refund failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Refund failed'
      };
    }
  }

  /**
   * Get payment status
   * @param {string} transactionId - VIPS transaction ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount / 100,
        orderId: response.data.orderId
      };

    } catch (error) {
      console.error('VIPS status check failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Status check failed'
      };
    }
  }

  /**
   * Generate HMAC signature for request authentication
   * @param {Object} data - Data to sign
   * @returns {string} HMAC signature
   */
  generateSignature(data) {
    const sortedData = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');

    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(sortedData)
      .digest('hex');
  }
}

module.exports = VIPSPayment;
