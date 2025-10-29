import type { Awaitable, ConfigurableEventFilter, ConfigurableFlush, RemovableRef } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { ConfigurableWindow } from '../_configurable'
import type { StorageLike } from '../ssr-handlers'
import { pausableWatch, tryOnMounted } from '@vueuse/shared'
import { computed, ref as deepRef, nextTick, shallowRef, toValue, watch } from 'vue'
import { defaultWindow } from '../_configurable'
import { getSSRHandler } from '../ssr-handlers'
import { useEventListener } from '../useEventListener'
import { guessSerializerType } from './guess'

/**
 * 数据序列化接口
 * @template T 数据类型
 */
export interface Serializer<T> {
  /** 从字符串读取数据 */
  read: (raw: string) => T
  /** 将数据写入字符串 */
  write: (value: T) => string
}

/**
 * 异步数据序列化接口
 * @template T 数据类型
 */
export interface SerializerAsync<T> {
  /** 从字符串异步读取数据 */
  read: (raw: string) => Awaitable<T>
  /** 将数据异步写入字符串 */
  write: (value: T) => Awaitable<string>
}

/**
 * 内置的数据序列化器
 */
export const StorageSerializers: Record<'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date', Serializer<any>> = {
  boolean: {
    read: (v: any) => v === 'true',
    write: (v: any) => String(v),
  },
  object: {
    read: (v: any) => JSON.parse(v),
    write: (v: any) => JSON.stringify(v),
  },
  number: {
    read: (v: any) => Number.parseFloat(v),
    write: (v: any) => String(v),
  },
  any: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  string: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  map: {
    read: (v: any) => new Map(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from((v as Map<any, any>).entries())),
  },
  set: {
    read: (v: any) => new Set(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from(v as Set<any>)),
  },
  date: {
    read: (v: any) => new Date(v),
    write: (v: any) => v.toISOString(),
  },
}

/** 自定义存储事件名称 */
export const customStorageEventName = 'vueuse-storage'

/**
 * 存储事件类接口
 */
export interface StorageEventLike {
  /** 存储区域 */
  storageArea: StorageLike | null
  /** 存储键 */
  key: StorageEvent['key']
  /** 旧值 */
  oldValue: StorageEvent['oldValue']
  /** 新值 */
  newValue: StorageEvent['newValue']
}

/**
 * useStorage函数的配置选项
 * @template T 存储的数据类型
 */
export interface UseStorageOptions<T> extends ConfigurableEventFilter, ConfigurableWindow, ConfigurableFlush {
  /**
   * 是否监听深度变化
   *
   * @default true
   */
  deep?: boolean

  /**
   * 是否监听存储变化，适用于多标签页应用
   *
   * @default true
   */
  listenToStorageChanges?: boolean

  /**
   * 当默认值不存在时，是否写入存储
   *
   * @default true
   */
  writeDefaults?: boolean

  /**
   * 将默认值与从存储中读取的值合并
   *
   * 当设置为true时，它将对对象执行**浅合并**。
   * 你可以传递一个函数来执行自定义合并（例如深度合并），例如：
   *
   * @default false
   */
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T)

  /**
   * 自定义数据序列化
   */
  serializer?: Serializer<T>

  /**
   * 错误回调
   *
   * 默认将错误记录到`console.error`
   */
  onError?: (error: unknown) => void

  /**
   * 使用浅层引用作为引用
   *
   * @default false
   */
  shallow?: boolean

  /**
   * 等待组件挂载后再读取存储
   *
   * @default false
   */
  initOnMounted?: boolean
}

export function useStorage(key: MaybeRefOrGetter<string>, defaults: MaybeRefOrGetter<string>, storage?: StorageLike, options?: UseStorageOptions<string>): RemovableRef<string>
export function useStorage(key: MaybeRefOrGetter<string>, defaults: MaybeRefOrGetter<boolean>, storage?: StorageLike, options?: UseStorageOptions<boolean>): RemovableRef<boolean>
export function useStorage(key: MaybeRefOrGetter<string>, defaults: MaybeRefOrGetter<number>, storage?: StorageLike, options?: UseStorageOptions<number>): RemovableRef<number>
export function useStorage<T>(key: MaybeRefOrGetter<string>, defaults: MaybeRefOrGetter<T>, storage?: StorageLike, options?: UseStorageOptions<T>): RemovableRef<T>
export function useStorage<T = unknown>(key: MaybeRefOrGetter<string>, defaults: MaybeRefOrGetter<null>, storage?: StorageLike, options?: UseStorageOptions<T>): RemovableRef<T>

/**
 * 响应式LocalStorage/SessionStorage操作
 *
 * @see https://vueuse.org/useStorage
 * @param key 存储键
 * @param defaults 默认值
 * @param storage 存储对象，默认为localStorage
 * @param options 配置选项
 * @returns 可移除的响应式引用
 */
