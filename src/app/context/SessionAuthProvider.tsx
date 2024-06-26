 "use client";

import React, { Children } from 'react'
import { SessionProvider } from "next-auth/react";

interface props {
    children: React.ReactNode
}
const SessionAuthProvider = ({children}: props) => {
  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  )
}

export default SessionAuthProvider