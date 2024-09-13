'use client'
import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { ChainId, Currency, currencyEquals, ETHER, Percent, WETH } from '@gocheto-dex/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../ButtonLegacy'
import { BlueCard, LightCard } from '../../Card'
import { AutoColumn, ColumnCenter } from '../../Column'
import CurrencyInputPanel from '../../CurrencyInputPanel'
import CurrencyLogo from '../../CurrencyLogo'
import DoubleCurrencyLogo from '../../DoubleLogo'
import { AddRemoveTabs } from '../../NavigationTabs'
import { MinimalPositionCard } from '../../PositionCard'
import Row, { RowBetween, RowFixed } from '../../Row'
import Slider from '../../Slider'
import { Dots } from '../../swap/styleds'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../TransactionConfirmationModal'
import { useActiveWeb3React } from '../../../hooks'
import { useCurrency } from '../../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { usePairContract } from '../../../hooks/useContract'
import useIsArgentWallet from '../../../hooks/useIsArgentWallet'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { Field } from '../../../state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../../state/burn/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useUserSlippageTolerance } from '../../../state/user/hooks'
import { StyledInternalLink, TYPE } from '../../../theme'
import {
    calculateGasMargin,
    calculateSlippageAmount,
    getShibaSwapRouterAddress,
    getShibaSwapRouterContract
} from '../../../utils'
import { currencyId } from '../../../utils/currencyId'
import useDebouncedChangeHandler from '../../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../../utils/wrappedCurrency'
import { MaxButton, Wrapper } from '../Pool/styleds'
import { useRouter } from 'next/navigation'

