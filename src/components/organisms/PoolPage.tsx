'use client'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import {
    Currency,
    currencyEquals,
    ETHER,
    TokenAmount,
    WETH,
    ChainId,
    SHIBASWAP_SHIB_TOKEN_ADDRESS
} from '@gocheto-dex/sdk'
import UnsupportedCurrencyFooter from '../swap/UnsupportedCurrencyFooter'
import { useIsTransactionUnsupported } from '../../hooks/Trades'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonPrimary } from '../ButtonLegacy'
import { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { MinimalPositionCard } from '../PositionCard'
import Row, { RowBetween, RowFlat } from '../Row'
import styled from 'styled-components'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../TransactionConfirmationModal'
import { PairState, usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode, usePairAdder, useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import {
    calculateGasMargin,
    calculateSlippageAmount,
    getShibaSwapRouterAddress,
    getShibaSwapRouterContract
} from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { Dots } from './Pool/styleds'
import { ConfirmAddModalBottom } from './AddLiquidity/ConfirmAddModalBottom'
import { PoolPriceBar, PoolShareBar } from './AddLiquidity/PoolPriceBar'
import '../../assets/styles/liquidity.scss'
import Settings from '../Settings'
import DigModal from './AddLiquidity/DigModal'
import { useRouter } from 'next/navigation'
import PoolLayout from './PoolLayout'
import { MouseoverTooltip } from '../Tooltip'
import { ErrorOutline } from '@material-ui/icons'
import { Avatar } from '@material-ui/core'
import { getTokenLogoURL } from '../CurrencyLogo'
import CurrencyInput from '../molecules/CurrencyInput'
import QuestionLogo from '../atoms/QuestionLogo'

export default function PoolPage({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) {
    const { account, chainId, provider } = useActiveWeb3React()
    const router = useRouter()
    const [priceRange, setPriceRange] = useState<'low' | 'medium' | 'high' | 'custom'>('medium')
    const [customPriceRange, setCustomPriceRange] = useState<number | null>(null)

    const currencyA = useCurrency(currencyIdA)
    const currencyB = useCurrency(currencyIdB)

    const oneCurrencyIsWETH = Boolean(
        chainId &&
            ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
                (currencyB && currencyEquals(currencyB, WETH[chainId])))
    )

    const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

    const expertMode = useIsExpertMode()

    const [showModal, setShowModal] = useState<boolean>(false)

    const handleDismiss = useCallback(() => {
        setShowModal(false)
    }, [setShowModal])
    // mint state
    const { independentField, typedValue, otherTypedValue } = useMintState()
    const {
        dependentField,
        currencies,
        pair,
        pairState,
        currencyBalances,
        parsedAmounts,
        price,
        noLiquidity,
        liquidityMinted,
        poolTokenPercentage,
        error
    } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

    const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

    const isValid = !error

    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
    const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

    // Chart data
    const [chartDataLoading, setChartDataLoading] = useState<boolean>(true)
    const [lineChartOptions, setLineChartOptions] = useState<any>('')
    const [candleChartOptions, setCandleChartOptions] = useState<any>('')
    const [chartMode, setChartMode] = useState<string>('line')
    const [tokenButton, setTokenButton] = useState<string>('SHIB')

    useEffect(() => {
        chartToken(SHIBASWAP_SHIB_TOKEN_ADDRESS[ChainId.MAINNET])
    }, [])

    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const [allowedSlippage] = useUserSlippageTolerance() // custom from users
    const [txHash, setTxHash] = useState<string>('')

    const handleTokenButtonClick = (tokenName: string) => {
        // console.log("tokenName", tokenName);
        setTokenButton(tokenName)
    }

    // get formatted amounts
    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

    // get the max amounts user can add
    const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
        (accumulator, field) => {
            return {
                ...accumulator,
                [field]: maxAmountSpend(currencyBalances[field])
            }
        },
        {}
    )

    const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
        (accumulator, field) => {
            return {
                ...accumulator,
                [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
            }
        },
        {}
    )

    // check whether the user has approved the router on the tokens
    const [approvalA, approveACallback] = useApproveCallback(
        parsedAmounts[Field.CURRENCY_A],
        getShibaSwapRouterAddress(chainId)
    )
    const [approvalB, approveBCallback] = useApproveCallback(
        parsedAmounts[Field.CURRENCY_B],
        getShibaSwapRouterAddress(chainId)
    )

    const [approvalSubmittedA, setApprovalSubmittedA] = useState<boolean>(false)
    useEffect(() => {
        if (approvalA === ApprovalState.PENDING) {
            setApprovalSubmittedA(true)
        }
    }, [approvalA, approvalSubmittedA])

    const [approvalSubmittedB, setApprovalSubmittedB] = useState<boolean>(false)
    useEffect(() => {
        if (approvalB === ApprovalState.PENDING) {
            setApprovalSubmittedB(true)
        }
    }, [approvalB, approvalSubmittedB])

    const addTransaction = useTransactionAdder()

    const chartToken = (baseCurrency: string) => {
        // getCurrencyQuotesData(baseCurrency).then((data) => {
        //     setLineChartOptions(prepareLineChartOptions(data))
        //     setCandleChartOptions(prepareCandleChartOptions(data))
        //     setChartDataLoading(false)
        // })
    }

    const [sta, p] = usePair(currencies[Field.CURRENCY_A] ?? undefined, currencies[Field.CURRENCY_B] ?? undefined)
    const addPair = usePairAdder()

    async function onAdd() {
        if (!chainId || !provider || !account) return
        const router = getShibaSwapRouterContract(chainId, provider, account)
        const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
        if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
            return
        }

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
            [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
        }

        let estimate,
            method: (...args: any) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null
        if (currencyA === ETHER || currencyB === ETHER) {
            const tokenBIsETH = currencyB === ETHER
            estimate = router.estimateGas.addLiquidityETH
            method = router.addLiquidityETH
            args = [
                wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
                (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
                amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
                amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
                account,
                deadline.toHexString()
            ]
            value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
        } else {
            estimate = router.estimateGas.addLiquidity
            method = router.addLiquidity
            args = [
                wrappedCurrency(currencyA, chainId)?.address ?? '',
                wrappedCurrency(currencyB, chainId)?.address ?? '',
                parsedAmountA.raw.toString(),
                parsedAmountB.raw.toString(),
                amountsMin[Field.CURRENCY_A].toString(),
                amountsMin[Field.CURRENCY_B].toString(),
                account,
                deadline.toHexString()
            ]
            value = null
        }

        setAttemptingTxn(true)
        await estimate(...args, value ? { value } : {})
            .then(estimatedGasLimit =>
                method(...args, {
                    ...(value ? { value } : {}),
                    gasLimit: calculateGasMargin(estimatedGasLimit)
                }).then(response => {
                    setAttemptingTxn(false)

                    if (p) addPair(p)

                    addTransaction(response, {
                        summary:
                            'Add ' +
                            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                            ' ' +
                            currencies[Field.CURRENCY_A]?.getSymbol(chainId) +
                            ' and ' +
                            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                            ' ' +
                            currencies[Field.CURRENCY_B]?.getSymbol(chainId)
                    })

                    setTxHash(response.hash)

                    ReactGA.event({
                        category: 'Liquidity',
                        action: 'Add',
                        label: [
                            currencies[Field.CURRENCY_A]?.getSymbol(chainId),
                            currencies[Field.CURRENCY_B]?.getSymbol(chainId)
                        ].join('/')
                    })
                })
            )
            .catch(error => {
                setAttemptingTxn(false)
                // we only care if the error is something _other_ than the user rejected the tx
                if (error?.code !== 4001) {
                    console.error(error)
                }
            })
    }

    const modalHeader = () => {
        return noLiquidity ? (
            <AutoColumn gap="20px">
                <LightCard mt="20px" borderRadius="20px">
                    <RowFlat>
                        <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                            {currencies[Field.CURRENCY_A]?.getSymbol(chainId) +
                                '/' +
                                currencies[Field.CURRENCY_B]?.getSymbol(chainId)}
                        </Text>
                        <DoubleCurrencyLogo
                            currency0={currencies[Field.CURRENCY_A]}
                            currency1={currencies[Field.CURRENCY_B]}
                            size={30}
                        />
                    </RowFlat>
                </LightCard>
            </AutoColumn>
        ) : (
            <AutoColumn gap="20px" className="modal-confirm">
                <DoubleCurrencyLogo
                    currency0={currencies[Field.CURRENCY_A]}
                    currency1={currencies[Field.CURRENCY_B]}
                    size={30}
                />
                <RowFlat>
                    <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                        {liquidityMinted?.toSignificant(6)}
                    </Text>
                </RowFlat>
                <Row>
                    <Text fontSize="24px">
                        {currencies[Field.CURRENCY_A]?.getSymbol(chainId) +
                            '/' +
                            currencies[Field.CURRENCY_B]?.getSymbol(chainId) +
                            ' Pool Tokens'}
                    </Text>
                </Row>
                <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
                    {`Output is estimated. If the price changes by more than ${allowedSlippage /
                        100}% your transaction will revert.`}
                </TYPE.italic>
            </AutoColumn>
        )
    }

    const modalBottom = () => {
        return (
            <ConfirmAddModalBottom
                price={price}
                currencies={currencies}
                parsedAmounts={parsedAmounts}
                noLiquidity={noLiquidity}
                onAdd={onAdd}
                poolTokenPercentage={poolTokenPercentage}
            />
        )
    }

    const HighAmount = useCallback(() => {
      const newprice = price?.invert()?.toSignificant(6) ?? '0.00'

      if (priceRange === 'high') return parseFloat(newprice) * 1.15
      if (priceRange === 'medium') return parseFloat(newprice) * 1.30
      if (priceRange === 'low') return parseFloat(newprice) * 2
      return parseFloat(newprice) * (customPriceRange ? (1 + customPriceRange/100) : 1)
    }, [priceRange, price, customPriceRange])

    const LowAmount = useCallback(() => {
      const newprice = price?.invert()?.toSignificant(6) ?? '0.00'

      if (priceRange === 'high') return parseFloat(newprice) / 1.15
      if (priceRange === 'medium') return parseFloat(newprice) / 1.30
      if (priceRange === 'low') return parseFloat(newprice) / 2
      return parseFloat(newprice) / (customPriceRange ? (1 + customPriceRange/100) : 1)
    },[priceRange, price, customPriceRange])


    const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${currencies[
        Field.CURRENCY_A
    ]?.getSymbol(chainId)} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[
        Field.CURRENCY_B
    ]?.getSymbol(chainId)}`

    const handleCurrencyASelect = useCallback(
        (currencyA: Currency) => {
            const newCurrencyIdA = currencyId(currencyA)
            if (newCurrencyIdA === currencyIdB) {
                router.push(`/newpool/${currencyIdB}/${currencyIdA}`, { scroll: false })
                // history.push(`/newpool/${currencyIdB}/${currencyIdA}`)
            } else {
                router.push(`/newpool/${newCurrencyIdA}/${currencyIdB}`, { scroll: false })
                // history.push(`/newpool/${newCurrencyIdA}/${currencyIdB}`)
            }
        },
        [currencyIdB, currencyIdA, router]
    )
    const handleCurrencyBSelect = useCallback(
        (currencyB: Currency) => {
            const newCurrencyIdB = currencyId(currencyB)
            if (currencyIdA === newCurrencyIdB) {
                if (currencyIdB) {
                    router.push(`/newpool/${currencyIdB}/${newCurrencyIdB}`, { scroll: false })
                    // history.push(`/newpool/${currencyIdB}/${newCurrencyIdB}`)
                } else {
                    router.push(`/newpool/${newCurrencyIdB}`, { scroll: false })
                    // history.push(`/newpool/${newCurrencyIdB}`)
                }
            } else {
                router.push(`/newpool/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`, { scroll: false })
                // history.push(`/newpool/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
            }
        },
        [currencyIdA, currencyIdB, router]
    )

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onFieldAInput('')
        }
        setTxHash('')
    }, [onFieldAInput, txHash])

    const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

    const digSectionHeight = document.getElementById('digSection')?.clientHeight

    const chartSectionHeight = digSectionHeight ? digSectionHeight * 0.488 : 276
    document
        .getElementById('chart-container')
        ?.setAttribute('style', `min-height:${chartSectionHeight}px;height:${chartSectionHeight}px`)
    document
        .getElementById('tableSection')
        ?.setAttribute('style', `min-height:${chartSectionHeight}px;height:${chartSectionHeight}px`)
    return (
        <>
            <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
                    />
                )}
                pendingText={pendingText}
            />
            {/* className="w-full max-w-2xl" */}
            <PoolLayout
              currencyIdA={currencyIdA}
              currencyIdB={currencyIdB}
              pair={pair && !noLiquidity && pairState !== PairState.INVALID ? pair : undefined}
            >
              <div  style={{ backgroundColor: '#222540' }} className={'p-5 rounded-2xl w-full flex flex-col gap-4 items-start'}>
                <h4 className={'text-white text-xl font-medium'}>DIG Tokens</h4>
                <MouseoverTooltip text="Total Value Locked (TVL) represents the total value of assets locked in liquidity pools. TVL reflects the depth and market capacity of the pool, crucial for assessing liquidity and potential performance">
                  <ErrorOutline />
                  <span className='text-gray-50 mt-1 ml-2 cursor-pointer'>Select Price Range</span>
                </MouseoverTooltip>
                {/** Options */}
                <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full gap-3'}>
                  {/** Option low risk */}
                  <div
                    onClick={() => setPriceRange('low')}
                    style={{ backgroundColor: `#191B27` }}
                    className={`p-4 rounded-2xl cursor-pointer flex flex-col gap-4 ${priceRange === 'low' ? 'border-2 border-yellow-500' : ''}`}
                  >
                    <span className={'text-white font-medium'}>Low Risk</span>
                    <span className={'text-gray-50'}>Full Range</span>
                  </div>
                  {/** Option medium risk */}
                  <div
                    onClick={() => setPriceRange('medium')}
                    style={{ backgroundColor: `#191B27` }}
                    className={`p-4 rounded-2xl cursor-pointer flex flex-col gap-4 ${priceRange === 'medium' ? 'border-2 border-yellow-500' : ''}`}
                  >
                    <span className={'text-white font-medium'}>Medium Risk</span>
                    <span className={'text-gray-50'}>Min -30% - Max +30%</span>
                  </div>
                  {/** Option high risk */}
                  <div
                    onClick={() => setPriceRange('high')}
                    style={{ backgroundColor: `#191B27` }}
                    className={`p-4 rounded-2xl cursor-pointer flex flex-col gap-4 ${priceRange === 'high' ? 'border-2 border-yellow-500' : ''}`}
                  >
                    <span className={'text-white font-medium'}>High Risk</span>
                    <span className={'text-gray-50'}>Min -15% - Max -15%</span>
                  </div>
                  {/** Option custom*/}
                  <label
                    onClick={() => setPriceRange('custom')}
                    style={{ backgroundColor: `#191B27` }}
                    className={`p-4 rounded-2xl cursor-pointer flex flex-col gap-4 ${priceRange === 'custom' ? 'border-2 border-yellow-500' : ''}`}
                  >
                    <span className={'text-white font-medium'}>Custom</span>
                    <input
                      placeholder='Input range manually'
                      className={'text-gray-50 border-0 bg-transparent min-w-0 outline-none p-0'}
                      value={customPriceRange ?? undefined}
                      type='number'
                      onChange={(e) => {
                          if (parseFloat(e.target.value) < 100 && parseFloat(e.target.value) > -0.001) setCustomPriceRange(parseFloat(e.target.value))
                        }}
                    />
                  </label>
                </div>
                {/** Price range on tokens */}
                <div className={'w-full flex flex-col gap-3'}>
                  <article style={{ backgroundColor: `#191B27` }} className={'py-6 px-4 rounded-2xl flex items-center justify-between'}>
                    <div className={'flex flex-col gap-2'}>
                      <h5 className={'text-lg font-medium text-white mb-3'}>High Price</h5>
                      
                      {currencies[Field.CURRENCY_A]?.symbol
                        ? <>
                            <span className={'flex items-center gap-2'}>
                              <Avatar src={getTokenLogoURL(currencyIdA ?? '', chainId)} className={'bg-white text-gray-800 text-center h-9 w-9'}>E</Avatar>
                              <p className={'font-medium text-white text-lg'}>{currencies[Field.CURRENCY_A]?.symbol ?? ''}</p>
                            </span>
                            <p className={'text-white font-medium'}>{currencies[Field.CURRENCY_A]?.symbol ?? ''} per {currencies[Field.CURRENCY_B]?.symbol ?? ''}</p>
                          </>
                        : <div style={{ height: '68px' }}><QuestionLogo /></div>
                      }
                    </div>
                    <div className={'flex flex-col items-end gap-0'}>
                      <button className={'text-2xl font-medium text-white outline-none border-0 bg-transparent px-5'}>+</button>
                      <input contentEditable className='text-3xl font-medium text-white bg-transparent border-none text-right' type='number' value={HighAmount()} />
                      <button className={'text-2xl font-medium text-white outline-none border-0 bg-transparent px-5'}>-</button>
                    </div>
                  </article>

                  <article style={{ backgroundColor: `#191B27` }} className={'py-6 px-4 rounded-2xl flex items-center justify-between'}>
                    <div className={'flex flex-col gap-2'}>
                      <h5 className={'text-lg font-medium text-white mb-3'}>Low Price</h5>

                      {currencies[Field.CURRENCY_A]?.symbol
                        ? <>
                            <span className={'flex items-center gap-2'}>
                              <Avatar src={getTokenLogoURL(currencyIdA ?? '', chainId)} className={'bg-white text-gray-800 text-center h-9 w-9'}>{currencies[Field.CURRENCY_A]?.symbol?.[0]}</Avatar>
                              <p className={'font-medium text-white text-lg'}>{currencies[Field.CURRENCY_A]?.symbol ?? ''}</p>
                            </span>
                            <p className={'text-white font-medium'}>{currencies[Field.CURRENCY_A]?.symbol ?? ''} per {currencies[Field.CURRENCY_B]?.symbol ?? ''}</p>
                          </>
                        : <div style={{ height: '68px' }}><QuestionLogo /></div>
                      }
                    
                    </div>
                    <div className={'flex flex-col items-end gap-0'}>
                      <button className={'text-2xl font-medium text-white outline-none border-0 bg-transparent px-5'}>+</button>
                      <input contentEditable className='text-3xl font-medium text-white bg-transparent border-none text-right' type='number' value={LowAmount()} />
                      <button className={'text-2xl font-medium text-white outline-none border-0 bg-transparent px-5'}>-</button>
                    </div>
                  </article>
                  
                  <article style={{ backgroundColor: `#191B27` }} className={'py-6 px-4 gap-3 rounded-2xl flex items-center justify-center'}>
                    {currencies[Field.CURRENCY_A]?.symbol && currencies[Field.CURRENCY_B]?.symbol 
                      ? <>
                          <div className='flex items-center gap-2 text-xl'>
                            <span className={'mr-0.5'}>
                              {price?.invert()?.toSignificant(6) ?? '-'}
                            </span>
                            {currencies[Field.CURRENCY_A]?.symbol ?? ''}
                            <Avatar src={getTokenLogoURL(currencyIdA ?? '', chainId)} className={'bg-white text-gray-800 text-center h-7 w-7'}>
                                {currencies[Field.CURRENCY_A]?.symbol?.[0]}
                            </Avatar>
                          </div>
                          <div className={'text-2xl'}>
                            =
                          </div>
                          <div className='flex items-center gap-2 text-xl'>
                            1 {' '}
                            {currencies[Field.CURRENCY_B]?.symbol ?? ''}
                            <Avatar src={getTokenLogoURL(currencyIdB ?? '', chainId)} className={'bg-white text-gray-800 text-center h-7 w-7'}>
                                {currencies[Field.CURRENCY_B]?.symbol}
                            </Avatar>
                          </div>
                        </>
                        : null
                    }
                  </article>
                </div>

                <MouseoverTooltip text="Total Value Locked (TVL) represents the total value of assets locked in liquidity pools. TVL reflects the depth and market capacity of the pool, crucial for assessing liquidity and potential performance">
                  <ErrorOutline />
                  <span className='text-gray-50 text-xl mt-1 ml-2 cursor-pointer'>Deposit Ammounts</span>
                </MouseoverTooltip>

                <div className="w-full" id="digSection">
                        <div style={{ backgroundColor: '#141824' }} className={'py-4 rounded-2xl w-full'}>
                          <h5 className={'text-xl font-medium text-white pb-6 px-4'}>Liquidity amount</h5>
                          <CurrencyInput
                            customStyle={'-mb-0 md:-mb-4'}
                            value={formattedAmounts[Field.CURRENCY_A]}
                            onUserInput={onFieldAInput}
                            onMax={() => {
                                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                            }}
                            onCurrencySelect={handleCurrencyASelect}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                            currency={currencies[Field.CURRENCY_A]}
                            currenciesAB={currencies}
                            type={Field.CURRENCY_A}
                            id="add-liquidity-input-tokena"
                            showCommonBases 
                          />
                          <div className={'w-full flex items-center'}>
                            <hr className={'h-0.5 bg-gray-600 flex-1 m-0'} />
                            <div style={{ backgroundColor: '#202740' }} className={'text-4xl font-normal text-white border-2 border-gray-600 w-12 h-12 rounded-full flex items-center justify-center'}>+</div>
                            <hr className={'h-0.5 bg-gray-600 flex-1 m-0'} />
                          </div>
                          <CurrencyInput
                            customStyle={'-mt-0 md:-mt-2'}
                            value={formattedAmounts[Field.CURRENCY_B]}
                            onUserInput={onFieldBInput}
                            onMax={() => {
                                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                            }}
                            onCurrencySelect={handleCurrencyBSelect}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                            currency={currencies[Field.CURRENCY_B]}
                            currenciesAB={currencies}
                            type={Field.CURRENCY_B}
                            id="add-liquidity-input-tokena"
                            showCommonBases 
                          />
                        </div>
                      </div>

                      {currencies[Field.CURRENCY_A] &&
                        currencies[Field.CURRENCY_B] &&
                        pairState !== PairState.INVALID && (
                          <>
                            <PoolShareBar
                              noLiquidity={noLiquidity}
                              poolTokenPercentage={poolTokenPercentage}
                              price={price}
                            />
                          </>
                      )}

                      <div className={'w-full'}>
                        {addIsUnsupported ? (
                          <ButtonPrimary disabled={true} className="mt-1 mb-1">
                            <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                          </ButtonPrimary>
                        ) : (
                          <React.Fragment>
                            {pair && !noLiquidity && pairState !== PairState.INVALID && (
                              <div className="w-full flex flex-col pdy-10">
                                <MinimalPositionCard
                                  showUnwrapped={oneCurrencyIsWETH}
                                  className={'py-4 rounded-2xl w-full mb-2'}
                                  style={{ backgroundColor: '#141824' }}
                                  pair={pair}
                                />
                              </div>
                            )}

                            {!account ? (
                              <ButtonPrimary
                                onClick={toggleWalletModal}
                                className="mt-1 mb-1"
                              >
                                Connect Wallet
                              </ButtonPrimary>
                            ) : (
                              <AutoColumn gap={'md'}>
                                {(approvalA === ApprovalState.NOT_APPROVED ||
                                  approvalA === ApprovalState.PENDING ||
                                  approvalB === ApprovalState.NOT_APPROVED ||
                                  approvalB === ApprovalState.PENDING) &&
                                  isValid && (
                                    <RowBetween>
                                      {approvalA !== ApprovalState.APPROVED && (
                                        <ButtonPrimary
                                          className="mt-1 mb-1"
                                          onClick={approveACallback}
                                          disabled={
                                            approvalA !==
                                              ApprovalState.NOT_APPROVED ||
                                            approvalSubmittedA
                                          }
                                          width={
                                            approvalB !== ApprovalState.APPROVED
                                              ? '48%'
                                              : '100%'
                                          }
                                        >
                                          {approvalA !==
                                            ApprovalState.NOT_APPROVED ||
                                            approvalSubmittedA ? (
                                              <Dots>
                                                Approving{' '}
                                                {currencies[
                                                  Field.CURRENCY_A
                                                ]?.getSymbol(chainId)}
                                              </Dots>
                                            ) : (
                                              'Approve ' +
                                                currencies[
                                                  Field.CURRENCY_A
                                                ]?.getSymbol(chainId)
                                            )}
                                        </ButtonPrimary>
                                      )}

                                      {approvalB !== ApprovalState.APPROVED && (
                                        <ButtonPrimary
                                          className="mt-1 mb-1"
                                          onClick={approveBCallback}
                                          disabled={
                                            approvalB !==
                                            ApprovalState.NOT_APPROVED ||
                                            approvalSubmittedB
                                          }
                                          width={
                                            approvalA !== ApprovalState.APPROVED
                                              ? '48%'
                                              : '100%'
                                            }
                                        >
                                          {approvalB !==
                                            ApprovalState.NOT_APPROVED ||
                                          approvalSubmittedB ? (
                                            <Dots>
                                              Approving{' '}
                                              {currencies[
                                                Field.CURRENCY_B
                                              ]?.getSymbol(chainId)}
                                            </Dots>
                                          ) : (
                                            'Approve ' +
                                            currencies[
                                              Field.CURRENCY_B
                                            ]?.getSymbol(chainId)
                                          )}
                                        </ButtonPrimary>
                                      )}
                                    </RowBetween>
                                  )}
                                  <ButtonError
                                    className="mt-1 mb-1"
                                    onClick={() => {
                                      expertMode ? onAdd() : setShowConfirm(true)
                                    }}
                                    width={'100%'}
                                    disabled={
                                      !isValid ||
                                      approvalA !== ApprovalState.APPROVED ||
                                      approvalB !== ApprovalState.APPROVED
                                    }
                                    error={
                                      !isValid &&
                                      !!parsedAmounts[Field.CURRENCY_A] &&
                                      !!parsedAmounts[Field.CURRENCY_B]
                                    }
                                  >
                                  <Text>
                                    <span className="fontFamily font-bold">
                                      {error ?? 'Supply'}
                                    </span>
                                  </Text>
                                </ButtonError>
                              </AutoColumn>
                            )}
                          </React.Fragment>
                        )}
                      </div>

                  {/*<div className="data-container">
                      <div id="chart-container" className="graph-container">
                          <div className="toggle-btn">
                              <TokenButton
                                  toggle={() => {
                                      chartToken(SHIBASWAP_SHIB_TOKEN_ADDRESS[ChainId.MAINNET]);
                                      handleTokenButtonClick('SHIB')
                                  }}
                                  name="SHIB"
                                  disabled={tokenButton !== 'SHIB'}
                              />
                              <TokenButton
                                  toggle={() => {
                                      chartToken(SHIBASWAP_LEASH_TOKEN_ADDRESS[ChainId.MAINNET]);
                                      handleTokenButtonClick('LEASH')
                                  }}
                                  name="LEASH"
                                  disabled={tokenButton !== 'LEASH'}
                              />
                              <TokenButton
                                  toggle={() => {
                                      chartToken(SHIBASWAP_BONE_TOKEN_ADDRESS[chainId ? chainId: 1]);
                                      handleTokenButtonClick('BONE')
                                  }}
                                  name="BONE"
                                  disabled={tokenButton !== 'BONE'}
                              />
                              <ToggleButton toggle={() => setChartMode(chartMode === 'line' ? 'candle' : 'line')} />
                          </div>
                          {chartDataLoading ? (
                              'Loading'
                          ) : chartMode === 'line' ? (
                              <Chart options={lineChartOptions} />
                          ) : (
                              <Chart options={candleChartOptions} />
                          )}
                          <div style={{textAlign:"center", height:"100%"}}>
                              <span style={{fontSize:"larger", position:"relative", top:"50%"}}>Coming Soon</span>
                          </div>
                      </div>
                      <div id="tableSection" className="total-container">
                          <div style={{textAlign:"center", height:"100%"}}>
                              <span style={{fontSize:"larger", position:"relative", top:"50%"}}>Coming Soon</span>
                          </div>
                          <Table/>
                      </div>
                      </div>*/}
              </div>
            </PoolLayout>

            {!addIsUnsupported ? //     <div className="w-full max-w-2xl flex flex-col" style={{ marginTop: '50px', marginBottom: '30px' }}> // pair && !noLiquidity && pairState !== PairState.INVALID ? (
            //         <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
            //     </div>
            // ) :
            null : (
                <UnsupportedCurrencyFooter
                    show={addIsUnsupported}
                    currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
                />
            )}

            <DigModal isOpen={showModal} onDismiss={handleDismiss} />
        </>
    )
}