// eslint-disable-next-line require-path-exists/exists
import { Handler } from 'aws-lambda'

import { Word } from '../../shared/types'
import { error, info } from '../../shared/logs'
import { getLoggedInUser } from '../utils/auth'
import { getRoomById, updateRoom } from '../utils/db'
import { onWordsAdded } from '../utils/realtime'

interface AddWordsBody {
  roomId: string
  words: string
}

export const handler: Handler = async (event) => {
  const userName = getLoggedInUser(event.headers.cookie)
  const data: AddWordsBody = JSON.parse(event.body)
  const { roomId, words } = data
  info('Function "add-words" invoked', { data, userName })

  try {
    let room = await getRoomById(roomId)
    const { rounds } = room.data
    const newRound = rounds.find(({ state }) => state === 'new')
    if (!newRound) {
      return {
        body: JSON.stringify({ message: 'Could not find new round.' }),
        statusCode: 400,
      }
    }

    // Add the new words to the pending round.
    const newWords: Word[] = words.split(',').map((word) => {
      return {
        claimedBy: null,
        createdBy: userName,
        word: word.trim(),
      }
    })
    newRound.words = [...newRound.words, ...newWords]

    room = await updateRoom(room.ref, { rounds })

    onWordsAdded(roomId)
    info('Successfully added words to round.', room)

    return {
      body: JSON.stringify(room.data),
      statusCode: 200,
    }
  } catch (err) {
    error('Failed to add words to round.', err)

    return {
      body: JSON.stringify(err),
      statusCode: 500,
    }
  }
}
