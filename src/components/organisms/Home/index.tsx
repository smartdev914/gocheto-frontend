'use client'
import React, { useState } from 'react'
import { AutoColumn } from '../../Column'
import { useActiveWeb3React } from '../../../hooks'
import SortableTable from '../../SortableTable/SortableTable'
import Avatar from '@material-ui/core/Avatar'
import ChartToken from '../../Chart/ChartToken'
import LineChart from '../../Chart/LineChartJS'
import { useTopTokens, usePairs, useVolumeAnalytics, useLiquidityAnalytics } from '../../../hooks/useTokensData'
import { getTokenLogoURL } from '../../CurrencyLogo/index'
import { formatNumber, abbrNum } from '../../../utils/numbers'
import Scale from '../../Chart/Scale'
import StakingRewards from '../../StakingRewards'
import { ChainId } from '@gocheto-dex/sdk'
import styled from 'styled-components'
import { makeStyles } from '@material-ui/core/styles'
import { getChainId } from '../../../utils/getDefaultChainId'
import Link from 'next/link'

// Define the styles for your table
const useStyles = makeStyles(theme => ({
    tokenImageSingle: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        background: '#fff',
        marginRight: '0.6rem',
        color: '#464648',
        lineHeight: '1.8rem',
        fontSize: '1rem',
        textAlign: 'center',
        fontWeight: 400
    },
    tokenImage: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        background: '#fff',
        color: '#464648',
        lineHeight: '1.8rem',
        fontSize: '1rem',
        textAlign: 'center',
        fontWeight: 400
    },
    secondImage: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginLeft: '-0.5rem !important',
        marginRight: '0.6rem',
        background: '#fff',
        color: '#464648',
        lineHeight: '1.8rem',
        fontSize: '1rem',
        textAlign: 'center',
        fontWeight: 400
    },
    poolName: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'Noto Sans'
    }
}))

const BackgroundDiv = styled.div`
    width: 100%; // Set the desired width or make it full-width
    height: 14rem; // Set a height for the background
    background-size: cover; // Cover the entire div area
    background-position: center; // Center the background image
    background-repeat: no-repeat; // Prevent the background image from repeating
    border-radius: 0.6rem;
`

const PageWrapper = styled(AutoColumn)`
    max-width: 100%;
    width: 100%;
    justify-items: flex-start;
    height: 100%;
`

const Col = styled.div<{ size: any }>`
    justify-content: flex-start;
    flex: ${props => props.size};
`

const Block = styled.div<{ children?: any; style?: any }>`
    display: inline-block;
    position: relative;
    width: auto;
    ${props =>
        props.style &&
        props.style.width &&
        `
        > div {
            width: ${100 / props.children.length}%;
        }
        @media (max-width: 768px) {
            > [role="group"].MuiButtonGroup-root {
                margin-top: -0.4rem;
                zoom: 0.82;
            }
        }
    `}
`

const CardWrapper = styled.div<{ type?: string; content?: string }>`
    width: 100%;
    height: auto;
    min-height: 12rem;
    * {
        transition: all ease 0.2s;
    }
    ${props =>
        props.type != 'table' &&
        `
    background-color: #222540;
    `}
    // box-shadow: 0 0 12px 6px rgba(0, 0, 0, 0.45);
    border-radius: .6rem;
    position: relative;
    ${props =>
        props.type == 'big' &&
        `
        padding-top: 0rem;
        border-radius: 1.5rem;
    `}
    ${props =>
        props.type == 'table' &&
        `
        padding-top: 0rem;
        margin-top: 1rem;
        margin-bottom: 2rem;
        border-radius: 1.5rem;
        background-color: none !important;
    `}
    ${props =>
        props.content == 'small_table' &&
        `
        tbody th {
            padding-left: 0;
        }
        tbody td {
            padding-right: 0;
        }
    `}
    :hover {
        // box-shadow: 0 0 12px 6px rgba(0, 0, 0, 0.45);
        // background-color: #262936;
    }
    .MuiTableContainer-root {
        background-color: #222540;
        border-radius: 1.5rem;
        tbody th, tbody td {
            border-bottom: 0;
        }
        thead th {
            border-bottom: 1px solid var(--Primary-600, #2D3659);
            font-wight: bold;
            font-size: 1.1rem;
        }
        thead .w-40 {
            padding-left:0;
            padding-right: 0;
            width: 40px !important;
        }
        .TblActions {
            a {
                margin-left: 1rem;
                color: #ff7a1c;
            }
        }
    }
`
const CardHeader = styled.header<{ dir?: string }>`
    padding-top: 1.2rem;
    padding-bottom: 1.6rem;
    padding-left: 1rem;
    padding-right: 1rem;
    ${props =>
        props.dir &&
        props.dir == 'reverse' &&
        `
        flex-direction: reverse;
        display: inline-flex;
    `}
`

