---
category: Utilities
---

# useCounter

带有实用函数的响应式计数器
A reactive counter with utility functions.

## 用法

```ts
import { useCounter } from '@vueuse/core'

const { count, inc, dec, set, reset } = useCounter()
```

### 基础用法

```ts
import { useCounter } from '@vueuse/core'

const { count, inc, dec, set, reset } = useCounter(0)

count.value // 0

inc() // count.value === 1
inc(5) // count.value === 6
dec() // count.value === 5
dec(2) // count.value === 3

set(100) // count.value === 100
reset() // count.value === 0
reset(50) // count.value === 50
```

### 设置最小值和最大值

```ts
import { useCounter } from '@vueuse/core'

const { count, inc, dec } = useCounter(0, { min: 0, max: 10 })

count.value // 0

inc() // count.value === 1
inc(5) // count.value === 6
inc(10) // count.value === 10 (不会超过最大值)
inc(5) // count.value === 10 (不会超过最大值)

dec() // count.value === 9
dec(10) // count.value === 0 (不会低于最小值)
dec(5) // count.value === 0 (不会低于最小值)
```

### 动态设置最小值和最大值

```ts
import { useCounter } from '@vueuse/core'

const { count, inc, dec } = useCounter(0, { min: 0, max: 10 })

count.value // 0

inc(5, { min: 5, max: 15 }) // count.value === 5
inc(5, { min: 5, max: 15 }) // count.value === 10
inc(10, { min: 5, max: 15 }) // count.value === 15 (不会超过最大值)
inc(5, { min: 5, max: 15 }) // count.value === 15 (不会超过最大值)

dec(5, { min: -5, max: 5 }) // count.value === 5
dec(10, { min: -5, max: 5 }) // count.value === -5 (不会低于最小值)
dec(5, { min: -5, max: 5 }) // count.value === -5 (不会低于最小值)
```

## 类型声明

```ts
export interface UseCounterOptions {
  min?: number
  max?: number
}

export interface UseCounterReturn {
  count: Ref<number>
  inc: (delta?: number, options?: UseCounterOptions) => void
  dec: (delta?: number, options?: UseCounterOptions) => void
  get: () => number
  set: (value: MaybeRef<number>, options?: UseCounterOptions) => void
  reset: (value?: MaybeRef<number>, options?: UseCounterOptions) => void
}
```