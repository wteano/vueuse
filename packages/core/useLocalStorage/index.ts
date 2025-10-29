/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 10:29:06
 * @FilePath: \vueuse\packages\core\useLocalStorage\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { RemovableRef } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { UseStorageOptions } from '../useStorage'
import { defaultWindow } from '../_configurable'
import { useStorage } from '../useStorage'

/**
 * 使用LocalStorage存储字符串类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<string>, options?: UseStorageOptions<string>): RemovableRef<string>

/**
 * 使用LocalStorage存储布尔类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<boolean>, options?: UseStorageOptions<boolean>): RemovableRef<boolean>

/**
 * 使用LocalStorage存储数字类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<number>, options?: UseStorageOptions<number>): RemovableRef<number>

/**
 * 使用LocalStorage存储泛型类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage<T>(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<T>, options?: UseStorageOptions<T>): RemovableRef<T>

/**
 * 使用LocalStorage存储未知类型数据
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage<T = unknown>(key: MaybeRefOrGetter<string>, initialValue: MaybeRefOrGetter<null>, options?: UseStorageOptions<T>): RemovableRef<T>

/**
 * 响应式LocalStorage操作
 *
 * @see https://vueuse.org/useLocalStorage
 * @param key - 存储键名
 * @param initialValue - 初始值
 * @param options - 配置选项
 * @returns 可移除的响应式引用
 */
export function useLocalStorage<T extends(string | number | boolean | object | null)>(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<T>,
  options: UseStorageOptions<T> = {},
): RemovableRef<any> {
  const { window = defaultWindow } = options
  return useStorage(key, initialValue, window?.localStorage, options)
}