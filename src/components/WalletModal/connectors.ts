import { Web3ReactHooks, initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Connector } from '@web3-react/types'
import { RPC } from '../../connectors'
import { ChainId } from '@gocheto-dex/sdk'

export const [web3Metamask, web3MetamaskHooks] = initializeConnector(actions => new MetaMask({ actions }))

export const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector(
    actions =>
        new CoinbaseWallet({
            actions,
            options: {
                url: RPC[ChainId.MAINNET],
                appName: 'Gocheto'
            }
        })
)

export const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector(
    actions =>
        new WalletConnect({
            actions,
            options: {
                projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? '71cf81654be359533f05049128d54e82',
                chains: [ChainId.MAINNET],
                showQrModal: true,
                rpcMap: RPC,
                metadata: {
                    name: 'Gocheto-DEX(V1)',
                    description: 'Gocheto',
                    url: 'https://exchange.gocheto.com',
                    icons: ['https://exchange.gocheto.com/_next/static/media/logo-medium.30c0aa06.png']
                }
            }
        })
)

const connectors = [
    {
        id: 1,
        connector: web3Metamask,
        name: 'MetaMask',
        iconName: 'metamask.png',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D'
    },
    {
        id: 2,
        connector: web3WalletConnect,
        name: 'Wallet Connect',
        iconName: 'walletConnectIcon.svg',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true
    },
    {
        id: 3,
        connector: web3CoinbaseWallet,
        name: 'Coinbase',
        iconName: 'coinbaseWalletIcon.svg',
        description: 'Use Coinbase Wallet app on mobile device',
        href: null,
        color: '#315CF5',
        mobile: true
    }
]

export const installExtentionLinks = {
    1: {
        desc: 'Metamask_not_installed',
        linkDesc: 'You_can_download_here',
        link: 'https://metamask.io'
    }
}

export const libraries: [Connector, Web3ReactHooks][] = [
    [web3Metamask, web3MetamaskHooks],
    [web3WalletConnect, web3WalletConnectHooks],
    [web3CoinbaseWallet, web3CoinbaseWalletHooks]
]
export const connectorLocalStorageKey = 'connectorId'

export default connectors
