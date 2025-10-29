/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:57:44
 * @FilePath: \vueuse\packages\core\useEventListener\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Arrayable, Fn } from '@vueuse/shared'
import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import { isObject, toArray, tryOnScopeDispose, watchImmediate } from '@vueuse/shared'
// eslint-disable-next-line no-restricted-imports -- We specifically need to use unref here to distinguish between callbacks
import { computed, toValue, unref } from 'vue'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'

// 推断事件目标类型，包含addEventListener和removeEventListener方法
interface InferEventTarget<Events> {
  addEventListener: (event: Events, fn?: any, options?: any) => any
  removeEventListener: (event: Events, fn?: any, options?: any) => any
}

// 窗口事件名称类型
export type WindowEventName = keyof WindowEventMap
// 文档事件名称类型
export type DocumentEventName = keyof DocumentEventMap
// ShadowRoot事件名称类型
export type ShadowRootEventName = keyof ShadowRootEventMap

// 通用事件监听器类型
export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载1: 省略Window目标
 *
 * @see https://vueuse.org/useEventListener
 */
// @ts-expect-error - TypeScript gets confused with this and can't infer the correct overload with Parameters<...>
export function useEventListener<E extends keyof WindowEventMap>(
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRef<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载2: 明确指定Window目标
 *
 * @see https://vueuse.org/useEventListener
 * @param target 事件目标
 * @param event 事件名称
 * @param listener 事件监听器
 * @param options 事件选项
 */
export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRef<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载3: 明确指定Document目标
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof DocumentEventMap>(
  target: Document,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRef<Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载4: 明确指定ShadowRoot目标
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof ShadowRootEventMap>(
  target: MaybeRefOrGetter<Arrayable<ShadowRoot> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRef<Arrayable<(this: ShadowRoot, ev: ShadowRootEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载5: 明确指定HTMLElement目标
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: MaybeRefOrGetter<Arrayable<HTMLElement> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRef<(this: HTMLElement, ev: HTMLElementEventMap[E]) => any>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载6: 自定义事件目标，推断事件类型
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<Names extends string, EventType = Event>(
  target: MaybeRefOrGetter<Arrayable<InferEventTarget<Names>> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<Names>>,
  listener: MaybeRef<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

/**
 * 在挂载时使用addEventListener注册事件监听器，在卸载时自动移除。
 *
 * 重载7: 自定义事件目标回退
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<EventType = Event>(
  target: MaybeRefOrGetter<Arrayable<EventTarget> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<string>>,
  listener: MaybeRef<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>
): Fn

// useEventListener函数的实际实现
export function useEventListener(...args: Parameters<typeof useEventListener>) {
  // 存储清理函数的数组
  const cleanups: Function[] = []
  // 清理所有事件监听器
  const cleanup = () => {
    cleanups.forEach(fn => fn())
    cleanups.length = 0
  }

  // 注册事件监听器
  const register = (
    el: EventTarget,
    event: string,
    listener: any,
    options: boolean | AddEventListenerOptions | undefined,
  ) => {
    el.addEventListener(event, listener, options)
    return () => el.removeEventListener(event, listener, options)
  }

  // 计算第一个参数是否是目标元素
  const firstParamTargets = computed(() => {
    const test = toArray(toValue(args[0])).filter(e => e != null)
    return test.every(e => typeof e !== 'string') ? test : undefined
  })

  // 立即监听参数变化
  const stopWatch = watchImmediate(
    () => [
      firstParamTargets.value?.map(e => unrefElement(e as never)) ?? [defaultWindow].filter(e => e != null),
      toArray(toValue(firstParamTargets.value ? args[1] : args[0]) as string[]),
      toArray(unref(firstParamTargets.value ? args[2] : args[1]) as Function[]),
      // @ts-expect-error - TypeScript gets the correct types, but somehow still complains
      toValue(firstParamTargets.value ? args[3] : args[2]) as boolean | AddEventListenerOptions | undefined,
    ] as const,
    ([raw_targets, raw_events, raw_listeners, raw_options]) => {
      cleanup()

      if (!raw_targets?.length || !raw_events?.length || !raw_listeners?.length)
        return

      // 创建选项的克隆，避免在移除时被响应式地更改
      const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options
      cleanups.push(
        ...raw_targets.flatMap(el =>
          raw_events.flatMap(event =>
            raw_listeners.map(listener => register(el, event, listener, optionsClone)),
          ),
        ),
      )
    },
    { flush: 'post' },
  )

  // 停止监听函数
  const stop = () => {
    stopWatch()
    cleanup()
  }

  // 在作用域销毁时自动清理
  tryOnScopeDispose(cleanup)

  return stop
}