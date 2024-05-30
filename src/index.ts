import { addDays, formatDate } from "date-fns";
import { getMetrics, getTokenRecords, type Metric } from "./query";

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
    token: "0x6b175474e89094c44da98b954eedeac495271d0f",
    observations: 30, // 90 / 3
    outputPrefix: "dai",
    decimals: 18,
  },
  {
    token: "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5",
    observations: 30, // 90 / 3
    outputPrefix: "ohm",
    decimals: 9,
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
  console.log("Getting data...");
  const tokenRecords = await getTokenRecords(startDateFormatted);

  // Iterate over tokens and extract prices
  TOKENS.forEach(token => {
    // Extract the matching TokenRecords
    const filteredTokenRecords = tokenRecords.filter(record => record.tokenAddress.toLowerCase() === token.token.toLowerCase());

    // Check that the required number of observations are available
    if (filteredTokenRecords.length < token.observations) {
      throw new Error(`Insufficient observations for token ${token.outputPrefix}. Required: ${token.observations}, Available: ${filteredTokenRecords.length}`);
    }

    // Limit to the required number of observations
    const limitedTokenRecords = filteredTokenRecords.slice(-token.observations);

    // Extract the token prices
    const prices: number[] = limitedTokenRecords.map(record => {
      // Shift the decimal point
      const rate = Number(record.rate) * 10 ** token.decimals;

      // 3 observations per day
      return [rate, rate, rate];
    }).flat(1);

    // Add to the output data
    outputData[`${token.outputPrefix}LastObsTime`] = Number(limitedTokenRecords.slice(-1)[0].timestamp);
    outputData[`${token.outputPrefix}Obs`] = prices;
  });

  const metricRecords = await getMetrics(formatDate(startDate, "yyyy-MM-dd"));
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
