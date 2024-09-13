export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Yield from '../../components/organisms/Yield'

export const metadata: Metadata = {
  title: "WOOF | Gocheto",
  description: "Farm BONE by staking LP (Liquidity Provider) tokens",
}

export default function Rewards() {
  return <Yield />
}
