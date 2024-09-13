import React from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
const BuryDogYard = dynamic(() => import('src/components/organisms/Bury/BuryDogYard'), { ssr: false })

export const metadata: Metadata = {
  title: "BURY | Gocheto",
  description: "",
}

const page = ({ params }: { params: { tokenName: string } }) => {
  return <BuryDogYard tokenName={params.tokenName} />
}

export default page
