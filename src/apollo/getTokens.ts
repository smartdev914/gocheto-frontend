import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { PairsRequestParams } from '../hooks/useTokensData';
import { getBlockTime } from '../utils/blockUtils';

// Initialize your Apollo Client
const createClient = (uri: string) => new ApolloClient({
  uri: uri,
  cache: new InMemoryCache()
});

// Define your GraphQL queries
const GET_TOKENS_AT_BLOCK = ({ orderBy, order, search }) => {
return gql`
query GetTokensAtBlock($blockHeight: Int!, $first: Int!) {
    tokens( block: { number: $blockHeight },
        ${search && search.length ? 'where: {symbol_contains_nocase: "' + search + '"}' : ''}
        first: $first, skip: 0, orderBy: ${orderBy}, orderDirection: ${order}) {
        id
        symbol
        name
        volumeUSD
        untrackedVolumeUSD
        derivedETH
        txCount
    }
    bundle(id: "1", block: { number: $blockHeight }) {
      ethPrice
    }
    factories {
        tokenCount
    }
  }
`
}

interface Response {
  tokens : any[],
  bundle: any,
  factories: any
}

// Function to fetch pairs' volumes at a specific block height
async function fetchTokensAtBlock(client: ApolloClient<NormalizedCacheObject>, blockHeight: number | string, params: PairsRequestParams): Promise<Response> {
  const rowsPerPage = params.rowsPerPage || 10
    const page = params.page || 1
    const first = (page + 1) * rowsPerPage
  try {
    const query = GET_TOKENS_AT_BLOCK({orderBy: params.order, order: params.orderDir, search: params.search} )
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
    return {tokens:[], factories:[], bundle: {}};
  }
}

// Function to calculate 24-hour volume for each pair
function calculateHistoricData(tokensBefore7Days: Response, tokensBefore24Hrs: Response, currentTokens: Response): any[] {
  const pairsWith24HrVolume = currentTokens.tokens.map(currentToken => {
    const tokenBefore24Hrs = tokensBefore24Hrs.tokens.find(token => token.id === currentToken.id);
    const tokenBefore7Days = tokensBefore7Days.tokens.find(token => token.id === currentToken.id);
    const currentVolume = currentToken.volumeUSD === "0" ? currentToken.untrackedVolumeUSD : currentToken.volumeUSD;
    const volumeBefore24Hrs = tokenBefore24Hrs ? tokenBefore24Hrs.volumeUSD === "0" ? tokenBefore24Hrs.untrackedVolumeUSD : tokenBefore24Hrs.volumeUSD : 0;
    const volumeBefore7Days = tokenBefore7Days ? tokenBefore7Days.volumeUSD === "0" ? tokenBefore7Days.untrackedVolumeUSD : tokenBefore7Days.volumeUSD : 0;
    const txnsBefore24Hrs = tokenBefore24Hrs ? tokenBefore24Hrs.txCount : 0;
    return {
      id : currentToken.id,
      symbol : currentToken.symbol,
      name : currentToken.name,
      volumeUSD : currentToken.volumeUSD,
      derivedETH : currentToken.derivedETH,
      txCount : currentToken.txCount,
      priceUSD : currentToken.derivedETH * currentTokens.bundle.ethPrice,
      volume24Hr : currentVolume - volumeBefore24Hrs,
      volume7Day : currentVolume - volumeBefore7Days,
      price24Hr : tokenBefore24Hrs?.derivedETH ? tokenBefore24Hrs?.derivedETH  * tokensBefore24Hrs.bundle.ethPrice : 0,
      price7Day : tokenBefore7Days?.derivedETH ? tokenBefore7Days?.derivedETH * tokensBefore7Days.bundle.ethPrice : 0,
      txCount24Hr : currentToken.txCount - txnsBefore24Hrs
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
export async function getTokensWithHistoricAppreciation(params: PairsRequestParams, endpoint: string, chainId: number | undefined) {
   const client = createClient(endpoint);
    const currentBlock = await getBlockBefore24Hours(client);
    const blockTime = getBlockTime(chainId)
    const blockBefore24Hours = currentBlock - Math.round((24 * 60 * 60) / blockTime);
    const blockBefore7Days= currentBlock - Math.round((7 * 24 * 60 * 60) / blockTime);
    const tokensBefore24Hrs = await fetchTokensAtBlock(client, blockBefore24Hours, params);
    const tokensBefore7Days = await fetchTokensAtBlock(client, blockBefore7Days, params);
    const currentTokens = await fetchTokensAtBlock(client, currentBlock, params);
    const tokensWith24HrVolume = calculateHistoricData(tokensBefore7Days, tokensBefore24Hrs, currentTokens);
    return { tokens: tokensWith24HrVolume, factories: currentTokens.factories};
}
