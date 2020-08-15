import React, { ReactNode } from 'react'

const FormContent = ({ children }: { children: ReactNode }) => {
  return <div className="form-content">{children}</div>
}

export default FormContent
