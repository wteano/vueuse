---
category: Animation
---

# useTimeout

在给定时间后更新值，并提供控制选项。
Update value after a given time with controls.

## 用法

```ts
import { useTimeout } from '@vueuse/core'

const ready = useTimeout(1000)
```

```ts
import { useTimeout } from '@vueuse/core'
// ---cut---
const { ready, start, stop } = useTimeout(1000, { controls: true })
```

```ts
import { promiseTimeout } from '@vueuse/core'

console.log(ready.value) // false

await promiseTimeout(1200)

console.log(ready.value) // true
```

## 类型声明

```ts
export interface UseTimeoutOptions<Controls extends boolean> extends UseTimeoutFnOptions {
  /**
   * 暴露更多控制选项
   * Expose more controls
   * @default false
   */
  controls?: Controls
  /**
   * 超时回调函数
   * Callback on timeout
   */
  callback?: Fn
}

export type UseTimoutReturn = ComputedRef<boolean> | { readonly ready: ComputedRef<boolean> } & Stoppable

export function useTimeout(interval?: MaybeRefOrGetter<number>, options?: UseTimeoutOptions<false>): ComputedRef<boolean>
export function useTimeout(interval: MaybeRefOrGetter<number>, options: UseTimeoutOptions<true>): { ready: ComputedRef<boolean> } & Stoppable
```