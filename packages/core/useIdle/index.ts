import type { ConfigurableEventFilter, Stoppable, TimerHandle } from '@vueuse/shared'
import type { ShallowRef } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { WindowEventName } from '../useEventListener'
import { createFilterWrapper, throttleFilter, timestamp } from '@vueuse/shared'
import { shallowReadonly, shallowRef } from 'vue'
import { defaultWindow } from '../_configurable'
import { useEventListener } from '../useEventListener'

// 默认监听的事件列表
const defaultEvents: WindowEventName[] = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
// 一分钟的毫秒数
const oneMinute = 60_000

export interface UseIdleOptions extends ConfigurableWindow, ConfigurableEventFilter {
  /**
   * 用于检测用户活动的事件名称
   *
   * @default ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
   */
  events?: WindowEventName[]
  /**
   * 是否监听文档可见性变化
   *
   * @default true
   */
  listenForVisibilityChange?: boolean
  /**
   * 空闲状态的初始值
   *
   * @default false
   */
  initialState?: boolean
}

export interface UseIdleReturn extends Stoppable {
  idle: ShallowRef<boolean>
  lastActive: ShallowRef<number>
  reset: () => void
}

/**
 * 跟踪用户是否处于非活动状态
 *
 * @see https://vueuse.org/useIdle
 * @param timeout 超时时间，默认为1分钟
 * @param options 配置选项
 */
export function useIdle(
  timeout: number = oneMinute,
  options: UseIdleOptions = {},
): UseIdleReturn {
  // 从选项中解构配置
  const {
    initialState = false,
    listenForVisibilityChange = true,
    events = defaultEvents,
    window = defaultWindow,
    eventFilter = throttleFilter(50),
  } = options
  // 空闲状态
  const idle = shallowRef(initialState)
  // 最后活动时间
  const lastActive = shallowRef(timestamp())
  // 是否正在监听
  const isPending = shallowRef(false)

  // 定时器句柄
  let timer: TimerHandle

  // 重置空闲状态
  const reset = () => {
    idle.value = false
    clearTimeout(timer)
    timer = setTimeout(() => idle.value = true, timeout)
  }

  // 事件处理函数
  const onEvent = createFilterWrapper(
    eventFilter,
    () => {
      lastActive.value = timestamp()
      reset()
    },
  )

  if (window) {
    const document = window.document
    const listenerOptions = { passive: true }

    // 为每个事件添加监听器
    for (const event of events) {
      useEventListener(window, event, () => {
        if (!isPending.value)
          return
        onEvent()
      }, listenerOptions)
    }

    // 监听文档可见性变化
    if (listenForVisibilityChange) {
      useEventListener(document, 'visibilitychange', () => {
        if (document.hidden || !isPending.value)
          return
        onEvent()
      }, listenerOptions)
    }

    // 开始监听
    start()
  }

  // 开始监听
  function start() {
    if (isPending.value) {
      return
    }
    isPending.value = true
    if (!initialState)
      reset()
  }
  
  // 停止监听
  function stop() {
    idle.value = initialState
    clearTimeout(timer)
    isPending.value = false
  }

  return {
    idle,
    lastActive,
    reset,
    stop,
    start,
    isPending: shallowReadonly(isPending),
  }
}