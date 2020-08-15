import { Room as RoomData } from './index'

export interface QueryResult<T> {
  data: T[]
}

export interface Room {
  data: RoomData
  ref: never
  ts: number
}
