import type { Fn, WatchOptionFlush } from '@vueuse/shared'
import type { ComputedRef, Ref } from 'vue'
import { noop } from '@vueuse/shared'
import {
  computed,
  ref as deepRef,
  isRef,
  shallowRef,
  watchEffect,
} from 'vue'

/**
 * 处理重叠的异步评估。
 *
 * @param cancelCallback 当在之前的评估完成之前触发重新评估时，调用提供的回调函数
 */
export type AsyncComputedOnCancel = (cancelCallback: Fn) => void

export interface AsyncComputedOptions<Lazy = boolean> {
  /**
   * 是否应该延迟计算值
   *
   * @default false
   */
  lazy?: Lazy

  /**
   * 用于接收异步评估更新的ref
   */
  evaluating?: Ref<boolean>

  /**
   * 使用shallowRef
   *
   * @default true
   */
  shallow?: boolean

  /**
   * flush选项允许更好地控制历史记录点的时机，默认为`pre`
   *
   * 可能的值: `pre`, `post`, `sync`
   *
   * 它的工作方式与Vue响应式中的watch和watch effect的flush选项相同
   * @default 'sync'
   */
  flush?: WatchOptionFlush

  /**
   * 捕获错误时的回调函数。
   */
  onError?: (e: unknown) => void
}

/**
 * 创建一个异步计算的依赖关系。
 *
 * @see https://vueuse.org/computedAsync
 * @param evaluationCallback     返回promise的回调函数，用于生成计算值
 * @param initialState           初始状态，在第一次评估完成之前使用
 * @param optionsOrRef           额外选项或一个ref，用于接收异步评估的更新
 */
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState: T,
  optionsOrRef: AsyncComputedOptions<true>,
): ComputedRef<T>
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState: undefined,
  optionsOrRef: AsyncComputedOptions<true>,
): ComputedRef<T | undefined>
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState: T,
  optionsOrRef?: Ref<boolean> | AsyncComputedOptions,
): Ref<T>
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState?: undefined,
  optionsOrRef?: Ref<boolean> | AsyncComputedOptions,
): Ref<T | undefined>
export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState?: T,
  optionsOrRef?: Ref<boolean> | AsyncComputedOptions,
): Ref<T> | Ref<T | undefined> | ComputedRef<T> | ComputedRef<T | undefined> {
  let options: AsyncComputedOptions

  if (isRef(optionsOrRef)) {
    options = {
      evaluating: optionsOrRef,
    }
  }
  else {
    options = optionsOrRef || {}
  }

  const {
    lazy = false,
    flush = 'sync',
    evaluating = undefined,
    shallow = true,
    onError = globalThis.reportError ?? noop,
  } = options

  const started = shallowRef(!lazy)
  const current = (shallow ? shallowRef(initialState) : deepRef(initialState)) as Ref<T>
  let counter = 0

  watchEffect(async (onInvalidate) => {
    if (!started.value)
      return

    counter++
    const counterAtBeginning = counter
    let hasFinished = false

    // 延迟初始设置`evaluating` ref
    // 以避免将其作为依赖项
    if (evaluating) {
      Promise.resolve().then(() => {
        evaluating.value = true
      })
    }

    try {
      const result = await evaluationCallback((cancelCallback) => {
        onInvalidate(() => {
          if (evaluating)
            evaluating.value = false

          if (!hasFinished)
            cancelCallback()
        })
      })

      if (counterAtBeginning === counter)
        current.value = result
    }
    catch (e) {
      onError(e)
    }
    finally {
      if (evaluating && counterAtBeginning === counter)
        evaluating.value = false

      hasFinished = true
    }
  }, { flush })

  if (lazy) {
    return computed(() => {
      started.value = true
      return current.value
    })
  }
  else {
    return current
  }
}

/** @deprecated 使用 `computedAsync` 替代 */
export const asyncComputed = computedAsync