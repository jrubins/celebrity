import React, { ReactNode } from 'react'

const CTAHeader = ({ children }: { children: ReactNode }) => {
  return <div className="cta-header">{children}</div>
}

export default CTAHeader
