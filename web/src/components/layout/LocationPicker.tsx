'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { useUserLocation } from '@/context/LocationContext';

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function LocationPicker() {
  const { location, radiusMiles, setLocation, clearLocation, setRadius } = useUserLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [draftAddress, setDraftAddress] = useState('');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraftAddress(location?.label ?? '');
          setIsOpen(true);
        }}
        className="hidden items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:flex"
      >
        <MapPin className="size-4 text-primary" />
        <span className="max-w-[160px] truncate">{location?.label ?? 'Set location'}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your location</DialogTitle>
            <DialogDescription>
              We&apos;ll show businesses that serve your area. Enter an address and pick a match.
            </DialogDescription>
          </DialogHeader>

          <div className="min-w-0 space-y-4">
            <div className="min-w-0">
              <Label htmlFor="location-address">Address</Label>
              <div className="mt-1.5">
                <AddressAutocomplete
                  id="location-address"
                  value={draftAddress}
                  onChange={setDraftAddress}
                  onResolved={(s) => {
                    setLocation({ lat: s.lat, lon: s.lon, label: s.formattedAddress });
                    setIsOpen(false);
                  }}
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location-radius">Search radius</Label>
              <select
                id="location-radius"
                value={radiusMiles}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    Within {r} miles
                  </option>
                ))}
              </select>
            </div>

            {location && (
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{location.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    clearLocation();
                    setDraftAddress('');
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
