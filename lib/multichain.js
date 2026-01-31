const { ethers } = require('ethers');
const axios = require('axios');

/**
 * Multi-Chain EVM Payment Handler
 * Supports: Ethereum, Polygon, Arbitrum, Optimism, Base, BSC
 */
class MultiChainPayment {
  constructor(config) {
    this.walletAddresses = config.walletAddresses || {};
    this.defaultWallet = config.defaultWallet;
    this.infuraProjectId = config.infuraProjectId;
    this.alchemyApiKey = config.alchemyApiKey;

    // Chain configurations
    this.chains = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://mainnet.infura.io/v3/${this.infuraProjectId}`
          : 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        coingeckoId: 'ethereum',
        icon: '⟠',
        color: '#627EEA'
      },
      polygon: {
        chainId: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://polygon-mainnet.infura.io/v3/${this.infuraProjectId}`
          : 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        coingeckoId: 'matic-network',
        icon: '⬡',
        color: '#8247E5'
      },
      arbitrum: {
        chainId: 42161,
        name: 'Arbitrum One',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://arbitrum-mainnet.infura.io/v3/${this.infuraProjectId}`
          : 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        coingeckoId: 'ethereum',
        icon: '🔷',
        color: '#28A0F0'
      },
      optimism: {
        chainId: 10,
        name: 'Optimism',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://optimism-mainnet.infura.io/v3/${this.infuraProjectId}`
          : 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        coingeckoId: 'ethereum',
        icon: '🔴',
        color: '#FF0420'
      },
      base: {
        chainId: 8453,
        name: 'Base',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        coingeckoId: 'ethereum',
        icon: '🔵',
        color: '#0052FF'
      },
      bsc: {
        chainId: 56,
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        decimals: 18,
        rpcUrl: 'https://bsc-dataseed.binance.org',
        explorer: 'https://bscscan.com',
        coingeckoId: 'binancecoin',
        icon: '⬡',
        color: '#F0B90B'
      }
    };

    // Testnets for development
    this.testnets = {
      goerli: {
        chainId: 5,
        name: 'Goerli Testnet',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://goerli.infura.io/v3/${this.infuraProjectId}`
          : 'https://rpc.ankr.com/eth_goerli',
        explorer: 'https://goerli.etherscan.io',
        coingeckoId: 'ethereum',
        isTestnet: true,
        icon: '⟠',
        color: '#627EEA'
      },
      sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://sepolia.infura.io/v3/${this.infuraProjectId}`
          : 'https://rpc.sepolia.org',
        explorer: 'https://sepolia.etherscan.io',
        coingeckoId: 'ethereum',
        isTestnet: true,
        icon: '⟠',
        color: '#627EEA'
      },
      mumbai: {
        chainId: 80001,
        name: 'Polygon Mumbai',
        symbol: 'MATIC',
        decimals: 18,
        rpcUrl: this.infuraProjectId
          ? `https://polygon-mumbai.infura.io/v3/${this.infuraProjectId}`
          : 'https://rpc-mumbai.maticvigil.com',
        explorer: 'https://mumbai.polygonscan.com',
        coingeckoId: 'matic-network',
        isTestnet: true,
        icon: '⬡',
        color: '#8247E5'
      }
    };

    // Initialize providers for each chain
    this.providers = {};
    this.rateCache = {};
    this.rateCacheExpiry = 60000; // 1 minute cache
  }

  /**
   * Get provider for a specific chain
   * @param {string} chainKey - Chain identifier
   * @returns {ethers.JsonRpcProvider} Provider instance
   */
  getProvider(chainKey) {
    const chain = this.chains[chainKey] || this.testnets[chainKey];
    if (!chain) {
      throw new Error(`Unknown chain: ${chainKey}`);
    }

    if (!this.providers[chainKey]) {
      this.providers[chainKey] = new ethers.JsonRpcProvider(chain.rpcUrl);
    }

    return this.providers[chainKey];
  }

  /**
   * Get chain configuration
   * @param {string} chainKey - Chain identifier
   * @returns {Object} Chain configuration
   */
  getChainConfig(chainKey) {
    return this.chains[chainKey] || this.testnets[chainKey];
  }

  /**
   * Get all supported chains for frontend
   * @param {boolean} includeTestnets - Include test networks
   * @returns {Array} Array of chain configs
   */
  getSupportedChains(includeTestnets = false) {
    const chains = Object.entries(this.chains).map(([key, config]) => ({
      key,
      ...config,
      walletAddress: this.walletAddresses[key] || this.defaultWallet
    }));

    if (includeTestnets) {
      const testnets = Object.entries(this.testnets).map(([key, config]) => ({
        key,
        ...config,
        walletAddress: this.walletAddresses[key] || this.defaultWallet
      }));
      chains.push(...testnets);
    }

    return chains;
  }

  /**
   * Get wallet address for a chain
   * @param {string} chainKey - Chain identifier
   * @returns {string} Wallet address
   */
  getWalletAddress(chainKey) {
    return this.walletAddresses[chainKey] || this.defaultWallet;
  }

  /**
   * Get crypto to NOK exchange rate from CoinGecko
   * @param {string} coingeckoId - CoinGecko token ID
   * @returns {Promise<number>} Price in NOK
   */
  async getCryptoToNokRate(coingeckoId) {
    const cacheKey = coingeckoId;
    const now = Date.now();

    // Return cached rate if valid
    if (this.rateCache[cacheKey] && now < this.rateCache[cacheKey].expiry) {
      return this.rateCache[cacheKey].rate;
    }

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: coingeckoId,
            vs_currencies: 'nok,usd'
          },
          timeout: 10000
        }
      );

      const rate = response.data[coingeckoId]?.nok;
      if (!rate) {
        throw new Error(`No rate found for ${coingeckoId}`);
      }

      // Cache the rate
      this.rateCache[cacheKey] = {
        rate,
        usdRate: response.data[coingeckoId]?.usd,
        expiry: now + this.rateCacheExpiry
      };

      return rate;
    } catch (error) {
      console.error(`Failed to fetch rate for ${coingeckoId}:`, error.message);

      // Return cached rate if available (even if expired)
      if (this.rateCache[cacheKey]) {
        return this.rateCache[cacheKey].rate;
      }

      throw new Error(`Unable to fetch exchange rate for ${coingeckoId}`);
    }
  }

  /**
   * Get exchange rate for a specific chain
   * @param {string} chainKey - Chain identifier
   * @returns {Promise<Object>} Rate information
   */
  async getChainRate(chainKey) {
    const chain = this.getChainConfig(chainKey);
    if (!chain) {
      throw new Error(`Unknown chain: ${chainKey}`);
    }

    const rate = await this.getCryptoToNokRate(chain.coingeckoId);

    return {
      chainKey,
      symbol: chain.symbol,
      rateNok: rate,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all exchange rates for supported chains
   * @returns {Promise<Object>} Rates for all chains
   */
  async getAllRates() {
    const uniqueIds = [...new Set(Object.values(this.chains).map(c => c.coingeckoId))];

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: uniqueIds.join(','),
            vs_currencies: 'nok,usd'
          },
          timeout: 10000
        }
      );

      const rates = {};

      for (const [key, chain] of Object.entries(this.chains)) {
        const coinData = response.data[chain.coingeckoId];
        rates[key] = {
          symbol: chain.symbol,
          name: chain.name,
          rateNok: coinData?.nok || 0,
          rateUsd: coinData?.usd || 0,
          chainId: chain.chainId,
          icon: chain.icon,
          color: chain.color
        };
      }

      return {
        rates,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch all rates:', error.message);
      throw new Error('Unable to fetch exchange rates');
    }
  }

  /**
   * Convert NOK to crypto amount
   * @param {number} nokAmount - Amount in NOK
   * @param {string} chainKey - Chain identifier
   * @returns {Promise<Object>} Conversion result
   */
  async convertNokToCrypto(nokAmount, chainKey) {
    const chain = this.getChainConfig(chainKey);
    if (!chain) {
      throw new Error(`Unknown chain: ${chainKey}`);
    }

    const rate = await this.getCryptoToNokRate(chain.coingeckoId);
    const cryptoAmount = nokAmount / rate;

    return {
      nokAmount,
      cryptoAmount,
      cryptoAmountFormatted: cryptoAmount.toFixed(8),
      cryptoAmountWei: ethers.parseEther(cryptoAmount.toFixed(18)).toString(),
      symbol: chain.symbol,
      exchangeRate: rate,
      chainKey,
      chainId: chain.chainId
    };
  }

  /**
   * Estimate gas fee for a transaction
   * @param {string} chainKey - Chain identifier
   * @returns {Promise<Object>} Gas estimate
   */
  async estimateGas(chainKey) {
    const chain = this.getChainConfig(chainKey);
    const provider = this.getProvider(chainKey);

    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

      // Standard transfer gas limit
      const gasLimit = 21000n;
      const estimatedFee = gasPrice * gasLimit;
      const estimatedFeeFormatted = ethers.formatEther(estimatedFee);

      // Get fee in NOK
      const rate = await this.getCryptoToNokRate(chain.coingeckoId);
      const feeNok = parseFloat(estimatedFeeFormatted) * rate;

      return {
        gasPrice: ethers.formatEther(gasPrice),
        gasPriceGwei: parseFloat(gasPriceGwei).toFixed(2),
        gasLimit: gasLimit.toString(),
        estimatedFee: estimatedFeeFormatted,
        estimatedFeeNok: feeNok.toFixed(2),
        symbol: chain.symbol,
        chainKey
      };
    } catch (error) {
      console.error(`Gas estimation failed for ${chainKey}:`, error.message);

      // Return default estimates
      return {
        gasPrice: '0.00000001',
        gasPriceGwei: '10',
        gasLimit: '21000',
        estimatedFee: '0.00021',
        estimatedFeeNok: '5.00',
        symbol: chain.symbol,
        chainKey,
        estimated: true
      };
    }
  }

  /**
   * Create payment request for frontend
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Payment request data
   */
  async createPaymentRequest(orderData) {
    const { orderId, amountNok, chainKey = 'ethereum' } = orderData;

    try {
      const chain = this.getChainConfig(chainKey);
      if (!chain) {
        throw new Error(`Unknown chain: ${chainKey}`);
      }

      const walletAddress = this.getWalletAddress(chainKey);
      if (!walletAddress) {
        throw new Error(`No wallet configured for ${chainKey}`);
      }

      const conversion = await this.convertNokToCrypto(amountNok, chainKey);
      const gasEstimate = await this.estimateGas(chainKey);

      return {
        success: true,
        orderId,
        recipient: walletAddress,
        amountCrypto: conversion.cryptoAmountFormatted,
        amountNok,
        symbol: chain.symbol,
        exchangeRate: conversion.exchangeRate,
        gasEstimate,
        chain: {
          key: chainKey,
          chainId: chain.chainId,
          name: chain.name,
          explorer: chain.explorer,
          icon: chain.icon,
          color: chain.color
        },
        transactionData: {
          to: walletAddress,
          value: conversion.cryptoAmountWei,
          chainId: chain.chainId
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
   * Verify a transaction on any chain
   * @param {string} txHash - Transaction hash
   * @param {Object} expectedData - Expected transaction data
   * @param {string} chainKey - Chain identifier
   * @returns {Promise<Object>} Verification result
   */
  async verifyTransaction(txHash, expectedData, chainKey) {
    const chain = this.getChainConfig(chainKey);
    if (!chain) {
      return {
        verified: false,
        error: `Unknown chain: ${chainKey}`
      };
    }

    const provider = this.getProvider(chainKey);
    const walletAddress = this.getWalletAddress(chainKey);

    try {
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          verified: false,
          error: 'Transaction not found or not yet mined',
          txHash,
          pending: true
        };
      }

      // Get full transaction details
      const tx = await provider.getTransaction(txHash);

      // Verify recipient
      const toAddress = tx.to?.toLowerCase();
      const expectedAddress = walletAddress.toLowerCase();

      if (toAddress !== expectedAddress) {
        return {
          verified: false,
          error: 'Transaction recipient mismatch',
          txHash
        };
      }

      // Verify amount (allow 1% variance for gas price fluctuations)
      const valueReceived = parseFloat(ethers.formatEther(tx.value));
      const expectedValue = parseFloat(expectedData.amountCrypto);
      const variance = expectedValue * 0.01;
      const amountMatches = Math.abs(valueReceived - expectedValue) <= variance;

      const verified = (
        receipt.status === 1 && // Transaction succeeded
        toAddress === expectedAddress && // Correct recipient
        amountMatches // Correct amount (within variance)
      );

      // Get block timestamp
      let timestamp = null;
      if (tx.blockNumber) {
        try {
          const block = await provider.getBlock(tx.blockNumber);
          timestamp = block?.timestamp;
        } catch (e) {
          // Ignore timestamp fetch errors
        }
      }

      return {
        verified,
        txHash,
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations: await receipt.confirmations(),
        blockNumber: receipt.blockNumber,
        from: tx.from,
        to: tx.to,
        value: valueReceived.toFixed(8),
        expectedValue: expectedValue.toFixed(8),
        symbol: chain.symbol,
        chainKey,
        gasUsed: receipt.gasUsed.toString(),
        timestamp,
        explorerUrl: this.getExplorerUrl(txHash, chainKey)
      };

    } catch (error) {
      console.error(`Transaction verification failed for ${chainKey}:`, error.message);
      return {
        verified: false,
        error: error.message,
        txHash
      };
    }
  }

  /**
   * Wait for transaction confirmation
   * @param {string} txHash - Transaction hash
   * @param {string} chainKey - Chain identifier
   * @param {number} confirmations - Number of confirmations to wait for
   * @returns {Promise<Object>} Confirmation result
   */
  async waitForConfirmation(txHash, chainKey, confirmations = 3) {
    const provider = this.getProvider(chainKey);

    try {
      console.log(`Waiting for ${confirmations} confirmations on ${chainKey} for tx: ${txHash}`);

      const receipt = await provider.waitForTransaction(txHash, confirmations, 120000); // 2 min timeout

      return {
        success: true,
        receipt,
        confirmed: true,
        confirmations
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
   * Get explorer URL for a transaction
   * @param {string} txHash - Transaction hash
   * @param {string} chainKey - Chain identifier
   * @returns {string} Explorer URL
   */
  getExplorerUrl(txHash, chainKey) {
    const chain = this.getChainConfig(chainKey);
    return chain ? `${chain.explorer}/tx/${txHash}` : null;
  }

  /**
   * Get explorer URL for an address
   * @param {string} address - Wallet address
   * @param {string} chainKey - Chain identifier
   * @returns {string} Explorer URL
   */
  getAddressExplorerUrl(address, chainKey) {
    const chain = this.getChainConfig(chainKey);
    return chain ? `${chain.explorer}/address/${address}` : null;
  }

  /**
   * Validate Ethereum-compatible address
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Get chain info for adding to wallet (EIP-3085)
   * @param {string} chainKey - Chain identifier
   * @returns {Object} Chain add params
   */
  getChainAddParams(chainKey) {
    const chain = this.getChainConfig(chainKey);
    if (!chain) return null;

    return {
      chainId: `0x${chain.chainId.toString(16)}`,
      chainName: chain.name,
      nativeCurrency: {
        name: chain.symbol,
        symbol: chain.symbol,
        decimals: chain.decimals
      },
      rpcUrls: [chain.rpcUrl],
      blockExplorerUrls: [chain.explorer]
    };
  }
}

module.exports = MultiChainPayment;
