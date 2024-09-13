'use client'
import React, { ReactNode, useEffect, useState } from 'react'

import graphAPIEndpoints from 'src/constants/subgraphs'
import { getTokenLogoURL } from '../CurrencyLogo'
import { graphEndpoint } from 'src/functions'
import { abbrNum } from 'src/utils/numbers'
import { getExplorerLink } from 'src/utils'

import styled from 'styled-components'

import { useLiquidityAnalytics, useVolumeAnalytics } from 'src/hooks/useTokensData'
import { useDerivedMintInfo } from 'src/state/mint/hooks'
import { useTokenBalance } from 'src/state/wallet/hooks'
import { useTotalSupply } from 'src/data/TotalSupply'
import { useCurrency } from 'src/hooks/Tokens'
import { useActiveWeb3React } from 'src/hooks'
import { useRouter } from 'next/navigation'

import { getPairData, IPairData } from 'src/apollo/getPairs'
import { NETWORK_ICON } from 'src/constants/networks'
import { Field } from '../../state/mint/actions'
import { CHAINS } from 'src/constants/Chains'
import { JSBI, Pair } from '@gocheto-dex/sdk'

import { ExternalLink as LinkIcon } from 'react-feather'
import TokenQuantity from '../atoms/TokenQuantity'
import QuestionLogo from '../atoms/QuestionLogo'
import { BackIcon } from '../../assets/icons'
import LineChart from '../Chart/LineChartJS'
import { Avatar } from '@material-ui/core'
import Tabs from '../molecules/Tabs'
import { StatsPairs } from './Pool'
import Scale from '../Chart/Scale'
import Image from 'next/image'
import Link from 'next/link'

{/** Components styled */}
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
export const Column = styled.div`
    display: flex;
    flex-direction: column;
    padding-right: 0.3rem;
`

