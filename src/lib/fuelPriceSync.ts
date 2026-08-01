// TODO: replace <owner>/<repo>/<branch> once this project's GitHub remote exists (set up separately) - e.g. https://raw.githubusercontent.com/someuser/motocare/main/public/fuel-price.json
const FUEL_PRICE_JSON_URL = 'https://raw.githubusercontent.com/<owner>/<repo>/<branch>/public/fuel-price.json';

export type FuelPriceSyncResult = { pricePerLitre: number; fetchedAt: string; fuelType: string };

export function isValidFuelPrice(n: number): boolean {
  return Number.isFinite(n) && n >= 20 && n <= 100; // sane range for THB/L, catches garbage/parsing errors
}

export async function fetchLatestFuelPrice(): Promise<FuelPriceSyncResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(FUEL_PRICE_JSON_URL, {
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      return null;
    }

    const { pricePerLitre, fetchedAt, fuelType } = data;

    if (
      typeof pricePerLitre === 'number' &&
      isValidFuelPrice(pricePerLitre) &&
      typeof fetchedAt === 'string' &&
      fetchedAt.length > 0 &&
      typeof fuelType === 'string' &&
      fuelType.length > 0
    ) {
      return { pricePerLitre, fetchedAt, fuelType };
    }

    return null;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
