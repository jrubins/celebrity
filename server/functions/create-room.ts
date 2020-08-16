// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { addUserToRoom, createRoom } from '../utils/db'
import { error, info } from '../../shared/logs'
import { makeResponse } from '../utils/api'

interface CreateRoomBody {
  name: string
  password: string
  roomName: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const data: CreateRoomBody = JSON.parse(event.body)
  info('Function "create-room" invoked.', data)
  const { name: userCreating, password, roomName } = data

  try {
    let newRoom = await createRoom({ data: { name: roomName, password } })
    newRoom = await addUserToRoom({ room: newRoom, user: userCreating })

    info('Successfully created new room.', newRoom)

    return makeResponse({
      body: newRoom.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to create new room.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
