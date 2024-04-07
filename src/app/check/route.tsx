import { DripsABI } from '@/utils/abi';
import { createFrames, Button } from 'frames.js/next';
import { createPublicClient, getContract, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getFrameMessage } from '@coinbase/onchainkit/frame';

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

  const json = await ctx.request.json();

  const { message } = await getFrameMessage(json);

  let solAddress;

  if (message?.interactor?.verified_addresses?.sol_addresses) {
    solAddress = message?.interactor?.verified_addresses?.sol_addresses[0];
  }

  const dripAddresses = await publicClient.readContract({
    address: address as `0x${string}`,
    functionName: 'discountedCommunities',
    abi: DripsABI,
    args: [0],
  });

  console.log('solAddress', dripAddresses);

  let isDiscount = false;

  if (solAddress && dripAddresses) {
    const apiResponse = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'searchAssets',
          params: {
            ownerAddress: solAddress,
            grouping: ['collection', dripAddresses],
            page: 1,
            limit: 2,
          },
        }),
      }
    );

    const data = await apiResponse.json();

    console.log('solAddress', solAddress);
    console.log('dripAddresses', dripAddresses);
    console.log('data', data);

    if (data?.result?.items?.length > 0) {
      isDiscount = true;
    }
  }

  return {
    image: `${
      isDiscount
        ? 'https://ipfs.moralis.io:2053/ipfs/QmbYFQCnGziHYuS8NWv7jdzcg7LusgBeJD8TCpJCpnDTNB'
        : 'https://ipfs.moralis.io:2053/ipfs/QmfSbR2Rn7hxAJmanUk1WXoFR6uCWeTMkqbY9oS3fTyd5p'
    }`,
    buttons: [
      <Button
        action='tx'
        key={1}
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/tx?address=${address}`}
        post_url={`${process.env.NEXT_PUBLIC_HOST_URL}/tx-success?address=${address}`}
      >
        Buy Now
      </Button>,
      <Button
        action='post'
        key={2}
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/frames?address=${address}`}
      >
        Show Preview
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
