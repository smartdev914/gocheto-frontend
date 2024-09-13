export const dynamic = "force-dynamic";

import React from 'react'
import { redirect } from 'next/navigation'

const page = () => {
  redirect('/swap')

  return <div>Send</div>
}

export default page
