/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:29:09
 * @FilePath: \vueuse\packages\math\createGenericProjection\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

// 投影函数类型，定义如何将输入值从源范围映射到目标范围
export type ProjectorFunction<F, T> = (input: F, from: readonly [F, F], to: readonly [T, T]) => T

// 投影函数类型，接受输入值并返回计算后的目标值
export type UseProjection<F, T> = (input: MaybeRefOrGetter<F>) => ComputedRef<T>

/* @__NO_SIDE_EFFECTS__ */
export function createGenericProjection<F = number, T = number>(
  fromDomain: MaybeRefOrGetter<readonly [F, F]>, // 源范围
  toDomain: MaybeRefOrGetter<readonly [T, T]>,   // 目标范围
  projector: ProjectorFunction<F, T>,            // 投影函数
): UseProjection<F, T> {
  // 返回一个函数，该函数接受输入值并返回计算后的目标值
  return (input: MaybeRefOrGetter<F>) => {
    // 使用computed创建响应式计算属性，通过投影函数将输入值从源范围映射到目标范围
    return computed(() => projector(toValue(input), toValue(fromDomain), toValue(toDomain)))
  }
}