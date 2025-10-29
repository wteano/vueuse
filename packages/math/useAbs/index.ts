import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的`Math.abs`。
 *
 * @see https://vueuse.org/useAbs
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useAbs(value: MaybeRefOrGetter<number>): ComputedRef<number> {
  // 使用computed创建响应式计算属性，将输入值转换为绝对值
  return computed(() => Math.abs(toValue(value)))
}