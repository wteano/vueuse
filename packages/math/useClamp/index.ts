/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:22:23
 * @FilePath: \vueuse\packages\math\useClamp\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ReadonlyRefOrGetter } from '@vueuse/shared'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { clamp } from '@vueuse/shared'
import { computed, ref as deepRef, isReadonly, toValue } from 'vue'

/**
 * 响应式地将值限制在两个其他值之间。
 *
 * @see https://vueuse.org/useClamp
 * @param value number
 * @param min
 * @param max
 *
 * @__NO_SIDE_EFFECTS__
 */
// 函数重载：当value是只读或函数时，返回计算属性
export function useClamp(
  value: ReadonlyRefOrGetter<number>,
  min: MaybeRefOrGetter<number>,
  max: MaybeRefOrGetter<number>,
): ComputedRef<number>
// 函数重载：当value是普通值时，返回可写的ref
export function useClamp(
  value: MaybeRefOrGetter<number>,
  min: MaybeRefOrGetter<number>,
  max: MaybeRefOrGetter<number>,
): Ref<number>

/**
 * 响应式地将值限制在两个其他值之间。
 *
 * @see https://vueuse.org/useClamp
 * @param value number
 * @param min
 * @param max
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useClamp(value: MaybeRefOrGetter<number>, min: MaybeRefOrGetter<number>, max: MaybeRefOrGetter<number>) {
  // 如果value是函数或只读的，返回只读的计算属性
  if (typeof value === 'function' || isReadonly(value))
    return computed(() => clamp(toValue(value), toValue(min), toValue(max)))

  // 否则创建一个可写的ref
  const _value = deepRef(value)
  return computed<number>({
    get() {
      // 获取时，确保值在[min, max]范围内
      return _value.value = clamp(_value.value, toValue(min), toValue(max))
    },
    set(value) {
      // 设置时，确保新值在[min, max]范围内
      _value.value = clamp(value, toValue(min), toValue(max))
    },
  })
}