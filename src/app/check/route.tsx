import { DripsABI } from '@/utils/abi';
import { createFrames, Button } from 'frames.js/next';
import { createPublicClient, getContract, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getFrameMessage } from '@coinbase/onchainkit/frame';

const checkDiscount = async (solAddress: string, dripAddresses: string) => {
  const apiResponse = await fetch(
    `https://api.simplehash.com/api/v0/nfts/owners?chains=solana&wallet_addresses=${solAddress}&limit=1&collection_ids=${dripAddresses}`,
    {
      method: 'GET',
      headers: {
        'X-API-KEY':
          'huddle01_sk_06c16a46-b3a4-455a-afd9-cfa252fc6ad3_nh4z4i5a1dh8yu0j',
      },
    }
  );
  const data = await apiResponse.json();
  console.log('API Response', data);
  return data?.nfts?.length > 0;
};

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

  const uri = await peasContractRegistry.read.previewImageURI();

  const uriResponse = await fetch(uri as string);

  const metadata = (await uriResponse.json()) as {
    name: string;
    description: string;
    image: string;
    dripAddresses: string[];
  };

  const dripAddresses = metadata.dripAddresses;
  console.log('Drip Addresses', dripAddresses);

  let isDiscount = false;

  if (solAddress && dripAddresses) {
    const apiResponse = await fetch(
      `https://api.simplehash.com/api/v0/nfts/owners?chains=solana&wallet_addresses=${solAddress}&limit=1&collection_ids=${dripAddresses.join(
        ','
      )}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.SIMPLEHASH_API_KEY!,
        },
      }
    );
    const data = await apiResponse.json();
    console.log('API Response', data.nfts);
    if (data?.nfts?.length > 0) {
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
        target={`${process.env.NEXT_PUBLIC_HOST_URL}/tx?address=${address}&isDiscount=${isDiscount}`}
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
