import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的`Math.trunc`。
 *
 * @see https://vueuse.org/useTrunc
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useTrunc(value: MaybeRefOrGetter<number>): ComputedRef<number> {
  // 使用computed创建响应式计算属性，移除数字的小数部分（不进行四舍五入）
  return computed<number>(() => Math.trunc(toValue(value)))
}