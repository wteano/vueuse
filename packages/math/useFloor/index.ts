import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的`Math.floor`
 *
 * @see https://vueuse.org/useFloor
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useFloor(value: MaybeRefOrGetter<number>): ComputedRef<number> {
  // 使用computed创建响应式计算属性，将输入值向下取整
  return computed<number>(() => Math.floor(toValue(value)))
}