import { useEffect, useRef } from 'react'

/**
 * A custom hook that only runs the provided callback function after the initial render.
 */
export function useDeferredEffect(cb: () => void, rerunProps: any[]) {
  const hasMounted = useRef(false)

  useEffect(() => {
    if (hasMounted.current) {
      cb()
    }

    hasMounted.current = true
  }, rerunProps)
}
