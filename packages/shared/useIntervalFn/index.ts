/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 11:10:57
 * @FilePath: \vueuse\packages\shared\useIntervalFn\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { MaybeRefOrGetter } from 'vue'
import type { Fn, Pausable } from '../utils'
import { isRef, shallowReadonly, shallowRef, toValue, watch } from 'vue'
import { tryOnScopeDispose } from '../tryOnScopeDispose'
import { isClient } from '../utils'

export interface UseIntervalFnOptions {
  /**
   * 立即启动计时器
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 调用`resume`后立即执行回调函数
   *
   * @default false
   */
  immediateCallback?: boolean
}

export type UseIntervalFnReturn = Pausable

/**
 * 带有控制功能的`setInterval`包装器
 *
 * @see https://vueuse.org/useIntervalFn
 * @param cb 回调函数
 * @param interval 间隔时间（毫秒）
 * @param options 配置选项
 */
export function useIntervalFn(cb: Fn, interval: MaybeRefOrGetter<number> = 1000, options: UseIntervalFnOptions = {}): UseIntervalFnReturn {
  // 从选项中解构配置
  const {
    immediate = true,
    immediateCallback = false,
  } = options

  // 定时器句柄
  let timer: ReturnType<typeof setInterval> | null = null
  // 是否激活状态
  const isActive = shallowRef(false)

  // 清理定时器
  function clean() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 暂停定时器
  function pause() {
    isActive.value = false
    clean()
  }

  // 恢复定时器
  function resume() {
    const intervalValue = toValue(interval)
    if (intervalValue <= 0)
      return
    isActive.value = true
    // 如果需要立即执行回调
    if (immediateCallback)
      cb()
    clean()
    // 设置新的定时器
    if (isActive.value)
      timer = setInterval(cb, intervalValue)
  }

  // 如果需要立即启动且在客户端环境
  if (immediate && isClient)
    resume()

  // 如果interval是响应式的，则监听其变化
  if (isRef(interval) || typeof interval === 'function') {
    const stopWatch = watch(interval, () => {
      if (isActive.value && isClient)
        resume()
    })
    tryOnScopeDispose(stopWatch)
  }

  // 组件卸载时自动暂停
  tryOnScopeDispose(pause)

  return {
    isActive: shallowReadonly(isActive),
    pause,
    resume,
  }
}