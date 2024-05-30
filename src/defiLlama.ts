import createClient from "openapi-fetch";
import type {paths} from "./defillama/api";

const client = createClient<paths>({
      baseUrl: "https://coins.llama.fi",
    });

type TokenMap = {
  [key: string]: number[];
}

type CoinMap = {
  [key: string]: {
    symbol: string;
    prices: {
      timestamp: number;
      price: number;
      confidence: number;
    }[]
  }
}

export const getTokenPrices = async (tokens: string[], observations: number) => {
    console.log("Getting token prices...");

    // Construct an array of timestamps at 8 hour intervals based on the number of observations, in ascending order
    const timestamps: number[] = [];
    const interval = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    for (let i = 0; i < observations; i++) {
      timestamps.push(Math.floor((Date.now() - i * interval)/1000)); // Seconds
    }
    timestamps.reverse();

    // Construct the input parameter
    const coins: TokenMap = {};
    for (const token of tokens) {
      coins[token] = timestamps;
    }

    const {data, error} = await client.GET("/batchHistorical", {
      params: {
        query: {
          coins: JSON.stringify(coins),
          searchWidth: "4h",
        }
      }
    });

    if (!data) {
      throw new Error(`No data returned from API. Error: ${JSON.stringify(error)}`);
    }

    return data.coins as CoinMap;
}