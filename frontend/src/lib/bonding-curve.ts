import Decimal from "decimal.js";

export interface BondingCurveConfig {
  slope: string;
  startingPrice: string;
  curveType: "linear" | "exponential";
}

export const defaultCurveConfig: BondingCurveConfig = {
  slope: "0.005",
  startingPrice: "1",
  curveType: "linear",
};

export function calculatePrice(
  supply: number | string,
  curveConfig: BondingCurveConfig = defaultCurveConfig
): string {
  const slope = new Decimal(curveConfig.slope);
  const startingPrice = new Decimal(curveConfig.startingPrice);
  const supplyBN = new Decimal(supply);

  if (curveConfig.curveType === "linear") {
    return slope.times(supplyBN).plus(startingPrice).toString();
  } else if (curveConfig.curveType === "exponential") {
    return startingPrice.times(supplyBN.pow(slope)).toString();
  } else {
    throw new Error("Invalid curve type");
  }
}
