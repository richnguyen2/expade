'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddressSearch } from '@/hooks';
import type { AddressSuggestionResponse } from '@/types';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onResolved?: (suggestion: AddressSuggestionResponse) => void;
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

const MIN_QUERY = 5;

export default function AddressAutocomplete({
  value,
  onChange,
  onResolved,
  onBlur,
  id,
  placeholder,
  invalid,
  disabled,
}: AddressAutocompleteProps) {
  const search = useAddressSearch();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canSearch = value.trim().length >= MIN_QUERY;

  const runSearch = () => {
    if (!canSearch || disabled) return;
    setOpen(true);
    search.mutate(value.trim());
  };

  const pick = (suggestion: AddressSuggestionResponse) => {
    onChange(suggestion.formattedAddress);
    onResolved?.(suggestion);
    setSelected(true);
    setOpen(false);
  };

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={invalid}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setSelected(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              runSearch();
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          onBlur={onBlur}
          className="h-11"
        />
        <Button
          type="button"
          variant="outline"
          disabled={!canSearch || search.isPending || disabled}
          onClick={runSearch}
          className="h-11 shrink-0 rounded-lg px-4 font-semibold"
        >
          {search.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Find
        </Button>
      </div>

      {selected && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
          <Check className="size-3" /> Address verified
        </p>
      )}

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {search.isPending ? (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </p>
          ) : search.isError ? (
            <p className="px-3 py-3 text-sm text-destructive">Address search failed. Try again.</p>
          ) : search.data && search.data.length > 0 ? (
            search.data.map((s, i) => (
              <button
                key={`${s.formattedAddress}-${i}`}
                type="button"
                onClick={() => pick(s)}
                className="flex w-full items-start gap-2 border-b border-border px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{s.formattedAddress}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matches found. Add city, state, or ZIP and try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
