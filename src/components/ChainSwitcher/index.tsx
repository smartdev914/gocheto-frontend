import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { ErrorOutline, ExpandMore } from '@material-ui/icons'
import { useWeb3React } from '@web3-react/core'
import { NETWORK_ICON } from '../../constants/networks'
import connectors from '../../components/WalletModal/connectors'

const ChainSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { connector, chainId } = useWeb3React()
    const name = connectors.filter(k => k.connector === connector).map(k => k.name)[0]

    const CHAINS = {
        1: {
            chainId: '0x1',
            chainName: 'Ethereum',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.infura.io/v3'],
            blockExplorerUrls: ['https://etherscan.io']
        },
        // 157: {
        //     chainId: '0x9d',
        //     chainName: 'Puppynet',
        //     nativeCurrency: {
        //         name: 'BONE',
        //         symbol: 'BONE',
        //         decimals: 18
        //     },
        //     rpcUrls: ['https://puppynet.shibrpc.com'],
        //     blockExplorerUrls: ['https://puppyscan.shib.io/'],
        //     hide: name === 'Wallet Connect'
        // },
        // 109: {
        //     chainId: '0x6d',
        //     chainName: 'Shibarium',
        //     nativeCurrency: {
        //         name: 'BONE',
        //         symbol: 'BONE',
        //         decimals: 18
        //     },
        //     rpcUrls: ['https://www.shibrpc.com'],
        //     blockExplorerUrls: ['https://shibariumscan.io'],
        //     hide: name === 'Wallet Connect'
        // },
        // 97: {
        //     chainId: '0x61',
        //     chainName: 'BSC Testnet',
        //     nativeCurrency: {
        //         name: 'Binance Coin',
        //         symbol: 'BNB',
        //         decimals: 18
        //     },
        //     rpcUrls: ['https://bsc-testnet-rpc.publicnode.com'],
        //     blockExplorerUrls: ['https://testnet.bscscan.com'],
        //     hide: name === 'Wallet Connect'
        // },
        // 31: {
        //     chainId: '0x1f',
        //     chainName: 'RSK Testnet',
        //     nativeCurrency: {
        //         name: 'Rootstock Bitcoin',
        //         symbol: 'RBTC',
        //         decimals: 18
        //     },
        //     rpcUrls: ['https://public-node.testnet.rsk.co'],
        //     blockExplorerUrls: ['https://explorer.testnet.rootstock.io'],
        //     hide: name === 'Wallet Connect'
        // }
    }

    const switchChain = async id => {
        if (connector) {
            try {
                await connector.activate(id)
            } catch (switchError) {
                if (switchError.code === 4902) {
                    connector.provider?.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: CHAINS[id].chainId,
                                rpcUrls: CHAINS[id].rpcUrls,
                                chainName: CHAINS[id].chainName,
                                nativeCurrency: CHAINS[id].nativeCurrency,
                                blockExplorerUrls: CHAINS[id].blockExplorerUrls,
                                iconUrls: [NETWORK_ICON[id]]
                            }
                        ]
                    })
                } else {
                    console.error(switchError)
                }
            }
        }
        setIsOpen(false)
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className={"flex"}>
        <button
          type="button"
          onClick={toggleMenu}
          style={{ borderRadius: '20px', borderColor: '#0AA663', borderWidth: '3px', backgroundColor: '#202740' }}
          className="inline-flex outline-none justify-center items-center gap-2 w-full text-base font-medium py-1.5 px-3"
        >
          {NETWORK_ICON[chainId || 1] ?
            <Image width={24} height={24} src={NETWORK_ICON[chainId || 1]} alt="Network icon" className={`w-5 ml-2 ${chainId === 109 || chainId == 157 ? '' : 'h-5 rounded-full'}`} />
            : <ErrorOutline />
          }
          <span className={'hidden-mobile'}>
            {CHAINS[chainId || 1]?.chainName || 'Network not supported'}
            {CHAINS[chainId || 1]?.chainName ? ' Network' : ''}
          </span>
          <ExpandMore />
        </button>
      </div>

      {isOpen && (
        <div
          style={{ borderColor: '#919193', zIndex: 2, borderWidth: '3px', backgroundColor: '#202740', borderRadius: '20px' }}
          className={`origin-top-right absolute right-0 mt-2 w-full shadow-lg overflow-hidden`}
        >
          <div
            className="relative py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
           {Object.keys(CHAINS).map((key) => {
              if (CHAINS[key].hide) return null
              return (
                <button className={`bg-transparent px-4 py-1.5 w-full flex gap-2 items-center border-none text-base font-medium `} key={key} onClick={() => switchChain(Number(key))}>
                  <Image width={24} height={24} src={NETWORK_ICON[key]} alt="Network icon" className={`w-5 ${Number(key) === 109 || Number(key) == 157 ? '' : 'h-5 rounded-full'}`} />
                  <span className={'hidden-mobile'}>
                    {CHAINS[key].chainName}
                  </span>
                  {chainId == Number(key) && (
                    <div className={'flex-1 flex justify-end'}>
                      <span className={'w-2 h-2 bg-green rounded-full'}/>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
    )
}

export default ChainSwitcher
