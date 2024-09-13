import { Currency, Percent, Price } from '@gocheto-dex/sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { AutoColumn } from '../../Column'
import { AutoRow } from '../../Row'
import { ONE_BIPS } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { Field } from '../../../state/mint/actions'
import { TYPE } from '../../../theme'

export const PoolShareBar = ({
    noLiquidity,
    poolTokenPercentage,
    price
}: {
    noLiquidity?: boolean
    poolTokenPercentage?: Percent
    price?: Price
}) => {

  return (
    <div style={{ backgroundColor: '#141824' }} className="poolPriceBar p-4 rounded-2xl w-full flex items-center justify-between">
      <p>Share of Pool</p>
      <span>
        {noLiquidity && price
            ? '100'
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ??
                '0'}
        %
      </span>
    </div>
  )
}

export function PoolPriceBar({
    currencies,
    noLiquidity,
    poolTokenPercentage,
    price
}: {
    currencies: { [field in Field]?: Currency }
    noLiquidity?: boolean
    poolTokenPercentage?: Percent
    price?: Price
}) {
    const { chainId } = useActiveWeb3React()
    const theme = useContext(ThemeContext)
    return (
        <AutoColumn gap="md">
            <AutoRow justify="space-around" gap="4px">
                <AutoColumn justify="center">
                    <TYPE.black>{price?.toSignificant(6) ?? '-'}</TYPE.black>
                    <Text fontWeight={500} fontSize={14} color={theme.text2} pt={1}>
                        {currencies[Field.CURRENCY_B]?.getSymbol(chainId)} per{' '}
                        {currencies[Field.CURRENCY_A]?.getSymbol(chainId)}
                    </Text>
                </AutoColumn>
                <AutoColumn justify="center">
                    <TYPE.black>{price?.invert()?.toSignificant(6) ?? '-'}</TYPE.black>
                    <Text fontWeight={500} fontSize={14} color={theme.text2} pt={1}>
                        {currencies[Field.CURRENCY_A]?.getSymbol(chainId)} per{' '}
                        {currencies[Field.CURRENCY_B]?.getSymbol(chainId)}
                    </Text>
                </AutoColumn>
                <AutoColumn justify="center">
                    <TYPE.black>
                        {noLiquidity && price
                            ? '100'
                            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ??
                              '0'}
                        %
                    </TYPE.black>
                    <Text fontWeight={500} fontSize={14} color={theme.text2} pt={1}>
                        Share of Pool
                    </Text>
                </AutoColumn>
            </AutoRow>
        </AutoColumn>
    )
}
