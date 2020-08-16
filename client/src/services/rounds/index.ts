import { Room } from '../../../../shared/types'

import { post } from '../'

/**
 * Activates a round for a room.
 */
export function activateRound({ roomId }: { roomId: string }) {
  return post<Room>('/activate-round', {
    body: { roomId },
  })
}

/**
 * Adds new words to a round.
 */
export function addWords({ roomId, words }: { roomId: string; words: string }) {
  return post<Room>('/add-words', {
    body: { roomId, words },
  })
}

/**
 * Claims a word in a round.
 */
export function claimWord({ roomId, word }: { roomId: string; word: string }) {
  return post<Room>('/claim-word', {
    body: { roomId, word },
  })
}

/**
 * Ends the turn for a user.
 */
export function endTurn({ roomId }: { roomId: string }) {
  return post<Room>('/end-turn', {
    body: { roomId },
  })
}

/**
 * Removes a submitted word from a round's words.
 */
export function removeWord({ roomId, word }: { roomId: string; word: string }) {
  return post<Room>('/remove-word', {
    body: { roomId, word },
  })
}
