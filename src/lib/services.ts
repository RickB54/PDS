// Complete service definitions with pricing and steps

export interface ServiceStep {
  id: string;
  name: string;
  category: 'exterior' | 'interior' | 'final';
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricing: {
    compact: number;
    midsize: number;
    truck: number;
    luxury: number;
  };
  steps: ServiceStep[];
}

export interface AddOn {
  id: string;
  name: string;
  basePrice: number;
  pricing: {
    compact: number;
    midsize: number;
    truck: number;
    luxury: number;
  };
}

export const servicePackages: ServicePackage[] = [
  {
    id: 'basic-exterior',
    name: 'Basic Exterior Wash',
    description: 'Essential exterior cleaning',
    basePrice: 50,
    pricing: { compact: 50, midsize: 60, truck: 75, luxury: 90 },
    steps: [
      { id: 'pre-rinse-foam', name: 'Pre-rinse & foam', category: 'exterior' },
      { id: 'two-bucket-wash', name: 'Two-bucket wash', category: 'exterior' },
      { id: 'hand-dry', name: 'Hand dry', category: 'exterior' },
      { id: 'final-inspection', name: 'Final inspection', category: 'final' }
    ]
  },
  {
    id: 'express-wax',
    name: 'Express Wash & Wax',
    description: 'Quick wash with protective wax',
    basePrice: 75,
    pricing: { compact: 75, midsize: 90, truck: 110, luxury: 135 },
    steps: [
      { id: 'quick-wash', name: 'Quick wash', category: 'exterior' },
      { id: 'spray-wax', name: 'Spray wax', category: 'exterior' },
      { id: 'tire-shine', name: 'Tire shine', category: 'exterior' },
      { id: 'final-inspection-express', name: 'Final inspection', category: 'final' }
    ]
  },
  {
    id: 'full-exterior',
    name: 'Full Exterior Detail',
    description: 'Complete exterior restoration',
    basePrice: 150,
    pricing: { compact: 150, midsize: 180, truck: 220, luxury: 275 },
    steps: [
      { id: 'pre-rinse-vehicle', name: 'Pre-rinse vehicle', category: 'exterior' },
      { id: 'apply-foam-cannon', name: 'Apply foam cannon', category: 'exterior' },
      { id: 'two-bucket-wash-full', name: 'Two-bucket wash', category: 'exterior' },
      { id: 'clay-bar-treatment', name: 'Clay bar treatment', category: 'exterior' },
      { id: 'iron-remover', name: 'Iron remover application', category: 'exterior' },
      { id: 'dry-vehicle', name: 'Dry vehicle', category: 'exterior' },
      { id: 'apply-sealant-wax', name: 'Apply sealant/wax', category: 'exterior' },
      { id: 'tire-dressing', name: 'Tire dressing', category: 'exterior' },
      { id: 'clean-windows-ext', name: 'Clean windows', category: 'final' },
      { id: 'final-inspection-full', name: 'Final inspection', category: 'final' }
    ]
  },
  {
    id: 'interior-cleaning',
    name: 'Interior Cleaning',
    description: 'Deep interior detailing',
    basePrice: 100,
    pricing: { compact: 100, midsize: 120, truck: 150, luxury: 185 },
    steps: [
      { id: 'vacuum-interior', name: 'Vacuum all surfaces', category: 'interior' },
      { id: 'clean-dashboard', name: 'Clean dashboard', category: 'interior' },
      { id: 'clean-door-panels', name: 'Clean door panels', category: 'interior' },
      { id: 'clean-seats', name: 'Clean seats', category: 'interior' },
      { id: 'clean-carpets', name: 'Clean carpets/mats', category: 'interior' },
      { id: 'apply-uv-protectant', name: 'Apply UV protectant', category: 'interior' },
      { id: 'clean-windows-int', name: 'Clean windows', category: 'final' },
      { id: 'final-inspection-int', name: 'Final inspection', category: 'final' }
    ]
  },
  {
    id: 'full-detail',
    name: 'Full Detail (BEST VALUE)',
    description: 'Complete interior and exterior',
    basePrice: 225,
    pricing: { compact: 225, midsize: 275, truck: 340, luxury: 425 },
    steps: [
      // Exterior
      { id: 'pre-rinse-full', name: 'Pre-rinse vehicle', category: 'exterior' },
      { id: 'foam-cannon-full', name: 'Apply foam cannon', category: 'exterior' },
      { id: 'two-bucket-full', name: 'Two-bucket wash', category: 'exterior' },
      { id: 'clay-bar-full', name: 'Clay bar treatment', category: 'exterior' },
      { id: 'iron-remover-full', name: 'Iron remover application', category: 'exterior' },
      { id: 'dry-full', name: 'Dry vehicle', category: 'exterior' },
      { id: 'sealant-full', name: 'Apply sealant', category: 'exterior' },
      { id: 'tire-dressing-full', name: 'Tire dressing', category: 'exterior' },
      // Interior
      { id: 'vacuum-full', name: 'Vacuum all surfaces', category: 'interior' },
      { id: 'dashboard-full', name: 'Clean dashboard', category: 'interior' },
      { id: 'door-panels-full', name: 'Clean door panels', category: 'interior' },
      { id: 'seats-full', name: 'Clean seats', category: 'interior' },
      { id: 'carpets-full', name: 'Clean carpets/mats', category: 'interior' },
      { id: 'uv-full', name: 'Apply UV protectant', category: 'interior' },
      // Final
      { id: 'windows-full', name: 'Clean windows', category: 'final' },
      { id: 'final-inspection-detail', name: 'Final inspection', category: 'final' }
    ]
  },
  {
    id: 'premium-detail',
    name: 'Premium Detail',
    description: 'Ultimate detailing experience',
    basePrice: 350,
    pricing: { compact: 350, midsize: 425, truck: 525, luxury: 650 },
    steps: [
      // Exterior
      { id: 'pre-rinse-premium', name: 'Pre-rinse vehicle', category: 'exterior' },
      { id: 'foam-cannon-premium', name: 'Apply foam cannon', category: 'exterior' },
      { id: 'two-bucket-premium', name: 'Two-bucket wash', category: 'exterior' },
      { id: 'clay-bar-premium', name: 'Clay bar treatment', category: 'exterior' },
      { id: 'iron-remover-premium', name: 'Iron remover application', category: 'exterior' },
      { id: 'dry-premium', name: 'Dry vehicle', category: 'exterior' },
      { id: 'ceramic-coating', name: 'Apply ceramic coating', category: 'exterior' },
      { id: 'tire-dressing-premium', name: 'Tire dressing', category: 'exterior' },
      // Interior
      { id: 'vacuum-premium', name: 'Vacuum all surfaces', category: 'interior' },
      { id: 'dashboard-premium', name: 'Clean dashboard', category: 'interior' },
      { id: 'door-panels-premium', name: 'Clean door panels', category: 'interior' },
      { id: 'seats-premium', name: 'Clean seats', category: 'interior' },
      { id: 'carpets-premium', name: 'Clean carpets/mats', category: 'interior' },
      { id: 'uv-premium', name: 'Apply UV protectant', category: 'interior' },
      // Final
      { id: 'windows-premium', name: 'Clean windows', category: 'final' },
      { id: 'final-inspection-premium', name: 'Final inspection', category: 'final' }
    ]
  }
];

