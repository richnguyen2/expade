/**
 * Centralized React Query keys. Use these everywhere instead of inline
 * string arrays so cache invalidation stays consistent across the app.
 */
export const QUERY_KEYS = {
  businesses: ['businesses'] as const,
  business: (id: string) => ['business', id] as const,
  myBusinesses: ['my-businesses'] as const,
  categories: ['categories'] as const,
  businessRequests: ['business-requests'] as const,
  onboardingData: (id: string) => ['onboarding-data', id] as const,
};
