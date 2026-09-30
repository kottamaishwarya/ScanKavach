/**
 * @license
 * SPDX-License-Identifier: MIT
 * Respiratory Health & Preventive Care Checklist
 */

export interface PreventionItem {
  id: string;
  title: string;
  whyThisHelps: string;
  completed: boolean;
  completedAt?: string;
}

export const DEFAULT_PREVENTION_ITEMS: Omit<PreventionItem, 'completed' | 'completedAt'>[] = [
  {
    id: 'vaccines',
    title: 'Vaccinations up to date (Pneumococcal, Influenza, COVID-19 booster)',
    whyThisHelps:
      'Vaccination primes your immune system against leading bacterial and viral causes of severe respiratory infections.',
  },
  {
    id: 'no_tobacco',
    title: 'Zero tobacco use and avoided second-hand smoke',
    whyThisHelps:
      'Smoke paralyzes protective respiratory cilia and damages alveoli, exponentially increasing susceptibility to chronic lung disease.',
  },
  {
    id: 'clean_air',
    title: 'Clean cooking fuel or well-ventilated indoor space',
    whyThisHelps:
      'Biomass smoke and indoor particulate matter are major contributors to respiratory illness in developing and rural communities.',
  },
  {
    id: 'hand_hygiene',
    title: 'Frequent hand washing habit with soap or alcohol rub',
    whyThisHelps:
      'Prevents transmission of airborne pathogens picked up from shared surfaces and touchpoints.',
  },
  {
    id: 'nutrition',
    title: 'Nutritious, balanced meals supporting immune vitality',
    whyThisHelps:
      'Adequate protein, vitamin A, and zinc intake reinforce epithelial mucosal barriers in the airways.',
  },
  {
    id: 'activity',
    title: '30 minutes of moderate physical activity most days',
    whyThisHelps:
      'Enhances vital lung capacity, cardiovascular endurance, and systemic anti-inflammatory circulation.',
  },
  {
    id: 'annual_check',
    title: 'Yearly general health and baseline checkup',
    whyThisHelps:
      'Enables early detection of silent non-communicable conditions (hypertension, diabetes, early COPD) before complications arise.',
  },
];

export function getStoredPreventionItems(userId: string): PreventionItem[] {
  try {
    const key = `scankavach_prevention_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  return DEFAULT_PREVENTION_ITEMS.map((item) => ({
    ...item,
    completed: false,
  }));
}

export function saveStoredPreventionItems(userId: string, items: PreventionItem[]): void {
  try {
    const key = `scankavach_prevention_${userId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // fallback
  }
}

export function calculatePreventionProgress(items: PreventionItem[]): number {
  if (!items || items.length === 0) return 0;
  const completed = items.filter((i) => i.completed).length;
  return Math.round((completed / items.length) * 100);
}
