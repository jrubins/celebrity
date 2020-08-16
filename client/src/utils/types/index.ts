import { GenericObject } from '../../../../shared/types'

export interface APIError extends Error {
  data: GenericObject
  erroredFields: GenericObject
  statusCode?: STATUS_CODES
}

export interface APIResponse<T> {
  data: T
  headers: Headers
  status: STATUS_CODES
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
