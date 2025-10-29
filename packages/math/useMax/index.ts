import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { MaybeComputedRefArgs } from '../utils'
import { computed } from 'vue'
import { toValueArgsFlat } from '../utils'

// 函数重载：接受一个数组参数
export function useMax(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): ComputedRef<number>
// 函数重载：接受多个参数
export function useMax(...args: MaybeRefOrGetter<number>[]): ComputedRef<number>

/**
 * 响应式地获取一组数值中的最大值。
 *
 * @see https://vueuse.org/useMax
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useMax(...args: MaybeComputedRefArgs<number>) {
  return computed<number>(() => {
    // 将参数转换为扁平化的数组
    const array = toValueArgsFlat(args)
    // 返回数组中的最大值
    return Math.max(...array)
  })
}