export const dynamic = "force-dynamic";

import { Metadata } from 'next'
import React from 'react'
import Faq from 'src/components/organisms/FaqPage'

export const metadata: Metadata = {
  title: "Faqs | Gocheto",
  description: "",
}

const page = () => {
  return <Faq />
}

export default page
