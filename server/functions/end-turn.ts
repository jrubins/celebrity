// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { error, info } from '../../shared/logs'
import { getLoggedInUser } from '../utils/auth'
import { getNextLeaders } from '../utils/teams'
import { getRoomById, updateRoom } from '../utils/db'
import { onTurnEnded } from '../utils/realtime'

interface EndTurnBody {
  roomId: string
}

export const handler: Handler = async (event) => {
  const userName = getLoggedInUser(event.headers.cookie)
  const data: EndTurnBody = JSON.parse(event.body)
  const { roomId } = data
  info('Function "end-turn" invoked', { data, userName })

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

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to end turn.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