export const FixedSubtitle = styled.span`
    position: absolute;
    top: 2.2rem;
    font-size: 0.9rem;
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

const PoolLayout = (
  {
    currencyIdA,
    currencyIdB,
    pair,
    children
  }: {
    currencyIdA?: string;
    currencyIdB?: string;
    pair?: Pair;
    children: ReactNode ;
  }) => {
  const router = useRouter()
  const analyticsLiq = useLiquidityAnalytics()
  const analyticsVol = useVolumeAnalytics()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  const { account, chainId } = useActiveWeb3React()
  const [totalTVL, setTotalTVL] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0)
  const [fees, setFees] = useState<number>(0)

    const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)
    const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

    const [token0Deposited, token1Deposited] =
        !!pair &&
        !!totalPoolTokens &&
        !!userPoolBalance &&
        // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
        JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
            ? [
                  pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
                  pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
              ]
            : [undefined, undefined]


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

    const { currencies } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
    
    
    useEffect(() => {
      const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

      const fetchData = async (params: IPairData) => {
        const fetchRes = await Promise.resolve(
          getPairData(
            {
              token0: params.token0,
              token1: params.token1
            },
            EXCHANGE_URI,
            chainId
          )
        )
        setTotalTVL(fetchRes?.[0]?.reserveUSD ?? 0)
        setVolume(fetchRes?.[0]?.volume24Hr ?? 0)
        setFees(fetchRes?.[0]?.fees * 0.003 ?? 0)
      }

      if (currencyA && currencyB) {
        fetchData({ token0: currencyIdA!, token1: currencyIdB! })
      }
    }, [currencyA, currencyB, chainId, currencyIdA, currencyIdB])


  return (
    <main className={'w-full flex flex-col gap-6 main-container-section px-4 pt-6 md:pt-0 pb-10'}>
      
      <section className='w-full rounded-xl flex items-center justify-between'>
        {/** Back button & tokens */}
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.back()}
            className={'outline-none border-0 bg-transparent text-gray-50'}
          >
            <BackIcon width={20} height={20} />
          </button>
          <div className='flex items-center gap-3'>
            {/** Icons */}
            <div className={'flex items-center'}>
              {currencies[Field.CURRENCY_A]?.symbol
                ? <Avatar src={getTokenLogoURL(currencyIdA ?? '', chainId)} className={'bg-white text-gray-800 text-center h-8 w-8'}>
                      {currencies[Field.CURRENCY_A]?.symbol}
                  </Avatar>
                : <div className='-ml-4'><QuestionLogo /></div>
              }
              {currencies[Field.CURRENCY_B]?.symbol
                ? <Avatar src={getTokenLogoURL(currencyIdB ?? '', chainId)} className={'-ml-4 bg-white text-gray-800 text-center h-8 w-8'}>
                      {currencies[Field.CURRENCY_B]?.symbol}
                  </Avatar>
                : <div className='-ml-4'><QuestionLogo /></div>
              }
          </div>
            {/** Tokens */}
            <span className={'text-white font-medium'}>{currencies[Field.CURRENCY_A]?.symbol ?? '-'}/{currencies[Field.CURRENCY_B]?.symbol ?? '-'}</span>
          </div>
        </div>
        {/** Tabs */}
        <Tabs
          tabs={
            [ 
              { label: 'Add Liquidity', href: `/newpool/${currencyIdA}/${currencyIdB}` },
              { label: 'Remove Liquidity', href: `/newremove/${currencyIdA}/${currencyIdB}` },
              { label: 'Claim Rewards', href: `/newclaim/${currencyIdA}/${currencyIdB}` }
            ]
          }
        />
      </section>

      {/** Pair stats boxes */}
      <StatsPairs
        dedicatedPool
        tvl={totalTVL}
        volume24h={volume}
        fees7d={fees}
      />

      {/** Pool section */}
      <section className={'flex flex-col gap-4 md:grid grid-cols-5 xl:grid-cols-4'}>
        <div className={'col-span-3'}>
          {children}
        </div>

        {/** Second colums */}
        <div
          className={'rounded-2xl col-span-2 xl:col-span-1 flex flex-col gap-3'}
        >
          {/** Available liquidity - Claim rewards */}
          <article style={{ backgroundColor: `#222540` }} className={'p-4 rounded-xl flex flex-col gap-2'}>
            <div className={'flex items-center justify-between text-white text-base'}>
              <p className={'font-medium'}>Available Liquidity</p>
              {/*<span>0.00$</span>*/}
            </div>
            {/** Tokens */}
            <div style={{ backgroundColor: '#191B27' }} className={'py-4 px-3 rounded-xl flex flex-col gap-4'}>
              
              <TokenQuantity
                symbol={currencies[Field.CURRENCY_A]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_A] ? currencyIdA : undefined}
                chainId={chainId}
              />

              <TokenQuantity
                symbol={currencies[Field.CURRENCY_B]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_B] ? currencyIdB : undefined}
                chainId={chainId}
              />

            </div>
            {/** Provided Liquidity */}
            <div className={'flex items-center justify-between text-white text-base'}>
              <p className={'font-medium'}>Provided Liquidity</p>
              {/*<span>0.00$</span>*/}
            </div>
            {/** Tokens */}
            <div style={{ backgroundColor: '#191B27' }} className={'py-4 px-3 rounded-xl flex flex-col gap-4'}>
              
              <TokenQuantity
                symbol={currencies[Field.CURRENCY_A]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_A] ? currencyIdA : undefined}
                chainId={chainId}
              />

              <TokenQuantity
                symbol={currencies[Field.CURRENCY_B]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_B] ? currencyIdB : undefined}
                chainId={chainId}
              />

            </div>

            {/** Unclaimed rewards */}
            <div className={'flex items-center justify-between text-white text-base'}>
              <p className={'font-medium'}>Unclaimed Rewards</p>
              {/*<span>0.00$</span>*/}
            </div>
            {/** Tokens */}
            <div style={{ backgroundColor: '#191B27' }} className={'py-4 px-3 rounded-xl flex flex-col gap-4'}>
              
              <TokenQuantity
                symbol={currencies[Field.CURRENCY_A]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_A] ? currencyIdA : undefined}
                chainId={chainId}
              />

              <TokenQuantity
                symbol={currencies[Field.CURRENCY_B]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_B] ? currencyIdB : undefined}
                chainId={chainId}
              />

            </div>
            <Link style={{ backgroundColor: '#FF7A1C' }} href='/yield' className='py-1.5 px-2 text-center w-full rounded-md text-white text-lg font-semibold inline-block mt-2'>Claim Rewards</Link>
          </article>
          {/** Pool liquidity info */}
          <article style={{ backgroundColor: `#222540` }} className={'p-4 rounded-xl space-y-2'}>
            <p className={'text-base text-white font-medium'}>Pool Liquidity Info</p>
            <div style={{ backgroundColor: '#191B27' }} className={'py-4 px-3 rounded-xl flex flex-col gap-4'}>
              <div className={'flex items-center w-full justify-between'}>
                <p className={'text-white font-medium'}>Total Liquidity</p>
                <span>{abbrNum(totalTVL)}</span>
              </div>
              
              <TokenQuantity
                symbol={currencies[Field.CURRENCY_A]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_A] ? currencyIdA : undefined}
                chainId={chainId}
              />

              <TokenQuantity
                symbol={currencies[Field.CURRENCY_B]?.symbol ?? ''}
                quantity={token0Deposited?.toSignificant(4) ?? '-'}
                address={currencies[Field.CURRENCY_B] ? currencyIdB : undefined}
                chainId={chainId}
              />
              
            </div>

            <div style={{ backgroundColor: '#141824' }} className={'py-4 px-3 rounded-xl grid grid-cols-2 gap-x-2 gap-y-4'}>
              <div className={'flex flex-col gap-1'}>
                <h6 className={'font-normal'}>Network</h6>
                <span className={'align-middle font-semibold flex items-center gap-2 text-sm'}>
                  <Image width={24} height={24} src={NETWORK_ICON[chainId || 1]} alt="Network icon" className={`w-7 ${chainId === 109 || chainId == 157 ? '' : 'h-5 rounded-full'}`} />
                  {CHAINS[chainId || 1]?.chainName ?? ''}
                </span>
              </div>

              <div className={'flex flex-col gap-1'}>
                <h6 className={'font-normal'}>{currencies[Field.CURRENCY_A]?.symbol ?? ''} Address</h6>
                <Link className={'flex items-center font-semibold gap-2 text-white hover:underline'} target='_blank' href={getExplorerLink(chainId ?? 1, currencyIdA ?? '', 'token')}>
                  {currencyIdA?.slice(0, 6) + '...'}
                  <LinkIcon size={16} />
                </Link>
              </div>

              <div className={'flex flex-col gap-1'}>
                <h6 className={'font-normal'}>Total Transactions</h6>
                <span>1023</span>
              </div>

              <div className={'flex flex-col gap-1'}>
                <h6 className={'font-normal'}>{currencies[Field.CURRENCY_B]?.symbol ?? ''} Address</h6>
                <Link className={'flex items-center font-semibold gap-2 text-white hover:underline'} target='_blank' href={getExplorerLink(chainId ?? 1, currencyIdB ?? '', 'token')}>
                  {currencyIdB?.slice(0, 6) + '...'}
                  <LinkIcon size={16} />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/** Ecosystem graphs */}
      <section>
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
      </section>

    </main>
  )
}

export default PoolLayout