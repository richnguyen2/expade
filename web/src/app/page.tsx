import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between gap-8 shadow-sm">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="bg-[#708238] text-white p-1.5 rounded-md">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v3H4V4zm0 6h16v3H4v-3zm0 6h16v3H4v-3z"/></svg>
          </div>
          <span className="font-bold text-3xl tracking-tight text-[#708238]">EXPADE</span>
        </div>

        {/* Auth Navigation - Top Left */}
        <div className="flex items-center gap-4 pl-8">
          <SignInButton mode="modal">
            <button className="text-gray-600 hover:text-[#708238] font-bold transition">
              Log In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-[#708238] text-white px-6 py-2.5 rounded-full hover:bg-[#5b6b2e] transition font-semibold shadow-sm">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 flex py-8 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-3xl">
          <div className="inline-block mb-4 px-4 py-1.5 bg-[#708238]/10 text-[#708238] rounded-full text-sm font-bold tracking-wide uppercase">
            The Premier Service Marketplace
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Discover and Book Local Services, <span className="text-[#708238]">Elevated.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Expade bridges the gap between top-tier service providers and the communities they serve. 
            Whether you need expert automotive repair, professional home services, or a relaxing wellness appointment, 
            our platform streamlines verification, booking, and business management all in one place.
          </p>

          <div className="flex items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <button className="bg-[#708238] text-white px-8 py-4 rounded-full text-lg hover:bg-[#5b6b2e] transition font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Get Started for Free
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full text-lg hover:border-[#708238] hover:text-[#708238] transition font-bold shadow-sm">
                I already have an account
              </button>
            </SignInButton>
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Expade. All rights reserved.
      </footer>
    </div>
  );
}