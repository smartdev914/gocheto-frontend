import React from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
const Swap = dynamic(() => import('../../../components/organisms/Swap'), { ssr: false })

export const metadata: Metadata = {
  title: "SWAP | Gocheto",
  description: "Gocheto allows for swapping of ERC20 compatible tokens across multiple networks",
}

const page = ({ params }: { params: { currencies: string[] } }) => {
  return <Swap params={params} />
}

export default page
