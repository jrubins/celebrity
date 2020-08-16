// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { addUserToRoom, findRoom } from '../utils/db'
import { error, info } from '../../shared/logs'
import { makeResponse } from '../utils/api'

interface JoinRoomBody {
  name: string
  roomName: string
  password: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const data: JoinRoomBody = JSON.parse(event.body)
  info('Function "join-room" invoked.', data)
  const { name: userJoining, password, roomName } = data

  try {
    let room = await findRoom({
      index: 'rooms_name_password',
      terms: [roomName, password],
    })
    room = await addUserToRoom({ room, user: userJoining })

    info('Successfully joined room.', room)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to join room.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
