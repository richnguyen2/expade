import {
  CarFront,
  Wrench,
  Sparkles,
  UtensilsCrossed,
  Scale,
  GraduationCap,
  PawPrint,
  HeartPulse,
  Palette,
  Layers,
  type LucideIcon,
} from 'lucide-react';

// Maps known category names to an icon; anything unmapped falls back to Layers.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Automotive Services': CarFront,
  'Home Services': Wrench,
  'Beauty & Personal Care': Sparkles,
  'Food & Dining': UtensilsCrossed,
  'Legal & Financial': Scale,
  Education: GraduationCap,
  'Pet Services': PawPrint,
  'Health & Fitness': HeartPulse,
  Creative: Palette,
};

export function iconForCategory(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Layers;
}
