// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { generateAuth } from '../utils/realtime/server'
import { getLoggedInUserOnServer } from '../utils/auth'
import { info } from '../utils/logs'
import { stringToObject } from '../utils/general'

interface PusherAuthBody {
  channel_name: string
  socket_id: string
}

export const handler: Handler = async (event) => {
  const data = stringToObject({
    propDelimiter: '&',
    valueDelimiter: '=',
    value: event.body,
  }) as PusherAuthBody
  const { socket_id: socketId, channel_name: channel } = data
  const userName = getLoggedInUserOnServer(event.headers.cookie)
  info('Authenticating Pusher request.', { data, userName })

  const pusherAuth = generateAuth({ channel, socketId, userName })
  info('Successfully generated auth for Pusher requests.', pusherAuth)

  return {
    body: JSON.stringify(pusherAuth),
    statusCode: 200,
  }
}