const CardHeaderRight = styled.header`
    padding-top: 1.2rem;
    padding-bottom: 1.6rem;
    padding-left: 1rem;
    padding-right: 0.5rem;
    display: flex;
    justify-content: flex-end;
    // min-height: 12rem;
`

export const CardHeading = styled.h1<{ dir?: string; justify?: string; type?: string }>`
    font-size: 1.6rem;
    text-align: left;
    font-weight: 500;
    color: #fff;
    margin: 0;
    line-height: 1.5rem;
    padding-top: 0.4rem;
    padding-bottom: 0.6rem;
    position: relative;
    ${props =>
        props.dir &&
        props.dir == 'reverse' &&
        `
        flex-direction: reverse;
        display: inline-flex;
    `}
    ${props =>
        props.justify == 'between' &&
        `
        justify-content: space-between;
        align-items: center;
        display: flex;
    `}
    ${props =>
        props.type == 'footer' &&
        `
        color: #FAFAFA;
        font-size: 1.1rem;
        padding-bottom:0;
    `}
    > .MuiAvatar-root {
        background: #fff;
    }
    > .top_subtitle {
        position: absolute;
        top: 0.15rem;
        left: 50px;
        font-size: 0.6em;
        color: #E5E5E5;
    }
    > .main_title {
        position: absolute;
        top: 1.5rem;
        left: 50px;
        font-size:1.4rem;
    }
    > .right_title {
        font-size: 1.8rem;
        font-weight: 400;
    }
`

export const CardsubTitle = styled.p`
    font-size: 15px;
    text-align: left;
    color: #d5d5d5;
    margin: 0;
    font-weight: 800;
`

const CardDesc = styled.p`
    font-size: 15px;
    text-align: left;
    font-weight: 600;
    color: #d5d5d5;
    margin: 0;
    margin-top: 1.4rem;
    margin-bottom: 5rem;
    font-weight: 800;
`

const TextLink = styled.a`
    font-size: 1.1rem;
    cursor: pointer;
    text-decoration: none;
    background-color: transparent;
    color: #fff;
    margin: 0;
    width: auto;
    display: inline-block;
`

const InlineLink = styled.a`
    font-size: 1rem;
    background-color: transparent;
    color: #d5d5d5;
    border-radius: 0.6rem;
    border: #d5d5d5 1px solid;
    font-weight: bold;
    padding: 0.5rem 1rem;
    padding-top: 0.8rem;
    line-height: 0.9rem;
    margin: 0;
    text-align: center;
    width: auto;
    min-width: 12rem;
    height: 42px;
    display: inline-block;
    ${props =>
        props.className == 'inline_yellow' &&
        `
        border-color: #FF7A1C;
        min-width: 8rem;
        font-size: 12pt;
        line-height: 0.66rem;
        font-weight: 400;
    `}
`

const InlineSearch = styled.input`
    font-size: 1rem;
    background-color: transparent;
    color: #d5d5d5;
    border-radius: 0.6rem;
    border: #d5d5d5 1px solid;
    font-weight: bold;
    padding: 0.5rem 1rem;
    padding-top: 0.7rem;
    line-height: 0.8rem;
    margin: 0;
    text-align: left;
    outline: none;
    width: 100%;
    min-width: 12rem;
    height: 42px;
    display: inline-block;
    + img {
        position: absolute;
        top: 0.9rem;
        right: 0.9rem;
    }
`

