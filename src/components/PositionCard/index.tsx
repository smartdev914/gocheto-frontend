import React, { CSSProperties, useEffect, useState } from 'react'
import { JSBI, Pair, Percent, TokenAmount } from '@gocheto-dex/sdk'
import { darken, transparentize } from 'polished'
import { Text } from 'rebass'
import styled from 'styled-components'
import { BIG_INT_ZERO } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import { ErrorOutline } from '@material-ui/icons'
import { MouseHoverTooltipInfo } from '../../components/Tooltip'
import { shibaExchange } from '../../apollo/client'
import { TOKEN_ETH } from '../../apollo/queries'
import { graphEndpoint } from '../../functions'
import graphAPIEndpoints from '../../constants/subgraphs'
import WithSkeleton from '../../components/Skeletons/WithSkeleton'
import Link from 'next/link'
import { Badge } from '../atoms/Badge'

export const FixedHeightRow = styled(RowBetween)`
    height: 24px;
`

export const HoverCard = styled(Card)`
    border: 1px solid transparent;
    :hover {
        border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
    }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  /* border: 1px solid ${({ theme }) => theme.text4}; */
  border: none;
  margin-bottom: 0.5rem;
  background: #222540;
  /* background: ${({ theme, bgColor }) =>
      `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.8, bgColor)} 0%, ${theme.bg3} 100%) `}; */
  position: relative;
  overflow: hidden;
`

