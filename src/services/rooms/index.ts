import { Room } from '../../utils/types'

import { get, post } from '../'

/**
 * Creates a new room.
 */
export function createRoom({
  name,
  password,
  roomName,
}: {
  name: string
  password: string
  roomName: string
}) {
  return post<Room>('/create-room', {
    body: { name, password, roomName },
  })
}

/**
 * Fetches room information.
 */
export function getRoom({ roomId }: { roomId: string }) {
  return get<Room>('/get-room', {
    query: { roomId },
  })
}

/**
 * Joins an existing room.
 */
export function joinRoom({
  name,
  password,
  roomName,
}: {
  name: string
  password: string
  roomName: string
}) {
  return post<Room>('/join-room', {
    body: { name, password, roomName },
  })
}
