import React, { ReactNode } from 'react'

const Page = ({
  children,
  sidebarContent,
}: {
  children: ReactNode
  sidebarContent: ReactNode
}) => {
  return (
    <div className="page">
      <div className="sidebar">
        <h1>Celebrity</h1>
        <div className="sidebar-content">{sidebarContent}</div>
      </div>
      <main>{children}</main>
    </div>
  )
}

export default Page
