'use client'
import React, { useCallback, useState } from 'react'
import { logo } from '../CurrencyLogo'
import { useRouter } from 'next/navigation'
import Scale from '../Chart/Scale'
import { useLiquidityAnalytics, useVolumeAnalytics } from 'src/hooks/useTokensData'
import { ErrorOutline } from '@material-ui/icons'
import { MouseoverTooltip } from '../Tooltip'
import Image from 'next/image'
import CurrencyInput from '../molecules/CurrencyInput'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'src/state/mint/hooks'
import { useCurrency } from 'src/hooks/Tokens'
import { Field } from '../../state/mint/actions'
import { maxAmountSpend } from 'src/utils/maxAmountSpend'
import { Currency, TokenAmount } from '@gocheto-dex/sdk'
import { currencyId } from 'src/utils/currencyId'
import { useActiveWeb3React } from 'src/hooks'
import PoolLayout from './PoolLayout'


const ClaimPage = ({ currencyIdA, currencyIdB }: { currencyIdA?: string; currencyIdB?: string }) => {
  const router = useRouter()
  const analyticsLiq = useLiquidityAnalytics()
  const analyticsVol = useVolumeAnalytics()
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const { chainId } = useActiveWeb3React()
  const [percentage, setPercentage] = useState(27)
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const [scales, setScales] = useState([30, 30, 30, 30, 30])

    const setScale = (scale: number, index: number) => {
        const newScales = [...scales]
        newScales[index] = scale
        setScales(newScales)

        // for top 3 tokens
        if (index < 3) {
            // first 3 are legacy but let's keep reserved
        }
        if (index == 3) analyticsLiq.fetchData({ scale })
        if (index == 4) analyticsVol.fetchData({ scale })
        if (index == 5) setPercentage(scale)
    }

    const { dependentField, currencies, pair, parsedAmounts, noLiquidity } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const handleCurrencyASelect = useCallback(
      (currencyA: Currency) => {
          const newCurrencyIdA = currencyId(currencyA)
          if (newCurrencyIdA === currencyIdB) {
              router.push(`/newclaim/${currencyIdB}/${currencyIdA}`, { scroll: false })
              // history.push(`/add/${currencyIdB}/${currencyIdA}`)
          } else {
              router.push(`/newclaim/${newCurrencyIdA}/${currencyIdB}`, { scroll: false })
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
                router.push(`/newclaim/${currencyIdB}/${newCurrencyIdB}`, { scroll: false })
                // history.push(`/newclaim/${currencyIdB}/${newCurrencyIdB}`)
            } else {
                router.push(`/newclaim/${newCurrencyIdB}`, { scroll: false })
                // history.push(`/newclaim/${newCurrencyIdB}`)
            }
        } else {
            router.push(`/newclaim/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`, { scroll: false })
            // history.push(`/newclaim/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
        }
    },
    [currencyIdA, currencyIdB, router]
)

    // get formatted amounts
    const formattedAmounts = {
      [independentField]: typedValue,
      [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

  return (
    <PoolLayout
      currencyIdA={currencyIdA}
      currencyIdB={currencyIdB}
      pair={pair ? pair : undefined}
    >
          <div style={{ backgroundColor: '#222540' }} className={'p-5 rounded-2xl w-full flex flex-col gap-4 items-start'}>
            {/** Header */}
            <div style={{ backgroundColor: '#222540' }} className={'p-5 rounded-2xl w-full flex flex-col gap-4 items-start'}>
            {/** Header */}
            <MouseoverTooltip text="Total Value Locked (TVL) represents the total value of assets locked in liquidity pools. TVL reflects the depth and market capacity of the pool, crucial for assessing liquidity and potential performance">
                <span className={'text-white text-2xl font-medium mr-2'}>Claim Rewards</span>
                <ErrorOutline />
            </MouseoverTooltip>

            <div className={'flex w-full items-center justify-between'}>
            <label className={'text-white text-3xl font-semibold'}>
                <input
                  value={percentage}
                  style={{ width: '52px'}}
                  className={'bg-transparent mr-0.5 min-w-0 text-right font-semibold w-14 px-0 py-0 text-3xl border-0 outline-none'}
                  type='number'
                  onChange={(e) => {
                    if (parseFloat(e.target.value) > 100) return
                    setPercentage(parseFloat(e.target.value))
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
            <CurrencyInput
                customStyle={'-mb-0 md:-mb-4'}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                onMax={() => { }}
                onCurrencySelect={handleCurrencyASelect}
                showMaxButton={true}
                currency={currencies[Field.CURRENCY_A]}
                currenciesAB={currencies}
                type={Field.CURRENCY_A}
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
                onMax={() => { }}
                onCurrencySelect={handleCurrencyBSelect}
                showMaxButton={true}
                currency={currencies[Field.CURRENCY_B]}
                currenciesAB={currencies}
                type={Field.CURRENCY_B}
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
            <div className={'w-full flex items-center justify-end'}>
              <button style={{ backgroundColor: '#FF7A1C' }} className={'px-12 py-2 text-white text-lg font-semibold text-center border-0 outline-none rounded-md'}>Claim Rewards</button>
            </div>

          </div>
        </div>
    </PoolLayout>
  )
}

export default ClaimPage