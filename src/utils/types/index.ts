export interface APIError extends Error {
  statusCode?: STATUS_CODES
}

export interface APIResponse<T> {
  data: T
  headers: Headers
  status: STATUS_CODES
}

export interface GenericObject {
  [fieldName: string]: any
}

export interface Room {
  id: string
  name: string
  password: string
  rounds: Round[]
  teamA: TeamMember[]
  teamB: TeamMember[]
}

export interface Round {
  leader: string | null
  // The states are as follows:
  //    "active": The round currently has a leader getting providing their team with clues.
  //    "completed": All words for the round have been claimed.
  //    "new": The round is new and is accepting word submissions.
  //    "pending": Currently waiting for the next leader to start their turn.
  state: 'active' | 'completed' | 'new' | 'pending'
  turns: number
  upNext: string | null
  words: Word[]
}

/**
 * A mapping of API response codes to be more semantic.
 */
export enum STATUS_CODES {
  BAD_REQUEST = 400,
  CONFLICT = 409,
  FORBIDDEN = 403,
  NO_CONTENT = 204,
  NOT_FOUND = 404,
  OK = 200,
  SERVER_ERROR = 500,
  UNAUTHORIZED = 401,
  UNPROCESSABLE_ENTITY = 422,
}

export interface TeamMember {
  imgSrc: string
  name: string
}

export interface TeamMemberConnection {
  name: string
}

export interface Word {
  claimedBy: string | null
  createdBy: string
  word: string
}
