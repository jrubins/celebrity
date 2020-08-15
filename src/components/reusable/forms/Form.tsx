import React, { ReactNode } from 'react'

const Form = ({ children }: { children: ReactNode }) => {
  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      {children}
    </form>
  )
}

export default Form
