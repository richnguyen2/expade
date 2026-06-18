import { cn } from '@/lib/utils';

interface LogoProps {
  /** Render the wordmark next to the glyph. */
  showWordmark?: boolean;
  className?: string;
  /** Color of the wordmark text. The glyph always uses the brand color. */
  wordmarkClassName?: string;
}

/**
 * Expade brand mark — a bold stacked-bars glyph in brand green plus the
 * EXPADE wordmark. Used in the landing header/footer and the app navbars.
 */
export default function Logo({ showWordmark = true, className, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
          <rect x="3" y="4" width="18" height="3.2" rx="1.6" />
          <rect x="3" y="10.4" width="13" height="3.2" rx="1.6" />
          <rect x="3" y="16.8" width="18" height="3.2" rx="1.6" />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn('text-xl font-extrabold tracking-tight text-foreground', wordmarkClassName)}>
          Expade
        </span>
      )}
    </div>
  );
}
