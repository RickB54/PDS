export type VehicleClassRow = {
  make: string;
  model: string;
  year_start?: number;
  year_end?: number;
  type_category: 'Compact / Sedan' | 'Mid-Size / SUV' | 'Truck / Van / Large SUV';
  is_luxury: boolean;
  notes?: string;
};

export const luxuryMakes = ['bmw','mercedes','lexus','audi','porsche','land rover','range rover','tesla','alfa romeo','jaguar','infiniti','acura','volvo','cadillac'];

export const dataset: VehicleClassRow[] = [
  { make: 'toyota', model: 'corolla', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'toyota', model: 'camry', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'toyota', model: 'rav4', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'toyota', model: 'tacoma', type_category: 'Truck / Van / Large SUV', is_luxury: false },
  { make: 'toyota', model: 'tundra', type_category: 'Truck / Van / Large SUV', is_luxury: false },
  { make: 'honda', model: 'civic', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'honda', model: 'accord', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'honda', model: 'cr-v', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'ford', model: 'focus', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'ford', model: 'fusion', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'ford', model: 'escape', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'ford', model: 'f-150', type_category: 'Truck / Van / Large SUV', is_luxury: false },
  { make: 'chevrolet', model: 'malibu', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'chevrolet', model: 'silverado', type_category: 'Truck / Van / Large SUV', is_luxury: false },
  { make: 'chevrolet', model: 'suburban', type_category: 'Truck / Van / Large SUV', is_luxury: false },
  { make: 'nissan', model: 'sentra', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'nissan', model: 'altima', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'nissan', model: 'rogue', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'kia', model: 'rio', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'kia', model: 'sportage', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'hyundai', model: 'elantra', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'hyundai', model: 'sonata', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'hyundai', model: 'tucson', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'subaru', model: 'forester', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'mazda', model: 'mazda3', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'mazda', model: 'cx-5', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'volkswagen', model: 'jetta', type_category: 'Compact / Sedan', is_luxury: false },
  { make: 'volkswagen', model: 'tiguan', type_category: 'Mid-Size / SUV', is_luxury: false },
  { make: 'bmw', model: '3 series', type_category: 'Compact / Sedan', is_luxury: true },
  { make: 'bmw', model: 'x5', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'mercedes', model: 'c-class', type_category: 'Compact / Sedan', is_luxury: true },
  { make: 'mercedes', model: 'gle', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'lexus', model: 'is', type_category: 'Compact / Sedan', is_luxury: true },
  { make: 'lexus', model: 'rx', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'audi', model: 'a4', type_category: 'Compact / Sedan', is_luxury: true },
  { make: 'audi', model: 'q5', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'porsche', model: 'macan', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'tesla', model: 'model 3', type_category: 'Compact / Sedan', is_luxury: true },
  { make: 'tesla', model: 'model y', type_category: 'Mid-Size / SUV', is_luxury: true },
  { make: 'land rover', model: 'range rover', type_category: 'Truck / Van / Large SUV', is_luxury: true },
  { make: 'cadillac', model: 'escalade', type_category: 'Truck / Van / Large SUV', is_luxury: true }
];

export function inferCategory(make: string, model: string): VehicleClassRow {
  const m = String(make).trim().toLowerCase();
  const mo = String(model).trim().toLowerCase();
  const lux = luxuryMakes.some(x => m.includes(x));
  const direct = dataset.find(r => r.make === m && r.model === mo);
  if (direct) return { ...direct, is_luxury: lux || direct.is_luxury } as VehicleClassRow;
  const truckHits = ['f-150','f150','ram','silverado','tundra','sprinter','transit','van','escalade','suburban','expedition','tahoe'];
  const compactHits = ['corolla','civic','fit','jetta','golf','focus','sentra','elantra','yaris','rio','mini'];
  const midsizeHits = ['camry','accord','malibu','altima','sonata','mazda6','cr-v','crv','rav4','escape','cx-5','cx5','forester','rogue','tiguan','sportage'];
  const isTruck = truckHits.some(x => mo.includes(x) || m.includes('ram') || m.includes('gmc'));
  const isCompact = compactHits.some(x => mo.includes(x));
  const isMidsize = midsizeHits.some(x => mo.includes(x));
  const type_category = isTruck ? 'Truck / Van / Large SUV' : isCompact ? 'Compact / Sedan' : 'Mid-Size / SUV';
  return { make: m, model: mo, type_category, is_luxury: lux };
}
