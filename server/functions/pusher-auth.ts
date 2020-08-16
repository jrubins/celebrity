// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { generateAuth } from '../utils/realtime'
import { getLoggedInUser } from '../utils/auth'
import { info } from '../../shared/logs'
import { makeResponse } from '../utils/api'
import { stringToObject } from '../../shared/general'

interface PusherAuthBody {
  channel_name: string
  socket_id: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.NO_CONTENT })
  }

  const data = stringToObject({
    propDelimiter: '&',
    valueDelimiter: '=',
    value: event.body,
  }) as PusherAuthBody
  const { socket_id: socketId, channel_name: channel } = data
  const userName = getLoggedInUser(event.headers.cookie)
  info('Authenticating Pusher request.', { data, userName })

  const pusherAuth = generateAuth({ channel, socketId, userName })
  info('Successfully generated auth for Pusher requests.', pusherAuth)

  return makeResponse({
    body: pusherAuth,
    statusCode: STATUS_CODES.OK,
  })
}
