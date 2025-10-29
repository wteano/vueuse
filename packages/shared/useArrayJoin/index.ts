/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:51:19
 * @FilePath: \vueuse\packages\shared\useArrayJoin\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export type UseArrayJoinReturn = ComputedRef<string>

/**
 * 响应式 `Array.join`
 * Reactive `Array.join`
 *
 * @see https://vueuse.org/useArrayJoin
 * @param list - 被调用的数组
 * @param separator - 用于分隔数组中每对相邻元素的字符串。如果省略，数组元素用逗号（","）分隔
 *
 * @returns 包含所有数组元素连接的字符串。如果 arr.length 为 0，则返回空字符串
 * @returns a string with all array elements joined. If arr.length is 0, the empty string is returned.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useArrayJoin(
  list: MaybeRefOrGetter<MaybeRefOrGetter<any>[]>,
  separator?: MaybeRefOrGetter<string>,
): UseArrayJoinReturn {
  return computed(() => toValue(list).map(i => toValue(i)).join(toValue(separator)))
}