export const addOns: AddOn[] = [
  { id: 'wheel-cleaning', name: 'Wheel Cleaning', basePrice: 25, pricing: { compact: 25, midsize: 30, truck: 35, luxury: 40 } },
  { id: 'leather-conditioning', name: 'Leather Conditioning', basePrice: 30, pricing: { compact: 30, midsize: 35, truck: 40, luxury: 50 } },
  { id: 'odor-eliminator', name: 'Odor Eliminator', basePrice: 20, pricing: { compact: 20, midsize: 25, truck: 30, luxury: 35 } },
  { id: 'headlight-restoration', name: 'Headlight Restoration', basePrice: 40, pricing: { compact: 40, midsize: 45, truck: 50, luxury: 60 } },
  { id: 'ceramic-trim-coat', name: 'Ceramic Trim Coat Restoration', basePrice: 75, pricing: { compact: 75, midsize: 85, truck: 95, luxury: 110 } },
  { id: 'engine-bay', name: 'Engine Bay Cleaning', basePrice: 85, pricing: { compact: 85, midsize: 95, truck: 110, luxury: 130 } },
  { id: 'wheel-rim-detailing', name: 'Wheel & Rim Detailing', basePrice: 60, pricing: { compact: 60, midsize: 70, truck: 80, luxury: 95 } },
  { id: 'clay-bar-decon', name: 'Clay Bar Decontamination', basePrice: 80, pricing: { compact: 80, midsize: 90, truck: 105, luxury: 125 } },
  { id: 'paint-sealant', name: 'Paint Sealant Application', basePrice: 110, pricing: { compact: 110, midsize: 130, truck: 150, luxury: 180 } },
  { id: 'pet-hair-removal', name: 'Pet Hair Removal', basePrice: 70, pricing: { compact: 70, midsize: 80, truck: 95, luxury: 110 } },
  { id: 'paint-touch-up', name: 'Minor Paint Touch-Up', basePrice: 90, pricing: { compact: 90, midsize: 105, truck: 120, luxury: 145 } }
];

export type VehicleType = 'compact' | 'midsize' | 'truck' | 'luxury';

export function getServicePrice(serviceId: string, vehicleType: VehicleType): number {
  const service = servicePackages.find(s => s.id === serviceId);
  return service ? service.pricing[vehicleType] : 0;
}

export function getAddOnPrice(addOnId: string, vehicleType: VehicleType): number {
  const addOn = addOns.find(a => a.id === addOnId);
  return addOn ? addOn.pricing[vehicleType] : 0;
}

export function calculateDestinationFee(miles: number): number {
  if (miles <= 5) return 0;
  if (miles <= 10) return 10;
  if (miles <= 20) return 15 + (miles - 10);
  if (miles <= 30) return 30 + ((miles - 20) * 1.5);
  if (miles <= 50) return 50 + ((miles - 30) * 1.25);
  return 75;
}
