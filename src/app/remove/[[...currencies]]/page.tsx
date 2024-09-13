import { Metadata } from 'next'
import React from 'react'
import dynamic from 'next/dynamic'
const RemoveLiquidity = dynamic(() => import('../../../components/organisms/RemoveLiquidity'), { ssr: false })

export const metadata: Metadata = {
  title: "Remove Liquidity | Gocheto",
  description: "",
}

const page = ({ params }: { params: { currencies: string[] } }) => {
  return <RemoveLiquidity currencyIdA={params.currencies[0]} currencyIdB={params.currencies[1]} />
}

export default page
