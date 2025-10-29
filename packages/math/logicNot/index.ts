/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:26:29
 * @FilePath: \vueuse\packages\math\logicNot\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * 响应式的逻辑非运算，对ref进行`NOT`条件判断。
 *
 * @see https://vueuse.org/logicNot
 *
 * @__NO_SIDE_EFFECTS__
 */
export function logicNot(v: MaybeRefOrGetter<any>): ComputedRef<boolean> {
  // 使用computed创建响应式计算属性，对传入的值取反
  return computed(() => !toValue(v))
}

/** @deprecated 使用 `logicNot` 替代 */
export const not = logicNot