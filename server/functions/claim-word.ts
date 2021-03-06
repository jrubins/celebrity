// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getLoggedInUser } from '../utils/auth'
import { getNextLeaders } from '../utils/teams'
import { getRoomById, updateRoom } from '../utils/db'
import { makeResponse } from '../utils/api'
import { onWordClaimed } from '../utils/realtime'

interface ClaimWordBody {
  roomId: string
  word: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const userName = getLoggedInUser(event.headers.cookie)
  const data: ClaimWordBody = JSON.parse(event.body)
  const { roomId, word: wordToClaim } = data
  info('Function "claim-word" invoked', { data, userName })

  try {
    let room = await getRoomById(roomId)
    const { rounds, teamA, teamB } = room.data
    const activeRound = rounds.find(({ state }) => state === 'active')
    if (!activeRound) {
      return makeResponse({
        body: { message: 'Could not find active round.' },
        statusCode: STATUS_CODES.BAD_REQUEST,
      })
    }

    // Mark the requested word as claimed.
    const wordInRound = activeRound.words.find(
      ({ word }) => word === wordToClaim
    )
    if (wordInRound) {
      wordInRound.claimedBy = userName
    }

    // Check if we no longer have any more unclaimed words and move to the next round if so.
    const hasUnclaimedWord = activeRound.words.find(
      ({ claimedBy }) => !claimedBy
    )
    if (!hasUnclaimedWord) {
      activeRound.state = 'completed'
      const { leader, upNext } = getNextLeaders({
        round: activeRound,
        teamA,
        teamB,
      })

      rounds.push({
        leader,
        state: 'pending',
        turns: 0,
        upNext,
        words: activeRound.words.map((word) => {
          return {
            ...word,
            claimedBy: null,
          }
        }),
      })
    }

    room = await updateRoom(room.ref, { rounds })

    onWordClaimed(roomId)
    info('Successfully claim word.', room)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to claim word.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
