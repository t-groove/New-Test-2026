export interface DepreciationResult {
  annualAmount: number;
  monthsInFirstYear: number;
  firstYearAmount: number;
  isFirstYear: boolean;
  depreciationForYear: number; // prorated/full/last amount for the requested year
}

/**
 * Straight-line depreciation calculator.
 *
 * First year is prorated by months remaining in the year from
 * the date placed in service (including the month of service).
 * Subsequent full years = originalCost / usefulLifeYears.
 * Final year = remaining book value.
 * Returns 0 for any year outside the depreciation schedule.
 */
export function calculateStraightLineDepreciation(
  originalCost: number,
  usefulLifeYears: number,
  datePlacedInService: Date,
  yearToDepreciate: number
): DepreciationResult {
  const annualAmount = originalCost / usefulLifeYears;
  const firstYear = datePlacedInService.getFullYear();
  const isFirstYear = yearToDepreciate === firstYear;

  // Months remaining in first year including the month placed in service
  // January (0) → 12 months, July (6) → 6 months, December (11) → 1 month
  const monthsInFirstYear = 12 - datePlacedInService.getMonth();
  const firstYearAmount = (annualAmount * monthsInFirstYear) / 12;

  // Last year = firstYear + usefulLifeYears (partial first year pushes finish out)
  const lastYear = firstYear + usefulLifeYears;
  const lastYearAmount =
    originalCost - firstYearAmount - (usefulLifeYears - 1) * annualAmount;

  let depreciationForYear: number;
  if (yearToDepreciate < firstYear || yearToDepreciate > lastYear) {
    depreciationForYear = 0;
  } else if (yearToDepreciate === firstYear) {
    depreciationForYear = firstYearAmount;
  } else if (yearToDepreciate === lastYear) {
    depreciationForYear = Math.max(0, lastYearAmount);
  } else {
    depreciationForYear = annualAmount;
  }

  return {
    annualAmount,
    monthsInFirstYear,
    firstYearAmount,
    isFirstYear,
    depreciationForYear,
  };
}
