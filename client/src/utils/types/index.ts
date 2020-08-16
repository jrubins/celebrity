import { STATUS_CODES, GenericObject } from '../../../../shared/types'

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
