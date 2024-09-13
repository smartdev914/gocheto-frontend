'use client'
/* This example requires Tailwind CSS v2.0+ */
import React, { useEffect, useRef, useState } from 'react'
import HomeIcon from '../../assets/images/gocheto-logo-light.webp'
import Link from 'next/link'
import { BridgeIcon, FaqIcon, FaucetIcon, LiquidityIcon, OverviewIcon, SupportIcon, SwapIcon, TokensIcon } from '../../assets/icons'
import Image from 'next/image'
import { Close, List } from '@material-ui/icons'
import { usePathname } from 'next/navigation'

export default function Menu() {
    const pathname = usePathname();

    return (
        <div className={`flex-none w-56 z-20 hidden lg:block relative`}>
            <div className="p-6 h-full fixed top-0 bottom-0" style={{ backgroundColor: '#0f112d' }}>
                <Link href="/">
                    <Image width={128} height={48} alt='Swap' className="pb-6" src={HomeIcon} />
                </Link>
                <Link href="/" className={`mnu-item`} style={{ color: pathname === '/' ? '#FF7A1C' : '#FFF' }}>
                    <OverviewIcon height={21} className="inline" />
                    <p className="inline">Overview</p>
                </Link>
                <Link href="/swap" className={`mnu-item`} style={{ color: pathname?.startsWith('/swap') ? '#FF7A1C' : '#FFF' }}>
                    <SwapIcon height={21} className="inline" />
                    <p className="inline">Swap</p>
                </Link>
                <Link href="/pool" className={`mnu-item`} style={{ color: pathname?.startsWith('/pool') ? '#FF7A1C' : '#FFF' }}>
                    <LiquidityIcon height={21} className="inline" />
                    <p className="inline">Liquidity Pools</p>
                </Link>
                <Link href="/tokens" className={`mnu-item`} style={{ color: pathname?.startsWith('/tokens') ? '#FF7A1C' : '#FFF' }}>
                    <TokensIcon height={21} className="inline" />
                    <p className="inline">Tokens</p>
                </Link>
                {/* <Link target="_blank" href={'https://shibarium.shib.io/bridge'} className={`mnu-item`}>
                    <BridgeIcon height={21} className="inline" />
                    <p className="inline">Bridge</p>
                </Link> */}
                <hr className="w-full bg-gray-500 mt-6 mb-4" />
                <Link target="_blank" href="https://www.gocheto.com/contact" className={`mnu-item`}>
                    <SupportIcon height={21} className="inline" />
                    <p className="inline">Support</p>
                </Link>
                <Link href="/faq" className={`mnu-item`}  style={{ color: pathname?.startsWith('/faq') ? '#FF7A1C' : '#FFF' }}>
                    <FaqIcon height={21} className="inline" />
                    <p className="inline">FAQs</p>
                </Link>
                {/* <Link target="_blank" href={'https://shibarium.shib.io/faucet'} className={`mnu-item`}>
                    <FaucetIcon height={21} className="inline" />
                    <p className="inline">Testnet Faucet</p>
                </Link> */}
            </div>
        </div>
    )
}

export function MobileMenu () {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname();
  
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
  
        document.addEventListener('mousedown', handleClickOutside)
  
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])
  
    return (
        <>
            <button className={'bg-transparent border-0 text-white lg:hidden'} onClick={() => setIsOpen(true)}>
                <List />
            </button>
            <div
                className={`flex-none w-56 z-20 h-screen top-0 transition-all duration-75 bottom-0 fixed ${
                    isOpen ? 'left-0' : '-left-full'
                }`}
            >
                <div className={`p-6 h-full relative`} style={{ backgroundColor: '#1b1d38' }}>
                    <button
                        className={
                            'h-8 w-8 flex items-center justify-center border bg-black border-gray-400 text-white right-0 top-0 absolute'
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        <Close />
                    </button>
                    <Link onClick={() => setIsOpen(false)} href="/">
                        <Image width={128} height={48} alt='shibaswap' className="pb-6" src={HomeIcon} />
                    </Link>
                    <Link href="/" className={`mnu-item`} style={{ color: pathname === '/' ? '#FF7A1C' : '#FFF' }}>
                        <OverviewIcon height={21} className="inline" />
                        <p className="inline">Overview</p>
                    </Link>
                    <Link href="/swap" className={`mnu-item`} style={{ color: pathname?.startsWith('/swap') ? '#FF7A1C' : '#FFF' }}>
                        <SwapIcon height={21} className="inline" />
                        <p className="inline">Swap</p>
                    </Link>
                    <Link href="/pool" className={`mnu-item`} style={{ color: pathname?.startsWith('/pool') ? '#FF7A1C' : '#FFF' }}>
                        <LiquidityIcon height={21} className="inline" />
                        <p className="inline">Liquidity Pools</p>
                    </Link>
                    <Link href="/tokens" className={`mnu-item`} style={{ color: pathname?.startsWith('/tokens') ? '#FF7A1C' : '#FFF' }}>
                        <TokensIcon height={21} className="inline" />
                        <p className="inline">Tokens</p>
                    </Link>
                    {/* <Link
                        onClick={() => setIsOpen(false)}
                        href={'https://shibarium.shib.io/bridge'}
                        target='_blank'
                        className={`mnu-item`}
                    >
                        <BridgeIcon height={21} className="inline" />
                        <p className="inline">Bridge</p>
                    </Link> */}
                    <hr className="w-full bg-gray-500 mt-6 mb-4" />
                    <Link
                        onClick={() => setIsOpen(false)}
                        href="https://www.gocheto.com/contact"
                        target='_blank'
                        className={`mnu-item`}
                    >
                        <SupportIcon height={21} className="inline" />
                        <p className="inline">Support</p>
                    </Link>
                    <Link href="/faq" className={`mnu-item`} style={{ color: pathname?.startsWith('/faq') ? '#FF7A1C' : '#FFF' }}>
                        <FaqIcon height={21} className="inline" />
                        <p className="inline">FAQs</p>
                    </Link>
                    {/* <Link
                        onClick={() => setIsOpen(false)}
                        href={'https://shibarium.shib.io/faucet'}
                        target='_blank'
                        className={`mnu-item`}
                    >
                        <FaucetIcon height={21} className="inline" />
                        <p className="inline">Testnet Faucet</p>
                    </Link> */}
                </div>
            </div>
        </>
    )
  }
