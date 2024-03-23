import { fetchMetadata } from 'frames.js/next';

export async function generateMetadata() {
  return {
    title: 'My Page',
    ...(await fetchMetadata(new URL('/frames', process.env.NEXT_PUBLIC_HOST_URL))),
  };
}

export default function Page() {
  return <span>My existing page</span>;
}
