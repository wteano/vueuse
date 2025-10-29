import type { EventHookOn, Fn, Stoppable } from '@vueuse/shared'
import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { containsProp, createEventHook, toRef, until, useTimeoutFn } from '@vueuse/shared'
import { computed, isRef, readonly, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'

/**
 * useFetch函数的返回类型
 */
export interface UseFetchReturn<T> {
  /**
   * 指示fetch请求是否已完成
   */
  isFinished: Readonly<ShallowRef<boolean>>

  /**
   * HTTP fetch响应的状态码
   */
  statusCode: ShallowRef<number | null>

  /**
   * fetch响应的原始响应
   */
  response: ShallowRef<Response | null>

  /**
   * 可能发生的任何fetch错误
   */
  error: ShallowRef<any>

  /**
   * 成功时的fetch响应体，可能是JSON或文本
   */
  data: ShallowRef<T | null>

  /**
   * 指示请求当前是否正在获取中
   */
  isFetching: Readonly<ShallowRef<boolean>>

  /**
   * 指示fetch请求是否可以被中止
   */
  canAbort: ComputedRef<boolean>

  /**
   * 指示fetch请求是否已被中止
   */
  aborted: ShallowRef<boolean>

  /**
   * 中止fetch请求
   */
  abort: (reason?: any) => void

  /**
   * 手动调用fetch
   * (默认不抛出错误)
   */
  execute: (throwOnFailed?: boolean) => Promise<any>

  /**
   * 在fetch请求完成后触发
   */
  onFetchResponse: EventHookOn<Response>

  /**
   * 在fetch请求错误后触发
   */
  onFetchError: EventHookOn

  /**
   * 在fetch完成后触发
   */
  onFetchFinally: EventHookOn

  // HTTP方法
  get: () => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  post: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  put: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  delete: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  patch: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  head: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  options: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>

  // 响应类型
  json: <JSON = any>() => UseFetchReturn<JSON> & PromiseLike<UseFetchReturn<JSON>>
  text: () => UseFetchReturn<string> & PromiseLike<UseFetchReturn<string>>
  blob: () => UseFetchReturn<Blob> & PromiseLike<UseFetchReturn<Blob>>
  arrayBuffer: () => UseFetchReturn<ArrayBuffer> & PromiseLike<UseFetchReturn<ArrayBuffer>>
  formData: () => UseFetchReturn<FormData> & PromiseLike<UseFetchReturn<FormData>>
}

/**
 * 数据类型枚举
 */
type DataType = 'text' | 'json' | 'blob' | 'arrayBuffer' | 'formData'

/**
 * HTTP方法枚举
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * 组合方式枚举
 */
type Combination = 'overwrite' | 'chain'

/**
 * 负载映射表
 */
const payloadMapping: Record<string, string> = {
  json: 'application/json',
  text: 'text/plain',
}

/**
 * 请求前的上下文
 */
export interface BeforeFetchContext {
  /**
   * 当前请求的计算URL
   */
  url: string

  /**
   * 当前请求的请求选项
   */
  options: RequestInit

  /**
   * 取消当前请求
   */
  cancel: Fn
}

/**
 * 请求后的上下文
 */
export interface AfterFetchContext<T = any> {
  response: Response

  data: T | null

  context: BeforeFetchContext

  execute: (throwOnFailed?: boolean) => Promise<any>
}

/**
 * 请求错误的上下文
 */
export interface OnFetchErrorContext<T = any, E = any> {
  error: E

  data: T | null

  response: Response | null

  context: BeforeFetchContext

  execute: (throwOnFailed?: boolean) => Promise<any>
}

/**
 * useFetch的配置选项
 */
export interface UseFetchOptions {
  /**
   * Fetch函数
   */
  fetch?: typeof window.fetch

  /**
   * 使用useFetch时是否自动运行fetch
   *
   * @default true
   */
  immediate?: boolean

  /**
   * 是否在以下情况下自动重新获取：
   * - 如果URL是ref，当URL改变时
   * - 如果payload是ref，当payload改变时
   *
   * @default false
   */
  refetch?: MaybeRefOrGetter<boolean>

  /**
   * 请求完成前的初始数据
   *
   * @default null
   */
  initialData?: any

  /**
   * 在指定毫秒数后中止请求的超时时间
   * `0`表示使用浏览器默认值
   *
   * @default 0
   */
  timeout?: number

  /**
   * 允许在fetch错误时或在onFetchError回调中修改时更新data引用
   *
   * @default false
   */
  updateDataOnError?: boolean

  /**
   * 将在fetch请求发送前立即运行
   */
  beforeFetch?: (ctx: BeforeFetchContext) => Promise<Partial<BeforeFetchContext> | void> | Partial<BeforeFetchContext> | void

  /**
   * 将在fetch请求返回后立即运行
   * 在任何2xx响应后运行
   */
  afterFetch?: (ctx: AfterFetchContext) => Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext>

  /**
   * 将在fetch请求返回后立即运行
   * 在任何4xx和5xx响应后运行
   */
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

/**
 * 创建Fetch的配置选项
 */
export interface CreateFetchOptions {
  /**
   * 将作为前缀添加到所有URL的基础URL，除非URL是绝对路径
   */
  baseUrl?: MaybeRefOrGetter<string>

  /**
   * 确定beforeFetch、afterFetch、onFetchError的继承行为
   * @default 'chain'
   */
  combination?: Combination

  /**
   * useFetch函数的默认选项
   */
  options?: UseFetchOptions

  /**
   * fetch请求的选项
   */
  fetchOptions?: RequestInit
}

/**
 * !!!重要!!!
 *
 * 如果你更新了UseFetchOptions接口，请确保更新此对象
 * 以包含新的选项
 */
function isFetchOptions(obj: object): obj is UseFetchOptions {
  return obj && containsProp(obj, 'immediate', 'refetch', 'initialData', 'timeout', 'beforeFetch', 'afterFetch', 'onFetchError', 'fetch', 'updateDataOnError')
}

const reAbsolute = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i
// 如果URL以"<scheme>://"或"//"（协议相对URL）开头，则视为绝对URL。
function isAbsoluteURL(url: string) {
  return reAbsolute.test(url)
}

function headersToObject(headers: HeadersInit | undefined) {
  if (typeof Headers !== 'undefined' && headers instanceof Headers)
    return Object.fromEntries(headers.entries())
  return headers
}

function combineCallbacks<T = any>(combination: Combination, ...callbacks: (((ctx: T) => void | Partial<T> | Promise<void | Partial<T>>) | undefined)[]) {
  if (combination === 'overwrite') {
    // 使用最后一个回调
    return async (ctx: T) => {
      let callback
      for (let i = callbacks.length - 1; i >= 0; i--) {
        if (callbacks[i] != null) {
          callback = callbacks[i]
          break
        }
      }
      if (callback)
        return { ...ctx, ...(await callback(ctx)) }

      return ctx
    }
  }
  else {
    // 链式调用并组合结果
    return async (ctx: T) => {
      for (const callback of callbacks) {
        if (callback)
          ctx = { ...ctx, ...(await callback(ctx)) }
      }

      return ctx
    }
  }
}

/**
 * 创建一个带有预配置选项的fetch函数
 * @param config 配置选项
 * @returns 预配置的fetch函数
 */
export function createFetch(config: CreateFetchOptions = {}) {
  const _combination = config.combination || 'chain' as Combination
  const _options = config.options || {}
  const _fetchOptions = config.fetchOptions || {}

  function useFactoryFetch(url: MaybeRefOrGetter<string>, ...args: any[]) {
    const computedUrl = computed(() => {
      const baseUrl = toValue(config.baseUrl)
      const targetUrl = toValue(url)

      return (baseUrl && !isAbsoluteURL(targetUrl))
        ? joinPaths(baseUrl, targetUrl)
        : targetUrl
    })

    let options = _options
    let fetchOptions = _fetchOptions

    // 将属性合并到单个对象中
    if (args.length > 0) {
      if (isFetchOptions(args[0])) {
        options = {
          ...options,
          ...args[0],
          beforeFetch: combineCallbacks(_combination, _options.beforeFetch, args[0].beforeFetch),
          afterFetch: combineCallbacks(_combination, _options.afterFetch, args[0].afterFetch),
          onFetchError: combineCallbacks(_combination, _options.onFetchError, args[0].onFetchError),
        }
      }
      else {
        fetchOptions = {
          ...fetchOptions,
          ...args[0],
          headers: {
            ...(headersToObject(fetchOptions.headers) || {}),
            ...(headersToObject(args[0].headers) || {}),
          },
        }
      }
    }

    if (args.length > 1 && isFetchOptions(args[1])) {
      options = {
        ...options,
        ...args[1],
        beforeFetch: combineCallbacks(_combination, _options.beforeFetch, args[1].beforeFetch),
        afterFetch: combineCallbacks(_combination, _options.afterFetch, args[1].afterFetch),
        onFetchError: combineCallbacks(_combination, _options.onFetchError, args[1].onFetchError),
      }
    }

    return useFetch(computedUrl, fetchOptions, options)
  }

  return useFactoryFetch as typeof useFetch
}

/**
 * 响应式fetch API
 * @param url 请求的URL
 * @returns 包含fetch状态和方法的响应式对象
 */
export function useFetch<T>(url: MaybeRefOrGetter<string>): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
export function useFetch<T>(url: MaybeRefOrGetter<string>, useFetchOptions: UseFetchOptions): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
export function useFetch<T>(url: MaybeRefOrGetter<string>, options: RequestInit, useFetchOptions?: UseFetchOptions): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>

export function useFetch<T>(url: MaybeRefOrGetter<string>, ...args: any[]): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>> {
  const supportsAbort = typeof AbortController === 'function'

  let fetchOptions: RequestInit = {}
  let options: UseFetchOptions = {
    immediate: true,
    refetch: false,
    timeout: 0,
    updateDataOnError: false,
  }

  interface InternalConfig {
    method: HttpMethod
    type: DataType
    payload: unknown
    payloadType?: string
  }

  const config: InternalConfig = {
    method: 'GET',
    type: 'text' as DataType,
    payload: undefined as unknown,
  }

  if (args.length > 0) {
    if (isFetchOptions(args[0]))
      options = { ...options, ...args[0] }
    else
      fetchOptions = args[0]
  }

  if (args.length > 1) {
    if (isFetchOptions(args[1]))
      options = { ...options, ...args[1] }
  }

  const {
    fetch = defaultWindow?.fetch ?? globalThis?.fetch,
    initialData,
    timeout,
  } = options

  // 事件钩子
  const responseEvent = createEventHook<Response>()
  const errorEvent = createEventHook<any>()
  const finallyEvent = createEventHook<any>()

  const isFinished = shallowRef(false)
  const isFetching = shallowRef(false)
  const aborted = shallowRef(false)
  const statusCode = shallowRef<number | null>(null)
  const response = shallowRef<Response | null>(null)
  const error = shallowRef<any>(null)
  const data = shallowRef<T | null>(initialData || null)

  const canAbort = computed(() => supportsAbort && isFetching.value)

  let controller: AbortController | undefined
  let timer: Stoppable | undefined

  /**
   * 中止请求
   * @param reason 中止原因
   */
  const abort = (reason?: any) => {
    if (supportsAbort) {
      controller?.abort(reason)
      controller = new AbortController()
      controller.signal.onabort = () => aborted.value = true
      fetchOptions = {
        ...fetchOptions,
        signal: controller.signal,
      }
    }
  }

  /**
   * 设置加载状态
   * @param isLoading 是否正在加载
   */
  const loading = (isLoading: boolean) => {
    isFetching.value = isLoading
    isFinished.value = !isLoading
  }

  if (timeout)
    timer = useTimeoutFn(abort, timeout, { immediate: false })

  let executeCounter = 0

  /**
   * 执行fetch请求
   * @param throwOnFailed 失败时是否抛出错误
   * @returns Promise对象
   */
  const execute = async (throwOnFailed = false) => {
    abort()

    loading(true)
    error.value = null
    statusCode.value = null
    aborted.value = false

    executeCounter += 1
    const currentExecuteCounter = executeCounter

    const defaultFetchOptions: RequestInit = {
      method: config.method,
      headers: {},
    }

    const payload = toValue(config.payload)
    if (payload) {
      const headers = headersToObject(defaultFetchOptions.headers) as Record<string, string>
      // 仅在未提供内容类型且提供了字面量对象或数组且对象不是`formData`时，将负载设置为json类型
      // 我们可以推断内容类型的唯一情况，而`fetch`不能
      const proto = Object.getPrototypeOf(payload)
      if (!config.payloadType && payload && (proto === Object.prototype || Array.isArray(proto)) && !(payload instanceof FormData))
        config.payloadType = 'json'

      if (config.payloadType)
        headers['Content-Type'] = payloadMapping[config.payloadType] ?? config.payloadType

      defaultFetchOptions.body = config.payloadType === 'json'
        ? JSON.stringify(payload)
        : payload as BodyInit
    }

    let isCanceled = false
    const context: BeforeFetchContext = {
      url: toValue(url),
      options: {
        ...defaultFetchOptions,
        ...fetchOptions,
      },
      cancel: () => { isCanceled = true },
    }

    if (options.beforeFetch)
      Object.assign(context, await options.beforeFetch(context))

    if (isCanceled || !fetch) {
      loading(false)
      return Promise.resolve(null)
    }

    let responseData: any = null

    if (timer)
      timer.start()

    return fetch(
      context.url,
      {
        ...defaultFetchOptions,
        ...context.options,
        headers: {
          ...headersToObject(defaultFetchOptions.headers),
          ...headersToObject(context.options?.headers),
        },
      },
    )
      .then(async (fetchResponse) => {
        response.value = fetchResponse
        statusCode.value = fetchResponse.status

        responseData = await fetchResponse.clone()[config.type]()

        // 参考: https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
        if (!fetchResponse.ok) {
          data.value = initialData || null
          throw new Error(fetchResponse.statusText)
        }

        if (options.afterFetch) {
          ({ data: responseData } = await options.afterFetch({
            data: responseData,
            response: fetchResponse,
            context,
            execute,
          }))
        }
        data.value = responseData

        responseEvent.trigger(fetchResponse)
        return fetchResponse
      })
      .catch(async (fetchError) => {
        let errorData = fetchError.message || fetchError.name

        if (options.onFetchError) {
          ({ error: errorData, data: responseData } = await options.onFetchError({
            data: responseData,
            error: fetchError,
            response: response.value,
            context,
            execute,
          }))
        }

        error.value = errorData
        if (options.updateDataOnError)
          data.value = responseData

        errorEvent.trigger(fetchError)
        if (throwOnFailed)
          throw fetchError
        return null
      })
      .finally(() => {
        if (currentExecuteCounter === executeCounter)
          loading(false)
        if (timer)
          timer.stop()
        finallyEvent.trigger(null)
      })
  }

  const refetch = toRef(options.refetch)
  watch(
    [
      refetch,
      toRef(url),
    ],
    ([refetch]) => refetch && execute(),
    { deep: true },
  )

  const shell: UseFetchReturn<T> = {
    isFinished: readonly(isFinished),
    isFetching: readonly(isFetching),
    statusCode,
    response,
    error,
    data,
    canAbort,
    aborted,
    abort,
    execute,

    onFetchResponse: responseEvent.on,
    onFetchError: errorEvent.on,
    onFetchFinally: finallyEvent.on,
    // method
    get: setMethod('GET'),
    put: setMethod('PUT'),
    post: setMethod('POST'),
    delete: setMethod('DELETE'),
    patch: setMethod('PATCH'),
    head: setMethod('HEAD'),
    options: setMethod('OPTIONS'),
    // type
    json: setType('json'),
    text: setType('text'),
    blob: setType('blob'),
    arrayBuffer: setType('arrayBuffer'),
    formData: setType('formData'),
  }

  /**
   * 设置HTTP方法
   * @param method HTTP方法
   * @returns 设置了方法的fetch对象
   */
  function setMethod(method: HttpMethod) {
    return (payload?: unknown, payloadType?: string) => {
      if (!isFetching.value) {
        config.method = method
        config.payload = payload
        config.payloadType = payloadType

        // 监听负载变化
        if (isRef(config.payload)) {
          watch(
            [
              refetch,
              toRef(config.payload),
            ],
            ([refetch]) => refetch && execute(),
            { deep: true },
          )
        }

        return {
          ...shell,
          then(onFulfilled: any, onRejected: any) {
            return waitUntilFinished()
              .then(onFulfilled, onRejected)
          },
        } as any
      }
      return undefined
    }
  }

  /**
   * 等待请求完成
   * @returns Promise对象
   */
  function waitUntilFinished() {
    return new Promise<UseFetchReturn<T>>((resolve, reject) => {
      until(isFinished).toBe(true).then(() => resolve(shell)).catch(reject)
    })
  }

  /**
   * 设置响应数据类型
   * @param type 数据类型
   * @returns 设置了类型的fetch对象
   */
  function setType(type: DataType) {
    return () => {
      if (!isFetching.value) {
        config.type = type
        return {
          ...shell,
          then(onFulfilled: any, onRejected: any) {
            return waitUntilFinished()
              .then(onFulfilled, onRejected)
          },
        } as any
      }
      return undefined
    }
  }

  if (options.immediate)
    Promise.resolve().then(() => execute())

  return {
    ...shell,
    then(onFulfilled, onRejected) {
      return waitUntilFinished()
        .then(onFulfilled, onRejected)
    },
  }
}

/**
 * 连接路径
 * @param start 起始路径
 * @param end 结束路径
 * @returns 连接后的路径
 */
function joinPaths(start: string, end: string): string {
  if (!start.endsWith('/') && !end.startsWith('/')) {
    return `${start}/${end}`
  }

  if (start.endsWith('/') && end.startsWith('/')) {
    return `${start.slice(0, -1)}${end}`
  }

  return `${start}${end}`
}