'use client'
import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { ChainId, Currency, ETHER, Percent } from '@gocheto-dex/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import Scale from '../Chart/Scale'
import CurrencyLogo, { logo } from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../TransactionConfirmationModal'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { usePairContract } from '../../hooks/useContract'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/burn/actions'
import { Field as FIELD } from '../../state/mint/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../state/burn/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import {
    calculateGasMargin,
    calculateSlippageAmount,
    getShibaSwapRouterAddress,
    getShibaSwapRouterContract
} from '../../utils'
import { currencyId } from '../../utils/currencyId'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useRouter } from 'next/navigation'
import PoolLayout from './PoolLayout'
import { MouseoverTooltip } from '../Tooltip'
import { ErrorOutline } from '@material-ui/icons'
import CurrencyInput from '../molecules/CurrencyInput'
import { useDerivedMintInfo, useMintActionHandlers } from 'src/state/mint/hooks'
import Image from 'next/image'

export default function RemovePage({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) {
    const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
    const { account, chainId, provider } = useActiveWeb3React()
    const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
        currencyA,
        currencyB,
        chainId
    ])
    const router = useRouter()

    /****
     * 
     * 
     * NEW CODE OF REMOVE LIQUIDITY
     * 
     */

    const [scales, setScales] = useState([30, 30, 30, 30, 30])

    const setScale = (scale: number, index: number) => {
        const newScales = [...scales]
        newScales[index] = scale
        setScales(newScales)

        // for top 3 tokens
        if (index < 3) {
            // first 3 are legacy but let's keep reserved
        }
        if (index == 5) onUserInput(Field.LIQUIDITY_PERCENT, `${scale}`)
    }

    const { currencies, noLiquidity } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  
  
    const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  
  
    const handleCurrencyASelect = useCallback(
        (currencyA: Currency) => {
            const newCurrencyIdA = currencyId(currencyA)
            if (newCurrencyIdA === currencyIdB) {
                router.push(`/newremove/${currencyIdB}/${currencyIdA}`, { scroll: false })
                // history.push(`/add/${currencyIdB}/${currencyIdA}`)
            } else {
                router.push(`/newremove/${newCurrencyIdA}/${currencyIdB}`, { scroll: false })
                // history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
            }
        },
        [currencyIdB, currencyIdA, router]
    )
  
    const handleCurrencyBSelect = useCallback(
      (currencyB: Currency) => {
          const newCurrencyIdB = currencyId(currencyB)
          if (currencyIdA === newCurrencyIdB) {
              if (currencyIdB) {
                  router.push(`/newremove/${currencyIdB}/${newCurrencyIdB}`, { scroll: false })
                  // history.push(`/newremove/${currencyIdB}/${newCurrencyIdB}`)
              } else {
                  router.push(`/newremove/${newCurrencyIdB}`, { scroll: false })
                  // history.push(`/newremove/${newCurrencyIdB}`)
              }
          } else {
              router.push(`/newremove/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`, { scroll: false })
              // history.push(`/newpool/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
          }
      },
      [currencyIdA, currencyIdB, router]
  )
  

    /****
     * 
     * 
     * NEW CODE OF REMOVE LIQUIDITY
     * 
     */

    const theme = useContext(ThemeContext)

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // burn state
    const { independentField, typedValue } = useBurnState()
    const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
    const { onUserInput: _onUserInput } = useBurnActionHandlers()
    const isValid = !error

    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
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
                name: 'Gocheto LP Token',
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
                        {'Gocheto ' + currencyA?.getSymbol(chainId) + '/' + currencyB?.getSymbol(chainId)} Burned
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


    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        setSignatureData(null) // important that we clear signature data to avoid bad sigs
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.LIQUIDITY_PERCENT, '0')
        }
        setTxHash('')
    }, [onUserInput, txHash])


    return (
        <PoolLayout
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
          pair={pair ? pair : undefined}
        >
          <div style={{ backgroundColor: '#222540' }} className={'p-5 rounded-2xl w-full flex flex-col gap-4 items-start'}>
            {/** Header */}
            <MouseoverTooltip text="Total Value Locked (TVL) represents the total value of assets locked in liquidity pools. TVL reflects the depth and market capacity of the pool, crucial for assessing liquidity and potential performance">
                <span className={'text-white text-2xl font-medium mr-2'}>Remove Liquidity</span>
                <ErrorOutline />
            </MouseoverTooltip>

            <div className={'flex w-full items-center justify-between'}>
            <label className={'text-white text-3xl font-semibold'}>
                <input
                  value={formattedAmounts[Field.LIQUIDITY_PERCENT]}
                  style={{ width: '52px'}}
                  className={'bg-transparent mr-0.5 min-w-0 text-right font-semibold w-14 px-0 py-0 text-3xl border-0 outline-none'}
                  type='number'
                  onChange={(e) => {
                    if (parseFloat(e.target.value) > 100) return
                    onUserInput(Field.LIQUIDITY_PERCENT, e.target.value)
                  }}
                />
                %
            </label>

            <Scale
                value={scales[5]}
                setScale={scale => {
                setScale(scale, 5)
                }}
                options={{
                '25%': 25,
                '50%': 50,
                '75%': 75,
                '100%': 100
                }}
                size={'large'}
            />
            </div>
            
            <div style={{ backgroundColor: '#141824' }} className={'py-4 rounded-2xl w-full'}>
            <h5 className={'text-xl font-medium text-white pb-6 px-4'}>Liquidity amount</h5>
            <CurrencyInput
                customStyle={'-mb-0 md:-mb-4'}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                onMax={() => { onUserInput(Field.LIQUIDITY_PERCENT, '100') }}
                onCurrencySelect={handleCurrencyASelect}
                showMaxButton={true}
                currency={currencies[Field.CURRENCY_A]}
                currenciesAB={currencies}
                type={FIELD.CURRENCY_A}
                id="add-liquidity-input-tokena"
                hideBalance
                showCommonBases 
            />
            <div className={'w-full flex items-center'}>
                <hr className={'h-0.5 bg-gray-600 flex-1'} />
                <div style={{ backgroundColor: '#202740' }} className={'text-4xl font-normal text-white border-2 border-gray-600 w-12 h-12 rounded-full flex items-center justify-center'}>+</div>
                <hr className={'h-0.5 bg-gray-600 flex-1'} />
            </div>
            <CurrencyInput
                customStyle={'-mt-0 md:-mt-2'}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onFieldBInput}
                onMax={() => { onUserInput(Field.LIQUIDITY_PERCENT, '100') }}
                onCurrencySelect={handleCurrencyBSelect}
                showMaxButton={true}
                currency={currencies[Field.CURRENCY_B]}
                currenciesAB={currencies}
                type={FIELD.CURRENCY_B}
                id="add-liquidity-input-tokena"
                hideBalance
                showCommonBases 
            />
            </div>

            <div className={'w-full flex items-center justify-between'}>
            <span>
                Gas Fee
            </span>  
            <div className={'flex items-center gap-2 text-lg font-normal'}>
                <span className='font-semibold'>0.01</span>
                <Image src={logo[chainId ?? 1]} alt='currency logo' width={30} height={30} />
            </div>
        </div>


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
            <div className={'w-full'}>

              <div style={{ position: 'relative' }}>
                {!account ? (
                    <ButtonLight className={'m-0'} onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                ) : (
                    <RowBetween className={'gap-2'}>
                        <ButtonConfirmed
                            onClick={onAttemptToApprove}
                            className="m-0"
                            confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                            disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
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
                            className="m-0"
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
            </div>
        </div>
        </PoolLayout>
    )
}
