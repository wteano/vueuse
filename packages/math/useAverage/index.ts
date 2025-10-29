import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { MaybeComputedRefArgs } from '../utils'
import { computed } from 'vue'
import { toValueArgsFlat } from '../utils'

// 函数重载：接受一个数组参数
export function useAverage(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): ComputedRef<number>
// 函数重载：接受多个参数
export function useAverage(...args: MaybeRefOrGetter<number>[]): ComputedRef<number>

/**
 * 响应式地获取数组的平均值
 *
 * @see https://vueuse.org/useAverage
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useAverage(...args: MaybeComputedRefArgs<number>): ComputedRef<number> {
  return computed(() => {
    // 将参数转换为扁平化的数组
    const array = toValueArgsFlat(args)
    // 计算数组元素的总和，然后除以数组长度得到平均值
    return array.reduce((sum, v) => sum += v, 0) / array.length
  })
}