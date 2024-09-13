'use client'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'
import { ChainId, JSBI, Pair, SHIBASWAP_FACTORY_ADDRESS } from '@gocheto-dex/sdk'
import Link from 'next/link'
import styled, { ThemeContext } from 'styled-components'
import Card from '../../Card'
import FullPositionCard from '../../PositionCard'
import { Dots } from '../../swap/styleds'
import { BIG_INT_ZERO } from '../../../constants'
import { useUserHasLiquidityInAllTokens } from '../../../data/V1'
import { useActiveWeb3React } from '../../../hooks'
import { useStakingInfo } from '../../../state/stake/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../../state/user/hooks'
import { useTokenBalancesWithLoadingIndicator } from '../../../state/wallet/hooks'
import { TYPE } from '../../../theme'
import { Add, ErrorOutline } from '@material-ui/icons'
import { usePairs as usePair } from '../../../hooks/useTokensData'
import { usePairs } from '../../../data/Reserves'
import { MouseoverTooltip } from '../../Tooltip'
import { ShibTable } from '../Home'
import { UserPairsProvider } from '../../../contexts/userPairsContext'
import { shibaExchange } from '../../../apollo/client'
import { ETH_PRICE, FACTORY_QUERY } from '../../../apollo/queries'
import graphAPIEndpoints from '../../../constants/subgraphs'
import { graphEndpoint } from '../../../functions'
import usePrices from '../../../hooks/usePrices'
import { formattedNum } from '../../../utils'

const EmptyProposals = styled.div`
    gap: 12px;
    padding: 16px 12px;
    border-radius: ${({ theme }) => theme.borderRadius};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const CardWrapper = styled.div<{ type?: string; content?: string }>`
    width: 100%;
    height: auto;
    min-height: 16rem;
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


export default function Pool() {
    return (
        <UserPairsProvider>
            <PoolPage />
        </UserPairsProvider>
    )
}

interface IStatsPairs {
    volume24h?: number
    tvl?: number
    fees7d?: number
    dedicatedPool?: boolean
}

export const StatsPairs: FC<IStatsPairs> = ({ volume24h, tvl, fees7d, dedicatedPool = false }) => {
    const [totalTVL, setTotalTVL] = useState<number>(0)
    const [volume, setVolume] = useState<number>(0)
    const [fees, setFees] = useState<number>(0)
    const { fetchTVL, fetchTotalVolumeUSD, fetchSevenDayVolumeUSD } = usePrices()

    useEffect(() => {
        if (dedicatedPool) {
            setTotalTVL(tvl || 0)
            setVolume(volume24h || 0)
            setFees(fees7d || 0)
        } else {
            fetchTVL().then(liqDay => {
                setTotalTVL(Number(liqDay?.liquidityUSD))
            })
            fetchTotalVolumeUSD().then(volumeUSD => {
                volumeUSD && setVolume(Number(volumeUSD))
            })
            fetchSevenDayVolumeUSD().then(volume => {
                volume && setFees(volume * 0.003)
            })
        }
    }, [fetchTVL, fetchTotalVolumeUSD, fetchSevenDayVolumeUSD, dedicatedPool, tvl, volume24h, fees7d])

    return (
        <div className={'w-full max-w-none grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4 md:mt-0'}>
            <div style={{ backgroundColor: '#222540' }} className={'p-6 rounded-2xl flex gap-4 flex-col'}>
                <div className={'flex w-full justify-between items-center'}>
                    <span>TVL</span>
                    <span>
                        <MouseoverTooltip text="Total Value Locked (TVL) represents the total value of assets locked in liquidity pools. TVL reflects the depth and market capacity of the pool, crucial for assessing liquidity and potential performance">
                            <ErrorOutline />
                        </MouseoverTooltip>
                    </span>
                </div>
                <p>{formattedNum(totalTVL)} USD</p>
            </div>

            <div style={{ backgroundColor: '#222540' }} className={'p-6 rounded-2xl flex gap-4 flex-col'}>
                <div className={'flex w-full justify-between items-center'}>
                    <span>Volume(24h)</span>
                    <span>
                        <MouseoverTooltip text="Volume (24h) refers to the total trading volume in liquidity pools over the past 24 hours. This metric indicates the level of activity and liquidity in the pool within a day, helping traders assess market trends and liquidity levels.">
                            <ErrorOutline />
                        </MouseoverTooltip>
                    </span>
                </div>
                <p>{formattedNum(volume)} USD</p>
            </div>

            <div style={{ backgroundColor: '#222540' }} className={'p-6 rounded-2xl flex gap-4 flex-col'}>
                <div className={'flex w-full justify-between items-center'}>
                    <span>Fees(7d)</span>
                    <span>
                        <MouseoverTooltip
                            className="border-0"
                            text="Fees represent the total transaction fees earned by liquidity providers in pools. These fees are generated from trades and contribute to the rewards earned by participants. Understanding fee levels helps assess the potential earnings and attractiveness of the pool."
                        >
                            <ErrorOutline />
                        </MouseoverTooltip>
                    </span>
                </div>
                <p>{formattedNum(fees)} USD</p>
            </div>
        </div>
    )
}

