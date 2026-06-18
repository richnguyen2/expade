import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingCategories from '@/components/landing/LandingCategories';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingBusinessCTA from '@/components/landing/LandingBusinessCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/home');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingCategories />
        <LandingHowItWorks />
        <LandingBusinessCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
