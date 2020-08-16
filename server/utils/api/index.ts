import { STATUS_CODES, GenericObject } from '../../../shared/types'

/**
 * Builds an API function response with the appropriate headers.
 */
export function makeResponse({
  body,
  statusCode,
}: {
  body: GenericObject
  statusCode: STATUS_CODES
}) {
  return {
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': process.env.CLIENT_BASE_URL || '',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    },
    statusCode,
  }
}
