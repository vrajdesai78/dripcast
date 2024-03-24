import { peasABI } from '@/utils/abi';
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
    abi: peasABI,
    client: publicClient,
  });

  const uri = await peasContractRegistry.read.uri([1]);

  const uriResponse = await fetch(uri as string);

  const metadata = (await uriResponse.json()) as {
    name: string;
    description: string;
    image: string;
  };

  return {
    image: <span>You have bought {metadata.name}</span>,
    buttons: [
      <Button action='link' key={1} target={`https://onlyframe.vercel.app`}>
        Check this out on OnlyFrame
      </Button>,
    ],
  };
  ``;
});

export const GET = handleRequest;
export const POST = handleRequest;