const InlineSelect = styled.select`
    font-size: 1rem;
    background-color: transparent;
    color: #d5d5d5;
    border-radius: 0.6rem;
    border: #d5d5d5 1px solid;
    font-weight: bold;
    padding: 0.5rem 1rem 0.5rem 5rem;
    padding-top: 0.7rem;
    line-height: 0.8rem;
    margin: 0;
    text-align: left;
    outline: none;
    width: auto;
    min-width: 12rem;
    height: 42px;
    display: inline-block;
    + span {
        position: absolute;
        top: 0.56rem;
        left: 0.9rem;
        font-size: 1rem;
    }
    > option {
        color: #fff;
        outline: none;
    }
`

const BuySellLine = styled.div`
    display: flex;
    width: 100%;
    border-radius: 0.6rem;
    overflow: hidden;
    margin-top: 0.9rem;
    margin-bottom: 0.1rem;
    > div {
        height: 0.26rem;
    }
    > .buy {
        background: #0aa663;
    }
    > .sell {
        background: #e81738;
    }
`

const Chip = styled.div<{ type: string }>`
    font-size: 0.8rem;
    font-weight: 400;
    ${props =>
        props.type &&
        props.type == 'up' &&
        `
        color: #03543F;
        background: #DEF7EC;
    `}
    ${props =>
        props.type &&
        props.type == 'down' &&
        `
        color: #9B1C1C;
        background: #FDE8E8;
    `}
    margin: 0;
    font-weight: 400;
    display: block;
    float: left;
    padding: 0.2rem 0.6rem;
    border-radius: 0.4rem;
    margin-left: 0.5rem;
    margin-top: -0.2rem;
    position: relative;
`

const Button = styled.a<{ disabled: boolean }>`
    background-color: #ff7a1c;
    border-radius: 0.4rem;
    color: #fff;
    font-size: 12pt;
    font-weight: 400;
    font-style: normal;
    letter-spacing: normal;
    line-height: normal;
    text-align: center;
    padding: 0.5rem 1.75rem;
    line-height: normal;
    position: absolute;
    bottom: 0.5rem;
    width: 200px;
    height: 42px;
    padding-bottom: 12px;
    :hover {
        color: #fff !important;
    }
    ${props =>
        props.disabled &&
        `
      pointer-events: none;
      color: #939395;
    `}
`

export const Row = styled.div`
    display: flex;
    margin: 0;
    width: 100%;
    justify-content: space-between;
`

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    padding-right: 0.3rem;
`

export const ImageDiv = styled.div`
    box-shadow: inset 0 0 9px rgba(13, 13, 13, 0.8);
    border-radius: 10px;
    padding: 0.5rem;
    background: transparent;
`

export const FixedSubtitle = styled.span`
    position: absolute;
    top: 2.2rem;
    font-size: 0.9rem;
