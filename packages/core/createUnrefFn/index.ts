/* This implementation is original ported from https://github.com/shorwood/pompaute by Stanley Horwood */

import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

export type UnrefFn<T> = T extends (...args: infer A) => infer R
  ? (...args: { [K in keyof A]: MaybeRef<A[K]> }) => R
  : never

/**
 * 将普通函数转换为可以接受ref和原始值作为参数的函数。
 * 返回与未转换函数相同的值，具有适当的类型。
 * 
 * Make a plain function accepting ref and raw values as arguments.
 * Returns the same value the unconverted function returns, with proper typing.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createUnrefFn<T extends Function>(fn: T): UnrefFn<T> {
  return function (this: any, ...args: any[]) {
    return fn.apply(this, args.map(i => toValue(i)))
  } as UnrefFn<T>
}