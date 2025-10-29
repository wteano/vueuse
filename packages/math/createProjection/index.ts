/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:28:34
 * @FilePath: \vueuse\packages\math\createProjection\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { ProjectorFunction, UseProjection } from '../createGenericProjection'
import { createGenericProjection } from '../createGenericProjection'

// 默认的数值投影函数，将一个数值从一个范围映射到另一个范围
function defaultNumericProjector(input: number, from: readonly [number, number], to: readonly [number, number]) {
  // 计算输入值在源范围中的相对位置，然后映射到目标范围
  return (input - from[0]) / (from[1] - from[0]) * (to[1] - to[0]) + to[0]
}

/* @__NO_SIDE_EFFECTS__ */
export function createProjection(
  fromDomain: MaybeRefOrGetter<readonly [number, number]>, // 源范围
  toDomain: MaybeRefOrGetter<readonly [number, number]>,   // 目标范围
  projector: ProjectorFunction<number, number> = defaultNumericProjector, // 投影函数，默认使用数值投影
): UseProjection<number, number> {
  // 使用通用投影函数创建数值投影
  return createGenericProjection(fromDomain, toDomain, projector)
}