import { useState } from 'react'
import { ChainId } from '@gocheto-dex/sdk'
import { useActiveWeb3React } from '../hooks'

// get default chain ID in case we're on unsupported chain
export function getChainId(chain_id): number {
    if (chain_id == ChainId.MAINNET || chain_id == ChainId.BSC_TESTNET || chain_id == ChainId.PUPPYNET || chain_id == ChainId.SHIBARIUM || chain_id == ChainId.RSK_TESTNET) return chain_id
    return 1
}

// export const useChainIdHook = (): number => {
//     let [chain_id, setChainId] = useState(1);
//     const { chainId } = useActiveWeb3React()
//     if (chainId) setChainId(getChainId(chainId));

//     return chain_id;
// }
