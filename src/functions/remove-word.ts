// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { error, info } from '../utils/logs'
import { getLoggedInUserOnServer } from '../utils/auth'
import { getRoomById, updateRoom } from '../utils/db'
import { onWordRemoved } from '../utils/realtime/server'

interface RemoveWordBody {
  roomId: string
  word: string
}

export const handler: Handler = async (event) => {
  const userName = getLoggedInUserOnServer(event.headers.cookie)
  const data: RemoveWordBody = JSON.parse(event.body)
  const { roomId, word: wordToRemove } = data
  info('Function "remove-word" invoked', { data, userName })

  try {
    let room = await getRoomById(roomId)
    const { rounds } = room.data
    const newRound = rounds.find(({ state }) => state === 'new')
    if (!newRound) {
      return {
        body: JSON.stringify({ message: 'Could not find pending round.' }),
        statusCode: 400,
      }
    }

    // Remove the word if it exists for the submitted user.
    newRound.words = newRound.words.filter(({ createdBy, word }) => {
      return word !== wordToRemove || createdBy !== userName
    })

    room = await updateRoom(room.ref, { rounds })

    onWordRemoved(roomId)
    info('Successfully removed word from round.', room)

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to remove word from round.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
