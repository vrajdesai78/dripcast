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
    image: metadata.image,
    buttons: [
      <Button
        action='tx'
        key={1}
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/tx?address=${address}`}
        post_url={`${process.env.NEXT_PUBLIC_HOST_URL}/tx-success?address=${address}`}
      >
        Base
      </Button>,
      <Button
        action='link'
        key={1}
        target={`https://dripcaster.xyz/sol/product/${address}`}
      >
        SOL
      </Button>,
      <Button
        action='post'
        key={1}
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/check?address=${address}`}
      >
        Discount
      </Button>,
      <Button
        action='post'
        key={2}
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/showDetails?address=${address}`}
      >
        Details
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
});

export const GET = handleRequest;
export const POST = handleRequest;
