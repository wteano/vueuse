import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { MaybeComputedRefArgs } from '../utils'
import { computed } from 'vue'
import { toValueArgsFlat } from '../utils'

// 函数重载：接受一个数组参数
export function useMin(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): ComputedRef<number>
// 函数重载：接受多个参数
export function useMin(...args: MaybeRefOrGetter<number>[]): ComputedRef<number>

/**
 * 响应式的`Math.min`。
 *
 * @see https://vueuse.org/useMin
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useMin(...args: MaybeComputedRefArgs<number>) {
  return computed<number>(() => {
    // 将参数转换为扁平化的数组
    const array = toValueArgsFlat(args)
    // 返回数组中的最小值
    return Math.min(...array)
  })
}