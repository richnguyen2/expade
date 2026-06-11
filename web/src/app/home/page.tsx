import Row from '@/components/Row';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // 1. Server-side route protection
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Render the layout and pass off the heavy lifting to the client component
  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Marketplace</h1>
        <p className="text-lg text-gray-600">Discover and book services from top local businesses.</p>
      </div>
      
      {/* Our new client-side carousel */}
      <Row />
    </div>
  );
}