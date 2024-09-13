'use client'
import React, { useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { useActiveWeb3React } from '../../hooks'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import { LineChartSVG } from '../../components/Chart/LineChartSvg'
import { useHomeTopTokens } from '../../hooks/useTokensData'
import { getTokenLogoURL } from '../CurrencyLogo/index'
import { formatNumber, abbrNum } from '../../utils/numbers'
import Scale from '../Chart/Scale'
import { ChainId } from '@gocheto-dex/sdk'
import Skeleton from '../../components/Skeletons/Skeleton'
import { getChainId } from '../../utils/getDefaultChainId'


// Define the styles for your table
const useStyles = makeStyles(theme => ({
    tokenImageSingle: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        background: '#fff',
        marginRight: '0.6rem'
    },
    tokenImage: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        background: '#fff'
    },
    secondImage: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginLeft: '-0.5rem !important',
        marginRight: '0.6rem',
        background: '#fff'
    },
    poolName: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center'
    }
}))

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
    `}
`

const CardWrapper = styled.div<{ type?: string; content?: string }>`
    width: 100%;
    height: auto;
    min-height: 16rem;
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
    padding-right: 1rem;
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
    @media (max-width: 800px) {
        ${props =>
            props.type == 'footer'
                ? `
            font-size: 1rem;
        `
                : `font-size: 1.3rem;`}
        > .top_subtitle {
            top: 0.15rem;
            left: 50px;
            font-size: 0.6em;
            color: #E5E5E5;
        }
        > .main_title {
            position: absolute;
            top: 1.6rem;
            left: 50px;
            font-size:1.3rem;
        }
        > .right_title {
            font-size: 1.4rem !important;
            font-weight: 400;
        }
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
    width: auto;
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
    bottom: 1rem;
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

export default function ChartToken({ position = 0 }) {
    const { chainId } = useActiveWeb3React()
    const [scale, setScales] = useState(30)
    const chartToken = useHomeTopTokens(position, scale)

    const setScale = (scale: number) => {
        setScales(scale)
        chartToken.fetchData(position, scale)
    }

    let topToken: { [key: string]: any }[] = []

    if (chartToken.data && chartToken.data.length) {
        topToken = chartToken.data.map((token: { [key: string]: any }, index) => {
            const item = { ...token }
            item.index = index
            item.image = getTokenLogoURL(token.id, getChainId(chainId))
            // item.chart = [...token.dayData]
            // item.chart = item.chart.reverse()

            item.grow =
                ((token.dayData[0].priceUSD - token.dayData[token.dayData.length - 1].priceUSD) * 100) /
                token.dayData[0].priceUSD

            if (item.grow == -Infinity) item.grow = 100
            if (item.grow.toFixed(2) == '-0.00') item.grow = 0

            item.sells = item.dayData
                .map(t => parseFloat(t.selltxn ? t.selltxn : 0))
                .reduce((partialSum, a) => partialSum + a, 0)
            item.buys = item.dayData
                .map(t => parseFloat(t.buytxn ? t.buytxn : 0))
                .reduce((partialSum, a) => partialSum + a, 0)

            item.sellRatio = item.sells && item.buys ? (item.sells * 100) / (item.buys + item.sells) : 0

            item.price = parseFloat(token.dayData[0].priceUSD)
            item.txs = token.dayData
                .map(t => (t.txCount ? parseInt(t.txCount) : 0))
                .reduce((partialSum, a) => partialSum + a, 0)

            return item
        })
    }

    return topToken[0] ? (
        <div>
            <div className="card_styles">
                <CardWrapper type="big">
                    <CardHeader>
                        <CardHeading pt-0 justify="between">
                            <Avatar src={topToken[0].image}>{topToken[0].symbol[0]}</Avatar>
                            <span className="top_subtitle">{topToken[0].symbol}</span>
                            <span className="main_title">${formatNumber(parseFloat(topToken[0].price), 2, 10)}</span>
                            <span className="right_title">
                                {topToken[0].grow + '' == 'NaN'
                                    ? '-'
                                    : parseFloat(topToken[0].grow)
                                    ? topToken[0].grow.toFixed(2) + '%'
                                    : '-'}
                            </span>
                            {/* <TextLink>View All</TextLink> */}
                        </CardHeading>

                        <div
                            style={{
                                width: '100%',
                                height: 'auto',
                                marginTop: '1rem',
                                marginBottom: '0.5rem',
                                position: 'relative'
                            }}
                        >
                            <LineChartSVG data={topToken[0].dayData.map(t => t.priceUSD).reverse()} />
                            {/* <LineChart data={topToken[0]} scale={scale} type="line-basic" /> */}
                            <Block style={{ height: '40px', width: '100%', marginTop: '1rem' }}>
                                <Scale
                                    value={scale}
                                    setScale={scale => {
                                        setScale(scale)
                                    }}
                                    size={'small'}
                                />
                            </Block>
                        </div>

                        <CardHeading justify="between">
                            <span>{abbrNum(topToken[0].txs)} Swaps</span>
                            <InlineLink className="inline_yellow" href={'/swap?outputCurrency=' + topToken[0].id}>
                                Swap
                            </InlineLink>
                        </CardHeading>
                        {chainId && chainId != ChainId.MAINNET && (
                            <>
                                <BuySellLine>
                                    <div
                                        className="buy"
                                        style={{
                                            width: (topToken[0].sellRatio ? 100 - topToken[0].sellRatio : 50) + '%'
                                        }}
                                    ></div>
                                    <div
                                        className="sell"
                                        style={{
                                            width: (topToken[0].sellRatio ? topToken[0].sellRatio : 50) + '%'
                                        }}
                                    ></div>
                                </BuySellLine>

                                <CardHeading pt-0 justify="between" type="footer">
                                    <span>Buy</span>
                                    <span>VS</span>
                                    <span>Sell</span>
                                </CardHeading>
                            </>
                        )}
                    </CardHeader>
                </CardWrapper>
            </div>
        </div>
    ) : (
        <Skeleton
            style={{ aspectRatio: '3/2' }}
            width="100%"
            height="auto"
            borderRadius="1.5rem"
            margin="0"
            className={'aspect-[2/3]'}
        />
    )
}
