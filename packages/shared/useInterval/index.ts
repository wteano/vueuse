/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:11:32
 * @FilePath: \vueuse\packages\shared\useInterval\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import type { Pausable } from '../utils'
import { shallowReadonly, shallowRef } from 'vue'
import { useIntervalFn } from '../useIntervalFn'

export interface UseIntervalOptions<Controls extends boolean> {
  /**
   * 暴露更多控制选项
   *
   * @default false
   */
  controls?: Controls

  /**
   * 调用时立即执行更新
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 每次间隔时的回调函数
   */
  callback?: (count: number) => void
}

export interface UseIntervalControls {
  counter: ShallowRef<number>
  reset: () => void
}

export type UseIntervalReturn = Readonly<ShallowRef<number>> | Readonly<UseIntervalControls & Pausable>

/**
 * 每个间隔递增的响应式计数器
 *
 * @see https://vueuse.org/useInterval
 * @param interval 间隔时间（毫秒）
 * @param options 配置选项
 */
export function useInterval(interval?: MaybeRefOrGetter<number>, options?: UseIntervalOptions<false>): Readonly<ShallowRef<number>>
export function useInterval(interval: MaybeRefOrGetter<number>, options: UseIntervalOptions<true>): Readonly<UseIntervalControls & Pausable>
export function useInterval(interval: MaybeRefOrGetter<number> = 1000, options: UseIntervalOptions<boolean> = {}): UseIntervalReturn {
  // 从选项中解构配置
  const {
    controls: exposeControls = false,
    immediate = true,
    callback,
  } = options

  // 计数器
  const counter = shallowRef(0)
  // 更新计数器
  const update = () => counter.value += 1
  // 重置计数器
  const reset = () => {
    counter.value = 0
  }
  // 使用useIntervalFn创建定时器
  const controls = useIntervalFn(
    callback
      ? () => {
          update()
          callback(counter.value)
        }
      : update,
    interval,
    { immediate },
  )

  // 根据是否暴露控制选项返回不同的结果
  if (exposeControls) {
    return {
      counter: shallowReadonly(counter),
      reset,
      ...controls,
    }
  }
  else {
    return shallowReadonly(counter)
  }
}