import { addDays, formatDate } from "date-fns";
import { getTreasurySubgraphMetrics, getTokenRecords, type Metric } from "./treasurySubgraph";
import { getTokenPrices } from "./defiLlama";

// Tokens to get values for
type TokenData = {
  token: string;
  observations: number;
  outputPrefix: string;
}

type OutputData = {
  [key: string]: number | number[];
}

const OUTPUT_DECIMALS = 18;

const TOKENS: TokenData[] = [
  {
    token: "coingecko:dai",
    observations: 90,
    outputPrefix: "dai"
  },
  {
    token: "coingecko:olympus",
    observations: 90,
    outputPrefix: "ohm"
  }
];

type MetricData = {
  metric: keyof Metric;
  observations: number;
  outputPrefix: string;
  decimals: number;
}

const METRICS: MetricData[] = [
  {
    metric: "treasuryLiquidBackingPerOhmBacked",
    observations: 30, // 90 / 3
    outputPrefix: "lbbo",
    decimals: 18,
  },
];

const main = async () => {
  // Determine the start date
  const startDate: Date = addDays(new Date(), -30);
  const startDateFormatted = formatDate(startDate, "yyyy-MM-dd");
  console.log(`Start date: ${startDateFormatted}`);

  const outputData: OutputData = {};

  // Get the tokens and metrics
  const tokenRecords = await getTokenPrices(TOKENS.map(token => token.token), 90);
  console.log(`Received ${Object.keys(tokenRecords).length} token records`);

  // Iterate over tokens and extract prices
  TOKENS.forEach(token => {
    console.log(`Processing token ${token.outputPrefix}...`);

    // Extract the matching records
    const record = tokenRecords[token.token];

    // Check that the required number of observations are available
    if (record.prices.length < token.observations) {
      throw new Error(`Insufficient observations for token ${token.outputPrefix}. Required: ${token.observations}, Available: ${record.prices.length}`);
    }

    // Order the prices in ascending order
    record.prices.sort((a, b) => a.timestamp - b.timestamp);

    // Limit to the required number of observations
    const limitedPrices = record.prices.slice(-token.observations);

    // Extract the token prices
    const prices: number[] = limitedPrices.map(record => {
      // Shift the decimal point
      const rate = Number(record.price) * 10 ** OUTPUT_DECIMALS;

      return rate;
    });

    const latestObsTimestamp = Number(limitedPrices.slice(-1)[0].timestamp);
    console.log(`Latest observation timestamp: ${latestObsTimestamp}`);

    // Add to the output data
    outputData[`${token.outputPrefix}LastObsTime`] = latestObsTimestamp;
    outputData[`${token.outputPrefix}Obs`] = prices;
  });

  console.log("Getting metric data...");
  const metricRecords = await getTreasurySubgraphMetrics(formatDate(startDate, "yyyy-MM-dd"));
  console.log(`Received ${metricRecords.length} metric records`);

  // Iterate over metrics and extract values
  METRICS.forEach(metric => {
    // Check that the required number of observations are available
    if (metricRecords.length < metric.observations) {
      throw new Error(`Insufficient observations for metric ${metric.outputPrefix}. Required: ${metric.observations}, Available: ${metricRecords.length}`);
    }

    // Limit to the required number of observations
    const limitedMetricRecords = metricRecords.slice(-metric.observations);

    // Extract the metric values
    const values: number[] = limitedMetricRecords.map(record => {
      // Shift the decimal point
      const value = Number(record[metric.metric]) * 10 ** metric.decimals;

      // 3 observations per day
      return [value, value, value];
    }).flat(1);

    // Add to the output data
    outputData[`${metric.outputPrefix}LastObsTime`] = Number(limitedMetricRecords.slice(-1)[0].timestamps.Ethereum);
    outputData[`${metric.outputPrefix}Obs`] = values;
  });

  // Write the data to a JSON file
  Bun.write("output.json", JSON.stringify(outputData, null, 2));

  console.log("Done");
};

main();
