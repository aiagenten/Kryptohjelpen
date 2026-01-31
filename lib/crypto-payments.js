const { ethers } = require('ethers');
const axios = require('axios');

/**
 * Comprehensive Crypto Payment Handler
 * Supports: EVM chains (ETH, Polygon, etc.), Bitcoin, Stablecoins (USDT, USDC)
 */
class CryptoPayments {
  constructor(config) {
    this.walletAddresses = config.walletAddresses || {};
    this.defaultEvmWallet = config.defaultEvmWallet;
    this.bitcoinAddress = config.bitcoinAddress;
    this.infuraProjectId = config.infuraProjectId;
    this.alchemyApiKey = config.alchemyApiKey;

    // Stablecoin contract addresses (mainnet)
    this.stablecoins = {
      ethereum: {
        usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      },
      polygon: {
        usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      },
      arbitrum: {
        usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
      },
      optimism: {
        usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
      },
      base: {
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      },
      bsc: {
        usdt: '0x55d398326f99059fF775485246999027B3197955',
        usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
      }
    };

    // ERC20 ABI (minimal for transfers)
    this.erc20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address account) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];

    // EVM Chain configurations
    this.evmChains = {
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
        color: '#627EEA',
        type: 'evm'
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
        color: '#8247E5',
        type: 'evm'
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
        color: '#28A0F0',
        type: 'evm'
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
        color: '#FF0420',
        type: 'evm'
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
        color: '#0052FF',
        type: 'evm'
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
        color: '#F0B90B',
        type: 'evm'
      }
    };

    // Bitcoin configuration
    this.bitcoin = {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
      explorer: 'https://blockstream.info',
      coingeckoId: 'bitcoin',
      icon: '₿',
      color: '#F7931A',
      type: 'bitcoin'
    };

    // Stablecoin configurations
    this.stablecoinConfig = {
      usdt: {
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        coingeckoId: 'tether',
        icon: '💵',
        color: '#26A17B',
        type: 'stablecoin'
      },
      usdc: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        coingeckoId: 'usd-coin',
        icon: '🔵',
        color: '#2775CA',
        type: 'stablecoin'
      }
    };

    // Cache for rates
    this.rateCache = {};
    this.rateCacheExpiry = 60000; // 1 minute

    // Providers cache
    this.providers = {};
  }

  /**
   * Get provider for EVM chain
   */
  getEvmProvider(chainKey) {
    const chain = this.evmChains[chainKey];
    if (!chain) {
      throw new Error(`Unknown EVM chain: ${chainKey}`);
    }

    if (!this.providers[chainKey]) {
      this.providers[chainKey] = new ethers.JsonRpcProvider(chain.rpcUrl);
    }

    return this.providers[chainKey];
  }

  /**
   * Get all supported payment options for checkout
   */
  getSupportedPaymentOptions() {
    const options = [];

    // Add EVM native currencies
    Object.entries(this.evmChains).forEach(([key, chain]) => {
      options.push({
        key: key,
        type: 'evm-native',
        chainId: chain.chainId,
        name: chain.name,
        symbol: chain.symbol,
        icon: chain.icon,
        color: chain.color,
        explorer: chain.explorer,
        walletAddress: this.walletAddresses[key] || this.defaultEvmWallet,
        fees: key === 'ethereum' ? 'high' : 'low'
      });
    });

    // Add Bitcoin
    if (this.bitcoinAddress) {
      options.push({
        key: 'bitcoin',
        type: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: '₿',
        color: '#F7931A',
        explorer: 'https://blockstream.info',
        walletAddress: this.bitcoinAddress,
        fees: 'variable'
      });
    }

    // Add stablecoins (available on multiple chains)
    ['usdt', 'usdc'].forEach(stablecoin => {
      const config = this.stablecoinConfig[stablecoin];
      const availableChains = Object.entries(this.stablecoins)
        .filter(([chain, tokens]) => tokens[stablecoin])
        .map(([chain]) => ({
          chainKey: chain,
          chainName: this.evmChains[chain].name,
          contractAddress: this.stablecoins[chain][stablecoin],
          chainId: this.evmChains[chain].chainId
        }));

      if (availableChains.length > 0) {
        options.push({
          key: stablecoin,
          type: 'stablecoin',
          name: config.name,
          symbol: config.symbol,
          icon: config.icon,
          color: config.color,
          chains: availableChains,
          walletAddress: this.defaultEvmWallet,
          fees: 'varies by chain'
        });
      }
    });

    return options;
  }

  /**
   * Fetch crypto price in NOK from CoinGecko
   */
  async getCryptoPrice(coingeckoId) {
    const cacheKey = coingeckoId;
    const now = Date.now();

    if (this.rateCache[cacheKey] && now < this.rateCache[cacheKey].expiry) {
      return this.rateCache[cacheKey];
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

      const data = response.data[coingeckoId];
      if (!data) {
        throw new Error(`No price data for ${coingeckoId}`);
      }

      const result = {
        nokRate: data.nok,
        usdRate: data.usd,
        expiry: now + this.rateCacheExpiry
      };

      this.rateCache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error(`Failed to fetch price for ${coingeckoId}:`, error.message);

      // Return cached if available
      if (this.rateCache[cacheKey]) {
        return this.rateCache[cacheKey];
      }

      throw new Error(`Unable to fetch price for ${coingeckoId}`);
    }
  }

  /**
   * Get all current rates
   */
  async getAllRates() {
    const coingeckoIds = [
      'bitcoin',
      'ethereum',
      'matic-network',
      'binancecoin',
      'tether',
      'usd-coin'
    ];

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: coingeckoIds.join(','),
            vs_currencies: 'nok,usd'
          },
          timeout: 10000
        }
      );

      const rates = {
        bitcoin: {
          symbol: 'BTC',
          name: 'Bitcoin',
          icon: '₿',
          color: '#F7931A',
          rateNok: response.data.bitcoin?.nok || 0,
          rateUsd: response.data.bitcoin?.usd || 0
        },
        ethereum: {
          symbol: 'ETH',
          name: 'Ethereum',
          icon: '⟠',
          color: '#627EEA',
          rateNok: response.data.ethereum?.nok || 0,
          rateUsd: response.data.ethereum?.usd || 0
        },
        polygon: {
          symbol: 'MATIC',
          name: 'Polygon',
          icon: '⬡',
          color: '#8247E5',
          rateNok: response.data['matic-network']?.nok || 0,
          rateUsd: response.data['matic-network']?.usd || 0
        },
        bsc: {
          symbol: 'BNB',
          name: 'BNB',
          icon: '⬡',
          color: '#F0B90B',
          rateNok: response.data.binancecoin?.nok || 0,
          rateUsd: response.data.binancecoin?.usd || 0
        },
        usdt: {
          symbol: 'USDT',
          name: 'Tether',
          icon: '💵',
          color: '#26A17B',
          rateNok: response.data.tether?.nok || 0,
          rateUsd: response.data.tether?.usd || 0,
          isStable: true
        },
        usdc: {
          symbol: 'USDC',
          name: 'USD Coin',
          icon: '🔵',
          color: '#2775CA',
          rateNok: response.data['usd-coin']?.nok || 0,
          rateUsd: response.data['usd-coin']?.usd || 0,
          isStable: true
        }
      };

      return {
        rates,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch rates:', error.message);
      throw new Error('Unable to fetch exchange rates');
    }
  }

  /**
   * Convert NOK to crypto amount
   */
  async convertNokToCrypto(nokAmount, paymentOption, chainKey = null) {
    let coingeckoId, symbol, decimals;

    if (paymentOption === 'bitcoin') {
      coingeckoId = 'bitcoin';
      symbol = 'BTC';
      decimals = 8;
    } else if (paymentOption === 'usdt' || paymentOption === 'usdc') {
      // Stablecoins are pegged to USD, use USD rate for better accuracy
      coingeckoId = paymentOption === 'usdt' ? 'tether' : 'usd-coin';
      symbol = paymentOption.toUpperCase();
      decimals = 6;
    } else if (this.evmChains[paymentOption]) {
      const chain = this.evmChains[paymentOption];
      coingeckoId = chain.coingeckoId;
      symbol = chain.symbol;
      decimals = chain.decimals;
    } else {
      throw new Error(`Unknown payment option: ${paymentOption}`);
    }

    const price = await this.getCryptoPrice(coingeckoId);
    const cryptoAmount = nokAmount / price.nokRate;

    return {
      nokAmount,
      cryptoAmount,
      cryptoAmountFormatted: cryptoAmount.toFixed(decimals),
      symbol,
      exchangeRate: price.nokRate,
      usdRate: price.usdRate,
      paymentOption,
      chainKey: chainKey || paymentOption
    };
  }

  /**
   * Create payment request for any crypto type
   */
  async createPaymentRequest(orderData) {
    const { orderId, amountNok, paymentOption, chainKey } = orderData;

    try {
      if (paymentOption === 'bitcoin') {
        return await this.createBitcoinPaymentRequest(orderId, amountNok);
      } else if (paymentOption === 'usdt' || paymentOption === 'usdc') {
        return await this.createStablecoinPaymentRequest(orderId, amountNok, paymentOption, chainKey);
      } else {
        return await this.createEvmPaymentRequest(orderId, amountNok, paymentOption);
      }
    } catch (error) {
      console.error('Payment request creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Bitcoin payment request
   */
  async createBitcoinPaymentRequest(orderId, amountNok) {
    if (!this.bitcoinAddress) {
      throw new Error('Bitcoin wallet not configured');
    }

    const conversion = await this.convertNokToCrypto(amountNok, 'bitcoin');

    return {
      success: true,
      orderId,
      type: 'bitcoin',
      recipient: this.bitcoinAddress,
      amountCrypto: conversion.cryptoAmountFormatted,
      amountNok,
      symbol: 'BTC',
      exchangeRate: conversion.exchangeRate,
      chain: {
        key: 'bitcoin',
        name: 'Bitcoin',
        icon: '₿',
        color: '#F7931A',
        explorer: 'https://blockstream.info'
      },
      // Generate BIP21 URI for QR code
      paymentUri: `bitcoin:${this.bitcoinAddress}?amount=${conversion.cryptoAmountFormatted}&label=Order-${orderId}`,
      // Instructions for user
      instructions: [
        'Skann QR-koden eller kopier adressen',
        `Send nøyaktig ${conversion.cryptoAmountFormatted} BTC`,
        'Vent på minst 1 bekreftelse (ca. 10 minutter)',
        'Du får e-post når betalingen er bekreftet'
      ]
    };
  }

  /**
   * Create EVM native currency payment request
   */
  async createEvmPaymentRequest(orderId, amountNok, chainKey) {
    const chain = this.evmChains[chainKey];
    if (!chain) {
      throw new Error(`Unknown chain: ${chainKey}`);
    }

    const walletAddress = this.walletAddresses[chainKey] || this.defaultEvmWallet;
    if (!walletAddress) {
      throw new Error(`No wallet configured for ${chainKey}`);
    }

    const conversion = await this.convertNokToCrypto(amountNok, chainKey);
    const gasEstimate = await this.estimateEvmGas(chainKey);

    return {
      success: true,
      orderId,
      type: 'evm-native',
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
        icon: chain.icon,
        color: chain.color,
        explorer: chain.explorer
      },
      transactionData: {
        to: walletAddress,
        value: ethers.parseEther(conversion.cryptoAmountFormatted).toString(),
        chainId: chain.chainId
      }
    };
  }

  /**
   * Create stablecoin payment request
   */
  async createStablecoinPaymentRequest(orderId, amountNok, stablecoin, chainKey) {
    const stablecoinContracts = this.stablecoins[chainKey];
    if (!stablecoinContracts || !stablecoinContracts[stablecoin]) {
      throw new Error(`${stablecoin.toUpperCase()} not available on ${chainKey}`);
    }

    const chain = this.evmChains[chainKey];
    const walletAddress = this.walletAddresses[chainKey] || this.defaultEvmWallet;
    if (!walletAddress) {
      throw new Error(`No wallet configured for ${chainKey}`);
    }

    const contractAddress = stablecoinContracts[stablecoin];
    const stablecoinInfo = this.stablecoinConfig[stablecoin];
    const conversion = await this.convertNokToCrypto(amountNok, stablecoin, chainKey);

    // Stablecoins use 6 decimals
    const amount = ethers.parseUnits(conversion.cryptoAmountFormatted, 6);

    return {
      success: true,
      orderId,
      type: 'stablecoin',
      recipient: walletAddress,
      amountCrypto: conversion.cryptoAmountFormatted,
      amountNok,
      symbol: stablecoinInfo.symbol,
      exchangeRate: conversion.exchangeRate,
      chain: {
        key: chainKey,
        chainId: chain.chainId,
        name: chain.name,
        icon: chain.icon,
        color: chain.color,
        explorer: chain.explorer
      },
      contract: {
        address: contractAddress,
        symbol: stablecoinInfo.symbol,
        decimals: 6
      },
      transactionData: {
        to: contractAddress,
        chainId: chain.chainId,
        // Encoded transfer function call
        data: new ethers.Interface(this.erc20Abi).encodeFunctionData('transfer', [walletAddress, amount])
      }
    };
  }

  /**
   * Estimate gas for EVM transaction
   */
  async estimateEvmGas(chainKey) {
    const chain = this.evmChains[chainKey];
    const provider = this.getEvmProvider(chainKey);

    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
      const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

      const gasLimit = 21000n;
      const estimatedFee = gasPrice * gasLimit;
      const estimatedFeeFormatted = ethers.formatEther(estimatedFee);

      const price = await this.getCryptoPrice(chain.coingeckoId);
      const feeNok = parseFloat(estimatedFeeFormatted) * price.nokRate;

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
   * Verify EVM transaction
   */
  async verifyEvmTransaction(txHash, expectedData, chainKey) {
    const chain = this.evmChains[chainKey];
    if (!chain) {
      return { verified: false, error: `Unknown chain: ${chainKey}` };
    }

    const provider = this.getEvmProvider(chainKey);
    const walletAddress = this.walletAddresses[chainKey] || this.defaultEvmWallet;

    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          verified: false,
          error: 'Transaction not found or not yet mined',
          pending: true
        };
      }

      const tx = await provider.getTransaction(txHash);

      // Verify recipient
      const toAddress = tx.to?.toLowerCase();
      const expectedAddress = walletAddress.toLowerCase();

      if (toAddress !== expectedAddress) {
        return { verified: false, error: 'Transaction recipient mismatch' };
      }

      // Verify amount (1% tolerance)
      const valueReceived = parseFloat(ethers.formatEther(tx.value));
      const expectedValue = parseFloat(expectedData.amountCrypto);
      const variance = expectedValue * 0.01;
      const amountMatches = Math.abs(valueReceived - expectedValue) <= variance;

      const verified = receipt.status === 1 && toAddress === expectedAddress && amountMatches;

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
        explorerUrl: `${chain.explorer}/tx/${txHash}`
      };
    } catch (error) {
      console.error(`Transaction verification failed:`, error.message);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Check Bitcoin transaction (via Blockstream API)
   */
  async checkBitcoinTransaction(txid) {
    try {
      const response = await axios.get(
        `https://blockstream.info/api/tx/${txid}`,
        { timeout: 10000 }
      );

      const tx = response.data;

      // Find output to our address
      const ourOutput = tx.vout.find(
        out => out.scriptpubkey_address === this.bitcoinAddress
      );

      if (!ourOutput) {
        return {
          verified: false,
          error: 'No output to our Bitcoin address'
        };
      }

      const amountBtc = ourOutput.value / 100000000; // satoshis to BTC
      const confirmed = tx.status.confirmed;

      return {
        verified: confirmed,
        pending: !confirmed,
        txid,
        amount: amountBtc,
        confirmations: confirmed ? 1 : 0, // Blockstream doesn't give confirmation count
        blockHeight: tx.status.block_height,
        explorerUrl: `https://blockstream.info/tx/${txid}`
      };
    } catch (error) {
      console.error('Bitcoin tx check failed:', error.message);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash, chainKey) {
    if (chainKey === 'bitcoin') {
      return `https://blockstream.info/tx/${txHash}`;
    }

    const chain = this.evmChains[chainKey];
    return chain ? `${chain.explorer}/tx/${txHash}` : null;
  }

  /**
   * Get chain config for wallet integration
   */
  getChainAddParams(chainKey) {
    const chain = this.evmChains[chainKey];
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

  /**
   * Get stablecoin contract info for a chain
   */
  getStablecoinContract(stablecoin, chainKey) {
    const contracts = this.stablecoins[chainKey];
    if (!contracts || !contracts[stablecoin]) {
      return null;
    }

    return {
      address: contracts[stablecoin],
      ...this.stablecoinConfig[stablecoin],
      chainKey,
      chainId: this.evmChains[chainKey].chainId
    };
  }

  /**
   * Get available stablecoin chains
   */
  getStablecoinChains(stablecoin) {
    return Object.entries(this.stablecoins)
      .filter(([chain, tokens]) => tokens[stablecoin])
      .map(([chainKey]) => ({
        chainKey,
        ...this.evmChains[chainKey],
        contractAddress: this.stablecoins[chainKey][stablecoin]
      }));
  }
}

module.exports = CryptoPayments;
