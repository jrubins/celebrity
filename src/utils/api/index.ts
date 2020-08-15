import _ from 'lodash'

import { APIError } from '../types'

/**
 * Interface for making an API request.
 */
export interface APIRequestOpts {
  body?: any
  bodyOpts?: {
    onlyWithValue?: boolean
  }
  delayMs?: number | null
  filename?: string | null
  headers?: Headers
  makeErrorFn?: (opts: { json: any; statusCode: number }) => APIError
  method?: string
  query?: {}
  responseParser?: (response: Response) => Promise<any>
  sendCookies?: boolean
  skipDefaultHeaders?: boolean
  testError?: {
    message?: string
    statusCode?: number
  }
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

/**
 * Delays an API request. Most useful for testing loading states during development.
 */
export function delayedApiRequest({
  msTimeout,
  resolveFn,
}: {
  msTimeout: number
  resolveFn: () => any
}): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(resolveFn())
    }, msTimeout)
  })
}

/**
 * Makes an error object for an API request that failed.
 */
export function makeApiResponseError({
  json,
  statusCode,
}: {
  json: {
    _schema?: Array<string>
    error?: string
    message?: string
    [fieldName: string]: any
  }
  statusCode: number
}): APIError {
  let errorMessage = json.message
  if (!errorMessage) {
    errorMessage = _.join(json._schema, ', ')
  }
  if (!errorMessage) {
    errorMessage = json.error
  }

  const error = new Error(errorMessage || 'Unspecified error.') as APIError
  error.statusCode = statusCode
  error.data = json || {}

  if (error.statusCode === STATUS_CODES.UNPROCESSABLE_ENTITY) {
    error.erroredFields = error.data
  }

  return error
}

/**
 * Stringifies the provided object for use in a query string.
 */
export function queryStringify(obj: {
  [fieldName: string]:
    | { operator: string; value: string | number | boolean | null | undefined }
    | string[]
    | string
    | number
    | boolean
    | null
    | undefined
}) {
  return _.reduce(
    obj,
    (result: string[], value, key) => {
      // If value is an object, its expected to have "operator" and "value" properties so we can construct a query
      // param of the form key[operator]=value.
      if (_.isObject(value) && !_.isArray(value)) {
        const { operator, value: queryParamValue } = value
        if (_.isUndefined(operator) || _.isUndefined(queryParamValue)) {
          throw new Error(
            `Object query param ${key} must have "operator" and "value" properties.`
          )
        }

        if (queryParamValue !== null) {
          result.push(
            `${key}[${value.operator}]=${encodeURIComponent(queryParamValue)}`
          )
        }
      } else if (_.isArray(value)) {
        value.forEach((queryValue) => {
          result.push(`${key}=${encodeURIComponent(queryValue)}`)
        })
      } else if (value || value === 0 || _.isBoolean(value)) {
        result.push(`${key}=${encodeURIComponent(value)}`)
      }

      return result
    },
    []
  ).join('&')
}

/**
 * Transforms data into the format the API expects using the provided data.
 */
export function transformFieldsForAPI({
  data,
  onlyWithValue = true,
}: {
  data: {}
  onlyWithValue?: boolean
}): {} {
  let apiData = _.mapKeys(data, (value, key) => key)

  if (onlyWithValue) {
    apiData = _.pickBy(apiData, (value) => {
      // We allow any boolean values or values that are the integer 0 - don't consider that empty.
      if (_.isBoolean(value) || value === 0) {
        return true
      }

      return value && (!_.isArray(value) || !_.isEmpty(value))
    })
  }

  return apiData
}
