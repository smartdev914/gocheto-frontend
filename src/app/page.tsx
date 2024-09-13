export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import Home from '../components/organisms/Home'

export const metadata: Metadata = {
  title: "Overview | Gocheto",
  description: "",
}

export default function Page () {
  return (
    <Home />
  )
}
