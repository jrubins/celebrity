import { USER_NAME_COOKIE } from '../../../shared/auth'
import { stringToObject } from '../../../shared/general'

/**
 * Returns the logged in user in a server function.
 */
export function getLoggedInUser(cookiesString: string) {
  const cookies = stringToObject({
    propDelimiter: '; ',
    value: cookiesString,
    valueDelimiter: '=',
  })

  return global.decodeURIComponent(cookies[USER_NAME_COOKIE])
}
