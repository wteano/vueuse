/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:36:53
 * @FilePath: \vueuse\packages\shared\useDebounceFn\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { DebounceFilterOptions, FunctionArgs, PromisifyFn } from '../utils'
import { createFilterWrapper, debounceFilter } from '../utils'

/** useDebounceFn函数的返回类型 */
export type UseDebounceFnReturn<T extends FunctionArgs> = PromisifyFn<T>

/**
 * 防抖执行一个函数。
 *
 * @see https://vueuse.org/useDebounceFn
 * @param  fn          一个在延迟毫秒数后执行的防抖函数。
 * @param  ms          一个大于或等于零的延迟时间（毫秒）。对于事件回调，100或250（甚至更高）左右的值最有用。
 * @param  options     配置选项
 *
 * @return 一个新的、防抖的函数。
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useDebounceFn<T extends FunctionArgs>(
  fn: T,
  ms: MaybeRefOrGetter<number> = 200,
  options: DebounceFilterOptions = {},
): UseDebounceFnReturn<T> {
  return createFilterWrapper(
    debounceFilter(ms, options),
    fn,
  )
}