import type { MaybeRef, Ref, ShallowRef, UnwrapRef } from 'vue'
import { noop, promiseTimeout, until } from '@vueuse/shared'
import { ref as deepRef, shallowRef, toValue } from 'vue'

export interface UseAsyncStateReturnBase<Data, Params extends any[], Shallow extends boolean> {
  state: Shallow extends true ? Ref<Data> : Ref<UnwrapRef<Data>>
  isReady: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<unknown>
  execute: (delay?: number, ...args: Params) => Promise<Data>
  executeImmediate: (...args: Params) => Promise<Data>
}

export type UseAsyncStateReturn<Data, Params extends any[], Shallow extends boolean>
  = UseAsyncStateReturnBase<Data, Params, Shallow>
    & PromiseLike<UseAsyncStateReturnBase<Data, Params, Shallow>>

export interface UseAsyncStateOptions<Shallow extends boolean, D = any> {
  /**
   * 当"immediate"为true时，首次执行promise的延迟时间（毫秒）
   * Delay for the first execution of the promise when "immediate" is true. In milliseconds.
   *
   * @default 0
   */
  delay?: number

  /**
   * 在函数调用后立即执行promise
   * 如果有延迟，将应用延迟
   * Execute the promise right after the function is invoked.
   * Will apply the delay if any.
   *
   * 当设置为false时，您需要手动执行
   * When set to false, you will need to execute it manually.
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 捕获错误时的回调函数
   * Callback when error is caught.
   */
  onError?: (e: unknown) => void

  /**
   * 捕获成功时的回调函数
   * Callback when success is caught.
   * @param {D} data
   */
  onSuccess?: (data: D) => void

  /**
   * 在执行promise之前将状态设置为initialState
   * Sets the state to initialState before executing the promise.
   *
   * 这在多次调用execute函数时很有用（例如，刷新数据）
   * 当设置为false时，当前状态保持不变，直到promise解决
   * This can be useful when calling the execute function more than once (for
   * example, to refresh data). When set to false, the current state remains
   * unchanged until the promise resolves.
   *
   * @default true
   */
  resetOnExecute?: boolean

  /**
   * 使用shallowRef
   * Use shallowRef.
   *
   * @default true
   */
  shallow?: Shallow
  /**
   * 执行execute函数时抛出错误
   * An error is thrown when executing the execute function
   *
   * @default false
   */
  throwError?: boolean
}

/**
 * 响应式异步状态。不会阻塞您的setup函数，并在promise准备就绪时触发更改
 * Reactive async state. Will not block your setup function and will trigger changes once
 * the promise is ready.
 *
 * @see https://vueuse.org/useAsyncState
 * @param promise         要解决的promise / 异步函数
 * @param initialState    初始状态，在第一次评估完成之前使用
 * @param options
 */
export function useAsyncState<Data, Params extends any[] = any[], Shallow extends boolean = true>(
  promise: Promise<Data> | ((...args: Params) => Promise<Data>),
  initialState: MaybeRef<Data>,
  options?: UseAsyncStateOptions<Shallow, Data>,
): UseAsyncStateReturn<Data, Params, Shallow> {
  const {
    immediate = true,
    delay = 0,
    onError = globalThis.reportError ?? noop,
    onSuccess = noop,
    resetOnExecute = true,
    shallow = true,
    throwError,
  } = options ?? {}
  const state = shallow ? shallowRef(initialState) : deepRef(initialState)
  const isReady = shallowRef(false)
  const isLoading = shallowRef(false)
  const error = shallowRef<unknown | undefined>(undefined)

  let executionsCount = 0
  async function execute(delay = 0, ...args: any[]) {
    const executionId = (executionsCount += 1)

    if (resetOnExecute)
      state.value = toValue(initialState)
    error.value = undefined
    isReady.value = false
    isLoading.value = true

    if (delay > 0)
      await promiseTimeout(delay)

    const _promise = typeof promise === 'function'
      ? promise(...args as Params)
      : promise

    try {
      const data = await _promise
      if (executionId === executionsCount) {
        state.value = data
        isReady.value = true
      }
      onSuccess(data)
    }
    catch (e) {
      if (executionId === executionsCount)
        error.value = e
      onError(e)
      if (throwError)
        throw e
    }
    finally {
      if (executionId === executionsCount)
        isLoading.value = false
    }

    return state.value as Data
  }

  if (immediate) {
    execute(delay)
  }

  const shell: UseAsyncStateReturnBase<Data, Params, Shallow> = {
    state: state as Shallow extends true ? ShallowRef<Data> : Ref<UnwrapRef<Data>>,
    isReady,
    isLoading,
    error,
    execute,
    executeImmediate: (...args: any[]) => execute(0, ...args),
  }

  function waitUntilIsLoaded() {
    return new Promise<UseAsyncStateReturnBase<Data, Params, Shallow>>((resolve, reject) => {
      until(isLoading).toBe(false).then(() => resolve(shell)).catch(reject)
    })
  }

  return {
    ...shell,
    then(onFulfilled, onRejected) {
      return waitUntilIsLoaded()
        .then(onFulfilled, onRejected)
    },
  }
}