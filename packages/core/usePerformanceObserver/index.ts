import type { ConfigurableWindow } from '../_configurable'
import { tryOnScopeDispose } from '@vueuse/shared'
import { defaultWindow } from '../_configurable'
import { useSupported } from '../useSupported'

export type UsePerformanceObserverOptions = PerformanceObserverInit & ConfigurableWindow & {
  /**
   * 立即启动观察器
   *
   * @default true
   */
  immediate?: boolean
}

/**
 * 观察性能指标
 *
 * @see https://vueuse.org/usePerformanceObserver
 * @param options 配置选项
 * @param callback 回调函数
 */
export function usePerformanceObserver(options: UsePerformanceObserverOptions, callback: PerformanceObserverCallback) {
  const {
    window = defaultWindow,
    immediate = true,
    ...performanceOptions
  } = options

  const isSupported = useSupported(() => window && 'PerformanceObserver' in window)

  let observer: PerformanceObserver | undefined

  const stop = () => {
    observer?.disconnect()
  }

  const start = () => {
    if (isSupported.value) {
      stop()
      observer = new PerformanceObserver(callback)
      observer.observe(performanceOptions)
    }
  }

  tryOnScopeDispose(stop)

  if (immediate)
    start()

  return {
    isSupported,
    start,
    stop,
  }
}