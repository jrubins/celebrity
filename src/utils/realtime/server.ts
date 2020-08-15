import Pusher from 'pusher'

import { REALTIME_EVENTS } from '.'

const pusherAppId = process.env.PUSHER_APP_ID
if (!pusherAppId) {
  throw new Error('Please add the PUSHER_APP_ID environment variable.')
}

const pusherAppKey = process.env.PUSHER_APP_KEY
if (!pusherAppKey) {
  throw new Error('Please add the PUSHER_APP_KEY environment variable.')
}

const pusherAppSecret = process.env.PUSHER_APP_SECRET
if (!pusherAppSecret) {
  throw new Error('Please add the PUSHER_APP_SECRET environment variable.')
}

const pusher = new Pusher({
  appId: pusherAppId,
  key: pusherAppKey,
  secret: pusherAppSecret,
  cluster: 'us2',
  useTLS: true,
})

/**
 * Pushes an event when a round starts.
 */
export function generateAuth({
  channel,
  socketId,
  userName,
}: {
  channel: string
  socketId: string
  userName: string
}) {
  return pusher.authenticate(socketId, channel, {
    user_id: userName,
    // @ts-ignore
    user_info: {
      name: userName,
    },
  })
}

/**
 * Pushes an event when a game starts.
 */
export function onGameStarted(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.GAME_STARTED, {})
}

/**
 * Pushes an event when a round starts.
 */
export function onRoundStarted(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.ROUND_STARTED, {})
}

/**
 * Pushes an event when a turn ends.
 */
export function onTurnEnded(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.TURN_ENDED, {})
}

/**
 * Pushes an event when new words are added to a round.
 */
export function onWordsAdded(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.WORDS_ADDED, {})
}

/**
 * Pushes an event when a word is claimed in a round.
 */
export function onWordClaimed(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.WORD_CLAIMED, {})
}

/**
 * Pushes an event when a word is removed from a round.
 */
export function onWordRemoved(channel: string) {
  pusher.trigger(channel, REALTIME_EVENTS.WORD_REMOVED, {})
}
