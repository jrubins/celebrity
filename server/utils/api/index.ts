import { STATUS_CODES, GenericObject } from '../../../shared/types'

interface APIResponse {
  body?: string
  headers: GenericObject
  statusCode: STATUS_CODES
}

/**
 * Builds an API function response with the appropriate headers.
 */
export function makeResponse({
  body,
  statusCode,
}: {
  body?: GenericObject
  statusCode: STATUS_CODES
}) {
  const response: APIResponse = {
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS, PATCH, POST, PUT',
      'Access-Control-Allow-Origin': process.env.CLIENT_BASE_URL || '',
    },
    statusCode,
  }
  if (body) {
    response.body = JSON.stringify(body)
  }

  return response
}
