/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:33:16
 * @FilePath: \vueuse\packages\math\useProjection\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { ProjectorFunction } from '../createGenericProjection'
import { createProjection } from '../createProjection'

/**
 * 响应式地将数值从一个范围映射到另一个范围。
 *
 * @see https://vueuse.org/useProjection
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useProjection(
  input: MaybeRefOrGetter<number>,            // 输入值
  fromDomain: MaybeRefOrGetter<readonly [number, number]>, // 源范围
  toDomain: MaybeRefOrGetter<readonly [number, number]>,   // 目标范围
  projector?: ProjectorFunction<number, number>,           // 可选的自定义投影函数
) {
  // 使用createProjection创建投影函数，并立即应用于输入值
  return createProjection(fromDomain, toDomain, projector)(input)
}