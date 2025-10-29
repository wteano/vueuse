import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的`Math.ceil`。
 *
 * @see https://vueuse.org/useCeil
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useCeil(value: MaybeRefOrGetter<number>): ComputedRef<number> {
  // 使用computed创建响应式计算属性，将输入值向上取整
  return computed<number>(() => Math.ceil(toValue(value)))
}