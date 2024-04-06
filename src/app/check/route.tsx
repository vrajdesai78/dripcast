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

  const dripAddresses = await peasContractRegistry.read.discountedCommunities([
    0,
  ]);

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

    if (data?.result?.items?.length > 0) {
      isDiscount = true;
    }
  }

  return {
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'whitesmoke',
          width: '100%',
          height: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '4rem',
            marginBottom: '10px',
          }}
        >
          {isDiscount
            ? 'Congratulations! You have Drip NFT.'
            : 'Sorry, you do not have Drip NFT.'}
        </h1>
      </div>
    ),
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
