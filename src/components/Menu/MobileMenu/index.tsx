import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import OverviewIcon from '../../../assets/images/home/overview.svg'
import SwapIcon from '../../../assets/images/home/swap.svg'
import LiquidityIcon from '../../../assets/images/home/liquidity.svg'
import BridgeIcon from '../../../assets/images/home/bridge.svg'
import TokensIcon from '../../../assets/images/home/circle-stack.svg'
import SupportIcon from '../../../assets/images/home/Support.svg'
import FaucetIcon from '../../../assets/images/home/Faucet.svg'
import HomeIcon from '../../../assets/images/gocheto-logo-light.webp'
import { Close, List } from '@material-ui/icons'
import Image from 'next/image'

export default function MobileMenu () {
  const [isOpen, setIsOpen] = useState(false)
  /*const containerRef = useRef<HTMLDivElement>(null)

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
  }, [])*/

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
                      <Image width={128} height={48} alt='Home icon' className="pb-6" src={HomeIcon} />
                  </Link>
                  <Link onClick={() => setIsOpen(false)} href="/" className="mnu-item">
                      <OverviewIcon className="inline" />
                      <p className="inline">Overview</p>
                  </Link>
                  <Link onClick={() => setIsOpen(false)} href="/swap" className="mnu-item">
                      <SwapIcon className="inline" />
                      <p className="inline">Swap</p>
                  </Link>
                  <Link onClick={() => setIsOpen(false)} href="/pool" className="mnu-item">
                      <LiquidityIcon className="inline" />
                      <p className="inline">Liquidity Pools</p>
                  </Link>
                  <Link onClick={() => setIsOpen(false)} href="/tokens" className="mnu-item">
                      <TokensIcon className="inline" />
                      <p className="inline">Tokens</p>
                  </Link>
                  {/* <Link
                      onClick={() => setIsOpen(false)}
                      href={'https://shibarium.shib.io/bridge'}
                      target='_blank'
                      className="mnu-item"
                  >
                      <BridgeIcon className="inline" />
                      <p className="inline">Bridge</p>
                  </Link> */}
                  <hr className="w-full bg-gray-500 mt-6 mb-4" />
                  <Link
                      onClick={() => setIsOpen(false)}
                      href="https://www.gocheto.com/contact"
                      target='_blank'
                      className="mnu-item"
                  >
                      <SupportIcon height={21} className="inline" />
                      <p className="inline">Support</p>
                  </Link>
                  {/* <Link
                      onClick={() => setIsOpen(false)}
                      href={'https://shibarium.shib.io/faucet'}
                      target='_blank'
                      className="mnu-item"
                  >
                      <FaucetIcon height={21} className="inline" />
                      <p className="inline">Testnet Faucet</p>
                  </Link> */}
              </div>
          </div>
      </>
  )
}