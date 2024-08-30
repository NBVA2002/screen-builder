import React, {FunctionComponent, isValidElement, ReactElement} from 'react'

import {normalizeCode, transform} from './transform'
import {RunnerOptions, Scope} from './types'

export type RunnerProps = RunnerOptions & {
  /** callback on code be rendered, returns error message when code is invalid */
  onRendered?: (error?: Error) => void
}

const evalCode = (code: string, scope: Scope) => {
  // `default` is not allowed in `new Function`
  const {default: _, import: imports, ...rest} = scope
  const finalScope: Scope = {React, require: createRequire(imports), ...rest}
  const scopeKeys = Object.keys(finalScope)
  const scopeValues = scopeKeys.map((key) => finalScope[key])
  // eslint-disable-next-line no-new-func
  const fn = new Function(...scopeKeys, code)
  return fn(...scopeValues)
}

export const generateElement = (options: RunnerProps): ReactElement | FunctionComponent | null => {
  const {code, scope} = options

  if (!code.trim()) return null

  const exports: Scope = {}
  const render = (value: unknown) => {
    exports.default = value
  }
  evalCode(transform(normalizeCode(code)), {render, ...scope, exports})

  const result = exports.default
  if (!result) return null
  if (isValidElement(result)) return result
  if (typeof result === 'function') return result
  if (typeof result === 'string') {
    return result as unknown as ReactElement
  }
  return null
}

export const createRequire = (imports: Scope = {}) => (module: string): Scope => {
  if (!imports.hasOwnProperty(module)) {
    throw new Error(`Module not found: '${module}'`)
  }
  return imports[module]
}

export const importCode = (code: string, scope?: Scope) => {
  const exports: Scope = {}
  evalCode(transform(code), {...scope, exports})

  return exports
}
