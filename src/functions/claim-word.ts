// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { error, info } from '../utils/logs'
import { getLoggedInUserOnServer } from '../utils/auth'
import { getNextLeaders } from '../utils/teams'
import { getRoomById, updateRoom } from '../utils/db'
import { onWordClaimed } from '../utils/realtime/server'

interface ClaimWordBody {
  roomId: string
  word: string
}

export const handler: Handler = async (event) => {
  const userName = getLoggedInUserOnServer(event.headers.cookie)
  const data: ClaimWordBody = JSON.parse(event.body)
  const { roomId, word: wordToClaim } = data
  info('Function "claim-word" invoked', { data, userName })

  try {
    let room = await getRoomById(roomId)
    const { rounds, teamA, teamB } = room.data
    const activeRound = rounds.find(({ state }) => state === 'active')
    if (!activeRound) {
      return {
        body: JSON.stringify({ message: 'Could not find active round.' }),
        statusCode: 400,
      }
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

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to claim word.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
