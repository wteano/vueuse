/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:58:48
 * @FilePath: \vueuse\packages\core\useEventSource\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Fn } from '@vueuse/shared'
import type { MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { isClient, toRef, tryOnScopeDispose } from '@vueuse/shared'
import { ref as deepRef, shallowRef, watch } from 'vue'
import { useEventListener } from '../useEventListener'

// EventSource连接状态类型
export type EventSourceStatus = 'CONNECTING' | 'OPEN' | 'CLOSED'

// useEventSource函数的选项接口
export interface UseEventSourceOptions<Data> extends EventSourceInit {
  /**
   * 启用自动重连
   *
   * @default false
   */
  autoReconnect?: boolean | {
    /**
     * 最大重试次数。
     *
     * 或者您可以传递一个谓词函数（如果您想重试，则返回true）。
     *
     * @default -1
     */
    retries?: number | (() => boolean)

    /**
     * 重连延迟，以毫秒为单位
     *
     * @default 1000
     */
    delay?: number

    /**
     * 达到最大重试次数时的回调。
     */
    onFailed?: Fn
  }

  /**
   * 调用此组合式函数时立即打开连接
   *
   * @default true
   */
  immediate?: boolean

  /**
   * URL更改时自动连接到EventSource
   *
   * @default true
   */
  autoConnect?: boolean

  /**
   * 自定义数据序列化
   */
  serializer?: {
    read: (v?: string) => Data
  }
}

// useEventSource函数的返回值接口
export interface UseEventSourceReturn<Events extends string[], Data = any> {
  /**
   * 通过EventSource接收的最新数据的引用，
   * 可以被监听以响应传入的消息
   */
  data: ShallowRef<Data | null>

  /**
   * 连接的当前状态，只能是以下之一：
   * 'CONNECTING', 'OPEN' 'CLOSED'
   */
  status: ShallowRef<EventSourceStatus>

  /**
   * 最新的命名事件
   */
  event: ShallowRef<Events[number] | null>

  /**
   * 当前错误
   */
  error: ShallowRef<Event | null>

  /**
   * 优雅地关闭EventSource连接。
   */
  close: EventSource['close']

  /**
   * 重新打开EventSource连接。
   * 如果当前连接处于活动状态，将在打开新连接之前关闭它。
   */
  open: Fn

  /**
   * 当前EventSource实例的引用。
   */
  eventSource: Ref<EventSource | null>
  /**
   * 最后的事件ID字符串，用于服务器发送的事件。
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/lastEventId
   */
  lastEventId: ShallowRef<string | null>
}

// 解析嵌套选项的辅助函数
function resolveNestedOptions<T>(options: T | true): T {
  if (options === true)
    return {} as T
  return options
}

/**
 * EventSource的响应式包装器。
 *
 * @see https://vueuse.org/useEventSource
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource EventSource
 * @param url EventSource的URL
 * @param events 要监听的事件数组
 * @param options 配置选项
 */
export function useEventSource<Events extends string[], Data = any>(
  url: MaybeRefOrGetter<string | URL | undefined>,
  events: Events = [] as unknown as Events,
  options: UseEventSourceOptions<Data> = {},
): UseEventSourceReturn<Events, Data> {
  // 最新的命名事件的响应式引用
  const event: ShallowRef<string | null> = shallowRef(null)
  // 最新数据的响应式引用
  const data: ShallowRef<Data | null> = shallowRef(null)
  // 连接状态的响应式引用
  const status = shallowRef<EventSourceStatus>('CONNECTING')
  // EventSource实例的响应式引用
  const eventSource = deepRef<EventSource | null>(null)
  // 错误的响应式引用
  const error = shallowRef<Event | null>(null)
  // URL的响应式引用
  const urlRef = toRef(url)
  // 最后事件ID的响应式引用
  const lastEventId = shallowRef<string | null>(null)

  // 标记是否显式关闭连接
  let explicitlyClosed = false
  // 记录重试次数
  let retried = 0

  // 从选项中解构配置
  const {
    withCredentials = false,
    immediate = true,
    autoConnect = true,
    autoReconnect,
    serializer = {
      read: (v?: string) => v as Data,
    },
  } = options

  // 关闭EventSource连接
  const close = () => {
    if (isClient && eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      status.value = 'CLOSED'
      explicitlyClosed = true
    }
  }

  // 初始化EventSource连接
  const _init = () => {
    if (explicitlyClosed || typeof urlRef.value === 'undefined')
      return

    const es = new EventSource(urlRef.value, { withCredentials })

    status.value = 'CONNECTING'

    eventSource.value = es

    // 连接打开时的处理
    es.onopen = () => {
      status.value = 'OPEN'
      error.value = null
    }

    // 连接错误时的处理
    es.onerror = (e) => {
      status.value = 'CLOSED'
      error.value = e

      // 只有在EventSource没有自己重连时才重连
      // 这是在连接关闭时的情况（readyState为2）
      if (es.readyState === 2 && !explicitlyClosed && autoReconnect) {
        es.close()
        const {
          retries = -1,
          delay = 1000,
          onFailed,
        } = resolveNestedOptions(autoReconnect)
        retried += 1

        if (typeof retries === 'number' && (retries < 0 || retried < retries))
          setTimeout(_init, delay)
        else if (typeof retries === 'function' && retries())
          setTimeout(_init, delay)
        else
          onFailed?.()
      }
    }

    // 接收到消息时的处理
    es.onmessage = (e: MessageEvent) => {
      event.value = null
      data.value = serializer.read(e.data) ?? null
      lastEventId.value = e.lastEventId
    }

    // 为每个指定的事件添加监听器
    for (const event_name of events) {
      useEventListener(es, event_name, (e: Event & { data?: string, lastEventId?: string }) => {
        event.value = event_name
        data.value = serializer.read(e.data) ?? null
        lastEventId.value = e.lastEventId ?? null
      }, { passive: true })
    }
  }

  // 打开EventSource连接
  const open = () => {
    if (!isClient)
      return
    close()
    explicitlyClosed = false
    retried = 0
    _init()
  }

  // 如果设置了immediate，立即打开连接
  if (immediate)
    open()

  // 如果设置了autoConnect，在URL变化时重新连接
  if (autoConnect)
    watch(urlRef, open)

  // 在作用域销毁时自动关闭连接
  tryOnScopeDispose(close)

  return {
    eventSource,
    event,
    data,
    status,
    error,
    open,
    close,
    lastEventId,
  }
}