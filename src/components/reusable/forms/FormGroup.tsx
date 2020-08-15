import React, { ReactNode } from 'react'

const FormGroup = ({
  children,
  label,
  labelFor,
}: {
  children: ReactNode
  label: string
  labelFor: string
}) => {
  return (
    <div className="form-group">
      <label className="form-group-label" htmlFor={labelFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default FormGroup
