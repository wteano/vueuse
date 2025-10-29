/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:52:35
 * @FilePath: \vueuse\packages\shared\useArrayUnique\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

function uniq<T>(array: T[]) {
  return Array.from(new Set(array))
}

function uniqueElementsBy<T>(
  array: T[],
  fn: (a: T, b: T, array: T[]) => boolean,
) {
  return array.reduce<T[]>((acc, v) => {
    if (!acc.some(x => fn(v, x, array)))
      acc.push(v)
    return acc
  }, [])
}

export type UseArrayUniqueReturn<T = any> = ComputedRef<T[]>

/**
 * 响应式去重数组
 * reactive unique array
 * @see https://vueuse.org/useArrayUnique
 * @param list - 被调用的数组
 * @param compareFn - 比较函数，用于确定元素是否相等
 * @returns 返回去重后数组的计算属性
 * @returns A computed ref that returns a unique array of items.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayUnique<T>(
  list: MaybeRefOrGetter<MaybeRefOrGetter<T>[]>,
  compareFn?: (a: T, b: T, array: T[]) => boolean,
): UseArrayUniqueReturn<T> {
  return computed<T[]>(() => {
    const resolvedList = toValue(list).map(element => toValue(element))
    return compareFn ? uniqueElementsBy(resolvedList, compareFn) : uniq(resolvedList)
  })
}