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
      {/* Our new client-side carousel */}
      <Row />
      <Row />
    </div>
  );
}