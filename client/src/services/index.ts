import _ from 'lodash'
import hash from 'object-hash'

import {
  STATUS_CODES,
  APIRequestOpts,
  delayedApiRequest,
  makeApiResponseError,
  queryStringify,
  transformFieldsForAPI,
} from '../utils/api'
import { APIError, APIResponse } from '../utils/types'
import { error, group } from '../../../shared/logs'

/**
 * The base host for API requests.
 */
const API_BASE_URL = process.env.API_BASE_URL

/**
 * The mimetype that represents JSON.
 */
const JSON_MIME_TYPE = 'application/json'

/**
 * A cache for requests that are currently being made. The key is a hash of the API path being called and
 * the request body. The value is the Promise for the API request.
 */
const PENDING_REQUESTS: {
  [hash: string]: Promise<APIResponse<any>> | null
} = {}

/**
 * Checks for a request response error and throws an API error if one happened.
 *
 * @throws Error
 */
function checkForRequestErrorAndThrow({
  apiJsonResponse = {},
  makeErrorFn = makeApiResponseError,
  response,
}: {
  apiJsonResponse?: any
  makeErrorFn?: (opts: { json: any; statusCode: number }) => APIError
  response: Response
}) {
  const hasError = response.status >= 400 && response.status <= 600

  if (hasError) {
    error(
      `Error making API request: ${response.statusText} (${response.status})`
    )

    throw makeErrorFn({
      json: apiJsonResponse,
      statusCode: response.status,
    })
  }
}

/**
 * Returns the request body transformed and stringified.
 */
function getStringifiedBody(
  data: { [fieldName: string]: any } | undefined,
  opts: { onlyWithValue?: boolean } = {}
) {
  return JSON.stringify(
    transformFieldsForAPI({
      ...opts,
      data: data || {},
    })
  )
}

/**
 * Makes an API request to the provided path with the provided options.
 */
async function makeRequest<T>({
  makeErrorFn,
  requestOptions,
  requestPath,
  responseParser = null,
}: {
  makeErrorFn?: (opts: { json: any; statusCode: number }) => APIError
  requestOptions: RequestInit
  requestPath: string
  responseParser: ((respone: Response) => Promise<any>) | null
}): Promise<APIResponse<T>> {
  // Make our AJAX request - allow external requests as well.
  const response = await fetch(requestPath, requestOptions)
  const responseStatusCode = _.get(response, 'status')
  const headers = requestOptions.headers as Headers
  const expectingJson = headers.get('Accept') === JSON_MIME_TYPE

  let apiResponse
  // If we're expecting JSON, parse it as such. Otherwise, allow the caller to parse.
  if (expectingJson && responseStatusCode !== STATUS_CODES.NO_CONTENT) {
    try {
      // If this isn't JSON, it will through a fetch error. We want to capture
      // that and return a better error message.
      apiResponse = await response.json()
    } catch (err) {
      error('Expecting JSON response, received non-JSON.')

      throw makeApiResponseError({
        json: {
          errors: ['Received unexpected response type from API.'],
        },
        statusCode: response.status,
      })
    }
  } else if (_.isFunction(responseParser)) {
    apiResponse = await responseParser(response)
  }

  // The second argument here we only pass through if it's JSON (to attach JSON to the error if we have an error).
  checkForRequestErrorAndThrow({
    apiJsonResponse: expectingJson ? apiResponse : undefined,
    makeErrorFn,
    response,
  })

  return {
    data: apiResponse,
    headers: response.headers,
    status: responseStatusCode,
  }
}

/**
 * Prepares to make an API request. Protects against multiple duplicate requests
 * in quick succession.
 *
 * @param [opts.delayMs] Number of ms to wait before firing off the API request. This is useful for testing
 *                       slow API requests.
 */
