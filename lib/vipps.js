const axios = require('axios');

/**
 * Vipps eCom API Integration
 * Norwegian mobile payment solution
 * API Documentation: https://developer.vipps.no/docs/APIs/ecom-api/
 */
class VippsPayment {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.subscriptionKey = config.subscriptionKey;
    this.merchantSerialNumber = config.merchantSerialNumber;
    this.callbackPrefix = config.callbackPrefix;
    this.fallbackUrl = config.fallbackUrl;
    this.mode = config.mode || 'test';

    // Vipps API endpoints
    this.baseUrl = this.mode === 'production'
      ? 'https://api.vipps.no'
      : 'https://apitest.vipps.no';

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token for API calls
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/accesstoken/get`,
        {},
        {
          headers: {
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Merchant-Serial-Number': this.merchantSerialNumber
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in seconds, convert to ms and store expiry time
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Vipps access token failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Vipps');
    }
  }

  /**
   * Get standard headers for API calls
   * @returns {Promise<Object>} Headers object
   */
  async getHeaders() {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      'Merchant-Serial-Number': this.merchantSerialNumber,
      'Vipps-System-Name': 'Kryptohjelpen',
      'Vipps-System-Version': '1.0.0',
      'Vipps-System-Plugin-Name': 'kryptohjelpen-ecom',
      'Vipps-System-Plugin-Version': '1.0.0',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Initiate a Vipps payment
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment initiation result
   */
  async initiatePayment(paymentData) {
    const {
      orderId,
      amount,
      customerPhone,
      productDescription = 'Bestilling fra Kryptohjelpen.no',
      isExpress = false
    } = paymentData;

    try {
      const headers = await this.getHeaders();

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber,
          callbackPrefix: this.callbackPrefix,
          fallBack: `${this.fallbackUrl}?orderId=${orderId}`,
          authToken: this.generateAuthToken(orderId),
          isApp: false,
          paymentType: isExpress ? 'eComm Express Payment' : 'eComm Regular Payment'
        },
        customerInfo: {
          mobileNumber: customerPhone ? customerPhone.replace(/\s/g, '').replace(/^\+47/, '') : undefined
        },
        transaction: {
          orderId: orderId,
          amount: Math.round(amount * 100), // Convert to oere
          transactionText: productDescription,
          skipLandingPage: false,
          scope: 'name phoneNumber'
        }
      };

      // Remove undefined mobile number if not provided
      if (!payload.customerInfo.mobileNumber) {
        delete payload.customerInfo;
      }

      const response = await axios.post(
        `${this.baseUrl}/ecomm/v2/payments`,
        payload,
        { headers }
      );

      return {
        success: true,
        orderId: response.data.orderId,
        url: response.data.url, // Redirect URL to Vipps
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min expiry
      };

    } catch (error) {
      console.error('Vipps payment initiation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  /**
   * Get payment details/status
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentDetails(orderId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${this.baseUrl}/ecomm/v2/payments/${orderId}/details`,
        { headers }
      );

      const data = response.data;
      const lastTransactionLogEntry = data.transactionLogHistory?.[0];

      return {
        success: true,
        orderId: data.orderId,
        status: this.mapTransactionStatus(lastTransactionLogEntry?.operation),
        amount: data.transactionSummary?.capturedAmount / 100 || data.transactionSummary?.reservedAmount / 100,
        transactionId: data.transactionId,
        userDetails: data.userDetails,
        shippingDetails: data.shippingDetails,
        transactionHistory: data.transactionLogHistory
      };

    } catch (error) {
      console.error('Vipps get payment details failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || 'Failed to get payment details'
      };
    }
  }

  /**
   * Capture a reserved payment
   * @param {string} orderId - Order ID
   * @param {number} amount - Amount to capture in NOK (0 for full amount)
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(orderId, amount = 0) {
    try {
      const headers = await this.getHeaders();
      headers['X-Request-Id'] = this.generateRequestId();

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber
        },
        transaction: {
          amount: Math.round(amount * 100),
          transactionText: 'Betaling fanget for ordre ' + orderId
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/ecomm/v2/payments/${orderId}/capture`,
        payload,
        { headers }
      );

      return {
        success: true,
        orderId: response.data.orderId,
        transactionId: response.data.transactionInfo?.transactionId,
        amount: response.data.transactionInfo?.amount / 100,
        status: response.data.transactionInfo?.status
      };

    } catch (error) {
      console.error('Vipps capture failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || 'Capture failed'
      };
    }
  }

  /**
   * Cancel/void a reserved payment
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Cancel result
   */
  async cancelPayment(orderId) {
    try {
      const headers = await this.getHeaders();

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber
        },
        transaction: {
          transactionText: 'Bestilling kansellert'
        }
      };

      const response = await axios.put(
        `${this.baseUrl}/ecomm/v2/payments/${orderId}/cancel`,
        payload,
        { headers }
      );

      return {
        success: true,
        orderId: response.data.orderId,
        transactionId: response.data.transactionInfo?.transactionId,
        status: 'cancelled'
      };

    } catch (error) {
      console.error('Vipps cancel failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || 'Cancel failed'
      };
    }
  }

  /**
   * Refund a captured payment
   * @param {string} orderId - Order ID
   * @param {number} amount - Amount to refund in NOK
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(orderId, amount) {
    try {
      const headers = await this.getHeaders();
      headers['X-Request-Id'] = this.generateRequestId();

      const payload = {
        merchantInfo: {
          merchantSerialNumber: this.merchantSerialNumber
        },
        transaction: {
          amount: Math.round(amount * 100),
          transactionText: 'Refusjon for ordre ' + orderId
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/ecomm/v2/payments/${orderId}/refund`,
        payload,
        { headers }
      );

      return {
        success: true,
        orderId: response.data.orderId,
        transactionId: response.data.transactionInfo?.transactionId,
        amount: response.data.transactionInfo?.amount / 100,
        status: 'refunded'
      };

    } catch (error) {
      console.error('Vipps refund failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || 'Refund failed'
      };
    }
  }

  /**
   * Verify callback from Vipps
   * @param {Object} callbackData - Callback data from Vipps
   * @param {string} authToken - Auth token from callback URL
   * @returns {Object} Verification result
   */
  verifyCallback(callbackData, authToken) {
    const { orderId, transactionInfo } = callbackData;

    // Verify auth token matches what we generated
    const expectedToken = this.generateAuthToken(orderId);
    if (authToken !== expectedToken) {
      console.error('Vipps callback auth token mismatch');
      return {
        valid: false,
        error: 'Invalid auth token'
      };
    }

    return {
      valid: true,
      orderId: orderId,
      status: this.mapTransactionStatus(transactionInfo?.status),
      amount: transactionInfo?.amount / 100,
      timestamp: transactionInfo?.timeStamp,
      transactionId: transactionInfo?.transactionId
    };
  }

  /**
   * Map Vipps transaction status to internal status
   * @param {string} vippsStatus - Vipps status
   * @returns {string} Internal status
   */
  mapTransactionStatus(vippsStatus) {
    const statusMap = {
      'INITIATE': 'pending',
      'RESERVE': 'reserved',
      'CAPTURE': 'completed',
      'REFUND': 'refunded',
      'CANCEL': 'cancelled',
      'VOID': 'cancelled',
      'FAILED': 'failed',
      'REJECTED': 'failed',
      'SALE': 'completed'
    };
    return statusMap[vippsStatus] || 'unknown';
  }

  /**
   * Generate auth token for callback verification
   * @param {string} orderId - Order ID
   * @returns {string} Auth token
   */
  generateAuthToken(orderId) {
    const crypto = require('crypto');
    const data = `${orderId}:${this.clientSecret}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Generate unique request ID for idempotent requests
   * @returns {string} Request ID
   */
  generateRequestId() {
    const crypto = require('crypto');
    return crypto.randomUUID();
  }

  /**
   * Force payment approval (test mode only)
   * @param {string} orderId - Order ID
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise<Object>} Approval result
   */
  async forceApprovePayment(orderId, customerPhone) {
    if (this.mode !== 'test') {
      return {
        success: false,
        error: 'Force approve only available in test mode'
      };
    }

    try {
      const headers = await this.getHeaders();

      // Test environment approval endpoint
      const response = await axios.post(
        `${this.baseUrl}/ecomm/v2/integration-test/payments/${orderId}/approve`,
        {
          customerPhoneNumber: customerPhone.replace(/\s/g, '').replace(/^\+47/, ''),
          token: this.generateAuthToken(orderId)
        },
        { headers }
      );

      return {
        success: true,
        orderId: orderId
      };

    } catch (error) {
      console.error('Vipps force approve failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.[0]?.message || 'Force approve failed'
      };
    }
  }
}

module.exports = VippsPayment;
