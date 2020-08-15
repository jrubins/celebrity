import { Machine, assign } from 'xstate'

import { Word } from '../../../../utils/types'
import { claimWord, endTurn } from '../../../../services/rounds'

enum ACTIONS {
  CLAIM_WORD = 'CLAIM_WORD',
  DECREMENT_SECONDS_LEFT = 'DECREMENT_SECONDS_LEFT',
  SKIP_WORD = 'SKIP_WORD',
}

export enum EVENTS {
  CLAIM_WORD = 'CLAIM_WORD',
  END_TURN = 'END_TURN',
  SECOND_PASSED = 'SECOND_PASSED',
  SKIP_WORD = 'SKIP_WORD',
}

enum GUARDS {
  TIME_EXPIRED = 'TIME_EXPIRED',
}

enum SERVICES {
  END_TURN = 'END_TURN',
}

enum STATES {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ENDING = 'ENDING',
}

export interface Context {
  availableWords: Word[]
  roomId: string
  secondsLeft: number
  totalSeconds: number
}

type ClaimWord = { type: EVENTS.CLAIM_WORD; wordToClaim: string }
type EndTurn = { type: EVENTS.END_TURN }
type SecondPassed = { type: EVENTS.SECOND_PASSED }
type SkipWord = { type: EVENTS.SKIP_WORD }
export type Events = ClaimWord | EndTurn | SecondPassed | SkipWord

export const turnMachine = Machine<Context, Events>(
  {
    context: {
      availableWords: [],
      roomId: '',
      secondsLeft: 30,
      totalSeconds: 30,
    },
    id: 'turn-machine',
    initial: STATES.ACTIVE,
    states: {
      [STATES.ACTIVE]: {
        always: [
          {
            cond: GUARDS.TIME_EXPIRED,
            target: STATES.ENDING,
          },
        ],
        invoke: {
          src: () => (cb) => {
            const interval = window.setInterval(() => {
              cb({ type: EVENTS.SECOND_PASSED })
            }, 1000)

            return () => {
              window.clearInterval(interval)
            }
          },
        },
        on: {
          [EVENTS.CLAIM_WORD]: { actions: [ACTIONS.CLAIM_WORD] },
          [EVENTS.END_TURN]: { target: STATES.ENDING },
          [EVENTS.SECOND_PASSED]: { actions: [ACTIONS.DECREMENT_SECONDS_LEFT] },
          [EVENTS.SKIP_WORD]: { actions: [ACTIONS.SKIP_WORD] },
        },
      },
      [STATES.ENDING]: {
        invoke: {
          src: SERVICES.END_TURN,
          onDone: { target: STATES.ENDED },
        },
      },
      [STATES.ENDED]: { type: 'final' },
    },
  },
  {
    actions: {
      [ACTIONS.CLAIM_WORD]: assign({
        availableWords: (context, event) => {
          const { wordToClaim } = event as ClaimWord

          claimWord({ roomId: context.roomId, word: wordToClaim })

          return context.availableWords.filter(
            ({ word }) => word !== wordToClaim
          )
        },
      }),
      [ACTIONS.DECREMENT_SECONDS_LEFT]: assign({
        secondsLeft: (context) => Math.max(context.secondsLeft - 1, 0),
      }),
      [ACTIONS.SKIP_WORD]: assign({
        availableWords: (context) => {
          const { availableWords } = context

          return [...availableWords.slice(1), availableWords[0]]
        },
      }),
    },
    guards: {
      [GUARDS.TIME_EXPIRED]: (context) => context.secondsLeft <= 0,
    },
    services: {
      [SERVICES.END_TURN]: (context) => {
        return endTurn({ roomId: context.roomId })
      },
    },
  }
)
