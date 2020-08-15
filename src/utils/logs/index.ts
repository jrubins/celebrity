import { GenericObject } from '../types'
import { isDebug, isDevelopment, isProduction, isTest } from '../environment'

/**
 * The logging instance.
 */
const logger = console

/**
 * Outputs an error message and captures the message as a Sentry exception.
 */
export function critical(message: string, context?: GenericObject) {
  if (isTest()) {
    return
  }

  error(message, context)
}

/**
 * Outputs a debug message.
 */
export function debug(message: string, context?: GenericObject) {
  if (isDebug() && !isTest()) {
    if (context) {
      logger.debug(message, context)
    } else {
      logger.debug(message)
    }
  }
}

/**
 * Outputs an error message.
 */
export function error(message: string, context?: GenericObject) {
  if (isTest()) {
    return
  }

  if (context) {
    logger.error(message, context)
  } else {
    logger.error(message)
  }
}

/**
 * Outputs a grouped info message.
 */
export function group(
  message: string,
  context: GenericObject | undefined,
  {
    isCollapsed = false,
  }: {
    isCollapsed?: boolean
  }
) {
  if (isDevelopment() && !isTest()) {
    if (isCollapsed) {
      logger.groupCollapsed(message)
    } else {
      logger.group(message)
    }

    if (context) {
      logger.info(message, context)
    } else {
      logger.info(message)
    }
    logger.groupEnd()
  }
}

/**
 * Outputs an info message.
 */
export function info(message: string, context?: GenericObject) {
  if (!isTest() && !isProduction()) {
    if (context) {
      logger.info(message, context)
    } else {
      logger.info(message)
    }
  }
}

/**
 * Outputs an warning message.
 */
export function warn(message: string, context?: GenericObject) {
  if (!isTest() && !isProduction()) {
    if (context) {
      logger.warn(message, context)
    } else {
      logger.warn(message)
    }
  }
}
