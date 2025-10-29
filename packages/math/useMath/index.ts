import type { ArgumentsType, Reactified } from '@vueuse/shared'
import { reactify } from '@vueuse/shared'

// Math对象中所有函数类型的键
export type UseMathKeys = keyof { [K in keyof Math as Math[K] extends (...args: any) => any ? K : never]: unknown }

// useMath函数的返回类型，基于Math[K]的响应式版本
export type UseMathReturn<K extends keyof Math> = ReturnType<Reactified<Math[K], true>>

/**
 * 响应式的`Math`方法。
 *
 * @see https://vueuse.org/useMath
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useMath<K extends keyof Math>(
  key: K, // Math对象的方法名
  ...args: ArgumentsType<Reactified<Math[K], true>> // 方法的参数，支持响应式
): UseMathReturn<K> {
  // 使用reactify将Math方法转换为响应式函数
  return reactify(Math[key] as any)(...args) as UseMathReturn<K>
}