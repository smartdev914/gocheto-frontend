export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Bury from 'src/components/organisms/Bury'

export const metadata: Metadata = {
  title: "BURY | Gocheto",
  description: "",
}

const page = () => {
  return <Bury />
}

export default page