export default function RemoveLiquidity({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) {
    const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
    const { account, chainId, provider } = useActiveWeb3React()
    const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
        currencyA,
        currencyB,
        chainId
    ])

    const theme = useContext(ThemeContext)
    const router = useRouter()

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // burn state
    const { independentField, typedValue } = useBurnState()
    const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
    const { onUserInput: _onUserInput } = useBurnActionHandlers()
    const isValid = !error

    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
    const [showDetailed, setShowDetailed] = useState<boolean>(false)
    const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

    // txn values
    const [txHash, setTxHash] = useState<string>('')
    const deadline = useTransactionDeadline()
    const [allowedSlippage] = useUserSlippageTolerance()

    const formattedAmounts = {
        [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
            ? '0'
            : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
            ? '<1'
            : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
        [Field.LIQUIDITY]:
            independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
        [Field.CURRENCY_A]:
            independentField === Field.CURRENCY_A
                ? typedValue
                : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
        [Field.CURRENCY_B]:
            independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
    }

    const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

    // pair contract
    const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

    // allowance handling
    const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
        null
    )
    const [approval, approveCallback] = useApproveCallback(
        parsedAmounts[Field.LIQUIDITY],
        getShibaSwapRouterAddress(chainId)
    )

    const isArgentWallet = useIsArgentWallet()

    async function onAttemptToApprove() {
        if (!pairContract || !pair || !provider || !deadline) throw new Error('missing dependencies')
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
        if (!liquidityAmount) throw new Error('missing liquidity amount')

        if (isArgentWallet) {
            return approveCallback()
        }

        if (chainId !== ChainId.HARMONY) {
            // try to gather a signature for permission
            const nonce = await pairContract.nonces(account)

            const EIP712Domain = [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
            ]
            const domain = {
                name: 'ShibaSwap LP Token',
                version: '1',
                chainId: chainId,
                verifyingContract: pair.liquidityToken.address
            }
            const Permit = [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
            const message = {
                owner: account,
                spender: getShibaSwapRouterAddress(chainId),
                value: liquidityAmount.raw.toString(),
                nonce: nonce.toHexString(),
                deadline: deadline.toNumber()
            }
            const data = JSON.stringify({
                types: {
                    EIP712Domain,
                    Permit
                },
                domain,
                primaryType: 'Permit',
                message
            })

            provider
                .send('eth_signTypedData_v4', [account, data])
                .then(splitSignature)
                .then(signature => {
                    setSignatureData({
                        v: signature.v,
                        r: signature.r,
                        s: signature.s,
                        deadline: deadline.toNumber()
                    })
                })
                .catch(error => {
                    // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
                    if (error?.code !== 4001) {
                        approveCallback()
                    }
                })
        } else {
            return approveCallback()
        }
    }

    // wrapped onUserInput to clear signatures
    const onUserInput = useCallback(
        (field: Field, typedValue: string) => {
            setSignatureData(null)
            return _onUserInput(field, typedValue)
        },
        [_onUserInput]
    )

    const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
        onUserInput
    ])
    const onCurrencyAInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue), [
        onUserInput
    ])
    const onCurrencyBInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue), [
        onUserInput
    ])

    // tx sending
    const addTransaction = useTransactionAdder()
    async function onRemove() {
        if (!chainId || !provider || !account || !deadline) throw new Error('missing dependencies')
        const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
        if (!currencyAmountA || !currencyAmountB) {
            throw new Error('missing currency amounts')
        }
        const router = getShibaSwapRouterContract(chainId, provider, account)

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
            [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
        }

        if (!currencyA || !currencyB) throw new Error('missing tokens')
        const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
        if (!liquidityAmount) throw new Error('missing liquidity amount')

        const currencyBIsETH = currencyB === ETHER
        const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH

        if (!tokenA || !tokenB) throw new Error('could not wrap')

        let methodNames: string[], args: Array<string | string[] | number | boolean>
        // we have approval, use normal remove liquidity
        if (approval === ApprovalState.APPROVED) {
            // removeLiquidityETH
            if (oneCurrencyIsETH) {
                methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
                    account,
                    deadline.toHexString()
                ]
            }
            // removeLiquidity
            else {
                methodNames = ['removeLiquidity']
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    deadline.toHexString()
                ]
            }
        }
        // we have a signataure, use permit versions of remove liquidity
        else if (signatureData !== null) {
            // removeLiquidityETHWithPermit
            if (oneCurrencyIsETH) {
                methodNames = [
                    'removeLiquidityETHWithPermit',
                    'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens'
                ]
                args = [
                    currencyBIsETH ? tokenA.address : tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
                    amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s
                ]
            }
            // removeLiquidityETHWithPermit
            else {
                methodNames = ['removeLiquidityWithPermit']
                args = [
                    tokenA.address,
                    tokenB.address,
                    liquidityAmount.raw.toString(),
                    amountsMin[Field.CURRENCY_A].toString(),
                    amountsMin[Field.CURRENCY_B].toString(),
                    account,
                    signatureData.deadline,
                    false,
                    signatureData.v,
                    signatureData.r,
                    signatureData.s
                ]
            }
        } else {
            throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
        }

        const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
            methodNames.map(methodName =>
                router.estimateGas[methodName](...args)
                    .then(calculateGasMargin)
                    .catch(error => {
                        console.error(`estimateGas failed`, methodName, args, error)
                        return undefined
                    })
            )
        )

        const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
            BigNumber.isBigNumber(safeGasEstimate)
        )

        // all estimations failed...
        if (indexOfSuccessfulEstimation === -1) {
            console.error('This transaction would fail. Please contact support.')
        } else {
            const methodName = methodNames[indexOfSuccessfulEstimation]
            const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

            setAttemptingTxn(true)
            await router[methodName](...args, {
                gasLimit: safeGasEstimate
            })
                .then((response: TransactionResponse) => {
                    setAttemptingTxn(false)

                    addTransaction(response, {
                        summary:
                            'Remove ' +
                            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                            ' ' +
                            currencyA?.getSymbol(chainId) +
                            ' and ' +
                            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                            ' ' +
                            currencyB?.getSymbol(chainId)
                    })

                    setTxHash(response.hash)

                    ReactGA.event({
                        category: 'Liquidity',
                        action: 'Remove',
                        label: [currencyA?.getSymbol(chainId), currencyB?.getSymbol(chainId)].join('/')
                    })
                })
                .catch((error: Error) => {
                    setAttemptingTxn(false)
                    // we only care if the error is something _other_ than the user rejected the tx
                    console.error(error)
                })
        }
    }

    function modalHeader() {
        return (
            <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
                <RowBetween align="flex-end">
                    <Text fontSize={24} fontWeight={500}>
                        {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                    </Text>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyA} size={'24px'} />
                        <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
                            {currencyA?.getSymbol(chainId)}
                        </Text>
                    </RowFixed>
                </RowBetween>
                <RowFixed>
                    <Plus size="16" color={theme.text2} />
                </RowFixed>
                <RowBetween align="flex-end">
                    <Text fontSize={24} fontWeight={500}>
                        {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
                    </Text>
                    <RowFixed gap="4px">
                        <CurrencyLogo currency={currencyB} size={'24px'} />
                        <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
                            {currencyB?.getSymbol(chainId)}
                        </Text>
                    </RowFixed>
                </RowBetween>

                <TYPE.italic fontSize={12} color={theme.text2} textAlign="left" padding={'12px 0 0 0'}>
                    {`Output is estimated. If the price changes by more than ${allowedSlippage /
                        100}% your transaction will revert.`}
                </TYPE.italic>
            </AutoColumn>
        )
    }

    function modalBottom() {
        return (
            <>
                <RowBetween>
                    <Text color={theme.text2} fontWeight={500} fontSize={16}>
                        {'ShibaSwap ' + currencyA?.getSymbol(chainId) + '/' + currencyB?.getSymbol(chainId)} Burned
                    </Text>
                    <RowFixed className={'flex flex-col items-center'}>
                        <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
                        <Text fontWeight={500} fontSize={12}>
                            {parseFloat(parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '0').toFixed(16)}
                        </Text>
                    </RowFixed>
                </RowBetween>
                {pair && (
                    <>
                        <RowBetween>
                            <Text color={theme.text2} fontWeight={500} fontSize={16}>
                                Price
                            </Text>
                            <Text fontWeight={500} fontSize={16} color={theme.text1}>
                                1 {currencyA?.getSymbol(chainId)} ={' '}
                                {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.getSymbol(chainId)}
                            </Text>
                        </RowBetween>
                        <RowBetween>
                            <div />
                            <Text fontWeight={500} fontSize={16} color={theme.text1}>
                                1 {currencyB?.getSymbol(chainId)} ={' '}
                                {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.getSymbol(chainId)}
                            </Text>
                        </RowBetween>
                    </>
                )}
                <ButtonPrimary
                    disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
                    onClick={onRemove}
                >
                    <Text fontWeight={500} fontSize={20}>
                        Confirm
                    </Text>
                </ButtonPrimary>
            </>
        )
    }

    const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${currencyA?.getSymbol(
        chainId
    )} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.getSymbol(chainId)}`

    const liquidityPercentChangeCallback = useCallback(
        (value: number) => {
            onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
        },
        [onUserInput]
    )

    const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
    const oneCurrencyIsWETH = Boolean(
        chainId &&
            ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
                (currencyB && currencyEquals(WETH[chainId], currencyB)))
    )

    const handleSelectCurrencyA = useCallback(
        (currency: Currency) => {
            if (currencyIdB && currencyId(currency) === currencyIdB) {
                router.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
                // history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
            } else {
                router.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
                // history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
            }
        },
        [currencyIdA, currencyIdB]
    )
    const handleSelectCurrencyB = useCallback(
        (currency: Currency) => {
            if (currencyIdA && currencyId(currency) === currencyIdA) {
                router.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
                // history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
            } else {
                router.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
                // history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
            }
        },
        [currencyIdA, currencyIdB]
    )

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        setSignatureData(null) // important that we clear signature data to avoid bad sigs
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.LIQUIDITY_PERCENT, '0')
        }
        setTxHash('')
    }, [onUserInput, txHash])

    const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
        Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
        liquidityPercentChangeCallback
    )

    return (
        <>
            <div className="w-full max-w-2xl rounded yield-card mt-2 my-auto">
                <AddRemoveTabs creating={false} adding={false} />
                <Wrapper>
                    <TransactionConfirmationModal
                        isOpen={showConfirm}
                        onDismiss={handleDismissConfirmation}
                        attemptingTxn={attemptingTxn}
                        hash={txHash ? txHash : ''}
                        content={() => (
                            <ConfirmationModalContent
                                title={'You will receive'}
                                onDismiss={handleDismissConfirmation}
                                topContent={modalHeader}
                                bottomContent={modalBottom}
                            />
                        )}
                        pendingText={pendingText}
                    />
                    <AutoColumn gap="md">
                        <BlueCard>
                            <AutoColumn gap="10px">
                                <TYPE.link fontWeight={500}>
                                    <p className="text-gray-5000">
                                        {' '}
                                        <b>Tip:</b> Removing pool tokens converts your position back into underlying
                                        tokens at the current rate, proportional to your share of the pool. Accrued fees
                                        are included in the amounts you receive.
                                    </p>
                                </TYPE.link>
                            </AutoColumn>
                        </BlueCard>
                        <LightCard>
                            <AutoColumn gap="20px">
                                <RowBetween>
                                    <Text fontWeight={500}>Amount</Text>
                                    {/* <ClickableText
                                        fontWeight={500}
                                        onClick={() => {
                                            setShowDetailed(!showDetailed)
                                        }}
                                    >
                                        {showDetailed ? 'Simple' : 'Detailed'}
                                    </ClickableText> */}
                                </RowBetween>
                                <Row style={{ alignItems: 'flex-end' }}>
                                    <Text fontSize={25} fontWeight={500}>
                                        {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                                    </Text>
                                </Row>
                                {!showDetailed && (
                                    <>
                                        <Slider
                                            value={innerLiquidityPercentage}
                                            onChange={setInnerLiquidityPercentage}
                                        />
                                        <RowBetween className="justify-center yield_slider">
                                            <MaxButton
                                                onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}
                                                width="100%"
                                            >
                                                25%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}
                                                width="100%"
                                            >
                                                50%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}
                                                width="100%"
                                            >
                                                75%
                                            </MaxButton>
                                            <MaxButton
                                                onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                                                width="100%"
                                            >
                                                Max
                                            </MaxButton>
                                        </RowBetween>
                                    </>
                                )}
                            </AutoColumn>
                        </LightCard>
                        {!showDetailed && (
                            <>
                                <ColumnCenter>
                                    <ArrowDown size="16" color={theme.text2} />
                                </ColumnCenter>
                                <LightCard>
                                    <AutoColumn gap="10px">
                                        <RowBetween>
                                            <Text fontSize={24} fontWeight={500}>
                                                {formattedAmounts[Field.CURRENCY_A] || '-'}
                                            </Text>
                                            <RowFixed>
                                                <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                                                <Text
                                                    fontSize={24}
                                                    fontWeight={500}
                                                    id="remove-liquidity-tokena-symbol"
                                                >
                                                    {currencyA?.getSymbol(chainId)}
                                                </Text>
                                            </RowFixed>
                                        </RowBetween>
                                        <RowBetween>
                                            <Text fontSize={24} fontWeight={500}>
                                                {formattedAmounts[Field.CURRENCY_B] || '-'}
                                            </Text>
                                            <RowFixed>
                                                <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                                                <Text
                                                    fontSize={24}
                                                    fontWeight={500}
                                                    id="remove-liquidity-tokenb-symbol"
                                                >
                                                    {currencyB?.getSymbol(chainId)}
                                                </Text>
                                            </RowFixed>
                                        </RowBetween>
                                        {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                                            <RowBetween style={{ justifyContent: 'flex-end' }}>
                                                {oneCurrencyIsETH ? (
                                                    <StyledInternalLink
                                                        href={`/remove/${
                                                            currencyA === ETHER ? WETH[chainId].address : currencyIdA
                                                        }/${currencyB === ETHER ? WETH[chainId].address : currencyIdB}`}
                                                        style={{ color: '#fea31c' }}
                                                    >
                                                        Receive W{Currency.getNativeCurrencySymbol(chainId)}
                                                    </StyledInternalLink>
                                                ) : oneCurrencyIsWETH ? (
                                                    <StyledInternalLink
                                                        href={`/remove/${
                                                            currencyA && currencyEquals(currencyA, WETH[chainId])
                                                                ? 'ETH'
                                                                : currencyIdA
                                                        }/${
                                                            currencyB && currencyEquals(currencyB, WETH[chainId])
                                                                ? 'ETH'
                                                                : currencyIdB
                                                        }`}
                                                        style={{ color: '#fea31c' }}
                                                    >
                                                        Receive {Currency.getNativeCurrencySymbol(chainId)}
                                                    </StyledInternalLink>
                                                ) : null}
                                            </RowBetween>
                                        ) : null}
                                    </AutoColumn>
                                </LightCard>
                            </>
                        )}

                        {showDetailed && (
                            <>
                                <CurrencyInputPanel
                                    value={formattedAmounts[Field.LIQUIDITY]}
                                    onUserInput={onLiquidityInput}
                                    onMax={() => {
                                        onUserInput(Field.LIQUIDITY_PERCENT, '100')
                                    }}
                                    showMaxButton={!atMaxAmount}
                                    disableCurrencySelect
                                    currency={pair?.liquidityToken}
                                    pair={pair}
                                    id="liquidity-amount"
                                />
                                <ColumnCenter>
                                    <ArrowDown size="16" color={theme.text2} />
                                </ColumnCenter>
                                <CurrencyInputPanel
                                    hideBalance={true}
                                    value={formattedAmounts[Field.CURRENCY_A]}
                                    onUserInput={onCurrencyAInput}
                                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                                    showMaxButton={!atMaxAmount}
                                    currency={currencyA}
                                    label={'Output'}
                                    onCurrencySelect={handleSelectCurrencyA}
                                    id="remove-liquidity-tokena"
                                />
                                <ColumnCenter>
                                    <Plus size="16" color={theme.text2} />
                                </ColumnCenter>
                                <CurrencyInputPanel
                                    hideBalance={true}
                                    value={formattedAmounts[Field.CURRENCY_B]}
                                    onUserInput={onCurrencyBInput}
                                    onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                                    showMaxButton={!atMaxAmount}
                                    currency={currencyB}
                                    label={'Output'}
                                    onCurrencySelect={handleSelectCurrencyB}
                                    id="remove-liquidity-tokenb"
                                />
                            </>
                        )}
                        {pair && (
                            <div style={{ padding: '10px 20px' }}>
                                <RowBetween>
                                    Price:
                                    <div>
                                        1 {currencyA?.getSymbol(chainId)} ={' '}
                                        {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
                                        {currencyB?.getSymbol(chainId)}
                                    </div>
                                </RowBetween>
                                <RowBetween>
                                    <div />
                                    <div>
                                        1 {currencyB?.getSymbol(chainId)} ={' '}
                                        {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
                                        {currencyA?.getSymbol(chainId)}
                                    </div>
                                </RowBetween>
                            </div>
                        )}
                        <div style={{ position: 'relative' }}>
                            {!account ? (
                                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                            ) : (
                                <RowBetween>
                                    <ButtonConfirmed
                                        onClick={onAttemptToApprove}
                                        confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                                        disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                                        mr="0.5rem"
                                        fontWeight={700}
                                        fontSize={16}
                                    >
                                        {approval === ApprovalState.PENDING ? (
                                            <Dots>Approving</Dots>
                                        ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                                            'Approved'
                                        ) : (
                                            'Approve'
                                        )}
                                    </ButtonConfirmed>
                                    <ButtonError
                                        className="ml-2"
                                        onClick={() => {
                                            setShowConfirm(true)
                                        }}
                                        disabled={
                                            !isValid || (signatureData === null && approval !== ApprovalState.APPROVED)
                                        }
                                        error={
                                            !isValid &&
                                            !!parsedAmounts[Field.CURRENCY_A] &&
                                            !!parsedAmounts[Field.CURRENCY_B]
                                        }
                                    >
                                        <Text fontSize={16} fontWeight={700}>
                                            <span>{error || 'Remove'}</span>
                                        </Text>
                                    </ButtonError>
                                </RowBetween>
                            )}
                        </div>
                    </AutoColumn>
                </Wrapper>
            </div>

            {pair ? (
                // <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
                //     <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                // </AutoColumn>
                <div className="w-full max-w-2xl flex flex-col mt-4">
                    <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                </div>
            ) : null}
        </>
    )
}
