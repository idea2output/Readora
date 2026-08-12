import { getSystemSettings } from '@/lib/ai/settings-service';

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
    features: ['Unlimited reading', '10 AI Queries/Day', 'Standard typography', 'Bookmarks & History'],
  },
  student: {
    id: 'student',
    name: 'Student',
    price: '$2.99',
    interval: 'month',
    description: 'Discounted academic plan for students and researchers.',
    features: ['Unlimited reading', '50 AI Queries/Day', 'Passage Explainer & Simplifier', 'Student Verification'],
  },
  pro: {
    id: 'pro',
    name: 'Reader Pro',
    price: '$6.99',
    interval: 'month',
    description: 'Full AI suite for power readers, researchers, and scholars.',
    features: ['Unlimited AI Queries', 'Anthropic Claude 3.5 Sonnet', 'Character Graph Maps', 'Export Notes & Citations'],
  },
  institutional: {
    id: 'institutional',
    name: 'Institutional',
    price: '$49.99',
    interval: 'month',
    description: 'Multi-seat access for schools, universities, and libraries.',
    features: ['100 Member Seats', 'Dedicated Admin Dashboard', 'Usage Analytics', 'Priority Support'],
  },
};

export async function getStripeClient() {
  const settings = await getSystemSettings();
  const apiKey = settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    return null;
  }

  // Dynamic import or fetch wrapper if stripe library is used
  return { apiKey };
}
