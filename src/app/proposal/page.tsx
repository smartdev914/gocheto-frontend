export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Proposal from '../../container/Proposal/Proposal';

export const metadata: Metadata = {
  title: "Proposal | Gocheto",
  description: "",
}

const page = () => {
  return <Proposal />
}

export default page
