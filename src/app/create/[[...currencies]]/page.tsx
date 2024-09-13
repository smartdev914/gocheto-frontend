import React from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
const AddLiquidity = dynamic(() => import('../../../components/organisms/AddLiquidity'), { ssr: false })

export const metadata: Metadata = {
  title: "Create Liquidity | Gocheto",
  description: "",
}

const page = ({ params }: { params: { currencies: string[] } }) => {
  return <AddLiquidity currencyIdA={params?.currencies?.[0]} currencyIdB={params?.currencies?.[1]} />
}

export default page
