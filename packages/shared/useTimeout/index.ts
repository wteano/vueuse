/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:53:27
 * @FilePath: \vueuse\packages\shared\useTimeout\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { UseTimeoutFnOptions } from '../useTimeoutFn'
import type { Fn, Stoppable } from '../utils'
import { computed } from 'vue'
import { useTimeoutFn } from '../useTimeoutFn'
import { noop } from '../utils'

export interface UseTimeoutOptions<Controls extends boolean> extends UseTimeoutFnOptions {
  /**
   * 暴露更多控制选项
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * 超时回调函数
   * Callback on timeout
   */
  callback?: Fn
}

export type UseTimoutReturn = ComputedRef<boolean> | { readonly ready: ComputedRef<boolean> } & Stoppable

/**
 * 在给定时间后更新值，并提供控制选项。
 * Update value after a given time with controls.
 *
 * @see   {@link https://vueuse.org/useTimeout}
 * @param interval - 时间间隔（毫秒）
 * @param options - 配置选项
 */
export function useTimeout(interval?: MaybeRefOrGetter<number>, options?: UseTimeoutOptions<false>): ComputedRef<boolean>
export function useTimeout(interval: MaybeRefOrGetter<number>, options: UseTimeoutOptions<true>): { ready: ComputedRef<boolean> } & Stoppable
export function useTimeout(interval: MaybeRefOrGetter<number> = 1000, options: UseTimeoutOptions<boolean> = {}): UseTimoutReturn {
  const {
    controls: exposeControls = false,
    callback,
  } = options

  const controls = useTimeoutFn(
    callback ?? noop,
    interval,
    options,
  )

  const ready = computed(() => !controls.isPending.value)

  if (exposeControls) {
    return {
      ready,
      ...controls,
    }
  }
  else {
    return ready
  }
}