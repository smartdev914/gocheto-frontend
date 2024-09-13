import { nanoid } from '@reduxjs/toolkit'
import { ChainId } from '@gocheto-dex/sdk'
import { TokenList } from '@uniswap/token-lists'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { getNetworkLibrary } from '../connectors'
import { AppDispatch } from '../state'
import { fetchTokenList } from '../state/lists/actions'
import getTokenList from '../utils/getTokenList'
import resolveENSContentHash from '../utils/resolveENSContentHash'
import { useActiveWeb3React } from './index'

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
    const { chainId, provider } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()

    const ensResolver = useCallback(
        (ensName: string) => {
            if (!provider || chainId !== ChainId.MAINNET) {
                if (chainId === ChainId.MAINNET) {
                    const networkLibrary = getNetworkLibrary()
                    if (networkLibrary) {
                        return resolveENSContentHash(ensName, networkLibrary)
                    }
                }
                throw new Error('Could not construct mainnet ENS resolver')
            }
            return resolveENSContentHash(ensName, provider)
        },
        [chainId, provider]
    )

    // note: prevent dispatch if using for list search or unsupported list
    return useCallback(
        async (listUrl: string, sendDispatch = true) => {
            const requestId = nanoid()
            sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
            return getTokenList(listUrl, ensResolver)
                .then(tokenList => {
                    sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
                    return tokenList
                })
                .catch(error => {
                    console.debug(`Failed to get list at url ${listUrl}`, error)
                    sendDispatch &&
                        dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
                    throw error
                })
        },
        [dispatch, ensResolver]
    )
}
