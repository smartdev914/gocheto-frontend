import React from 'react'
import { Metadata } from 'next'
import ClaimPage from 'src/components/organisms/ClaimPage'

export const metadata: Metadata = {
  title: "Claim Rewards | Gocheto",
  description: "",
}

export default function Pool ({ params }: { params: { currencies: string[] } }) {
  return (
    <ClaimPage currencyIdA={params?.currencies?.[0] ?? undefined} currencyIdB={params?.currencies?.[1] ?? undefined} />
  )
}