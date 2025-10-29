---
category: Component
---

# computedInject
# 计算注入

组合computed和inject功能

## Usage
## 用法

### In Provider Component
### 在提供者组件中

```ts twoslash include main
import type { InjectionKey, Ref } from 'vue'
import { provide } from 'vue'

interface Item {
  key: number
  value: string
}

export const ArrayKey: InjectionKey<Ref<Item[]>> = Symbol('symbol-key')

const array = ref([{ key: 1, value: '1' }, { key: 2, value: '2' }, { key: 3, value: '3' }])

provide(ArrayKey, array)
```

### In Receiver Component
### 在接收者组件中

```ts
// @filename: provider.ts
// @include: main
// ---cut---
import { computedInject } from '@vueuse/core'

import { ArrayKey } from './provider'

const computedArray = computedInject(ArrayKey, (source) => {
  const arr = [...source.value]
  arr.unshift({ key: 0, value: 'all' })
  return arr
})
```

## Type Declarations
## 类型声明

```ts
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
): ComputedRef<K>
```

## Source
## 源码

```ts
import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject } from 'vue'

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
```