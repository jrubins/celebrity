import { useMachine } from '@xstate/react'

import { APIResponse } from '../../utils/types'

import {
  GUARDS as API_REQUEST_GUARDS,
  EVENTS as API_REQUEST_EVENTS,
  SERVICES as API_REQUEST_SERVICES,
  STATES as API_REQUEST_STATES,
  Context as APIRequestContext,
  Events as APIRequestEvents,
  createApiRequestMachine,
} from './machines/apiRequestMachine'
import { useDeferredEffect } from '../general'

interface APIFn<T> {
  (...requestProps: any[]): Promise<APIResponse<T> | null>
}

interface APIRequestOpts<T> {
  apiFn: APIFn<T>
  id: string
  onMount?: boolean
}

/**
 * A custom hook to make an API request.
 *
 * @param [opts.onMount] Whether to make the request on mount or not.
 * @param [refetchProps] An array of options that trigger the API request on change.
 */
export function useApiRequest<T>(
  { apiFn, id, onMount = false }: APIRequestOpts<T>,
  refetchProps: any[] = []
) {
  const [apiRequestState, apiRequestSend] = useMachine<
    APIRequestContext<T>,
    APIRequestEvents<T>
  >(createApiRequestMachine({ id }), {
    devTools: true,
    guards: {
      [API_REQUEST_GUARDS.SHOULD_START_WITH_REQUEST]: () => onMount,
    },
    services: {
      [API_REQUEST_SERVICES.API_FN]: apiFn,
    },
  })
  const { data, error } = apiRequestState.context
  const isLoading = apiRequestState.matches(API_REQUEST_STATES.REQUESTING)

  // Remakes the API request if the refetch props change.
  useDeferredEffect(() => {
    apiRequestSend({ type: API_REQUEST_EVENTS.MAKE_REQUEST })
  }, refetchProps)

  return {
    data,
    error,
    isLoading,
    makeApiRequest: () => {
      apiRequestSend({ type: API_REQUEST_EVENTS.MAKE_REQUEST })
    },
  }
}
