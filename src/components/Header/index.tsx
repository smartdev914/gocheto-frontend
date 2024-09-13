'use client'
import { ChainId } from '@gocheto-dex/sdk'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useActiveWeb3React } from '../../hooks'
import Web3Status from '../Web3Status'
import { Disclosure } from '@headlessui/react'
import { makeStyles } from '@material-ui/core/styles'
import HomeIcon from '../../assets/images/gocheto-logo-light.webp'
import TrendsBanner from '../../components/TrendsBanner'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MobileMenu } from '../Menu'
import Image from 'next/image'

// Define the styles for your table
const useStyles = makeStyles(theme => ({
    Title: {
        fontSize: '1.8rem',
        fontWeight: 500,
        width: 'auto',
        display: 'inline-block',
        minWidth: '8em'
    },
    trends: {
        backgroundColor: '#30333E',
        borderRadius: '0.8rem',
        marginTop: '1rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
    },
    tokenImageSingle: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        background: '#fff',
        marginRight: '0.6rem'
    },
    Dark: {
        backgroundColor: '#141824',
        height: '100%',
        lineHeight: '2.8rem',
        padding: '0 1rem',
        cursor: 'pointer',
        color: '#fff'
    },
    Fire: {},
    Light: {
        height: '100%',
        lineHeight: '2.8rem',
        padding: '0 1rem',
        cursor: 'pointer',
        margin: '0 0.7rem'
    },
    Ads: {
        backgroundColor: '#fafafa',
        lineHeight: '1.7rem',
        height: '60%',
        borderRadius: '0.3rem',
        padding: '0 0.6rem',
        color: '#262626'
    },
    Token: {
        backgroundColor: '#30333E',
        marginRight: '0.6rem',
        marginLeft: '0.6rem',
        paddingLeft: 0,
        paddingRight: 0,
        height: '100%',
        lineHeight: '2.8rem',
        cursor: 'pointer',
        border: 0
    },
    Avatar: {
        width: 26,
        height: 26
    }
}))

const getNavName = loc => {
    const name = 'Overview'

    if (loc.startsWith('/swap')) return 'Swap'
    if (
        loc.startsWith('/create') ||
        loc.startsWith('/pool') ||
        loc.startsWith('/add')
    )
        return 'Liquidity Pools'

    if (loc.startsWith('/bury')) return 'Staking'
    if (loc.startsWith('/tokens')) return 'Tokens'
    return name
}

export default function Header(): JSX.Element {
    const { chainId } = useActiveWeb3React()
    const { t } = useTranslation()
    const classes = useStyles()
    const currLocation = usePathname()

    return (
        <Disclosure as="nav" className="w-full max-w-full bg-transparent gradiant-border-bottom z-10">
            {({}) => (
                <>
                    <div
                        style={{ padding: '1rem', background: 'transparent', border: 'none' }}
                        className="header main-container-section"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center font-noto">
                                <MobileMenu />
                                <Link href="/" className="flex items-center h-8 md:hidden">
                                    <Image width={128} height={48} src={HomeIcon} alt="Gocheto" className="h-full object-contain" />
                                </Link>
                                <h1
                                    style={{ textWrap: 'nowrap' }}
                                    className={`${classes.Title} hidden md:inline-block`}
                                >
                                    {getNavName(currLocation ?? '/')}
                                </h1>
                                {/* <button className="btn btn-blue btn-round bold nav-tvl-btn inline-flex items-center w-full">
                                    <span>TVL</span>
                                    <span className="ml-2">{TVL}</span>
                                </button> */}
                            </div>

                            <div className="flex flex-row items-center justify-center w-full p-4 left-0 bottom-0 bg-dark-1000 lg:relative lg:p-0 md:p-0 sm:p-0 lg:bg-transparent header-mobile">
                                <div className="flex items-center justify-between sm:justify-end space-x-2 w-full header">
                                    {/* {library && library.provider.isMetaMask && (
                                        <div className="hidden sm:inline-block">
                                            <Web3Network />
                                        </div>
                                    )} */}

                                    <div className="w-auto flex items-center rounded p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto header_space">
                                        <Web3Status />
                                    </div>
                                </div>
                            </div>
                            {/* <div className="-mr-2 flex sm:hidden"> */}
                            {/* Mobile menu button */}
                            {/* <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-high-emphesis focus:outline-none">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <X title="Close" className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Burger title="Burger" className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div> */}
                        </div>
                        <TrendsBanner />
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                            <Link id={`swap-nav-link`} href={'/swap'}>
                                {t('swap')}
                            </Link>
                            <PoolLink />
                            {chainId === ChainId.MAINNET && (
                                <Link id={`yield-nav-link`} href={'/yield'}>
                                    Yield
                                </Link>
                            )}
                            {chainId === ChainId.MAINNET && (
                                <Link id={`stake-nav-link`} href={'/stake'}>
                                    Stake
                                </Link>
                            )}
                            {chainId === ChainId.MAINNET && (
                                <Link id={`vesting-nav-link`} href={'/vesting'}>
                                    Vesting
                                </Link>
                            )}
                            {chainId && [ChainId.MAINNET, ChainId.KOVAN, ChainId.BSC].includes(chainId) && (
                                <Link id={`bento-nav-link`} href={'/bento'}>
                                    Apps
                                </Link>
                            )}
                            <Link id={`tool-nav-link`} href={'/tools'}>
                                Tools
                            </Link>
                            {chainId && (
                                <Link id={`analytics-nav-link`} href={'#'}>
                                    Analytics
                                </Link>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}

function fetchTVL() {
    throw new Error('Function not implemented.')
}

const PoolLink = () => {
    const { t } = useTranslation()
    const pathname = usePathname()
    const isActive = useMemo(() => {
        return (
            pathname?.startsWith('/add') ||
            pathname?.startsWith('/remove') ||
            pathname?.startsWith('/create') ||
            pathname?.startsWith('/find')
        )
    }, [location])

    return (
        <Link id="pool-nav-link" href="/pool">
            {t('pool')}
        </Link>
    )
}
