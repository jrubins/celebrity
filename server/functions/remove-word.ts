// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { STATUS_CODES } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getLoggedInUser } from '../utils/auth'
import { getRoomById, updateRoom } from '../utils/db'
import { makeResponse } from '../utils/api'
import { onWordRemoved } from '../utils/realtime'

interface RemoveWordBody {
  roomId: string
  word: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return makeResponse({ statusCode: STATUS_CODES.OK })
  }

  const userName = getLoggedInUser(event.headers.cookie)
  const data: RemoveWordBody = JSON.parse(event.body)
  const { roomId, word: wordToRemove } = data
  info('Function "remove-word" invoked', { data, userName })

  try {
    let room = await getRoomById(roomId)
    const { rounds } = room.data
    const newRound = rounds.find(({ state }) => state === 'new')
    if (!newRound) {
      return makeResponse({
        body: { message: 'Could not find pending round.' },
        statusCode: STATUS_CODES.BAD_REQUEST,
      })
    }

    // Remove the word if it exists for the submitted user.
    newRound.words = newRound.words.filter(({ createdBy, word }) => {
      return word !== wordToRemove || createdBy !== userName
    })

    room = await updateRoom(room.ref, { rounds })

    onWordRemoved(roomId)
    info('Successfully removed word from round.', room)

    return makeResponse({
      body: room.data,
      statusCode: STATUS_CODES.OK,
    })
  } catch (err) {
    error('Failed to remove word from round.', err)

    return makeResponse({
      body: err,
      statusCode: STATUS_CODES.SERVER_ERROR,
    })
  }
}
