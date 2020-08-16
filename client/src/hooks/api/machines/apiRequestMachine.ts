import { DoneInvokeEvent, Machine, assign } from 'xstate'

import { STATUS_CODES } from '../../../../../shared/types'
import { APIError, APIResponse } from '../../../utils/types'

export enum ACTIONS {
  CLEAR_DATA = 'clearData',
  CLEAR_ERROR = 'clearError',
  UPDATE_DATA = 'updateData',
  UPDATE_ERROR = 'updateError',
}

export enum EVENTS {
  MAKE_REQUEST = 'makeRequest',
}

export enum GUARDS {
  HAS_INVALID_AUTH = 'hasInvalidAuth',
  SHOULD_START_WITH_REQUEST = 'shouldStartWithRequest',
}

export enum SERVICES {
  API_FN = 'apiFn',
}

export enum STATES {
  BOOT = 'boot',
  IDLE = 'idle',
  REQUESTING = 'requesting',
}

export interface Context<T> {
  data: APIResponse<T> | null
  error: APIError | null
}

type DataLoaded<T> = DoneInvokeEvent<APIResponse<T>>
type LoadDataFailed = DoneInvokeEvent<APIError>
type MakeReqeust = { type: EVENTS.MAKE_REQUEST }
export type Events<T> = DataLoaded<T> | LoadDataFailed | MakeReqeust

export function createApiRequestMachine<T>({ id }: { id: string }) {
  return Machine<Context<T>, Events<T>>(
    {
      context: {
        data: null,
        error: null,
      },
      id: `${id}-api-request-machine`,
      initial: STATES.BOOT,
      states: {
        [STATES.BOOT]: {
          always: [
            {
              cond: GUARDS.SHOULD_START_WITH_REQUEST,
              target: STATES.REQUESTING,
            },
            { target: STATES.IDLE },
          ],
        },
        [STATES.IDLE]: {
          on: {
            [EVENTS.MAKE_REQUEST]: {
              target: STATES.REQUESTING,
            },
          },
        },
        [STATES.REQUESTING]: {
          entry: [ACTIONS.CLEAR_ERROR],
          invoke: {
            src: SERVICES.API_FN,
            onDone: { actions: [ACTIONS.UPDATE_DATA], target: STATES.IDLE },
            onError: [
              {
                actions: [ACTIONS.CLEAR_DATA, ACTIONS.UPDATE_ERROR],
                cond: GUARDS.HAS_INVALID_AUTH,
                target: STATES.IDLE,
              },
              {
                actions: [ACTIONS.CLEAR_DATA, ACTIONS.UPDATE_ERROR],
                target: STATES.IDLE,
              },
            ],
          },
        },
      },
    },
    {
      actions: {
        [ACTIONS.CLEAR_DATA]: assign<Context<T>>({ data: null }),
        [ACTIONS.CLEAR_ERROR]: assign<Context<T>>({ error: null }),
        [ACTIONS.UPDATE_DATA]: assign<Context<T>, DataLoaded<T>>({
          data: (_context, event) => event.data,
        }),
        [ACTIONS.UPDATE_ERROR]: assign<Context<T>, LoadDataFailed>({
          error: (_context, event) => event.data,
        }),
      },
      guards: {
        [GUARDS.HAS_INVALID_AUTH]: (_context, event: LoadDataFailed) => {
          return event.data.statusCode === STATUS_CODES.UNAUTHORIZED
        },
      },
    }
  )
}
