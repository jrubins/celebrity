// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { error, info } from '../utils/logs'
import { getRoomById, updateRoom } from '../utils/db'
import { onGameStarted } from '../utils/realtime/server'

export const handler: Handler = async (event) => {
  const { roomId } = JSON.parse(event.body)
  info('Function "activate-round" invoked.', roomId)

  try {
    let room = await getRoomById(roomId)
    const { rounds } = room.data
    const roundToActivate = rounds.find(
      ({ state }) => state === 'new' || state === 'pending'
    )
    if (!roundToActivate) {
      return {
        body: JSON.stringify({ message: 'Could not find round to activate.' }),
        statusCode: 400,
      }
    }

    roundToActivate.state = 'active'
    room = await updateRoom(room.ref, { rounds })

    onGameStarted(roomId)
    info('Successfully activated round.', roomId)

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to activate round.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
