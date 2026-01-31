import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import db from '@/lib/db';

const WALLET_ADDRESS = '0x14f7b46445e77c61bb4f7b23c81221dfc6928c9f';

const NETWORKS: Record<string, { name: string; rpc: string; symbol: string; chainId: number; explorer: string }> = {
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    chainId: 1,
    explorer: 'https://etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    chainId: 137,
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    chainId: 42161,
    explorer: 'https://arbiscan.io'
  },
  optimism: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    chainId: 10,
    explorer: 'https://optimistic.etherscan.io'
  },
  base: {
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    symbol: 'ETH',
    chainId: 8453,
    explorer: 'https://basescan.org'
  },
  bsc: {
    name: 'BNB Chain',
    rpc: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    chainId: 56,
    explorer: 'https://bscscan.com'
  }
};

// Get current crypto prices in NOK
async function getPrices(): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,binancecoin&vs_currencies=nok',
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return {
      ETH: data.ethereum?.nok || 35000,
      MATIC: data['matic-network']?.nok || 8,
      BNB: data.binancecoin?.nok || 5000
    };
  } catch {
    // Fallback prices
    return { ETH: 35000, MATIC: 8, BNB: 5000 };
  }
}

// GET: Get payment info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amountNok = parseFloat(searchParams.get('amount') || '0');
  const network = searchParams.get('network') || 'ethereum';

  if (!amountNok) {
    return NextResponse.json({ error: 'Amount required' }, { status: 400 });
  }

  const networkInfo = NETWORKS[network];
  if (!networkInfo) {
    return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
  }

  const prices = await getPrices();
  const price = prices[networkInfo.symbol] || prices.ETH;
  const cryptoAmount = amountNok / price;

  return NextResponse.json({
    address: WALLET_ADDRESS,
    network: networkInfo,
    amountNok,
    cryptoAmount: cryptoAmount.toFixed(6),
    symbol: networkInfo.symbol,
    networks: Object.entries(NETWORKS).map(([key, val]) => ({ id: key, ...val }))
  });
}

// POST: Verify payment
export async function POST(request: NextRequest) {
  try {
    const { orderId, network, txHash } = await request.json();

    if (!orderId || !network || !txHash) {
      return NextResponse.json({ error: 'Missing orderId, network, or txHash' }, { status: 400 });
    }

    const networkInfo = NETWORKS[network];
    if (!networkInfo) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }

    // Connect to network and verify transaction
    const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
    
    try {
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        return NextResponse.json({ error: 'Transaction not found', verified: false });
      }

      // Check if transaction is to our wallet
      if (tx.to?.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
        return NextResponse.json({ error: 'Transaction not to correct address', verified: false });
      }

      // Get transaction receipt to confirm it's mined
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt || receipt.status !== 1) {
        return NextResponse.json({ error: 'Transaction not confirmed or failed', verified: false });
      }

      // Update order in database
      const stmt = db.prepare(`
        UPDATE orders 
        SET payment_status = 'completed',
            order_status = 'paid',
            payment_method = ?,
            updated_at = datetime('now')
        WHERE id = ? OR order_number = ?
      `);
      
      stmt.run(`crypto-${network}`, orderId, orderId);

      return NextResponse.json({
        verified: true,
        txHash,
        from: tx.from,
        value: ethers.formatEther(tx.value),
        explorer: `${networkInfo.explorer}/tx/${txHash}`
      });

    } catch (err) {
      console.error('Transaction verification error:', err);
      return NextResponse.json({ error: 'Failed to verify transaction', verified: false });
    }

  } catch (error) {
    console.error('Crypto payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
