export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import  PoolFinder from 'src/components/organisms/PoolFinder'

export const metadata: Metadata = {
  title: "Find Pool | Gocheto",
  description: "",
}

const page = () => {
  return <PoolFinder />
}

export default page
