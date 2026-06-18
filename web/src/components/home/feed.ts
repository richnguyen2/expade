import type { BusinessListItemResponse, Category } from '@/types';

/**
 * A single horizontal row on the discovery home page. The feed is just an
 * ordered list of these, so rows can be added, reordered, or swapped
 * (e.g. promos, discounts, "new this week") without touching the renderer.
 *
 * Today sections only carry businesses; if we later add service-based rows
 * (e.g. discounted services), generalize this into a tagged union.
 */
export interface FeedSection {
  id: string;
  title: string;
  subtitle?: string;
  /** Optional "See all" target. */
  href?: string;
  businesses: BusinessListItemResponse[];
}

/**
 * Builds the home feed client-side from the businesses + categories we already
 * fetch. This is a placeholder for the future personalized/promoted feed:
 *  - "Recommended for you" is currently every business (ranking comes later,
 *    once we have the user's appointment history).
 *  - Then one row per category that actually has businesses, capped.
 */
export function buildFeedSections(
  businesses: BusinessListItemResponse[],
  categories: Category[],
  maxCategoryRows = 20,
): FeedSection[] {
  if (businesses.length === 0) return [];

  const sections: FeedSection[] = [
    {
      id: 'recommended',
      title: 'Recommended for you',
      subtitle: 'Popular providers in your area',
      businesses,
    },
  ];

  const byCategory = new Map<string, BusinessListItemResponse[]>();
  for (const business of businesses) {
    const existing = byCategory.get(business.categoryId);
    if (existing) existing.push(business);
    else byCategory.set(business.categoryId, [business]);
  }

  for (const category of categories) {
    if (sections.length > maxCategoryRows) break; // +1 for the recommended row
    const list = byCategory.get(category.id);
    if (!list || list.length === 0) continue;
    sections.push({
      id: `category-${category.id}`,
      title: category.name,
      href: `/home?category=${category.id}`,
      businesses: list,
    });
  }

  return sections;
}