function PoolPage() {
    const theme = useContext(ThemeContext)
    const { account, chainId } = useActiveWeb3React()
    const pairs = usePair()
    const [ethPrice, setEthPrice] = useState<number | null>()
    const pairsCount: string | number =
        pairs.data && pairs.data.factories && pairs.data.factories.length ? pairs.data.factories[0].pairCount : 0

    // fetch the user's balances of all tracked V2 LP tokens
    const trackedTokenPairs = useTrackedTokenPairs()
    console.log(trackedTokenPairs);
    const tokenPairsWithLiquidityTokens = useMemo(
        () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
        [trackedTokenPairs]
    )

    const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
        tokenPairsWithLiquidityTokens
    ])
    const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
        account ?? undefined,
        liquidityTokens
    )

    // fetch the reserves for all V2 pools in which the user has a balance
    const liquidityTokensWithBalances = useMemo(
        () =>
            tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
                v2PairsBalances[liquidityToken.address]?.greaterThan('0')
            ),
        [tokenPairsWithLiquidityTokens, v2PairsBalances]
    )

    const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
    const v2IsLoading =
        fetchingV2PairBalances ||
        v2Pairs?.length < liquidityTokensWithBalances.length ||
        v2Pairs?.some(V2Pair => !V2Pair)

    const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

    const hasV1Liquidity = useUserHasLiquidityInAllTokens()

    // show liquidity even if its deposited in rewards contract
    const stakingInfo = useStakingInfo()
    const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
    const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

    // remove any pairs that also are included in pairs with stake in mining pool
    const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
        return (
            stakingPairs
                ?.map(stakingPair => stakingPair[1])
                .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length ===
            0
        )
    })

    useEffect(() => {
        const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)
        const fetchEthPrice = async () => {
            const ethPriceQ = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: ETH_PRICE()
                })
            )
            setEthPrice(ethPriceQ.data.bundles[0].ethPrice)
        }

        fetchEthPrice()
    }, [chainId])

    return (
        <>
            <div className='px-4 w-full'>
                <StatsPairs />
            </div>

            <div className={'py-4 flex items-start md:items-center justify-between w-full px-4 gap-2 flex-col md:flex-row'}>
                <h3 className={'text-2xl font-semibold'}>My Liquidity Pools</h3>
                <div className={'flex flex-col w-full md:w-auto sm:flex-row items-center gap-4'}>
                    {/* {account && chainId === ChainId.MAINNET ? <Link href={'/yield'} style={{ borderColor: '#FF7A1C' }} className={'text-white text-center w-full inline-block sm:w-auto text-lg font-semibold py-2 px-6 border rounded-lg hover:bg-gray-800'}>Collect Rewards</Link> : null} */}
                    <Link href={'/create/ETH'} style={{ backgroundColor: '#FF7A1C', borderColor: '#FF7A1C' }} className={'text-white text-center w-full inline-block sm:w-auto rounded-lg border py-2 px-6 text-lg font-semibold hover:opacity-90'}>Create Pool <Add /></Link>
                </div>
            </div>
            <div className={'w-full px-4 mb-6'}>
                {!account ? (
                    <Card padding="40px 40px 20px 40px">
                        <TYPE.body textAlign="center" className="text-gray-5000 text">
                            Connect to a wallet to view your liquidity.
                        </TYPE.body>
                    </Card>
                ) : v2IsLoading ? (
                    <EmptyProposals>
                        <TYPE.body textAlign="center" className="text-gray-5000 text">
                            <Dots>Loading</Dots>
                        </TYPE.body>
                    </EmptyProposals>
                ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
                    <>
                        {v2PairsWithoutStakedAmount.map((v2Pair, index) => (
                            <FullPositionCard
                                ethPrice={ethPrice ?? 0}
                                key={v2Pair.liquidityToken.address}
                                pair={v2Pair}
                                inRange={index%2 === 0}
                            />
                        ))}
                        {stakingPairs.map(
                            (stakingPair, i) =>
                                stakingPair[1] && ( // skip pairs that arent loaded
                                    <FullPositionCard
                                        ethPrice={ethPrice ?? 0}
                                        key={stakingInfosWithBalance[i].stakingRewardAddress}
                                        pair={stakingPair[1]}
                                        stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                                    />
                                )
                        )}
                    </>
                ) : (
                    <EmptyProposals className="mb-2">
                        <TYPE.body color={theme.text3} textAlign="center" fontWeight={800} className="text">
                            No liquidity found.
                        </TYPE.body>
                    </EmptyProposals>
                )}

                        <div className='mx-auto text-center'>
                            Don&apos;t see a pool you joined?
                                <Link
                                    id="import-pool-link font-bold"
                                    className="text ml-2"
                                    href={'/find'}
                                    style={{ color: '#FF7A1C' }}
                                >
                                    Import it.
                                </Link>
                            {/**
                <div className="mx-auto text-center">
                    Don&apos;t see a pool you joined?
                    <StyledInternalLink
                        id="import-pool-link font-bold"
                        className="text ml-2"
                        to={'/find'}
                        style={{ color: '#FF7A1C' }}
                    >
                        Import it.
                    </StyledInternalLink>
                    {/**
                             * 
                                {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                                <StyledInternalLink
                                    id="import-pool-link font-bold"
                                    className="text"
                                    href={hasV1Liquidity ? '/migrate/v1' : '/find'}
                                    style={{ color: '#FF7A1C' }}
                                >
                                    {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                                </StyledInternalLink>
                             */}
                </div>
            </div>

            <div className={'py-4 px-4 w-full'}>
                <CardWrapper type="table">
                    <ShibTable
                        count={pairsCount}
                        chain_id={
                            chainId === ChainId.MAINNET || chainId === ChainId.PUPPYNET || chainId === ChainId.BSC_TESTNET || chainId === ChainId.RSK_TESTNET || chainId === ChainId.SHIBARIUM
                                ? chainId
                                : ChainId.MAINNET
                        }
                        data={pairs}
                    />
                </CardWrapper>
            </div>
            {/*<PageWrapper className="dig-liquidity mb-auto my-auto relative">

                <BackButton defaultRoute="/" className="back_button -left-12 top-6" />
                <Alert
                    title="Liquidity provider rewards"
                    className="fetch-container text"
                    message={
                        <>
                            <span className="text-gray-5000 font-extrabold text">
                                Liquidity providers earn returns on trades proportional to their share of the pool.
                                Returns are added to the pool, accrue in real time and can be claimed by withdrawing
                                your liquidity
                            </span>
                        </>
                    }
                    type="information"
                />
                <AutoColumn gap="sm" justify="center">
                    <AutoColumn gap="md" style={{ width: '100%' }}>
                        <TitleRow style={{ marginTop: '1.8rem', marginBottom: '1.8rem' }} padding={'0'}>
                            <HideSmall>
                                <TYPE.mediumHeader
                                    className="text font-extrabold	"
                                    style={{ marginTop: '0.8rem', justifySelf: 'flex-start' }}
                                >
                                    Your liquidity
                                </TYPE.mediumHeader>
                            </HideSmall>
                            <ButtonRow className="Dig-button">
                                <Link
                                    className="text"
                                    href="/create/ETH"
                                    style={{
                                        fontSize: '1rem',
                                        backgroundColor: 'transparent',
                                        color: '#d5d5d5',
                                        borderRadius: '0.6rem',
                                        border: '#d5d5d5 2px solid',
                                        fontWeight: 'bold',
                                        padding: '0.5rem',
                                        paddingTop: '0.8rem',
                                        lineHeight: '10px',
                                        margin: 'auto',
                                        textAlign: 'center',
                                        width: '120px',
                                        height: '40px'
                                    }}
                                >
                                    Create a Pair
                                </Link>
                                <Link
                                    className="text add_liquidity"
                                    href="/add/ETH"
                                    style={{
                                        fontSize: '1rem',
                                        backgroundColor: '#d5d5d5',
                                        color: '#292c37',
                                        borderRadius: '0.6rem',
                                        fontWeight: 'bold',
                                        padding: '0.5rem',
                                        paddingTop: '0.8rem',
                                        lineHeight: '14px',
                                        margin: 'auto',
                                        textAlign: 'center',
                                        width: '120px',
                                        height: '40px',
                                        marginLeft: '1px'
                                    }}
                                >
                                    Add Liquidity
                                </Link>
                            </ButtonRow>
                        </TitleRow>

                        {!account ? (
                            <Card padding="40px">
                                <TYPE.body textAlign="center" className="text-gray-5000 text">
                                    Connect to a wallet to view your liquidity.
                                </TYPE.body>
                            </Card>
                        ) : v2IsLoading ? (
                            <EmptyProposals>
                                <TYPE.body textAlign="center" className="text-gray-5000 text">
                                    <Dots>Loading</Dots>
                                </TYPE.body>
                            </EmptyProposals>
                        ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
                            <>
                                {v2PairsWithoutStakedAmount.map(v2Pair => (
                                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                                ))}
                                {stakingPairs.map(
                                    (stakingPair, i) =>
                                        stakingPair[1] && ( // skip pairs that arent loaded
                                            <FullPositionCard
                                                key={stakingInfosWithBalance[i].stakingRewardAddress}
                                                pair={stakingPair[1]}
                                                stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                                            />
                                        )
                                )}
                            </>
                        ) : (
                            <EmptyProposals>
                                <TYPE.body color={theme.text3} textAlign="center" fontWeight={800} className="text">
                                    No liquidity found.
                                </TYPE.body>
                            </EmptyProposals>
                        )}

                        <AutoColumn justify={'center'} gap="xs">
                            <Text
                                textAlign="center"
                                fontSize={14}
                                style={{ padding: '.5rem 0 .5rem 0' }}
                                className="text font-bold"
                            >
                                {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                                <StyledInternalLink
                                    id="import-pool-link font-bold"
                                    className="text"
                                    href={hasV1Liquidity ? '/migrate/v1' : '/find'}
                                    style={{ color: '#ffb73c' }}
                                >
                                    {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                                </StyledInternalLink>
                            </Text>
                        </AutoColumn>
                    </AutoColumn>
                </AutoColumn>
            </PageWrapper> */}
        </>
    )
}
