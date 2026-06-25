'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get('search') ?? '';
  const [value, setValue] = useState(activeQuery);

  // Keep the input in sync when the URL query changes (e.g. cleared, or navigated).
  useEffect(() => {
    setValue(activeQuery);
  }, [activeQuery]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/home?search=${encodeURIComponent(q)}` : '/home');
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-xl">
      <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search services, businesses…"
        className="w-full rounded-xl border border-border bg-muted/60 py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
