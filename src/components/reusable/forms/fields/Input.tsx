import React from 'react'

const Input = ({
  name,
  onChange,
  placeholder,
  value,
}: {
  name: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) => {
  return (
    <input
      className="input"
      id={name}
      name={name}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  )
}

export default Input
