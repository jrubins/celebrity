// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getLoggedInUser } from '../utils/auth'
import { getNextLeaders } from '../utils/teams'
import { getRoomById, updateRoom } from '../utils/db'
import { makeResponse } from '../utils/api'
import { onTurnEnded } from '../utils/realtime'

interface EndTurnBody {
  roomId: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.NO_CONTENT })
  }

  const userName = getLoggedInUser(event.headers.cookie)
  const data: EndTurnBody = JSON.parse(event.body)
  const { roomId } = data
  info('Function "end-turn" invoked', { data, userName })

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

    const { leader, upNext } = getNextLeaders({
      round: activeRound,
      teamA,
      teamB,
    })
    activeRound.leader = leader
    activeRound.state = 'pending'
    activeRound.turns = activeRound.turns + 1
    activeRound.upNext = upNext

    room = await updateRoom(room.ref, { rounds, teamA, teamB })

    onTurnEnded(roomId)
    info('Successfully ended turn.', room)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to end turn.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
