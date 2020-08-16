import { Room as RoomData } from '../../../shared/types'

export interface QueryResult<T> {
  data: T[]
}

export interface Room {
  data: RoomData
  ref: never
  ts: number
}
