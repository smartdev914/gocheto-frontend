import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'
import { Token } from '@gocheto-dex/sdk'
import CurrencyLogo from '../../components/CurrencyLogo'
import { unwrappedToken } from '../../utils/wrappedCurrency'

const TooltipContainer = styled.div`
    width: 228px;
    padding: 0.6rem 1rem;
    line-height: 150%;
    font-weight: 500;
    border: 1px solid #e4e4e4;
    border-radius: 0.625rem !important;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
    text: string
    className?: string
}

export default function Tooltip({ text, className = '', ...rest }: TooltipProps) {
    return <Popover content={<TooltipContainer className={'border-0'}>{text}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, className, ...rest }: Omit<TooltipProps, 'show'>) {
    const [show, setShow] = useState(false)
    const open = useCallback(() => setShow(true), [setShow])
    const close = useCallback(() => setShow(false), [setShow])
    return (
        <Tooltip className={className} {...rest} show={show}>
            <div onMouseEnter={open} onMouseLeave={close}>
                {children}
            </div>
        </Tooltip>
    )
}

interface TooltipInfoProps extends TooltipProps {
    currency0: Token;
    currency1: Token;
    quantity0: string;
    quantity1: string;
    chainId?: number;
}

export function TooltipInfo({ currency0, currency1, quantity0, quantity1, chainId = 1, ...rest }: TooltipInfoProps) {
    const token0 = unwrappedToken(currency0)
    const token1 = unwrappedToken(currency1)
    return <Popover content={
    <TooltipContainer className='w-full border-0'>
        <div>Token Allocation</div>
        <div className={'w-full flex items-center gap-8 mt-2'}>
            <p>{currency0.symbol}</p>
            <span className={'flex items-center gap-1 flex-1 justify-end'}>
                {quantity0}
                <CurrencyLogo currency={token0} size={'16px'} />
            </span>
        </div>
        <div className={'w-full flex items-center gap-8'}>
            <p>{currency1.symbol}</p>
            <span className={'flex items-center gap-1 flex-1 justify-end'}>
                {quantity1}
                <CurrencyLogo currency={token1} size={'16px'} />
            </span>
        </div>
    </TooltipContainer>} {...rest} />
}

export function MouseHoverTooltipInfo({ children, ...rest }: Omit<TooltipInfoProps, 'show'>) {
    const [show, setShow] = useState(false)
    const open = useCallback(() => setShow(true), [setShow])
    const close = useCallback(() => setShow(false), [setShow])
    return (
        <TooltipInfo {...rest} show={show}>
            <div onMouseEnter={open} onMouseLeave={close}>
                {children}
            </div>
        </TooltipInfo>
    )
}
