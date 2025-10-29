/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:50:13
 * @FilePath: \vueuse\packages\shared\useArrayDifference\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface UseArrayDifferenceOptions {
  /**
   * 返回不对称差集
   * Returns asymmetric difference
   *
   * @see https://en.wikipedia.org/wiki/Symmetric_difference
   * @default false
   */
  symmetric?: boolean
}

function defaultComparator<T>(value: T, othVal: T) {
  return value === othVal
}

export type UseArrayDifferenceReturn<T = any> = ComputedRef<T[]>

export function useArrayDifference<T>(
  list: MaybeRefOrGetter<T[]>,
  values: MaybeRefOrGetter<T[]>,
  key?: keyof T,
  options?: UseArrayDifferenceOptions
): UseArrayDifferenceReturn<T>
export function useArrayDifference<T>(
  list: MaybeRefOrGetter<T[]>,
  values: MaybeRefOrGetter<T[]>,
  compareFn?: (value: T, othVal: T) => boolean,
  options?: UseArrayDifferenceOptions
): UseArrayDifferenceReturn<T>

/**
 * 响应式获取两个数组的差集
 * Reactive get array difference of two array
 * @see https://vueuse.org/useArrayDifference
 * @returns - 两个数组的差集
 * @param args
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayDifference<T>(...args: any[]): UseArrayDifferenceReturn<T> {
  const list: MaybeRefOrGetter<T[]> = args[0]
  const values: MaybeRefOrGetter<T[]> = args[1]

  let compareFn = args[2] ?? defaultComparator
  const {
    symmetric = false,
  } = args[3] ?? {}

  if (typeof compareFn === 'string') {
    const key = compareFn as keyof T
    compareFn = (value: T, othVal: T) => value[key] === othVal[key]
  }

  const diff1 = computed(() => toValue(list).filter(x => toValue(values).findIndex(y => compareFn(x, y)) === -1))

  if (symmetric) {
    const diff2 = computed(() => toValue(values).filter(x => toValue(list).findIndex(y => compareFn(x, y)) === -1))
    return computed(() => symmetric ? [...toValue(diff1), ...toValue(diff2)] : toValue(diff1))
  }
  else {
    return diff1
  }
}