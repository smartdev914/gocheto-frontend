import { Currency, Pair } from '@gocheto-dex/sdk'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import  DropDown from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import useTheme from '../../hooks/useTheme'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { Field } from '../../state/mint/actions'
import Image from 'next/image'

const CurrencySelect = styled.button<{ selected: boolean }>`
    align-items: center;
    height: 100%;
    font-size: 20px;
    font-weight: 500;
    background-color: #222540;
    min-width: 160px;
    // color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    // border-radius: ${({ theme }) => theme.borderRadius};
    // box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
    outline: none;
    cursor: pointer;
    user-select: none;
    border: none;
    // padding: 0 0.5rem;

    :focus,
    :hover {
        opacity: 0.8;
    }
`


const StyledTokenName = styled.span<{ active?: boolean }>`
//   ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
//   font-size:  ${({ active }) => (active ? '24px' : '12px')};
`

const InputGroupStyle: any = {
    margin: '0 0.75rem',
}

const InputTextStyle: any = {
    outline: 'none',
    background: 'transparent !important',
    border: 'none',
    width: '100%',
    padding: '0.5rem 0',
    fontSize: '120%',
    color: '#d5d5d5'
}

interface CurrencyInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: (currency: Currency) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    customStyle: any
    otherCurrency?: Currency | null
    currenciesAB?: { [field in Field]?: Currency }
    type?: Field
    id: string
    showCommonBases?: boolean
    customBalanceText?: string
    cornerRadiusBottomNone?: boolean
    cornerRadiusTopNone?: boolean
    containerBackground?: string
}

export default function CurrencyInput({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = '',
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    otherCurrency,
    customStyle,
    currenciesAB,
    type,
    id,
    showCommonBases,
    customBalanceText,
    cornerRadiusBottomNone,
    cornerRadiusTopNone,
    containerBackground
}: CurrencyInputPanelProps) {
    const { t } = useTranslation()

    const [modalOpen, setModalOpen] = useState(false)
    const { account, chainId } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const theme = useTheme()

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    return (
        <div id={id} style={InputGroupStyle} className={'relative ' + customStyle}>
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between">

                <div
                    style={{ minWidth: '170px' }}
                    className="w-full sm:w-2/5 flex flex-col items-start py-2"
                >
                    <CurrencySelect
                        selected={!!currency}
                        className="open-currency-select-button float-left h-12 px-4 py-2 rounded-2xl"
                        onClick={() => {
                            if (!disableCurrencySelect) {
                                setModalOpen(true)
                            }
                        }}
                    >
                        <div className="flex items-center">
                            {pair ? (
                                <DoubleCurrencyLogo
                                    currency0={pair.token0}
                                    currency1={pair.token1}
                                    size={32}
                                    margin={true}
                                />
                            ) : currency ? (
                                <div className="flex-1" style={{ width: 32, height: 32 }}>
                                    <CurrencyLogo currency={currency} size={'32px'} />
                                </div>
                            ) : (
                                <div className="rounded" style={{ maxWidth: 32, maxHeight: 32 }}>
                                    <div style={{ width: 32, height: 32 }} className="questions flex items-center justify-center">
                                        <span className={'text-xl'}>?</span>
                                    </div>
                                </div>
                            )}
                            {pair ? (
                                <StyledTokenName className="pair-name-container">
                                    {pair?.token0.symbol}:{pair?.token1.symbol}
                                </StyledTokenName>
                            ) : (
                                <div className="flex flex-1 flex-col items-start justify-center mx-3.5">
                                    <div className="flex items-center relative">
                                        <div
                                            style={{ fontFamily: 'Metric - Bold' }}
                                            className="text-lg md:text-2xl font-bold token-style"
                                        >
                                            {(currency && currency.symbol && currency.symbol.length > 20
                                                ? currency.symbol.slice(0, 4) +
                                                  '...' +
                                                  currency.symbol.slice(
                                                      currency.symbol.length - 5,
                                                      currency.symbol.length
                                                  )
                                                : currency?.getSymbol(chainId || 1)) || (
                                                <div
                                                    className="bg-transparent border border-low-emphesis rounded-full py-1 px-0 text-secondary text-xs font-medium whitespace-nowrap row"
                                                    style={{ border: 0, fontFamily: 'Metric - Bold' }}
                                                >
                                                    {t('Select Token')}
                                                </div>
                                            )}
                                        </div>
                                        {!disableCurrencySelect && currency && (
                                            <Image alt='Chevron' width={14} height={14} src={DropDown} className="absolute -right-3.5" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CurrencySelect>

                    {!hideInput && (
                        <>
                            {account && (
                                <div
                                    onClick={onMax}
                                    className="cursor-pointer text-sm font-semibold mt-1.5 text-white balance"
                                >
                                    {!hideBalance && !!currency && selectedCurrencyBalance
                                        ? (customBalanceText ?? 'Balance Available: ') + selectedCurrencyBalance?.toSignificant(6) + ' ' + currency.symbol
                                        : ''}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div
                    style={InputTextStyle}
                    className="ml-4 flex items-end flex-col rounded min-w-0 space-x-3 p-3 w-full sm:w-3/5 currency-div"
                >
                    {!hideInput && (
                        <>
                            <NumericalInput
                                className="token-amount-input text-right"
                                value={value}
                                placeholder='0.00'
                                onUserInput={val => {
                                    onUserInput(val)
                                }}
                            />
                            {account && label !== 'To' && (
                                <button
                                    onClick={onMax}
                                    className="bg-transparent border-0 rounded-full py-1 px-0 text-yellow-500 uppercase text-sm font-semibold whitespace-nowrap"
                                >
                                    MAX
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            {!disableCurrencySelect && chainId && onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    selectedCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                    showCommonBases={showCommonBases}
                    currenciesAB={currenciesAB}
                    type={type}
                />
            )}
        </div>
    )
}