import { peasABI } from '@/utils/abi';
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

  console.log('frameMessage', frameMessage?.connectedAddress);

  if (!frameMessage) {
    throw new Error('No frame message');
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  const calldata = encodeFunctionData({
    abi: peasABI,
    functionName: 'mint',
    args: [frameMessage.connectedAddress],
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const peasContractRegistry = getContract({
    address: `${address}` as any,
    abi: peasABI,
    client: publicClient,
  });

  const price = await peasContractRegistry.read.price();
  console.log('price', price?.toString());

  return NextResponse.json({
    chainId: `eip155:${baseSepolia.id}`, // Remember Base Sepolia might not work on Warpcast yet
    method: 'eth_sendTransaction',
    params: {
      abi: peasABI as Abi,
      to: `${address}` as any,
      data: calldata,
      value: price?.toString() ?? '0',
    },
  });
}
