/*
 * @Author: wteano wzgtao@foxmail.com
 * @Date: 2025-10-29 09:19:17
 * @LastEditors: wteano wzgtao@foxmail.com
 * @LastEditTime: 2025-10-29 14:01:28
 * @FilePath: \vueuse\packages\core\computedInject\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject } from 'vue'

/**
 * 计算注入的获取函数类型
 */
export type ComputedInjectGetter<T, K> = (source: T | undefined, oldValue?: K) => K
/**
 * 带默认值的计算注入的获取函数类型
 */
export type ComputedInjectGetterWithDefault<T, K> = (source: T, oldValue?: K) => K
/**
 * 计算注入的设置函数类型
 */
export type ComputedInjectSetter<T> = (v: T) => void

/**
 * 可写计算注入选项
 */
export interface WritableComputedInjectOptions<T, K> {
  get: ComputedInjectGetter<T, K>
  set: ComputedInjectSetter<K>
}

/**
 * 带默认值的可写计算注入选项
 */
export interface WritableComputedInjectOptionsWithDefault<T, K> {
  get: ComputedInjectGetterWithDefault<T, K>
  set: ComputedInjectSetter<K>
}

/**
 * 组合computed和inject功能，创建一个基于注入值的计算属性
 * 
 * @param key 注入键或字符串
 * @param getter 获取函数或选项对象
 * @param defaultSource 默认源值
 * @param treatDefaultAsFactory 是否将默认源视为工厂函数
 * @returns 计算属性引用
 */
export function computedInject<T, K = any>(
  key: InjectionKey<T> | string,
  getter: ComputedInjectGetter<T, K>
): ComputedRef<K | undefined>
export function computedInject<T, K = any>(
  key: InjectionKey<T> | string,
  options: WritableComputedInjectOptions<T, K>
): ComputedRef<K | undefined>
export function computedInject<T, K = any>(
  key: InjectionKey<T> | string,
  getter: ComputedInjectGetterWithDefault<T, K>,
  defaultSource: T,
  treatDefaultAsFactory?: false
): ComputedRef<K>
export function computedInject<T, K = any>(
  key: InjectionKey<T> | string,
  options: WritableComputedInjectOptionsWithDefault<T, K>,
  defaultSource: T | (() => T),
  treatDefaultAsFactory: true
): ComputedRef<K>
export function computedInject<T, K = any>(
  key: InjectionKey<T> | string,
  options: ComputedInjectGetter<T, K> | WritableComputedInjectOptions<T, K>,
  defaultSource?: T | (() => T),
  treatDefaultAsFactory?: boolean,
) {
  let source = inject(key) as T | undefined
  if (defaultSource)
    source = inject(key, defaultSource as T) as T
  if (treatDefaultAsFactory)
    source = inject(key, defaultSource, treatDefaultAsFactory) as T

  if (typeof options === 'function') {
    return computed(oldValue => options(source, oldValue as K | undefined))
  }
  else {
    return computed({
      get: oldValue => options.get(source, oldValue as K | undefined),
      set: options.set,
    })
  }
}