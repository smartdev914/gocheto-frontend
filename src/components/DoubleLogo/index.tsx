import { Currency } from '@gocheto-dex/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
    margin?: boolean
    size?: number
    currency0?: Currency
    currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
    z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
    position: absolute;
    left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
    currency0,
    currency1,
    size = 24,
    margin = false
}: DoubleCurrencyLogoProps) {
    return (
        <Wrapper sizeraw={size} margin={margin}>
            <span
                className="doublelogo"
                style={{
                    position: 'relative',
                    top: '-10px',
                    marginRight: '-8px',
                    overflow: 'hidden',
                    borderRadius: '50%'
                }}
            >
                {currency0 && <HigherLogo currency={currency0} size={size.toString() + 'px'} />}
            </span>
            <span
                className="doublelogo"
                style={{ position: 'relative', top: '-10px', overflow: 'hidden', borderRadius: '50%' }}
            >
                {currency1 && <CoveredLogo currency={currency1} size={size.toString() + 'px'} sizeraw={size} />}
            </span>
        </Wrapper>
    )
}
