'use client'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ContextType, useWeb3React as useWeb3ReactCore } from '@web3-react/core'
// import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useState } from 'react'
import { injected } from '../connectors'
import connectors, { connectorLocalStorageKey } from '../components/WalletModal/connectors'
import { Connector } from '@web3-react/types'
import { getChainId } from '../utils/getDefaultChainId'

export function useActiveWeb3React(): Web3ContextType<Web3Provider> {
    const context = useWeb3ReactCore<Web3Provider>()
    // const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
    // return context.active ? context : contextNetwork
    const chainId = getChainId(context.chainId)
    return { ...context, chainId }
}

export function useEagerConnect() {
    const { isActive, provider } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
    const [tried, setTried] = useState(false)

    const tryActivation = async provider => {
        const connector: Connector = provider.connector
        let name = ''
        Object.keys(connectors).map(key => {
            if (connector === connectors[key].connector) {
                return (name = connectors[key].name)
            }
            return true
        })
        if (connector) {
            try {
                if (connector.connectEagerly) {
                    await connector.connectEagerly()
                } else {
                    await connector.activate()
                }
                setTried(true)
            } catch (error) {
                setTried(true)
                console.error(error)
            }
        }
    }

    useEffect(() => {
        const connectorId = window.localStorage.getItem(connectorLocalStorageKey)
        if (connectorId) tryActivation(connectors[parseInt(connectorId, 10) - 1])
        else setTried(true)
    }, []) // intentionally only running on mount (make sure it's only mounted once :))

    // if the connection worked, wait until we get confirmation of that to flip the flag
    // useEffect(() => {
    //     if (isActive) {
    //         setTried(true)
    //     }
    // }, [isActive])

    return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
    const { isActive, connector } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

    useEffect(() => {
        const { ethereum } = window

        if (ethereum && ethereum.on && !isActive && !suppress) {
            const handleChainChanged = () => {
                // eat errors
                connector.activate(injected, undefined, true)?.catch(error => {
                    console.error('Failed to activate after chain changed', error)
                })
            }

            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    // eat errors
                    connector.activate(injected, undefined, true)?.catch(error => {
                        console.error('Failed to activate after accounts changed', error)
                    })
                }
            }

            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                }
            }
        }
        return undefined
    }, [isActive, suppress, connector])
}

export * from './useContract'
export { default as useFuse } from './useFuse'
export { default as useSortableData } from './useSortableData'
