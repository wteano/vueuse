/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:23:00
 * @FilePath: \vueuse\packages\math\logicAnd\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的逻辑与运算，对多个ref进行`AND`条件判断。
 *
 * @see https://vueuse.org/logicAnd
 *
 * @__NO_SIDE_EFFECTS__
 */
export function logicAnd(...args: MaybeRefOrGetter<any>[]): ComputedRef<boolean> {
  // 使用computed创建响应式计算属性，检查所有参数是否都为真值
  return computed(() => args.every(i => toValue(i)))
}

/** @deprecated 使用 `logicAnd` 替代 */
export const and = logicAnd