export function useStorage<T extends (string | number | boolean | object | null)>(
  key: MaybeRefOrGetter<string>,
  defaults: MaybeRefOrGetter<T>,
  storage: StorageLike | undefined,
  options: UseStorageOptions<T> = {},
): RemovableRef<T> {
  const {
    flush = 'pre',
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    mergeDefaults = false,
    shallow,
    window = defaultWindow,
    eventFilter,
    onError = (e) => {
      console.error(e)
    },
    initOnMounted,
  } = options

  const data = (shallow ? shallowRef : deepRef)(typeof defaults === 'function' ? defaults() : defaults) as RemovableRef<T>
  const keyComputed = computed<string>(() => toValue(key))

  if (!storage) {
    try {
      storage = getSSRHandler('getDefaultStorage', () => defaultWindow?.localStorage)()
    }
    catch (e) {
      onError(e)
    }
  }

  if (!storage)
    return data

  const rawInit: T = toValue(defaults)
  const type = guessSerializerType<T>(rawInit)
  const serializer = options.serializer ?? StorageSerializers[type]

  const { pause: pauseWatch, resume: resumeWatch } = pausableWatch(
    data,
    newValue => write(newValue),
    { flush, deep, eventFilter },
  )

  watch(keyComputed, () => update(), { flush })

  let firstMounted = false
  const onStorageEvent = (ev: StorageEvent): void => {
    if (initOnMounted && !firstMounted) {
      return
    }

    update(ev)
  }
  const onStorageCustomEvent = (ev: CustomEvent<StorageEventLike>): void => {
    if (initOnMounted && !firstMounted) {
      return
    }

    updateFromCustomEvent(ev)
  }

  /**
   * 当使用自定义存储后端时，需要自定义事件来进行同文档同步，
   * 但它在不同文档之间不起作用。
   *
   * TODO: 考虑实现一个基于BroadcastChannel的解决方案来修复这个问题。
   */
  if (window && listenToStorageChanges) {
    if (storage instanceof Storage)
      useEventListener(window, 'storage', onStorageEvent, { passive: true })
    else
      useEventListener(window, customStorageEventName, onStorageCustomEvent)
  }

  if (initOnMounted) {
    tryOnMounted(() => {
      firstMounted = true
      update()
    })
  }
  else {
    update()
  }

  /**
   * 派发写入事件
   * @param oldValue 旧值
   * @param newValue 新值
   */
  function dispatchWriteEvent(oldValue: string | null, newValue: string | null) {
    // 发送自定义事件在同一页面内通信
    if (window) {
      const payload = {
        key: keyComputed.value,
        oldValue,
        newValue,
        storageArea: storage as Storage,
      }
      // 我们也使用CustomEvent，因为StorageEvent不能
      // 用非内置存储区域构造
      window.dispatchEvent(storage instanceof Storage
        ? new StorageEvent('storage', payload)
        : new CustomEvent<StorageEventLike>(customStorageEventName, {
          detail: payload,
        }))
    }
  }

  /**
   * 写入数据到存储
   * @param v 要写入的值
   */
  function write(v: unknown) {
    try {
      const oldValue = storage!.getItem(keyComputed.value)

      if (v == null) {
        dispatchWriteEvent(oldValue, null)
        storage!.removeItem(keyComputed.value)
      }
      else {
        const serialized = serializer.write(v as any)
        if (oldValue !== serialized) {
          storage!.setItem(keyComputed.value, serialized)
          dispatchWriteEvent(oldValue, serialized)
        }
      }
    }
    catch (e) {
      onError(e)
    }
  }

  /**
   * 从存储读取数据
   * @param event 存储事件
   * @returns 读取的数据
   */
  function read(event?: StorageEventLike) {
    const rawValue = event
      ? event.newValue
      : storage!.getItem(keyComputed.value)

    if (rawValue == null) {
      if (writeDefaults && rawInit != null)
        storage!.setItem(keyComputed.value, serializer.write(rawInit))
      return rawInit
    }
    else if (!event && mergeDefaults) {
      const value = serializer.read(rawValue)
      if (typeof mergeDefaults === 'function')
        return mergeDefaults(value, rawInit)
      else if (type === 'object' && !Array.isArray(value))
        return { ...rawInit as any, ...value }
      return value
    }
    else if (typeof rawValue !== 'string') {
      return rawValue
    }
    else {
      return serializer.read(rawValue)
    }
  }

  /**
   * 更新数据
   * @param event 存储事件
   */
  function update(event?: StorageEventLike) {
    if (event && event.storageArea !== storage)
      return

    if (event && event.key == null) {
      data.value = rawInit
      return
    }

    if (event && event.key !== keyComputed.value) {
      return
    }

    pauseWatch()

    try {
      const serializedData = serializer.write(data.value)
      if (event === undefined || event?.newValue !== serializedData) {
        data.value = read(event)
      }
    }
    catch (e) {
      onError(e)
    }
    finally {
      // 使用nextTick避免无限循环
      if (event)
        nextTick(resumeWatch)
      else
        resumeWatch()
    }
  }

  /**
   * 从自定义事件更新数据
   * @param event 自定义存储事件
   */
  function updateFromCustomEvent(event: CustomEvent<StorageEventLike>) {
    update(event.detail)
  }

  return data
}