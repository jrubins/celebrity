// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { error, info } from '../utils/logs'
import { getRoomById } from '../utils/db'

export const handler: Handler = async (event) => {
  const { roomId } = event.queryStringParameters
  info('Function "get-room" invoked.', roomId)

  try {
    const room = await getRoomById(roomId)
    info('Successfully fetched room.', room)

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Error fetching room.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
