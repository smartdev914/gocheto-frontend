import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { PairsRequestParams } from '../hooks/useTokensData';
import { getBlockTime } from '../utils/blockUtils';

// Initialize your Apollo Client
const createClient = (uri: string) => new ApolloClient({
  uri: uri,
  cache: new InMemoryCache()
});

// Define your GraphQL queries
const GET_PAIRS_AT_BLOCK = ({ orderBy, order, search }) => {
return gql`
  query GetPairsAtBlock($blockHeight: Int!, $first: Int!) {
    pairs( block: { number: $blockHeight }, 
      ${ search && search.length ? 'where: { name_contains_nocase: "' + search + '" }, ' : ''} 
      first: $first, skip: 0, orderBy: ${orderBy}, orderDirection: ${order}) {
      id
      token0Price
      token1Price
      totalSupply
      txCount
      volumeToken0
      volumeToken1
      name
      volumeUSD
      reserveUSD
      untrackedVolumeUSD
      token0 {
          id
          name
          symbol
        }
      token1 {
          id
          name
          symbol
        }
      }
      factories {
          pairCount
      }
    }
`
}

// Function to fetch pairs' volumes at a specific block height
async function fetchPairsAtBlock(client: ApolloClient<NormalizedCacheObject>, blockHeight: number | string, params: PairsRequestParams): Promise<{pairs: any[], factories: any[]}> {
  const rowsPerPage = params.rowsPerPage || 10 
    const page = params.page || 1
    const first = (page + 1) * rowsPerPage
  try {
    const query = GET_PAIRS_AT_BLOCK({orderBy: params.order, order: params.orderDir, search: params.search} )
    const { data } = await client.query({
      query: query,
      variables: {
        blockHeight: blockHeight,
        first: first,
        // skip: skip
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {pairs:[], factories:[]};
  }
}

// Function to calculate 24-hour volume for each pair
function calculate24HourData(pairsBefore24Hrs: any[], currentPairs: any[]): any[] {
  const pairsWith24HrVolume = currentPairs.map(currentPair => {
    const pairBefore24Hrs = pairsBefore24Hrs.find(pair => pair.id === currentPair.id);
    const currentVolume = currentPair.volumeUSD === "0" ? currentPair.untrackedVolumeUSD : currentPair.volumeUSD;
    const volumeBefore24Hrs = pairBefore24Hrs ? pairBefore24Hrs.volumeUSD === "0" ? pairBefore24Hrs.untrackedVolumeUSD : pairBefore24Hrs.volumeUSD : 0;
    const txnsBefore24Hrs = pairBefore24Hrs ? pairBefore24Hrs.txCount : 0;
    return {
      id: currentPair.id,
      volume24Hr: currentVolume - volumeBefore24Hrs,
      txn24Hr: currentPair.txCount - txnsBefore24Hrs,
      token0Price: currentPair.token0Price,
      token1Price: currentPair.token1Price,
      totalSupply: currentPair.totalSupply,
      txCount: currentPair.txCount,
      volumeToken0: currentPair.volumeToken0,
      volumeToken1: currentPair.volumeToken1,
      name: currentPair.name,
      volumeUSD: currentPair.volumeUSD,
      reserveUSD: currentPair.reserveUSD,
      untrackedVolumeUSD: currentPair.untrackedVolumeUSD,
      token0: currentPair.token0,
      token1: currentPair.token1
    };
  });
  return pairsWith24HrVolume;
}


// Function to get the time 24 hours ago in block height
async function getBlockBefore24Hours(client: ApolloClient<NormalizedCacheObject>): Promise<number> {
  const currentBlock = await client.query({
    query: gql`{ _meta { block { number } } }`
  });
  const currentBlockHeight = currentBlock.data._meta.block.number;
  return currentBlockHeight;
}

// Fetch pairs data and calculate 24-hour volume
export async function getPairsWithHistoricAppreciation(params: PairsRequestParams, endpoint: string, chainId: number | undefined) {        
   const client = createClient(endpoint);
    const currentBlock = await getBlockBefore24Hours(client);
    const twentyFourHoursInSeconds = 24 * 60 * 60;
    const blockTime = getBlockTime(chainId)
    const blockBefore24Hours = currentBlock - Math.round(twentyFourHoursInSeconds / blockTime); 
    const pairsBefore24Hrs = await fetchPairsAtBlock(client, blockBefore24Hours, params);
    const currentPairs = await fetchPairsAtBlock(client, currentBlock, params);
    const pairsWith24HrVolume = calculate24HourData(pairsBefore24Hrs.pairs, currentPairs.pairs);

    // console.log("24-hour volumes for the pairs:");
    return { pairs: pairsWith24HrVolume, factories: currentPairs.factories};
}

// gpl for single pair data
export const GET_PAIR_DATA = () => {
  return gql`
  query GetPairData($blockHeight: Int!, $token0: String!, $token1: String!) {
    pairs(
      block: { number: $blockHeight }
      where: { token0_: { id: $token0 }, token1_: { id: $token1 } }
    ) {
      id
      dayData ( first: 7 ) {
        volumeUSD
      }
      token0Price
      token1Price
      totalSupply
      txCount
      volumeToken0
      volumeToken1
      name
      volumeUSD
      reserveUSD
      untrackedVolumeUSD
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
    }
    factories {
      pairCount
    }
  }
  `
}

export interface IPairData {
  token0: string;
  token1: string;
}

// Fetch single pair data
async function fetchPairData(client: ApolloClient<NormalizedCacheObject>, blockHeight: number | string, params: IPairData): Promise<{pairs: any[], factories: any[]}> {
  try {
    const query = GET_PAIR_DATA()
    const { data } = await client.query({
      query: query,
      variables: {
        blockHeight: blockHeight,
        token0: params.token0,
        token1: params.token1,
        // skip: skip
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {pairs:[], factories:[]};
  }
}

// Get 7 days fees
const calculate7DayFees = (pair: any): number => {
  let totalVolume = 0
  if (pair?.dayData) {
    pair.dayData.forEach(day => {
      totalVolume += Number(day.volumeUSD)
    })
  }
  return totalVolume
}

// Function get single pair data
export async function getPairData(params: IPairData, endpoint: string, chainId: number | undefined) {
  const client = createClient(endpoint);
  const currentBlock = await getBlockBefore24Hours(client);
  const twentyFourHoursInSeconds = 24 * 60 * 60;
  const blockTime = getBlockTime(chainId)
  const blockBefore24Hours = currentBlock - Math.round(twentyFourHoursInSeconds / blockTime);
  const pairsBefore24Hrs = await fetchPairData(client, blockBefore24Hours, params);
  const currentPairs = await fetchPairData(client, currentBlock, params);
  const pairData = calculate24HourData(pairsBefore24Hrs.pairs, currentPairs.pairs);
  const pair = [{...pairData[0], fees: calculate7DayFees(currentPairs?.pairs[0]) }];
  return pair;
}
