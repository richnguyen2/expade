import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function MarketplacePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-10">
      <h1>Marketplace</h1>
      <p>Welcome to the marketplace, where businesses offer their services.</p>
    </div>
  );
}