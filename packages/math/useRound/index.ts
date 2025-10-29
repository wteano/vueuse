import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的`Math.round`。
 *
 * @see https://vueuse.org/useRound
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useRound(value: MaybeRefOrGetter<number>): ComputedRef<number> {
  // 使用computed创建响应式计算属性，将输入值四舍五入
  return computed<number>(() => Math.round(toValue(value)))
}