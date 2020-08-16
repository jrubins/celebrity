import Cookies from 'js-cookie'

import { USER_NAME_COOKIE } from '../../../../shared/auth'

/**
 * Returns the logged in user.
 */
export function getLoggedInUser() {
  return Cookies.get(USER_NAME_COOKIE)
}

/**
 * Stores the user's name.
 */
export function storeName(name: string) {
  Cookies.set(USER_NAME_COOKIE, name, {
    domain: process.env.COOKIES_DOMAIN,
  })
}
