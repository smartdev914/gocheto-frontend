import React from 'react'
import { Metadata } from 'next'
import PoolPage from 'src/components/organisms/PoolPage'

export const metadata: Metadata = {
  title: "POOL | Gocheto",
  description: "",
}

export default function Pool ({ params }: { params: { currencies: string[] } }) {
  return (
    <PoolPage currencyIdA={params?.currencies?.[0] ?? undefined} currencyIdB={params?.currencies?.[1] ?? undefined} />
  )
}