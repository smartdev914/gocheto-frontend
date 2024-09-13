import React from 'react'
import { Metadata } from 'next'
import RemovePage from 'src/components/organisms/RemovePage'

export const metadata: Metadata = {
  title: "Remove Liquidity | Gocheto",
  description: "",
}

export default function Pool ({ params }: { params: { currencies: string[] } }) {
  return (
    <RemovePage currencyIdA={params?.currencies?.[0] ?? undefined} currencyIdB={params?.currencies?.[1] ?? undefined} />
  )
}