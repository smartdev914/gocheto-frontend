export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Pool from '../../components/organisms/Pool'

export const metadata: Metadata = {
  title: "POOL | Gocheto",
  description: "",
}

const page = () => {
  return <Pool />
}

export default page
