import { useEffect } from 'react'
import _ from 'lodash'
import Pusher from 'pusher-js'

import { REALTIME_EVENTS } from '../../../../shared/realtime/index'

const pusherAppKey = process.env.PUSHER_APP_KEY
if (!pusherAppKey) {
  throw new Error('Please add the PUSHER_APP_KEY environment variable.')
}

// @ts-ignore
Pusher.Runtime.createXHR = function () {
  const xhr = new XMLHttpRequest()
  xhr.withCredentials = true

  return xhr
}
const pusher = new Pusher(pusherAppKey, {
  authEndpoint: `${process.env.API_BASE_URL}/pusher-auth`,
  cluster: 'us2',
})

interface PresencePerson {
  id: string
  info: PresencePersonInfo
}

interface PresencePersonInfo {
  name: string
}

interface SubscriptionSucceeded {
  count: number
  me: PresencePerson
  members: {
    [id: string]: PresencePersonInfo
  }
  myID: string
}

/**
 * Invokes the provided presence callbacks when appropriate.
 */
export function usePresence({
  channel,
  onConnected,
  onPersonJoined,
  onPersonLeft,
}: {
  channel: string
  onConnected: (payload: SubscriptionSucceeded) => void
  onPersonJoined: (payload: PresencePerson) => void
  onPersonLeft: (payload: PresencePerson) => void
}) {
  useEffect(() => {
    const presenceChannel = pusher.subscribe(`presence-${channel}`)

    presenceChannel.bind('pusher:subscription_succeeded', onConnected)
    presenceChannel.bind('pusher:member_added', onPersonJoined)
    presenceChannel.bind('pusher:member_removed', onPersonLeft)
  }, [channel])
}

/**
 * Invokes the provided presence callbacks when appropriate.
 */
export function useRealtimeEvents({
  channel,
  callbacks,
}: {
  channel: string
  callbacks: { [event in REALTIME_EVENTS]: () => void }
}) {
  useEffect(() => {
    const subscription = pusher.subscribe(channel)

    _.forEach(callbacks, (callback, event) => {
      subscription.bind(event, callback)
    })
  }, [channel])
}
