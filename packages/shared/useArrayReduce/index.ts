/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:52:11
 * @FilePath: \vueuse\packages\shared\useArrayReduce\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export type UseArrayReducer<PV, CV, R> = (previousValue: PV, currentValue: CV, currentIndex: number) => R

/**
 * 响应式 `Array.reduce`
 * Reactive `Array.reduce`
 *
 * @see https://vueuse.org/useArrayReduce
 * @param list - 被调用的数组
 * @param reducer - "reducer" 函数
 *
 * @returns 在整个数组上运行 "reducer" 回调函数至完成所产生的值
 * @returns the value that results from running the "reducer" callback function to completion over the entire array.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayReduce<T>(
  list: MaybeRefOrGetter<MaybeRefOrGetter<T>[]>,
  reducer: UseArrayReducer<T, T, T>,
): ComputedRef<T>

/**
 * 响应式 `Array.reduce`
 * Reactive `Array.reduce`
 *
 * @see https://vueuse.org/useArrayReduce
 * @param list - 被调用的数组
 * @param reducer - "reducer" 函数
 * @param initialValue - 首次调用回调时要初始化的值
 *
 * @returns 在整个数组上运行 "reducer" 回调函数至完成所产生的值
 * @returns the value that results from running the "reducer" callback function to completion over the entire array.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayReduce<T, U>(
  list: MaybeRefOrGetter<MaybeRefOrGetter<T>[]>,
  reducer: UseArrayReducer<U, T, U>,
  initialValue: MaybeRefOrGetter<U>,
): ComputedRef<U>

/**
 * 响应式 `Array.reduce`
 * Reactive `Array.reduce`
 *
 * @see https://vueuse.org/useArrayReduce
 * @param list - 被调用的数组
 * @param reducer - "reducer" 函数
 * @param args - 其他参数
 *
 * @returns 在整个数组上运行 "reducer" 回调函数至完成所产生的值
 * @returns the value that results from running the "reducer" callback function to completion over the entire array.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayReduce<T>(
  list: MaybeRefOrGetter<MaybeRefOrGetter<T>[]>,
  reducer: ((...p: any[]) => any),
  ...args: any[]
): ComputedRef<T> {
  const reduceCallback = (sum: any, value: any, index: number) => reducer(toValue(sum), toValue(value), index)

  return computed(() => {
    const resolved = toValue(list)
    // Depending on the behavior of reduce, undefined is also a valid initialization value,
    // and this code will distinguish the behavior between them.
    // 根据 reduce 的行为，undefined 也是一个有效的初始化值，
    // 此代码将区分它们之间的行为。
    return args.length
      ? resolved.reduce(reduceCallback, typeof args[0] === 'function' ? toValue(args[0]()) : toValue(args[0]))
      : resolved.reduce(reduceCallback)
  })
}