interface PositionCardProps {
    pair: Pair
    showUnwrapped?: boolean
    border?: string
    ethPrice?: number
    inRange?: boolean
    className?: string
    style?: CSSProperties
    stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border, className, style }: PositionCardProps) {
    const { account, chainId } = useActiveWeb3React()

    const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
    const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

    const [showMore, setShowMore] = useState(false)

    const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
    const totalPoolTokens = useTotalSupply(pair.liquidityToken)

    const poolTokenPercentage =
        !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
            ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
            : undefined

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

    return (
        <>
            {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
                <GreyCard className={className} style={style} border={border}>
                    <AutoColumn gap="12px">
                        <FixedHeightRow>
                            <RowFixed>
                                <Text fontWeight={500} fontSize={16}>
                                    Your position
                                </Text>
                            </RowFixed>
                        </FixedHeightRow>
                        <FixedHeightRow className='flex-col sm:flex-row h-auto sm:h-24' onClick={() => setShowMore(!showMore)}>
                            <RowFixed>
                                <span className="mt-5">
                                <DoubleCurrencyLogo
                                    currency0={currency0}
                                    currency1={currency1}
                                    margin={true}
                                    size={30}
                                />
                                </span>
                                
                                <Text fontWeight={500} fontSize={20}>
                                    {currency0.getSymbol(chainId)}/{currency1.getSymbol(chainId)}
                                </Text>
                            </RowFixed>
                            <RowFixed>
                                <Text fontWeight={500} fontSize={20}>
                                    {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                                </Text>
                            </RowFixed>
                        </FixedHeightRow>
                        <AutoColumn gap="4px">
                            <FixedHeightRow>
                                <Text fontSize={16} fontWeight={500}>
                                    Your pool share:
                                </Text>
                                <Text fontSize={16} fontWeight={500}>
                                    {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                                </Text>
                            </FixedHeightRow>
                            <FixedHeightRow>
                                <Text fontSize={16} fontWeight={500}>
                                    {currency0.getSymbol(chainId)}:
                                </Text>
                                {token0Deposited ? (
                                    <RowFixed>
                                        <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                                            {token0Deposited?.toSignificant(6)}
                                        </Text>
                                    </RowFixed>
                                ) : (
                                    '-'
                                )}
                            </FixedHeightRow>
                            <FixedHeightRow>
                                <Text fontSize={16} fontWeight={500}>
                                    {currency1.getSymbol(chainId)}:
                                </Text>
                                {token1Deposited ? (
                                    <RowFixed>
                                        <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                                            {token1Deposited?.toSignificant(6)}
                                        </Text>
                                    </RowFixed>
                                ) : (
                                    '-'
                                )}
                            </FixedHeightRow>
                        </AutoColumn>
                    </AutoColumn>
                </GreyCard>
            ) : (
                <div></div>
                // <LightCard>
                //     <TYPE.subHeader style={{ textAlign: 'center' }}>
                //         <span role="img" aria-label="wizard-icon">
                //             ⭐️
                //         </span>{' '}
                //         By adding liquidity you&apos;ll earn 0.25% of all trades on this pair proportional to your share
                //         of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing
                //         your liquidity.
                //     </TYPE.subHeader>
                // </LightCard>
            )}
        </>
    )
}

export default function FullPositionCard({ pair, border, stakedBalance, ethPrice, inRange }: PositionCardProps) {
    const { account, chainId } = useActiveWeb3React()

    const currency0 = unwrappedToken(pair.token0)
    const currency1 = unwrappedToken(pair.token1)

    const [showMore, setShowMore] = useState(false)

    const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
    const totalPoolTokens = useTotalSupply(pair.liquidityToken)
    const [tvl, setTvl] = useState<number>(0);
    const [token0Price, setToken0Price] = useState<number>(0);
    const [token1Price, setToken1Price] = useState<number>(0);
    const [loadingPrices, setLoadingPrices] = useState<boolean>(true);

    const [userPoolBalance] = useState(stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance);
    const [poolTokenPercentage, setPoolTokenPercentage] = useState<Percent | undefined>(undefined);

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

    useEffect(() => {        
        if (!!pair && !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)) {
            setPoolTokenPercentage(new Percent(userPoolBalance.raw, totalPoolTokens.raw));
        }
    }, [pair, userPoolBalance]);
    
    useEffect(() => {
        const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

        const fetchTokensPrices = async () => {
            try {
                const token0Q = await Promise.resolve(
                    shibaExchange(EXCHANGE_URI).query({
                        query: TOKEN_ETH(pair.token0.address.toLowerCase())
                    })
                )
                const token1Q = await Promise.resolve(
                    shibaExchange(EXCHANGE_URI).query({
                        query: TOKEN_ETH(pair.token1.address.toLowerCase())
                    })
                )
    
                setToken0Price(parseFloat(ethPrice?.toString() ?? '0') * parseFloat(token0Q.data.tokens[0]?.derivedETH));
                setToken1Price(parseFloat(ethPrice?.toString() ?? '0') * parseFloat(token1Q.data.tokens[0]?.derivedETH));
                setTvl(token0Price * parseFloat(token0Deposited?.toSignificant(6) ?? '0') + token1Price * parseFloat(token1Deposited?.toSignificant(6) ?? '0'));
                setLoadingPrices(false);
            } catch (error) {
                console.log('Error fetching tokens prices', error);
                setLoadingPrices(false);
            }
            setLoadingPrices(false);
        }

        fetchTokensPrices();
    }, [token0Deposited, token1Deposited]);

    return (
        <StyledPositionCard className={'p-4'} border={border} bgColor={'#222540'}>
            <AutoColumn gap="12px">
                <div className={'w-full flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-0 m-0'}>
                    <AutoRow gap="4px">
                        <span style={{position:"relative",top:"10px"}}>
                            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
                        </span>
                        <Text fontWeight={300} color={'#FAFAFA'} fontSize={16}>
                            {!currency0 || !currency1 ? (
                                <Dots>Loading</Dots>
                            ) : (
                                `${pair.token0.symbol}/${pair.token1.symbol}`
                            )}
                        </Text>
                        <Text fontSize={16} color={'#FAFAFA'} fontWeight={300}>
                            {poolTokenPercentage
                                ? (poolTokenPercentage.toFixed(2) === '0.00'
                                    ? '<0.01'
                                    : poolTokenPercentage.toFixed(2)) + '%'
                                : '-'}
                        </Text>
                        <WithSkeleton skeletonConfig={{ width: '64px' }} loading={loadingPrices}>
                                <MouseHoverTooltipInfo
                                    text=''
                                    currency0={pair.token0}
                                    currency1={pair.token1}
                                    quantity0={
                                        tvl === 0
                                            ? `${parseFloat(token0Deposited?.toSignificant(6) ?? '0').toFixed(4)}`
                                            : `$${(token0Price * parseFloat(token0Deposited?.toSignificant(6) ?? '0')).toFixed(2)}`
                                        }
                                    quantity1={
                                        tvl === 0
                                            ? `${parseFloat(token1Deposited?.toSignificant(6) ?? '0').toFixed(4)}`
                                            : `$${(token1Price * parseFloat(token1Deposited?.toSignificant(6) ?? '0')).toFixed(2)}`
                                        }
                                    chainId={chainId}
                                >
                                    {tvl === 0
                                        ? ``
                                        : `$${tvl.toFixed(2)}`}
                                    {'  '}
                                    <ErrorOutline style={{ marginTop: '-5px' }} />
                                </MouseHoverTooltipInfo>
                        </WithSkeleton>
                        {inRange 
                          ? <Badge className={'text-sm'} type='success'>In Range</Badge>
                          : <Badge className={'text-sm'} type='danger'>Out of Range</Badge>
                        }
                        <span className={'flex items-center text-sm font-normal gap-1'}>
                          <span>Min:</span>
                          <p className={'font-semibold mr-2'}>0.23 {pair.token0.symbol}/{pair.token1.symbol}</p>
                          <span>Max:</span>
                          <p className={'font-semibold'}>0.23 {pair.token0.symbol}/{pair.token1.symbol}</p>
                        </span>
                    </AutoRow>
                    <div className={'flex gap-2 items-center'}>
                        <Link
                            href={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                            style={{ textWrap: 'nowrap' }}
                            className="font-noto text-sm py-3 px-4 underline text-white font-medium bg-transparent"
                        >
                            Withdraw Liquidity
                        </Link>
                        <Link
                            href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                            style={{ borderColor: '#FF7A1C', textWrap: 'nowrap', borderWidth: '1px !impontant' }}
                            className="font-noto text-sm py-3 px-4 border text-white font-medium bg-transparent rounded-lg"
                        >
                            Add Liquidity
                        </Link>
                            
                        {/*<ButtonEmpty
                            padding="6px 8px"
                            borderRadius="20px"
                            width="fit-content"
                            onClick={() => setShowMore(!showMore)}
                        >
                            {showMore ? (
                                <>
                                    <span className="text-white b-0">Manage</span>
                                    <ChevronUp size="20" className="text-white" style={{ marginLeft: '10px' }} />
                                </>
                            ) : (
                                <>
                                    <span className="text-white b-0">Manage</span>
                                    <ChevronDown size="20" className="text-white" style={{ marginLeft: '10px' }} />
                                </>
                            )}
                        </ButtonEmpty>*/}
                    </div>
                </div>

                {showMore && (
                    <AutoColumn gap="8px">
                        <FixedHeightRow>
                            <Text fontSize={16} fontWeight={500}>
                                Your total pool tokens:
                            </Text>
                            <Text fontSize={16} fontWeight={500}>
                                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                            </Text>
                        </FixedHeightRow>
                        {stakedBalance && (
                            <FixedHeightRow>
                                <Text fontSize={16} fontWeight={500}>
                                    Pool tokens in rewards pool:
                                </Text>
                                <Text fontSize={16} fontWeight={500}>
                                    {stakedBalance.toSignificant(4)}
                                </Text>
                            </FixedHeightRow>
                        )}
                        <FixedHeightRow>
                            <RowFixed>
                                <Text fontSize={16} fontWeight={500}>
                                    Pooled {currency0?.getSymbol(chainId)}:
                                </Text>
                            </RowFixed>
                            {token0Deposited ? (
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'} marginTop={'5px'}>
                                        {token0Deposited?.toSignificant(6)}
                                    </Text>
                                    <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                                </RowFixed>
                            ) : (
                                '-'
                            )}
                        </FixedHeightRow>

                        <FixedHeightRow>
                            <RowFixed>
                                <Text fontSize={16} fontWeight={500}>
                                    Pooled {currency1?.getSymbol(chainId)}:
                                </Text>
                            </RowFixed>
                            {token1Deposited ? (
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'} marginTop={'5px'}>
                                        {token1Deposited?.toSignificant(6)}
                                    </Text>
                                    <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                                </RowFixed>
                            ) : (
                                '-'
                            )}
                        </FixedHeightRow>

                        <FixedHeightRow>
                            <Text fontSize={16} fontWeight={500}>
                                Your pool share:
                            </Text>
                            <Text fontSize={16} fontWeight={500}>
                                {poolTokenPercentage
                                    ? (poolTokenPercentage.toFixed(2) === '0.00'
                                          ? '<0.01'
                                          : poolTokenPercentage.toFixed(2)) + '%'
                                    : '-'}
                            </Text>
                        </FixedHeightRow>

                        {/* <ButtonSecondary padding="8px" borderRadius="8px">
              <ExternalLink
                style={{ width: '100%', textAlign: 'center' }}
                href={`https://uniswap.info/account/${account}`}
              >
                View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
              </ExternalLink>
            </ButtonSecondary> */}
                        {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.raw, BIG_INT_ZERO) && (
                            <RowBetween marginTop="10px">
                                <Link
                                    href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                                    className={`pool-buttons`}
                                    style={{ width: '48%', borderRadius: '8px' }}
                                >
                                    Add
                                </Link>
                                {/* <a href = {`/add/${currencyId(currency0)}/${currencyId(currency1)}`} 
                                style={{ fontSize: "1rem", backgroundColor: '#d5d5d5'
                                    color: #292c37;
                                    border-radius: 0.6rem;
                                    font-weight: bold;
                                    padding: 0.5rem;
                                    margin: auto;
                                    text-align: center;}}
                                >Add</a> */}
                                <Link
                                    href={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                                    className="pool-buttons"
                                    style={{ width: '48%', borderRadius: '8px' }}
                                >
                                    Remove
                                </Link>
                            </RowBetween>
                        )}
                        {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
                            <Link
                                href={`/uni/${currencyId(currency0)}/${currencyId(currency1)}`}
                                className="pool-buttons"
                                style={{ width: '100%', borderRadius: '8px' }}
                            >
                                Manage Liquidity in Rewards Pool
                            </Link>
                        )}         
                    </AutoColumn>
                )}
            </AutoColumn>
        </StyledPositionCard>
    )
}
