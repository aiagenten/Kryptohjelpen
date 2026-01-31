const nodemailer = require('nodemailer');

/**
 * Email Service for Order Confirmations and Notifications
 */
class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    this.fromAddress = config.from;
    this.siteName = config.siteName || 'Kryptohjelpen.no';
    this.siteUrl = config.siteUrl;
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Send result
   */
  async sendOrderConfirmation(orderData) {
    const { order, items, customer } = orderData;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price_nok.toFixed(2)} NOK</td>
      </tr>
    `).join('');

    const paymentMethodText = order.payment_method === 'vips' 
      ? 'Korttbetaling (VIPS)' 
      : 'Ethereum (ETH)';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.siteName}</h1>
            <p>Ordrebekreftelse</p>
          </div>
          
          <div class="content">
            <h2>Takk for din bestilling!</h2>
            <p>Hei ${customer.name},</p>
            <p>Vi har mottatt din bestilling. Her er detaljene:</p>
            
            <div class="order-details">
              <p><strong>Ordrenummer:</strong> ${order.order_number}</p>
              <p><strong>Betalingsmetode:</strong> ${paymentMethodText}</p>
              <p><strong>Status:</strong> ${this.getStatusText(order.payment_status)}</p>
              
              <h3>Bestilte produkter:</h3>
              <table>
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 10px; text-align: left;">Produkt</th>
                    <th style="padding: 10px; text-align: center;">Antall</th>
                    <th style="padding: 10px; text-align: right;">Pris</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                Total: ${order.total_nok.toFixed(2)} NOK
              </div>
            </div>
            
            ${order.shipping_address ? `
              <div class="order-details">
                <h3>Leveringsadresse:</h3>
                <p>${order.shipping_address.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}
            
            <p style="text-align: center;">
              <a href="${this.siteUrl}/order-status?order=${order.order_number}" class="button">
                Spor din bestilling
              </a>
            </p>
            
            <p>Vi sender en e-post når bestillingen din er sendt.</p>
            <p>Hvis du har spørsmål, kontakt oss på ${process.env.SUPPORT_EMAIL}</p>
          </div>
          
          <div class="footer">
            <p>${this.siteName} - Din kryptovalutahjelp i Norge</p>
            <p>${this.siteUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${this.siteName} - Ordrebekreftelse
      
      Hei ${customer.name},
      
      Takk for din bestilling!
      
      Ordrenummer: ${order.order_number}
      Betalingsmetode: ${paymentMethodText}
      Status: ${this.getStatusText(order.payment_status)}
      
      Bestilte produkter:
      ${items.map(item => `- ${item.product_name} x ${item.quantity} - ${item.price_nok.toFixed(2)} NOK`).join('\n')}
      
      Total: ${order.total_nok.toFixed(2)} NOK
      
      Spor din bestilling: ${this.siteUrl}/order-status?order=${order.order_number}
      
      Hvis du har spørsmål, kontakt oss på ${process.env.SUPPORT_EMAIL}
      
      ${this.siteName}
      ${this.siteUrl}
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: customer.email,
        subject: `Ordrebekreftelse - ${order.order_number}`,
        text: text,
        html: html
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send order shipped notification
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Send result
   */
  async sendShippedNotification(orderData) {
    const { order, customer, trackingNumber } = orderData;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #27ae60; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Bestillingen din er sendt!</h1>
          </div>
          
          <div class="content">
            <p>Hei ${customer.name},</p>
            <p>Gode nyheter! Din bestilling (${order.order_number}) er nå sendt.</p>
            
            ${trackingNumber ? `
              <div class="tracking">
                <p>Sporingsnummer:</p>
                <div class="tracking-number">${trackingNumber}</div>
              </div>
            ` : ''}
            
            <p>Du vil motta pakken innen 3-5 virkedager.</p>
            <p>Takk for at du handler hos ${this.siteName}!</p>
          </div>
          
          <div class="footer">
            <p>${this.siteName}</p>
            <p>${this.siteUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: customer.email,
        subject: `Pakken din er sendt - ${order.order_number}`,
        html: html
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send shipped notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send admin notification for new order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Send result
   */
  async sendAdminNotification(orderData) {
    const { order, items } = orderData;

    const text = `
      Ny bestilling mottatt!
      
      Ordrenummer: ${order.order_number}
      Kunde: ${order.customer_name} (${order.customer_email})
      Betalingsmetode: ${order.payment_method}
      Total: ${order.total_nok.toFixed(2)} NOK
      
      Produkter:
      ${items.map(item => `- ${item.product_name} x ${item.quantity}`).join('\n')}
      
      Se detaljer i admin-panelet: ${this.siteUrl}/admin/orders.html
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: process.env.SUPPORT_EMAIL,
        subject: `Ny bestilling - ${order.order_number}`,
        text: text
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Norwegian status text
   * @param {string} status - Payment status
   * @returns {string} Norwegian status text
   */
  getStatusText(status) {
    const statusMap = {
      'pending': 'Venter på betaling',
      'completed': 'Betalt',
      'failed': 'Betaling mislyktes',
      'refunded': 'Refundert'
    };
    return statusMap[status] || status;
  }
}

module.exports = EmailService;
