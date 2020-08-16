// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getRoomById, updateRoom } from '../utils/db'
import { makeResponse } from '../utils/api'
import { onGameStarted } from '../utils/realtime'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const { roomId } = JSON.parse(event.body)
  info('Function "activate-round" invoked.', roomId)

  try {
    let room = await getRoomById(roomId)
    const { rounds } = room.data
    const roundToActivate = rounds.find(
      ({ state }) => state === 'new' || state === 'pending'
    )
    if (!roundToActivate) {
      return makeResponse({
        body: { message: 'Could not find round to activate.' },
        statusCode: STATUS_CODES.BAD_REQUEST,
      })
    }

    roundToActivate.state = 'active'
    room = await updateRoom(room.ref, { rounds })

    onGameStarted(roomId)
    info('Successfully activated round.', roomId)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to activate round.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
