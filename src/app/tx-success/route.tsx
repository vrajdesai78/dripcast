import { DripsABI } from '@/utils/abi';
import { createFrames, Button } from 'frames.js/next';
import { createPublicClient, getContract, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const frames = createFrames();
const handleRequest = frames(async (ctx) => {
  const { searchParams } = new URL(ctx.url);
  const address = searchParams.get('address');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const peasContractRegistry = getContract({
    address: address as `0x${string}`,
    abi: DripsABI,
    client: publicClient,
  });

  const uri = await peasContractRegistry.read.previewImageURI();

  const uriResponse = await fetch(uri as string);

  const metadata = (await uriResponse.json()) as {
    name: string;
    description: string;
    image: string;
  };

  return {
    image:
      'https://ipfs.moralis.io:2053/ipfs/QmQMAsLmnXnL1k1TkCihF4bTiFc7c4PTFG3edNy4BoV7dG',
    buttons: [
      <Button action='link' key={1} target={`https://dripcast.vercel.app`}>
        Check this out on DripCaster
      </Button>,
    ],
    accepts: [
      {
        id: 'farcaster',
        version: 'vNext',
      },
      {
        id: 'xmtp',
        version: 'vNext',
      },
    ],
  };
  ``;
});

export const GET = handleRequest;
export const POST = handleRequest;
