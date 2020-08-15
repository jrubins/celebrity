// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { addUserToRoom, findRoom } from '../utils/db'
import { error, info } from '../utils/logs'

interface JoinRoomBody {
  name: string
  roomName: string
  password: string
}

export const handler: Handler = async (event) => {
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

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to join room.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
