import { Currency, CurrencyAmount, Fraction, Percent } from '@gocheto-dex/sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../ButtonLegacy'
import CurrencyLogo from '../../CurrencyLogo'
import { RowBetween, RowFixed } from '../../Row'
import { useActiveWeb3React } from '../../../hooks'
import { Field } from '../../../state/mint/actions'
import { TYPE } from '../../../theme'

export function ConfirmAddModalBottom({
    noLiquidity,
    price,
    currencies,
    parsedAmounts,
    poolTokenPercentage,
    onAdd
}: {
    noLiquidity?: boolean
    price?: Fraction
    currencies: { [field in Field]?: Currency }
    parsedAmounts: { [field in Field]?: CurrencyAmount }
    poolTokenPercentage?: Percent
    onAdd: () => void
}) {
    const { chainId } = useActiveWeb3React()
    return (
        <>
            <RowBetween>
                <TYPE.body>{currencies[Field.CURRENCY_A]?.getSymbol(chainId)} Deposited</TYPE.body>
                <RowFixed>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px', }} />
                    <TYPE.body>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.body>
                </RowFixed>
            </RowBetween>
            <RowBetween>
                <TYPE.body>{currencies[Field.CURRENCY_B]?.getSymbol(chainId)} Deposited</TYPE.body>
                <RowFixed>
                    <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
                    <TYPE.body>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.body>
                </RowFixed>
            </RowBetween>
            <RowBetween>
                <TYPE.body>Rates</TYPE.body>
                <TYPE.body>
                    {`1 ${currencies[Field.CURRENCY_A]?.getSymbol(chainId)} = ${price?.toSignificant(4)} ${currencies[
                        Field.CURRENCY_B
                    ]?.getSymbol(chainId)}`}
                </TYPE.body>
            </RowBetween>
            <RowBetween style={{ justifyContent: 'flex-end' }}>
                <TYPE.body>
                    {`1 ${currencies[Field.CURRENCY_B]?.getSymbol(chainId)} = ${price
                        ?.invert()
                        .toSignificant(4)} ${currencies[Field.CURRENCY_A]?.getSymbol(chainId)}`}
                </TYPE.body>
            </RowBetween>
            <RowBetween>
                <TYPE.body>Share of Pool:</TYPE.body>
                <TYPE.body>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.body>
            </RowBetween>
            <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
                <Text>
                    <span className="fontFamily">{noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}</span>
                </Text>
            </ButtonPrimary>
        </>
    )
}
