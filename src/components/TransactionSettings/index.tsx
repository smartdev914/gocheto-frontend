import { darken } from 'polished'
import React, { useContext, useRef, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'

enum SlippageError {
    InvalidInput = 'InvalidInput',
    RiskyLow = 'RiskyLow',
    RiskyHigh = 'RiskyHigh'
}

enum DeadlineError {
    InvalidInput = 'InvalidInput'
}

const FancyButton = styled.button`
    color: ${({ theme }) => theme.text1};
    align-items: center;
    height: 2rem;
    border-radius: 5px;
    font-size: 1rem;
    width: auto;
    min-width: 3.5rem;
    font-weight: 500;
    border: 1px solid ${({ theme }) => theme.bg3};
    outline: none;
    background: #202231;
    :hover {
        border: 1px solid ${({ theme }) => theme.bg4};
    }
    :focus {
        border: 1px solid ${({ theme }) => theme.primary1};
    }
`

const Option = styled(FancyButton)<{ active: boolean }>`
    :hover {
        cursor: pointer;
    }
    line-height: 1.2rem;
    font-weight: 500;
    background-color: ${({ active, theme }) => active && '#ffb73c'};
    color: ${({ active, theme }) => (active ? theme.white : theme.text1)};
`

const Input = styled.input`
    background: #202231;
    font-size: 16px;
    width: auto;
    outline: none;
    font-weight: 500;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
    text-align: right;
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
    height: 2rem;
    position: relative;
    padding: 0 0.75rem;
    flex: 1;
    font-weight: 500;
    background-color: #202231 !important;
    border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : '#ffb73c'}`};
    :hover {
        border: ${({ theme, active, warning }) =>
            active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary1)}`};
    }

    input {
        width: 100%;
        height: 100%;
        border: 0px;
        border-radius: 2rem;
    }
`

const SlippageEmojiContainer = styled.span`
    color: #f3841e;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`

export interface SlippageTabsProps {
    rawSlippage: number
    setRawSlippage: (rawSlippage: number) => void
    deadline: number
    setDeadline: (deadline: number) => void
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
    const theme = useContext(ThemeContext)

    const inputRef = useRef<HTMLInputElement>()

    const [slippageInput, setSlippageInput] = useState((rawSlippage / 100).toFixed(2))
    const [deadlineInput, setDeadlineInput] = useState((deadline / 60).toString())

    const slippageInputIsValid =
        slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
    const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

    let slippageError: SlippageError | undefined
    if (slippageInput !== '' && !slippageInputIsValid) {
        slippageError = SlippageError.InvalidInput
    } else if (slippageInputIsValid && rawSlippage < 50) {
        slippageError = SlippageError.RiskyLow
    } else if (slippageInputIsValid && rawSlippage > 500) {
        slippageError = SlippageError.RiskyHigh
    } else {
        slippageError = undefined
    }

    let deadlineError: DeadlineError | undefined
    if (deadlineInput !== '' && !deadlineInputIsValid) {
        deadlineError = DeadlineError.InvalidInput
    } else {
        deadlineError = undefined
    }

    function parseCustomSlippage(value: string) {
        setSlippageInput(value)

        try {
            const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
            if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
                setRawSlippage(valueAsIntFromRoundedFloat)
            }
        } catch {}
    }

    function parseCustomDeadline(value: string) {
        value = parseInt(value) < 200 ? value : '200'
        setDeadlineInput(value)

        try {
            const valueAsInt: number = Number.parseInt(value) * 60
            if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
                setDeadline(valueAsInt)
            }
        } catch {}
    }

    return (
        <AutoColumn gap="md">
            <AutoColumn gap="sm">
                <RowFixed>
                    <TYPE.black fontWeight={500} fontSize={14} color={theme.text2}>
                        Slippage tolerance
                    </TYPE.black>
                    <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
                </RowFixed>
                <RowBetween className={'flex flex-col sm:flex-row gap-2 w-full'}>
                    <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                        <Option
                            onClick={() => {
                                setSlippageInput('0.1')
                                setRawSlippage(10)
                            }}
                            active={rawSlippage === 10}
                        >
                            0.1%
                        </Option>
                        <Option
                            onClick={() => {
                                setSlippageInput('0.5')
                                setRawSlippage(50)
                            }}
                            active={rawSlippage === 50}
                        >
                            0.5%
                        </Option>
                        <Option
                            onClick={() => {
                                setSlippageInput('1')
                                setRawSlippage(100)
                            }}
                            active={rawSlippage === 100}
                        >
                            1%
                        </Option>
                    </div>
                    <OptionCustom
                        active={![10, 50, 100].includes(rawSlippage)}
                        warning={!slippageInputIsValid}
                        tabIndex={-1}
                        className={'w-full'}
                    >
                        <RowBetween style={{ lineHeight: '1.3rem' }}>
                            {!!slippageInput &&
                            (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
                                <SlippageEmojiContainer>
                                    <span role="img" aria-label="warning">
                                        ⚠️
                                    </span>
                                </SlippageEmojiContainer>
                            ) : null}
                            {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
                            <Input
                                ref={inputRef as any}
                                placeholder={(rawSlippage / 100).toFixed(2)}
                                value={slippageInput}
                                onBlur={() => {
                                    parseCustomSlippage((rawSlippage / 100).toFixed(2))
                                }}
                                onChange={e => parseCustomSlippage(e.target.value)}
                                color={!slippageInputIsValid ? 'red' : ''}
                            />
                            <span
                                style={{
                                    lineHeight: '1rem',
                                    fontSize: '1rem',
                                    paddingTop: '0.2rem',
                                    paddingLeft: '0.2rem'
                                }}
                            >
                                %
                            </span>
                        </RowBetween>
                    </OptionCustom>
                </RowBetween>
                {!!slippageError && (
                    <RowBetween
                        style={{
                            fontSize: '14px',
                            paddingTop: '7px',
                            color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'
                        }}
                    >
                        {slippageError === SlippageError.InvalidInput
                            ? 'Enter a valid slippage percentage'
                            : slippageError === SlippageError.RiskyLow
                            ? 'Your transaction may fail'
                            : 'Your transaction may be frontrun'}
                    </RowBetween>
                )}
            </AutoColumn>

            <AutoColumn gap="sm">
                <RowFixed>
                    <TYPE.black fontSize={14} fontWeight={500} color={theme.text2}>
                        Transaction deadline
                    </TYPE.black>
                    <QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
                </RowFixed>
                <RowFixed>
                    <OptionCustom style={{ width: '80px' }} tabIndex={-1}>
                        <Input
                            color={!!deadlineError ? 'red' : undefined}
                            onBlur={() => {
                                parseCustomDeadline((deadline / 60).toString())
                            }}
                            placeholder={(deadline / 60).toString()}
                            value={deadlineInput}
                            onChange={e => parseCustomDeadline(e.target.value)}
                        />
                    </OptionCustom>
                    <TYPE.body style={{ paddingLeft: '8px' }} fontSize={14} fontWeight={500}>
                        minutes
                    </TYPE.body>
                </RowFixed>
            </AutoColumn>
        </AutoColumn>
    )
}
