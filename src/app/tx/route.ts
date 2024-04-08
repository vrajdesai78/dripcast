import { DripsABI } from '@/utils/abi';
import { TransactionTargetResponse } from 'frames.js';
import { getFrameMessage } from 'frames.js/next/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
} from 'viem';
import { baseSepolia } from 'viem/chains';

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error('No frame message');
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const isDiscount = searchParams.get('isDiscount');

  const calldata = encodeFunctionData({
    abi: DripsABI,
    functionName: isDiscount ? 'discountedMint' : 'mint',
    args: isDiscount
      ? [frameMessage.connectedAddress, 50]
      : [frameMessage.connectedAddress],
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const peasContractRegistry = getContract({
    address: `${address}` as any,
    abi: DripsABI,
    client: publicClient,
  });

  const price = await peasContractRegistry.read.price();

  return NextResponse.json({
    chainId: `eip155:${baseSepolia.id}`, // Remember Base Sepolia might not work on Warpcast yet
    method: 'eth_sendTransaction',
    params: {
      abi: DripsABI as Abi,
      to: `${address}` as any,
      data: calldata,
      value: price?.toString() ?? '0',
    },
  });
}
