import React from 'react'
import QuestionLogo from './QuestionLogo'
import { Avatar } from '@material-ui/core'
import { getTokenLogoURL } from '../CurrencyLogo'

const TokenQuantity = ({ symbol, address, chainId, quantity }) => {
  return (
    <div className={'w-full flex items-center justify-between'}>
      <p>{symbol === '' ? '-' : symbol}</p>
      <span className={'flex gap-1.5 items-center'}>
        <p>{quantity ?? '-'}</p>
        {!address
          ? <QuestionLogo />
          : <Avatar src={getTokenLogoURL(address, chainId)} className={'bg-white text-gray-800 text-center h-7 w-7'}>
              {symbol[0]}
            </Avatar>
      }
      </span>
    </div>
  )
}

export default TokenQuantity