`

export const ShibTable = props => {
    const classes = useStyles()
    const pairs = usePairs()
    const pairsCount: string | number =
        pairs.data && pairs.data.factories && pairs.data.factories.length ? pairs.data.factories[0].pairCount : 0

    const prepared = pairs.data.pairs.map(pair => {
        return {
            ...pair,
            // volume24h: pair.dayData && pair.dayData[0] ? parseInt(pair.dayData[0].volumeUSD) : 0,
            tx24: pair.dayData && pair.dayData[0] ? parseInt(pair.dayData[0].txCount) : 0
        }
    })

    // Define columns for SortableTable
    const columns = [
        {
            key: 'name',
            label: 'Pool Name',
            render: row => {
                return (
                    <div className={classes.poolName}>
                        <Avatar src={getTokenLogoURL(row.token0.id, props.chain_id)} className={classes.tokenImage}>
                            {row.token0.symbol[0]}
                        </Avatar>
                        <Avatar src={getTokenLogoURL(row.token1.id, props.chain_id)} className={classes.secondImage}>
                            {row.token1.symbol[1]}
                        </Avatar>
                        {row.name}
                    </div>
                )
            }
        },
        {
            key: 'reserveUSD',
            label: 'TVL',
            align: 'right',
            render: row => {
                return abbrNum(Number(row.reserveUSD))
            }
        },
        {
            key: 'volume24Hr',
            label: '24H Volume',
            align: 'right',
            render: row => abbrNum(Number(row.volume24Hr))
        },
        {
            key: 'txn24Hr',
            label: '24H Txs',
            align: 'right',
            render: row => abbrNum(Number(row.txn24Hr))
        },
        {
            key: 'txCount',
            label: 'Transactions',
            align: 'right',
            render: row => {
                return <div className="pr-8">{abbrNum(Number(row.txCount))}</div>
            }
        },
        {
            key: 'actions',
            sortable: false,
            label: '',
            align: 'right',
            render: row => {
                return (
                    <div className="TblActions">
                        <Link
                            style={{ textWrap: 'nowrap' }}
                            className={'hover:underline'}
                            href={`/add/${row.token0.id}/${row.token1.id}`}
                        >
                            Add Liquidity
                        </Link>
                        <Link
                            className={'hover:underline'}
                            href={`/swap?inputCurrency=${row.token0.id}&outputCurrency=${row.token1.id}`}
                        >
                            Swap
                        </Link>
                    </div>
                )
            }
        }
    ]

    return (
        <SortableTable
            design={{
                title: 'Liquidity Pools (' + pairsCount + ')',
                headerButton: {
                    to: '/add/ETH',
                    text: 'Create Liquidity Pool'
                }
            }}
            count={pairsCount ? Number(pairsCount) : pairs.data.pairs.length}
            columns={columns}
            rows={prepared}
            title=""
            order="desc"
            orderBy="volume24Hr"
            rowsPerPage={10}
            loading={pairs.loading || pairsCount == 0}
            page={0}
            filterCallback={(page, rowsPerPage, order, orderBy, search) => {
                pairs.setHookParams({ page, order, orderBy, rowsPerPage, search })
                pairs.fetchData({ page, order, orderBy, rowsPerPage, search, reload: true })
            }}
        />
    )
}

const TokensTable = props => {
    const classes = useStyles()
    const { chainId } = useActiveWeb3React()

    if (!props.data) return <></>

    const rows = props.data.map((token, i) => {
        return {
            rank: '#' + (i + 1),
            ...token
        }
    })

    // Define columns for SortableTable
    const columns = [
        //   {className: 'w-40', key: 'rank', sortable: false, label: 'Rank Name', align: 'left'},
        {
            key: 'token',
            label: 'Rank Name',
            sortable: false,
            align: 'left',
            className: 'pl-0 text-sm',
            render: row => (
                <div className={classes.poolName}>
                    <span style={{ width: '2rem' }}>{row.rank}</span>
                    <Avatar src={row.image} className={classes.tokenImageSingle}>
                        {row.symbol[0]}
                    </Avatar>
                    {row.symbol}
                </div>
            )
        },
        {
            className: 'pr-0 text-sm',
            key: 'price',
            label: 'Price & Gains(7d)',
            align: 'right',
            render: row => {
                const price = formatNumber(row.price, 2, 10)
                return (
                    <>
                        {price === '0.00' ? '< $0.00001 USD' : '$' + price + ' USD'}
                        <div style={{ color: parseFloat(row.grow) >= 0 ? 'rgb(102, 237, 102)' : 'rgb(255, 185, 185)' }}>
                            {parseFloat(row.grow) ? row.grow + '%' : '-'}
                        </div>
                    </>
                )
            }
        },
        {
            className: 'pr-0 text-sm',
            key: 'volume7d',
            label: 'Volume(7d)',
            align: 'right',
            render: row => {
                return <div className={'pr-6'}>{abbrNum(row.volume7d)}</div>
            }
        },
        {
            key: 'actions',
            sortable: false,
            label: '',
            align: 'right',
            render: row => {
                return (
                    <div className="TblActions">
                        <Link className={'hover:underline'} href={`/swap?outputCurrency=${row.id}`}>
                            Swap
                        </Link>
                    </div>
                )
            }
        }
    ]

    return (
        <SortableTable
            orderBy={props.orderBy ? props.orderBy : null}
            design={null}
            columns={columns}
            rows={rows}
            title=""
            rowsPerPage={5}
            loading={props.data.length == 0}
            page={0}
            hide_pagination={true}
        />
    )
}

export default function Home() {
    let { chainId, account } = useActiveWeb3React()
    chainId = getChainId(chainId)
    const topTokens = useTopTokens()
    const newTokens = useTopTokens('timestamp')

    // analytics-related data manipulation
    const analyticsLiq = useLiquidityAnalytics()
    const analyticsVol = useVolumeAnalytics()

    // scales for 3 top tokens, 4-5 for ecosystem charts
    const [scales, setScales] = useState([30, 30, 30, 30, 30])

    const setScale = (scale: number, index: number) => {
        const newScales = [...scales]
        newScales[index] = scale
        setScales(newScales)

        // for top 3 tokens
        if (index < 3) {
            // first 3 are legacy but let's keep reserved
        }
        if (index == 3) analyticsLiq.fetchData({ scale })
        if (index == 4) analyticsVol.fetchData({ scale })
    }

    let popularTokens: { [key: string]: any }[] = []
    let launchedTokens: { [key: string]: any }[] = []

    const prepareToken = (token, index) => {
        const item = { ...token, index }
        item.image = getTokenLogoURL(token.id, chainId)
        item.volume7d = token.dayData.map(t => parseFloat(t.volumeUSD)).reduce((partialSum, a) => partialSum + a, 0)

        if (item.dayData && item.dayData[0]) {
            item.grow = (token.dayData[token.dayData.length - 1].priceUSD == '0'
                ? 0
                : ((token.dayData[0].priceUSD - token.dayData[token.dayData.length - 1].priceUSD) * 100) /
                  token.dayData[token.dayData.length - 1].priceUSD
            ).toFixed(2)
            item.price = parseFloat(token.dayData[0].priceUSD)
        } else {
            item.price = 0
            item.grow = 0
        }

        return item
    }

    if (topTokens.data && topTokens.data.length) {
        popularTokens = topTokens.data.map((token: { [key: string]: any }, index) => prepareToken(token, index))
    }

    if (newTokens.data && newTokens.data.length) {
        launchedTokens = newTokens.data.map((token: { [key: string]: any }, index) => prepareToken(token, index))
    }

    return (
        <div className="max-w-full w-full h-full">
            <div className="my-auto">
                <div className="row">
                    {/* <div className="col-12 col-md-12 col-lg-12">
                        <div className="card_styles">
                            <CardWrapper>
                                <BackgroundDiv
                                    className="hidden md:block"
                                    style={{ backgroundImage: `url(/images/desktop.jpg)` }}
                                />
                                <BackgroundDiv
                                    className="block md:hidden"
                                    style={{ backgroundImage: `url(/images/bannerM.jpeg)` }}
                                />
                                <CardHeaderRight style={{ position: 'absolute', width: '100%', bottom: '0.2rem' }}>
                                    <Button href={'/create/'} disabled={false} className="hover:opacity-80">
                                        Add your tokens
                                    </Button>
                                </CardHeaderRight>
                            </CardWrapper>
                        </div>
                    </div> */}

                    {/* <div className="col-12 col-md-12 col-lg-12">
                        <div className="card_styles">
                            <CardWrapper type='big'>
                                <CardHeader>
                                        <Column>
                                            <CardHeading dir='reverse'>
                                                <span>My Portfolio</span>
                                                <Chip type="up">↑ 1.4%</Chip>
                                                <Chip type="down">↓ 1.4%</Chip>
                                            </CardHeading>
                                        </Column>
                                </CardHeader>
                            </CardWrapper>
                        </div>
                    </div> */}

                    {/* {account && chainId == ChainId.MAINNET ? (
                        <div className={'px-4 w-full mt-4'}>
                            <StakingRewards />
                        </div>
                    ) : null} */}

                    <div className="col-12 col-md-12 col-lg-12 grid">
                        <CardHeading justify="between">
                            <span className="md:hidden block">Trending</span>
                            <span className="hidden md:block">Trending Trades</span>
                            <InlineLink className="text" href="/tokens">
                                Explore Tokens
                            </InlineLink>
                        </CardHeading>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ChartToken position={0} />
                            <ChartToken position={1} />
                            <ChartToken position={2} />
                        </div>
                    </div>

                    <div className="col-12 col-md-12 col-lg-12">
                        <div className={'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                            <div>
                                <div className="card_styles">
                                    <CardWrapper type="big" content="small_table">
                                        <CardHeader>
                                            <CardHeading pt-0 justify="between">
                                                <span>
                                                    {(chainId && chainId == ChainId.MAINNET) ||
                                                    !chainId ||
                                                    (chainId != ChainId.PUPPYNET && chainId != ChainId.SHIBARIUM && chainId != ChainId.RSK_TESTNET)
                                                        ? 'Top Tokens'
                                                        : 'Recently Created'}
                                                </span>
                                                <TextLink href="/tokens">View All</TextLink>
                                            </CardHeading>

                                            <TokensTable data={popularTokens} />
                                        </CardHeader>
                                    </CardWrapper>
                                </div>
                            </div>

                            <div>
                                <div className="card_styles">
                                    <CardWrapper type="big" content="small_table">
                                        <CardHeader>
                                            <Column>
                                                <CardHeading justify="between">
                                                    <span>Trending Tokens</span>
                                                    <TextLink className="hover:underline" href="/tokens">
                                                        View All
                                                    </TextLink>
                                                </CardHeading>
                                                <TokensTable orderBy="grow" data={launchedTokens} />
                                            </Column>
                                            {/* <Button href={'/pool'} disabled={false}>Add your tokens</Button> */}
                                        </CardHeader>
                                    </CardWrapper>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', marginTop: '2rem', marginBottom: '1.5rem' }}>
                            <CardHeading justify="between">
                                <span>Ecosystem Defi Stats</span>
                            </CardHeading>
                        </div>

                        <div className={'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                            <div>
                                <div className="card_styles">
                                    <CardWrapper type="big" content="small_table">
                                        <CardHeader>
                                            <Column>
                                                <CardHeading pt-0 justify="between">
                                                    <span>
                                                        {analyticsLiq.data.value
                                                            ? abbrNum(analyticsLiq.data.value)
                                                            : '0'}
                                                    </span>
                                                    <FixedSubtitle>Total Value Locked</FixedSubtitle>
                                                </CardHeading>
                                                <Block
                                                    style={{
                                                        height: '40px',
                                                        width: '100%',
                                                        marginTop: '-2rem',
                                                        marginBottom: '2rem'
                                                    }}
                                                >
                                                    <Scale
                                                        value={scales[3]}
                                                        setScale={scale => {
                                                            setScale(scale, 3)
                                                        }}
                                                        size={'medium'}
                                                    />
                                                </Block>
                                                <div style={{ aspectRatio: '4/2' }} className={'w-full'}>
                                                    {analyticsLiq.data.chart && (
                                                        <LineChart
                                                            scale={scales[3]}
                                                            data={analyticsLiq.data}
                                                            type="line"
                                                        />
                                                    )}
                                                </div>
                                            </Column>
                                        </CardHeader>
                                    </CardWrapper>
                                </div>
                            </div>

                            <div>
                                <div className="card_styles">
                                    <CardWrapper type="big" content="small_table">
                                        <CardHeader>
                                            <Column>
                                                <CardHeading pt-0 justify="between">
                                                    <span>
                                                        {analyticsVol.data.value
                                                            ? abbrNum(analyticsVol.data.value)
                                                            : '0'}
                                                    </span>
                                                    <FixedSubtitle>Trading Volume</FixedSubtitle>
                                                </CardHeading>

                                                <Block
                                                    style={{
                                                        height: '40px',
                                                        width: '100%',
                                                        marginTop: '-2rem',
                                                        marginBottom: '2rem'
                                                    }}
                                                >
                                                    <Scale
                                                        value={scales[4]}
                                                        setScale={scale => {
                                                            setScale(scale, 4)
                                                        }}
                                                        size={'medium'}
                                                    />
                                                </Block>
                                                <div style={{ aspectRatio: '4/2' }} className={'w-full'}>
                                                    {analyticsVol.data.chart && (
                                                        <LineChart
                                                            scale={scales[4]}
                                                            data={analyticsVol.data}
                                                            type="bars"
                                                        />
                                                    )}
                                                </div>
                                            </Column>

                                            {/* <Button href={'/pool'} disabled={false}>Add your tokens</Button> */}
                                        </CardHeader>
                                    </CardWrapper>
                                </div>
                            </div>
                        </div>
                        <br />
                        <ShibTable
                            chain_id={
                                chainId === ChainId.MAINNET ||
                                chainId === ChainId.PUPPYNET ||
                                chainId === ChainId.RSK_TESTNET ||
                                chainId === ChainId.BSC_TESTNET ||
                                chainId === ChainId.SHIBARIUM
                                    ? chainId
                                    : ChainId.MAINNET
                            }
                        />
                    </div>

                    {/* {chainId != 157 && <div></div>} */}
                </div>
            </div>
        </div>
    )
}
