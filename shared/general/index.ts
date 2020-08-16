import _ from 'lodash'

/**
 * Converts the provided string value into an object, split by the delimiters.
 */
export function stringToObject({
  propDelimiter,
  value,
  valueDelimiter,
  valueProcessorFn = null,
}: {
  propDelimiter: string
  value?: string | null
  valueDelimiter: string
  valueProcessorFn?: ((value: string) => string) | null
}) {
  if (!value) {
    return {}
  }

  return value.split(propDelimiter).reduce((queryObj, term) => {
    const termArr = term.split(valueDelimiter)
    const termValue = termArr[1]

    return {
      ...queryObj,
      [termArr[0]]: _.isFunction(valueProcessorFn)
        ? valueProcessorFn(termValue)
        : termValue,
    }
  }, {})
}

/**
 * "Un-stringifies" the query part of a provided string.
 */
export function unStringifyQuery(
  search: string
): { [fieldName: string]: string | undefined } {
  if (!search) {
    return {}
  }

  // Get rid of the "?" at the beginning.
  return stringToObject({
    propDelimiter: '&',
    value: search.substring(1),
    valueDelimiter: '=',
    valueProcessorFn: (value) => decodeURIComponent(value),
  })
}
