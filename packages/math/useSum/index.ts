import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { MaybeComputedRefArgs } from '../utils'
import { computed } from 'vue'
import { toValueArgsFlat } from '../utils'

// 函数重载：接受一个数组参数
export function useSum(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): ComputedRef<number>
// 函数重载：接受多个参数
export function useSum(...args: MaybeRefOrGetter<number>[]): ComputedRef<number>

/**
 * 获取一组数字的总和。
 *
 * @see https://vueuse.org/useSum
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useSum(...args: MaybeComputedRefArgs<number>): ComputedRef<number> {
  return computed(() => {
    // 将参数转换为扁平化的数组，然后使用reduce计算总和
    return toValueArgsFlat(args).reduce((sum, v) => sum += v, 0)
  })
}