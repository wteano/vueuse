/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:56:52
 * @FilePath: \vueuse\packages\core\useEventBus\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Fn } from '@vueuse/shared'
import { getCurrentScope } from 'vue'
import { events } from './internal'

// 事件总线监听器类型
export type EventBusListener<T = unknown, P = any> = (event: T, payload?: P) => void
// 事件总线事件集合类型
export type EventBusEvents<T, P = any> = Set<EventBusListener<T, P>>

// eslint-disable-next-line unused-imports/no-unused-vars, ts/no-wrapper-object-types
// 事件总线键类型，扩展自Symbol
export interface EventBusKey<T> extends Symbol { }

// 事件总线标识符类型，可以是EventBusKey、字符串或数字
export type EventBusIdentifier<T = unknown> = EventBusKey<T> | string | number

export interface UseEventBusReturn<T, P> {
  /**
   * 订阅事件。当调用emit时，监听器将执行。
   * @param listener 监听器函数
   * @returns 一个停止函数，用于移除当前回调
   */
  on: (listener: EventBusListener<T, P>) => Fn
  /**
   * 类似于`on`，但只触发一次
   * @param listener 监听器函数
   * @returns 一个停止函数，用于移除当前回调
   */
  once: (listener: EventBusListener<T, P>) => Fn
  /**
   * 发出事件，相应的事件监听器将执行
   * @param event 发送的数据
   * @param payload 负载数据
   */
  emit: (event?: T, payload?: P) => void
  /**
   * 移除相应的监听器
   * @param listener 监听器函数
   */
  off: (listener: EventBusListener<T>) => void
  /**
   * 清除所有事件
   */
  reset: () => void
}

/* @__NO_SIDE_EFFECTS__ */
/**
 * 创建一个事件总线实例，用于组件间通信
 * 
 * @param key 事件总线的唯一标识符
 * @returns 返回事件总线的控制对象
 */
export function useEventBus<T = unknown, P = any>(key: EventBusIdentifier<T>): UseEventBusReturn<T, P> {
  // 获取当前Vue作用域，用于自动清理
  const scope = getCurrentScope()
  
  // 订阅事件
  function on(listener: EventBusListener<T, P>) {
    // 获取或创建监听器集合
    const listeners = (events.get(key) || new Set())
    listeners.add(listener)
    events.set(key, listeners)

    // 创建取消订阅函数
    const _off = () => off(listener)
    // 当作用域被销毁时自动取消订阅
    // @ts-expect-error vue3 and vue2 mis-align
    scope?.cleanups?.push(_off)
    return _off
  }

  // 订阅一次性事件
  function once(listener: EventBusListener<T, P>) {
    function _listener(...args: any[]) {
      off(_listener)
      // @ts-expect-error cast
      listener(...args)
    }
    return on(_listener)
  }

  // 取消订阅事件
  function off(listener: EventBusListener<T>): void {
    const listeners = events.get(key)
    if (!listeners)
      return

    listeners.delete(listener)

    // 如果没有监听器了，则重置事件
    if (!listeners.size)
      reset()
  }

  // 重置事件，清除所有监听器
  function reset() {
    events.delete(key)
  }

  // 发出事件
  function emit(event?: T, payload?: P) {
    events.get(key)?.forEach(v => v(event, payload))
  }

  return { on, once, off, emit, reset }
}