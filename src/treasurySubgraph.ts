import {
  WunderGraphClient,
  createClient,
  type Queries,
} from "@olympusdao/treasury-subgraph-client";
import { fetch } from "cross-fetch";

let subgraphClient: WunderGraphClient;

const getSubgraphClient = () => {
  if (!subgraphClient) {
    subgraphClient = createClient({
      customFetch: fetch,
    });
  }

  return subgraphClient;
};

type TokenRecordArray = Exclude<
  Queries["paginated/tokenRecords"]["response"]["data"],
  undefined
>;
export type TokenRecord = TokenRecordArray[0];

type MetricArray = Exclude<
  Queries["paginated/metrics"]["response"]["data"],
  undefined
>;
export type Metric = MetricArray[0];

export const getTokenRecords = async (
  startDate: string,
): Promise<TokenRecord[]> => {
  const response = await getSubgraphClient().query({
    operationName: "paginated/tokenRecords",
    input: {
      startDate: startDate,
    },
  });

  if (!response.data) {
    throw new Error("No data returned from API");
  }

  const records = response.data;

  // Sort the records in ascending order
  records.sort((a, b) => {
    return Number(a.timestamp) - Number(b.timestamp);
  });

  return records;
};

export const getTreasurySubgraphMetrics = async (
  startDate: string,
): Promise<Metric[]> => {
  const response = await getSubgraphClient().query({
    operationName: "paginated/metrics",
    input: {
      startDate: startDate,
    },
  });

  if (!response.data) {
    throw new Error("No data returned from API");
  }

  const records = response.data;

  // Sort the records in descending order
  records.sort((a, b) => {
    return Number(b.timestamps.Ethereum) - Number(a.timestamps.Ethereum);
  });

  return records;
};
