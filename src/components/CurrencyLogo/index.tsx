import { ChainId, Currency, ETHER, Token } from '@gocheto-dex/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import AvalancheLogo from '../../assets/images/avalanche-logo.png'
import BinanceCoinLogo from '../../assets/images/binance-coin-logo.png'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import FantomLogo from '../../assets/images/fantom-logo.png'
import HarmonyLogo from '../../assets/images/harmony-logo.png'
import HecoLogo from '../../assets/images/heco-logo.png'
import MaticLogo from '../../assets/images/matic-logo.png'
import BoneLogo from '../../assets/images/bone-logo.png'
import MoonbeamLogo from '../../assets/images/moonbeam-logo.png'
import xDaiLogo from '../../assets/images/xdai-logo.png'
import { useActiveWeb3React } from '../../hooks'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import ethereumList from '../../constants/token-lists/ethereum.json'
import puppynetList from '../../constants/token-lists/puppynet.json'
import shibariumList from '../../constants/token-lists/shibarium.json'
import bsctestnetList from '../../constants/token-lists/bsctestnet.json'
import rsktestnetList from '../../constants/token-lists/rsktestnet.json'
import Image, { StaticImageData } from 'next/image'
// import stringSimilarity from 'string-similarity';

const tokensLists = {
    [ChainId.MAINNET]: ethereumList.tokens,
    [ChainId.PUPPYNET]: puppynetList.tokens,
    [ChainId.SHIBARIUM]: shibariumList.tokens,
    [ChainId.BSC_TESTNET]: bsctestnetList.tokens,
    [ChainId.RSK_TESTNET]: rsktestnetList.tokens
}

export const getTokenLogoURL = (address: string, chainId: number = 1) => {
    try {
        // use ethereum as default chain ID
        if (!tokensLists[chainId]) {
            chainId = 1
        }

        const logo = tokensLists[chainId]?.find(t => t.address.toLowerCase() == address.toLowerCase())

        if (logo && logo.logoURI) {
            return logo.logoURI
        } else {
            // const bestSimilar = stringSimilarity.findBestMatch(address, tokensLists[chainId].map(t => t.address))
            // console.log('bestSimilar for ', address, bestSimilar.bestMatch)
            // return `/assets/images/home/placeholder_token.png`
        }
    } catch (e) {
        // console.log('cant detect img:', e)
    }

    return `https://raw.githubusercontent.com/SashaDesigN/assets/master/blockchains/ethereum/assets/${address}/logo.png`
}

// examples of different providers:
// `https://tokens.1inch.io/${address}.png`
// `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`
// `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledNativeCurrencyLogo = styled(Image)<{ size: string }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    border-radius: 50%;
    overflow: hidden;
`

const StyledLogo = styled(Logo)<{ size: string }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    // background-color: ${({ theme }) => theme.white};
`

export const logo: { readonly [chainId in ChainId]?: StaticImageData } = {
    [ChainId.MAINNET]: EthereumLogo,
    [ChainId.FANTOM]: FantomLogo,
    [ChainId.FANTOM_TESTNET]: FantomLogo,
    [ChainId.MATIC]: MaticLogo,
    [ChainId.MATIC_TESTNET]: MaticLogo,
    [ChainId.XDAI]: xDaiLogo,
    [ChainId.BSC]: BinanceCoinLogo,
    [ChainId.BSC_TESTNET]: BinanceCoinLogo,
    [ChainId.MOONBASE]: MoonbeamLogo,
    [ChainId.AVALANCHE]: AvalancheLogo,
    [ChainId.FUJI]: AvalancheLogo,
    [ChainId.HECO]: HecoLogo,
    [ChainId.HECO_TESTNET]: HecoLogo,
    [ChainId.HARMONY]: HarmonyLogo,
    [ChainId.HARMONY_TESTNET]: HarmonyLogo,
    [ChainId.PUPPYNET]: BoneLogo,
    [ChainId.SHIBARIUM]: BoneLogo,
    [ChainId.RSK_TESTNET]: FantomLogo
}

export default function CurrencyLogo({
    currency,
    size = '24px',
    style
}: {
    currency?: Currency
    size?: string
    style?: React.CSSProperties
}) {
    const { chainId } = useActiveWeb3React()
    const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

    const srcs: string[] = useMemo(() => {
        if (currency === ETHER) return []

        if (currency instanceof Token) {
            if (currency instanceof WrappedTokenInfo) {
                return [...uriLocations, getTokenLogoURL(currency.address, chainId)]
            }

            return [getTokenLogoURL(currency.address, chainId)]
        }
        return []
    }, [currency, uriLocations])

    if (currency === ETHER && chainId) {
        return <Image src={logo[chainId]} alt='Currency' style={{ width: size, ...style }} width={24} height={24} />
    }

    return <StyledLogo size={size} srcs={srcs} alt={`${currency?.getSymbol(chainId) ?? 'token'} logo`} style={style} />
}
