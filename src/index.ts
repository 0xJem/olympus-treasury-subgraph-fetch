import { addDays, formatDate } from "date-fns";
import { getMetrics, getTokenRecords } from "./query";

// Tokens to get values for
type TokenData = {
  token: string;
  observations: number;
  outputPrefix: string;
  decimals: number;
}

type OutputData = {
  [key: string]: number | number[];
}

const TOKENS: TokenData[] = [
  {
    token: "DAI",
    observations: 90,
    outputPrefix: "dai",
    decimals: 18,
  },
  {
    token: "OHM",
    observations: 90,
    outputPrefix: "ohm",
    decimals: 9,
  },
  {
    token: "FXS",
    observations: 90,
    outputPrefix: "fxs",
    decimals: 18,
  },
  // TODO add LP tokens
];

const METRICS: TokenData[] = [
  {
    token: "treasuryLiquidBackingPerOhmBacked",
    observations: 90,
    outputPrefix: "lbbo",
    decimals: 18,
  },
];

const main = async () => {
  // Determine the start date
  const startDate: Date = addDays(new Date(), -90);

  const outputData: OutputData = {};

  // Get the tokens and metrics
  const tokenRecords = getTokenRecords(formatDate(startDate, "yyyy-MM-dd"));

  // Iterate over tokens and extract prices
  TOKENS.forEach(token => {
    // Extract the matching TokenRecords

    // Limit to the required number of observations

    // Extract the token prices

    // Add to the output data
  });

  const metricRecords = getMetrics(formatDate(startDate, "yyyy-MM-dd"));

  // Iterate over metrics and extract values
  METRICS.forEach(metric => {
    // Extract the matching Metric record

    // Limit to the required number of observations

    // Extract the metric values

    // Add to the output data
  });

  // Write the data to a JSON file
  Bun.write("output.json", JSON.stringify(outputData, null, 2));

  console.log("Done");
};

// If called from the command-line, trigger the getValue function in index.ts
if (require.main === module) {
  main();
}
