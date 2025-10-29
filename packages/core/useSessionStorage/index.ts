import type { RemovableRef } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { UseStorageOptions } from '../useStorage'
import { defaultWindow } from '../_configurable'
import { useStorage } from '../useStorage'

/**
 * 使用SessionStorage存储字符串类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<string>, options?: UseStorageOptions<string>): RemovableRef<string>

/**
 * 使用SessionStorage存储布尔类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<boolean>, options?: UseStorageOptions<boolean>): RemovableRef<boolean>

/**
 * 使用SessionStorage存储数字类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<number>, options?: UseStorageOptions<number>): RemovableRef<number>

/**
 * 使用SessionStorage存储泛型类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage<T>(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<T>, options?: UseStorageOptions<T>): RemovableRef<T>

/**
 * 使用SessionStorage存储未知类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage<T = unknown>(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<null>, options?: UseStorageOptions<T>): RemovableRef<T>

/**
 * 响应式SessionStorage操作
 *
 * @see https://vueuse.org/useSessionStorage
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useSessionStorage<T extends(string | number | boolean | object | null)>(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<T>,
  options: UseStorageOptions<T> = {},
): RemovableRef<any> {
  const { window = defaultWindow } = options
  return useStorage(key, initialValue, window?.sessionStorage, options)
}