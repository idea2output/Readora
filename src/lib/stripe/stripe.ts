export interface PlanConfig {
  id: string;
  name: string;
  price: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Library',
    price: '$0',
    interval: 'month',
    description: '100% open public domain access for readers worldwide.',
    features: ['Unlimited reading', 'Community Participation', 'Standard typography', 'Bookmarks & History'],
  },
  institutional: {
    id: 'institutional',
    name: 'Institutional Partner',
    price: '$49.99',
    interval: 'month',
    description: 'Multi-seat access for schools, universities, and open research libraries.',
    features: ['Dedicated Institutional Access', 'OpenStax Metadata Syndication', 'Usage Analytics', 'Priority Support'],
  },
};

export async function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  return { apiKey };
}
