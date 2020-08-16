// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getRoomById } from '../utils/db'
import { makeResponse } from '../utils/api'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const { roomId } = event.queryStringParameters
  info('Function "get-room" invoked.', roomId)

  try {
    const room = await getRoomById(roomId)
    info('Successfully fetched room.', room)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Error fetching room.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
