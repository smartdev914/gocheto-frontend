import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import shibaData from '@shibaswap/shibaswap-data-snoop'
import { shibaExchange } from '../apollo/client'
import { ETH_PRICE, liquidityOfDay, TOKEN_DAYDATA, TOKEN_ETH, VOLUME_QUERY } from '../apollo/queries'
import { useActiveWeb3React } from '../hooks'
import { graphEndpoint } from '../functions'
import graphAPIEndpoints from '../constants/subgraphs'
import {
    ChainId,
    SHIBASWAP_BONE_TOKEN_ADDRESS,
    SHIBASWAP_LEASH_TOKEN_ADDRESS,
    SHIBASWAP_SHIB_TOKEN_ADDRESS
} from '@gocheto-dex/sdk'
import { WBONE } from './../constants'

const usePrices = () => {
    const { chainId } = useActiveWeb3React()
    // chainId = getChainId(chainId)

    const [shibPrice, setShibPrice] = useState<string>('-')
    const [leashPrice, setLeashPrice] = useState<string>('-')
    const [bonePrice, setBonePrice] = useState<string>('-')

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchPrices = useCallback(async () => {
        const ethPriceQ = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: ETH_PRICE()
            })
        )
        const ethPrice = ethPriceQ.data.bundles[0].ethPrice
        const shibPriceQ = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: TOKEN_ETH(SHIBASWAP_SHIB_TOKEN_ADDRESS[chainId ? chainId : ChainId.MAINNET].toLowerCase())
            })
        )
        const bonePriceQ = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: TOKEN_ETH(
                    chainId === ChainId.PUPPYNET || chainId === ChainId.SHIBARIUM
                        ? WBONE
                        : SHIBASWAP_BONE_TOKEN_ADDRESS[chainId ? chainId : ChainId.MAINNET].toLowerCase()
                )
            })
        )
        const leashPriceQ = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: TOKEN_ETH(SHIBASWAP_LEASH_TOKEN_ADDRESS[chainId ? chainId : ChainId.MAINNET].toLowerCase())
            })
        )
        const bonep = Number(ethPrice) * Number(bonePriceQ.data.tokens[0]?.derivedETH)
        const leashp = Number(ethPrice) * Number(leashPriceQ.data.tokens[0]?.derivedETH)
        const shibp = Number(ethPrice) * Number(shibPriceQ.data.tokens[0]?.derivedETH)
        setBonePrice(String(bonep))
        setShibPrice(String(shibp))
        setLeashPrice(String(leashp))
    }, [EXCHANGE_URI, chainId])

    useEffect(() => {
        fetchPrices()
        const refreshInterval = setInterval(fetchPrices, 20000)
        return () => clearInterval(refreshInterval)
    }, [fetchPrices])

    const fetchTVL = useCallback(async () => {
        try {
            const liqDay = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: liquidityOfDay
                })
            )
            return liqDay.data?.dayDatas[0]
        } catch (e) {
            console.error(e)
            return null
        }
    }, [EXCHANGE_URI])

    const fetchTotalVolumeUSD = useCallback(async () => {
        const volumeData = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: VOLUME_QUERY(1)
            })
        )
        const dayDatas = volumeData.data.dayDatas
        return dayDatas ? Number(dayDatas[0]?.volumeUSD) : undefined
    }, [EXCHANGE_URI])

    const fetchSevenDayVolumeUSD = useCallback(async () => {
        const volumeData = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: VOLUME_QUERY(7)
            })
        )
        const dayDatas = volumeData.data.dayDatas
        let totalVolume = 0
        if (dayDatas) {
            dayDatas.forEach(day => {
                totalVolume += Number(day.volumeUSD)
            })
            return totalVolume
        }
        return undefined
    }, [EXCHANGE_URI])

    const fetchTokenVolumeUSD = useCallback(
        async id => {
            const tokenData = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: TOKEN_DAYDATA,
                    variables: {
                        id: id
                    }
                })
            )

            return tokenData.data.token ? Number(tokenData.data.token.dayData[0]?.volumeUSD) : undefined
        },
        [EXCHANGE_URI]
    )

    const fetchEthPrice = useCallback(async () => {
        const ethPrice = await Promise.resolve(shibaData.exchange.ethPrice())
        return ethPrice ? Number(ethPrice) : undefined
    }, [])

    return {
        shibPrice,
        leashPrice,
        bonePrice,
        fetchTVL,
        fetchTotalVolumeUSD,
        fetchTokenVolumeUSD,
        fetchEthPrice,
        fetchSevenDayVolumeUSD
    }
}

export default usePrices
