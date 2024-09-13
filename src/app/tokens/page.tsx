export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Tokens from '../../components/organisms/Tokens'

export const metadata: Metadata = {
  title: "Tokens | Gocheto",
  description: "",
}

const page = () => {
  return <Tokens />
}

export default page
