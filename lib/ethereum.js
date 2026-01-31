const { ethers } = require('ethers');
const axios = require('axios');

/**
 * Ethereum Payment Handler
 * Handles ETH payments via MetaMask and transaction verification
 */
class EthereumPayment {
  constructor(config) {
    this.walletAddress = config.walletAddress;
    this.network = config.network || 'mainnet';
    this.infuraProjectId = config.infuraProjectId;
    
    // Set up provider for transaction verification
    if (this.infuraProjectId) {
      const infuraUrl = `https://${this.network}.infura.io/v3/${this.infuraProjectId}`;
      this.provider = new ethers.JsonRpcProvider(infuraUrl);
    }
  }

  /**
   * Get current ETH to NOK exchange rate from CoinGecko
   * @returns {Promise<number>} ETH price in NOK
   */
  async getEthToNokRate() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'ethereum',
            vs_currencies: 'nok'
          }
        }
      );

      return response.data.ethereum.nok;
    } catch (error) {
      console.error('Failed to fetch ETH/NOK rate:', error.message);
      throw new Error('Unable to fetch current exchange rate');
    }
  }

  /**
   * Convert NOK amount to ETH
   * @param {number} nokAmount - Amount in NOK
   * @returns {Promise<Object>} ETH amount and exchange rate
   */
  async convertNokToEth(nokAmount) {
    const ethNokRate = await this.getEthToNokRate();
    const ethAmount = nokAmount / ethNokRate;

    return {
      ethAmount: ethAmount,
      ethAmountFormatted: ethAmount.toFixed(6),
      exchangeRate: ethNokRate,
      nokAmount: nokAmount
    };
  }

  /**
   * Estimate gas price for a transaction
   * @returns {Promise<Object>} Gas price information
   */
  async estimateGas() {
    if (!this.provider) {
      // Return estimated values if no provider
      return {
        gasPrice: '0.00001',
        gasPriceGwei: '10',
        estimatedFeeEth: '0.00021'
      };
    }

    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
      
      // Estimate gas for a simple transfer (21000 units)
      const gasLimit = 21000n;
      const estimatedFee = gasPrice * gasLimit;
      const estimatedFeeEth = ethers.formatEther(estimatedFee);

      return {
        gasPrice: ethers.formatEther(gasPrice),
        gasPriceGwei: gasPriceGwei,
        estimatedFeeEth: estimatedFeeEth,
        gasLimit: gasLimit.toString()
      };
    } catch (error) {
      console.error('Gas estimation failed:', error.message);
      return {
        gasPrice: '0.00001',
        gasPriceGwei: '10',
        estimatedFeeEth: '0.00021'
      };
    }
  }

  /**
   * Create payment request data for frontend
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Payment request data
   */
  async createPaymentRequest(orderData) {
    const { orderId, amountNok } = orderData;

    try {
      const conversion = await this.convertNokToEth(amountNok);
      const gasEstimate = await this.estimateGas();

      return {
        success: true,
        orderId: orderId,
        recipient: this.walletAddress,
        amountEth: conversion.ethAmountFormatted,
        amountNok: amountNok,
        exchangeRate: conversion.exchangeRate,
        gasEstimate: gasEstimate,
        network: this.network,
        // Frontend will use this data to initiate MetaMask transaction
        transactionData: {
          to: this.walletAddress,
          value: ethers.parseEther(conversion.ethAmountFormatted).toString(),
          chainId: this.network === 'mainnet' ? 1 : 5 // 1 for mainnet, 5 for Goerli
        }
      };
    } catch (error) {
      console.error('Payment request creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify an Ethereum transaction
   * @param {string} txHash - Transaction hash
   * @param {Object} expectedData - Expected transaction data
   * @returns {Promise<Object>} Verification result
   */
  async verifyTransaction(txHash, expectedData) {
    if (!this.provider) {
      console.warn('No provider configured - transaction verification limited');
      return {
        verified: false,
        error: 'Provider not configured for verification',
        txHash: txHash,
        needsManualVerification: true
      };
    }

    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          verified: false,
          error: 'Transaction not found or not yet mined',
          txHash: txHash,
          pending: true
        };
      }

      // Get full transaction details
      const tx = await this.provider.getTransaction(txHash);

      // Verify transaction data
      const toAddress = tx.to.toLowerCase();
      const expectedAddress = this.walletAddress.toLowerCase();
      const valueReceived = ethers.formatEther(tx.value);
      const expectedValue = parseFloat(expectedData.amountEth);

      // Allow 0.5% variance for gas price fluctuations during transaction
      const variance = expectedValue * 0.005;
      const amountMatches = Math.abs(parseFloat(valueReceived) - expectedValue) <= variance;

      const verified = (
        receipt.status === 1 && // Transaction succeeded
        toAddress === expectedAddress && // Correct recipient
        amountMatches // Correct amount (within variance)
      );

      return {
        verified: verified,
        txHash: txHash,
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations: receipt.confirmations,
        blockNumber: receipt.blockNumber,
        from: tx.from,
        to: tx.to,
        value: valueReceived,
        expectedValue: expectedValue.toFixed(6),
        gasUsed: receipt.gasUsed.toString(),
        timestamp: tx.blockNumber ? await this.getBlockTimestamp(tx.blockNumber) : null
      };

    } catch (error) {
      console.error('Transaction verification failed:', error.message);
      return {
        verified: false,
        error: error.message,
        txHash: txHash
      };
    }
  }

  /**
   * Get block timestamp
   * @param {number} blockNumber - Block number
   * @returns {Promise<number>} Unix timestamp
   */
  async getBlockTimestamp(blockNumber) {
    try {
      const block = await this.provider.getBlock(blockNumber);
      return block.timestamp;
    } catch (error) {
      console.error('Failed to get block timestamp:', error.message);
      return null;
    }
  }

  /**
   * Wait for transaction confirmation
   * @param {string} txHash - Transaction hash
   * @param {number} confirmations - Number of confirmations to wait for (default: 3)
   * @returns {Promise<Object>} Transaction receipt
   */
  async waitForConfirmation(txHash, confirmations = 3) {
    if (!this.provider) {
      throw new Error('Provider not configured');
    }

    try {
      console.log(`Waiting for ${confirmations} confirmations for tx: ${txHash}`);
      
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      
      return {
        success: true,
        receipt: receipt,
        confirmed: true,
        confirmations: confirmations
      };

    } catch (error) {
      console.error('Error waiting for confirmation:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transaction details for display
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionDetails(txHash) {
    if (!this.provider) {
      return {
        explorerUrl: `https://etherscan.io/tx/${txHash}`,
        txHash: txHash
      };
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        txHash: txHash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        gasUsed: receipt ? receipt.gasUsed.toString() : 'pending',
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        confirmations: receipt ? receipt.confirmations : 0,
        blockNumber: tx.blockNumber,
        explorerUrl: this.getExplorerUrl(txHash)
      };

    } catch (error) {
      console.error('Failed to get transaction details:', error.message);
      return {
        txHash: txHash,
        error: error.message,
        explorerUrl: this.getExplorerUrl(txHash)
      };
    }
  }

  /**
   * Get Etherscan explorer URL for transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} Explorer URL
   */
  getExplorerUrl(txHash) {
    const baseUrl = this.network === 'mainnet' 
      ? 'https://etherscan.io' 
      : 'https://goerli.etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Ethereum address
   * @returns {boolean} Is valid
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }
}

module.exports = EthereumPayment;
