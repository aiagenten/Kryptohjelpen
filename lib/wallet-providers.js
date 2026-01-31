/**
 * Wallet Provider Configurations
 * Used by frontend for multi-wallet support
 */

const WALLET_PROVIDERS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Populær nettleser-lommebok',
    color: '#F6851B',
    downloadUrl: 'https://metamask.io/download/',
    deepLinkPrefix: 'https://metamask.app.link/dapp/',
    injectedProvider: 'ethereum',
    checkInjected: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask
  },

  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Koble til 300+ lommebøker via QR-kode',
    color: '#3B99FC',
    downloadUrl: null, // No download needed
    injectedProvider: null,
    projectId: process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id',
    checkInjected: () => true // Always available
  },

  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Coinbase sin offisielle lommebok',
    color: '#0052FF',
    downloadUrl: 'https://www.coinbase.com/wallet',
    deepLinkPrefix: 'https://go.cb-w.com/dapp?cb_url=',
    injectedProvider: 'coinbaseWalletExtension',
    checkInjected: () => typeof window !== 'undefined' && (
      window.coinbaseWalletExtension ||
      window.ethereum?.isCoinbaseWallet
    )
  },

  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Sikker mobil-lommebok',
    color: '#3375BB',
    downloadUrl: 'https://trustwallet.com/download',
    deepLinkPrefix: 'trust://open_url?url=',
    injectedProvider: 'trustwallet',
    checkInjected: () => typeof window !== 'undefined' && (
      window.trustwallet ||
      window.ethereum?.isTrust
    )
  },

  rabby: {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '🐰',
    description: 'Sikker DeFi-lommebok',
    color: '#7B61FF',
    downloadUrl: 'https://rabby.io/',
    injectedProvider: 'ethereum',
    checkInjected: () => typeof window !== 'undefined' && window.ethereum?.isRabby
  },

  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Brukervennlig Ethereum-lommebok',
    color: '#001E59',
    downloadUrl: 'https://rainbow.me/',
    deepLinkPrefix: 'rainbow://wc?uri=',
    injectedProvider: 'ethereum',
    checkInjected: () => typeof window !== 'undefined' && window.ethereum?.isRainbow
  }
};

/**
 * Get wallet provider configuration
 * @param {string} providerId - Wallet provider ID
 * @returns {Object|null} Provider config
 */
function getWalletProvider(providerId) {
  return WALLET_PROVIDERS[providerId] || null;
}

/**
 * Get all wallet providers
 * @returns {Array} All provider configs
 */
function getAllWalletProviders() {
  return Object.values(WALLET_PROVIDERS);
}

/**
 * Get recommended wallets for a platform
 * @param {string} platform - 'desktop', 'mobile', or 'all'
 * @returns {Array} Recommended providers
 */
function getRecommendedWallets(platform = 'all') {
  if (platform === 'desktop') {
    return [
      WALLET_PROVIDERS.metamask,
      WALLET_PROVIDERS.coinbase,
      WALLET_PROVIDERS.rabby,
      WALLET_PROVIDERS.walletconnect
    ];
  }
  if (platform === 'mobile') {
    return [
      WALLET_PROVIDERS.walletconnect,
      WALLET_PROVIDERS.trust,
      WALLET_PROVIDERS.coinbase,
      WALLET_PROVIDERS.rainbow
    ];
  }
  return Object.values(WALLET_PROVIDERS);
}

module.exports = {
  WALLET_PROVIDERS,
  getWalletProvider,
  getAllWalletProviders,
  getRecommendedWallets
};
