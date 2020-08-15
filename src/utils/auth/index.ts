import Cookies from 'js-cookie'

import { stringToObject } from '../general'

/**
 * The name of the cookie that stores the logged in user's name.
 */
const USER_NAME_COOKIE = 'celebrity-user-name'

/**
 * Returns the logged in user.
 */
export function getLoggedInUser() {
  return Cookies.get(USER_NAME_COOKIE)
}

/**
 * Returns the logged in user in a server function.
 */
export function getLoggedInUserOnServer(cookiesString: string) {
  const cookies = stringToObject({
    propDelimiter: '; ',
    value: cookiesString,
    valueDelimiter: '=',
  })

  return global.decodeURIComponent(cookies[USER_NAME_COOKIE])
}

/**
 * Stores the user's name.
 */
export function storeName(name: string) {
  Cookies.set(USER_NAME_COOKIE, name)
}
