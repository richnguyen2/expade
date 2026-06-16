import Link from 'next/link';

interface AppointmentPageProps {
  params: { id: string };
}

export default function AppointmentPage({ params }: AppointmentPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white border border-gray-100 p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Book your appointment</h1>
        <p className="mt-4 text-gray-600">This booking flow is coming soon. We have reserved your choice: service ID <span className="font-semibold">{params.id}</span>.</p>
        <div className="mt-8 rounded-3xl bg-gray-50 p-6 text-sm text-gray-500">
          <p>Next step: add a simple appointment checkout and a time picker for the selected service.</p>
        </div>
        <Link href="/" className="mt-8 inline-flex items-center justify-center rounded-full bg-[#708238] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b6b2e] transition-colors">
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
