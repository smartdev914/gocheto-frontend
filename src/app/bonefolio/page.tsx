export const dynamic = "force-dynamic";

import React from 'react'
import { Metadata } from 'next'
import  Bonefolio from 'src/components/organisms/Bonefolio'

export const metadata: Metadata = {
  title: "Bonefolio | Gocheto",
  description: "",
}

const page = () => {
  return <Bonefolio />
}

export default page
