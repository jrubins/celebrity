import React, { ReactNode } from 'react'
import cn from 'classnames'

const Button = ({
  children,
  isMuted = false,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  isMuted?: boolean
  onClick: () => void
  type?: 'button' | 'submit'
}) => {
  return (
    <button
      className={cn('button button-primary', {
        'button-muted': isMuted,
      })}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export default Button