async function prepareRequest<T>(
  path: string,
  opts: APIRequestOpts
): Promise<APIResponse<T>> {
  const {
    delayMs = null,
    filename = null,
    headers: providedHeaders = null,
    makeErrorFn,
    query = {},
    responseParser = null,
    sendCookies = false,
    skipDefaultHeaders = false,
    testError = undefined,
    ...otherRequestOpts
  } = opts

  if (testError) {
    return Promise.reject(
      makeApiResponseError({
        json: {
          message:
            testError.message || 'This is a developer test error message.',
        },
        statusCode: testError.statusCode || 500,
      })
    )
  }

  let requestPath = `${API_BASE_URL}${path}`
  // Add on our query string if we have data for it.
  if (!_.isEmpty(query)) {
    const transformedQueryFields = queryStringify(
      transformFieldsForAPI({
        data: query,
      })
    )

    requestPath = `${requestPath}${
      transformedQueryFields ? `?${transformedQueryFields}` : ''
    }`
  }

  // Add default headers unless we're skipping them.
  const headers = providedHeaders || new Headers()
  if (!skipDefaultHeaders) {
    headers.set('Accept', JSON_MIME_TYPE)
    headers.set('Content-Type', JSON_MIME_TYPE)
  }

  const requestOptions: RequestInit = { ...otherRequestOpts, headers }

  // Isomorphic-fetch doesn't send cookies in requests by default.
  if (sendCookies) {
    requestOptions.credentials = 'include'
  }

  let requestHash: string
  // If this is a file request, we can't hash the body, so use the filename as the requestHash.
  if (filename) {
    requestHash = `${requestPath}-${filename}`
  } else {
    // Calculate our request hash based off the request body and path.
    requestHash = hash({
      body: requestOptions.body,
      requestPath,
    })
  }

  // If we're already making this exact request, let's not make it again.
  const pendingRequest = PENDING_REQUESTS[requestHash]
  if (pendingRequest) {
    return pendingRequest
  }

  // Log a collapsed group for our API request. User can expand if they want.
  group(
    `API Request: ${requestOptions.method} ${requestPath}`,
    requestOptions,
    {
      isCollapsed: true,
    }
  )

  try {
    const apiRequest = makeRequest<T>({
      makeErrorFn,
      requestPath,
      requestOptions,
      responseParser,
    })
    PENDING_REQUESTS[requestHash] = apiRequest

    if (delayMs) {
      return await delayedApiRequest({
        resolveFn: () => apiRequest,
        msTimeout: delayMs,
      })
    }

    return await apiRequest
  } finally {
    // Once the request is done, we want to clear the pending requests cache so we can make this request
    // again in the future.
    PENDING_REQUESTS[requestHash] = null
  }
}

/**
 * Makes an API DELETE request.
 */
export function apiDelete<T>(path: string, opts: APIRequestOpts) {
  return prepareRequest<T>(path, {
    ...opts,
    method: 'DELETE',
  })
}

/**
 * Makes an API GET request.
 */
export function get<T>(path: string, opts: APIRequestOpts = {}) {
  return prepareRequest<T>(path, {
    ...opts,
    method: 'GET',
  })
}

/**
 * Makes an API PATCH request.
 */
export function patch<T>(
  path: string,
  opts: APIRequestOpts & { bodyNotJSON?: boolean }
) {
  const { bodyNotJSON = false } = opts

  return prepareRequest<T>(path, {
    ...opts,
    body: bodyNotJSON
      ? opts.body
      : // We allow empty values on PUTs since they may be deleting some previously set value.
        getStringifiedBody(opts.body, { onlyWithValue: false }),
    method: 'PATCH',
  })
}

/**
 * Makes an API PUT request.
 */
export function put<T>(
  path: string,
  opts: APIRequestOpts & { bodyNotJSON?: boolean }
) {
  const { bodyNotJSON = false } = opts

  return prepareRequest<T>(path, {
    ...opts,
    body: bodyNotJSON
      ? opts.body
      : // We allow empty values on PUTs since they may be deleting some previously set value.
        getStringifiedBody(opts.body, { onlyWithValue: false }),
    method: 'PUT',
  })
}

/**
 * Makes an API POST request.
 */
export function post<T>(
  path: string,
  opts: APIRequestOpts & {
    bodyNotJSON?: boolean
    bodyOpts?: { onlyWithValue?: boolean }
  }
) {
  return prepareRequest<T>(path, {
    ...opts,
    // If it's a file, we don't want to manipulate the body at all.
    body: opts.filename
      ? opts.body
      : getStringifiedBody(opts.body, opts.bodyOpts),
    method: 'POST',
  })
}
