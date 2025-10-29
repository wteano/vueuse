/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:37:45
 * @FilePath: \vueuse\packages\shared\useThrottleFn\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { FunctionArgs, PromisifyFn } from '../utils'
import { createFilterWrapper, throttleFilter } from '../utils'

/**
 * 节流执行一个函数。对于限制事件处理程序（如resize和scroll）的执行速率特别有用。
 *
 * @param   fn             一个在延迟毫秒数后执行的函数。当节流函数执行时，`this`上下文和所有参数将原样传递给`callback`。
 * @param   ms             一个大于或等于零的延迟时间（毫秒）。对于事件回调，100或250（甚至更高）左右的值最有用。
 *                                    (默认值: 200)
 *
 * @param [trailing] 如果为true，在时间结束后再次调用fn (默认值: false)
 *
 * @param [leading] 如果为true，在ms超时的开始边缘调用fn (默认值: true)
 *
 * @param [rejectOnCancel] 如果为true，如果被取消则拒绝最后一次调用 (默认值: false)
 *
 * @return  一个新的、节流的函数。
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useThrottleFn<T extends FunctionArgs>(
  fn: T,
  ms: MaybeRefOrGetter<number> = 200,
  trailing = false,
  leading = true,
  rejectOnCancel = false,
): PromisifyFn<T> {
  return createFilterWrapper(
    throttleFilter(ms, trailing, leading, rejectOnCancel),
    fn,
  )
}