import React from 'react'
import dynamic from 'next/dynamic'
const Tokens = dynamic(() => import('../../components/organisms/Tokens'), { ssr: false })

export const TokenPage = () => {
  return (
    <Tokens />
  )
}
