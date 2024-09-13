import React from 'react'
import { Avatar, makeStyles } from '@material-ui/core'
import { getTokenLogoURL } from '../../components/CurrencyLogo'
import { useFullTokens } from '../../hooks/useTokensData'
import { useActiveWeb3React } from '../../hooks'
import Link from 'next/link'
import { FireIcon, PlusIcon } from '../../assets/icons'
import { formatNumber } from '../../utils/numbers'

const calculateGrow = (price: number, prevPrice: number, fix?: number): string => {
    if (price === prevPrice) return '0.00'
    const grow = `${price > prevPrice ? '+' : ''}${(((price - prevPrice) / prevPrice) * 100).toFixed(fix || 2)}`
    if (grow == '+Infinity' || grow == '-Infinity') return '0'
    return grow
}

const useStyles = makeStyles(theme => ({
    Title: {
        fontSize: '1.8rem',
        fontWeight: 500,
        width: 'auto',
        display: 'inline-block'
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
        backgroundColor: '#25273b',
        height: '100%',
        lineHeight: '2.8rem',
        padding: '0 1rem',
        cursor: 'pointer',
        color: '#fff'
    },
    Fire: {
        cursor: 'default'
    },
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
        cursor: 'default',
        color: '#262626'
    },
    Token: {
        backgroundColor: '#1b1d38',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        height: '100%',
        lineHeight: '2.8rem',
        cursor: 'pointer',
        border: 0
    },
    Avatar: {
        width: 26,
        height: 26,
        backgroundColor: '#FFF',
        color: '#000'
    },
    PairBtn: {
        position: 'absolute',
        right: 0,
        [theme.breakpoints.down('xs')]: {
            width: '3rem'
        }
    }
}))

const TrendsBanner = () => { 
    const classes = useStyles()
    const { data } = useFullTokens()
    const { chainId } = useActiveWeb3React()

    const resp = data.tokens.map(t => {
        const tmp = {
            ...t,
            token0price: t.priceUSD,
            token1price: t.price24Hr
        }
        return tmp
    })


  return (
    <div
            style={{ height: '44.8px' ,backgroundColor: '#1b1d38', position: 'relative', borderRadius: '0.8rem' }}
            className={'flex overflow-hidden w-full items-center mt-3'}
        >
            <div className={`${classes.Dark} cursor-default`}>
                <FireIcon width={24} className={'text-gray-100'} style={{ display: 'inline-block', cursor: 'default' }} />
            </div>
            <div className={[classes.Light, classes.Ads].join(' ')}>ADS</div>
            <div className="overflow-x-hidden flex flex-row justify-between items-center relative h-auto marquee-container">
                <div className={'flex items-center'}>
                    <div className="flex items-center flex-auto  animate-auto-scroll h-auto">
                        {resp.slice(0, 10).map((t, key) => (
                            // <ExternalLink href={`${t.Link}`}>
                            <div key={key}>
                                <Link
                                    className={`inline-flex items-center w-full hover:bg-gray-700 ` + classes.Token}
                                    href={`/swap/${t.id}`}
                                >
                                    {/* {JSON.stringify(t, null, 2)} */}
                                    <Avatar src={getTokenLogoURL(t.id, chainId)} className={classes.Avatar}>
                                        {t.symbol[0]}
                                    </Avatar>
                                    <span className="ml-2 text-gray-100">{t.symbol}</span>
                                    <span className="ml-2 text-gray-100">
                                        ${formatNumber(t.token0price, 2, 4)}
                                        {/* {Number(t.token0price).toFixed(
                                        t.symbol === 'SHIB' || t.symbol === 'SHI' || t.symbol === 'ILS'  ? 6 : 2
                                    )} */}
                                    </span>
                                    <span
                                        className={`ml-2 ${t.token0price >= t.token1price ? 'text-green' : 'text-red'}`}
                                    >
                                        {calculateGrow(Number(t.token0price), Number(t.token1price))}%
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center flex-auto  animate-auto-scroll h-auto">
                        {resp.slice(0, 10).map((t, key) => (
                            // <ExternalLink href={`${t.Link}`}>
                            <div key={key}>
                                <Link
                                    className={`inline-flex items-center w-full hover:bg-gray-700 ` + classes.Token}
                                    href={`/swap/${t.id}`}
                                >
                                    {/* {JSON.stringify(t, null, 2)} */}
                                    <Avatar src={getTokenLogoURL(t.id, chainId)} className={classes.Avatar}>
                                        {t.symbol[0]}
                                    </Avatar>
                                    <span className="ml-2 text-gray-100">{t.symbol}</span>
                                    <span className="ml-2 text-gray-100">
                                        $
                                        {// Number(
                                        formatNumber(t.token0price, 2, 4)
                                        // ).toFixed(
                                        // t.symbol === 'SHIB' || t.symbol === 'SHI' || t.symbol === 'ILS'  ? 6 : 2
                                        // )
                                        }
                                    </span>
                                    <span
                                        className={`ml-2 ${t.token0price >= t.token1price ? 'text-green' : 'text-red'}`}
                                    >
                                        {calculateGrow(Number(t.token0price), Number(t.token1price))}%
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Link href="/create/ETH" className={`${classes.Dark + ' ' + classes.PairBtn}`}>
                <div className="sm:hidden block">
                    <PlusIcon style={{ display: 'inline-block' }} />
                </div>

                <div className="md:hidden block">
                    <PlusIcon style={{ display: 'inline-block' }} /> Pair
                </div>

                <div className="hidden md:block">
                    Create liquidity pair <PlusIcon style={{ display: 'inline-block' }} />
                </div>
            </Link>
        </div>
    )
}

export default TrendsBanner
