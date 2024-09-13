import { ChainId } from '@gocheto-dex/sdk'
import graphAPIEndpoints from '../constants/subgraphs'

export function graphEndpoint(chainId: ChainId | undefined, graphName: string) {
    if (chainId == ChainId.PUPPYNET) return graphAPIEndpoints.puppynet[graphName]
    if (chainId == ChainId.SHIBARIUM) return graphAPIEndpoints.shibarium[graphName]
    if (chainId == ChainId.BSC_TESTNET) return graphAPIEndpoints.bsctestnet[graphName]
    if (chainId == ChainId.RSK_TESTNET) return graphAPIEndpoints.rsktestnet[graphName]
    return graphAPIEndpoints.etherium[graphName]
}
