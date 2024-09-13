export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Testing | Gocheto",
  description: "",
}

export default function Pool () {
  return (
    <div className={'flex flex-col gap-4'}>
      <h1>Testing</h1>
    </div>
  )
}