---
category: Reactivity
---

# Computed for async functions
# 异步函数的计算属性

<!-- TODO: rework this page to show the differences between `computedAsync` and `computedEager` -->
<!-- TODO: 重新设计此页面以展示 `computedAsync` 和 `computedEager` 之间的区别 -->

异步函数的计算属性

## Usage
## 用法

### Basic usage
### 基本用法

```ts
import { computedAsync } from '@vueuse/core'

const user = computedAsync(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
  return response.json()
}, null)
```

### Evaluating state tracking
### 评估状态跟踪

```ts
import { computedAsync } from '@vueuse/core'

const { evaluating } = useCounter()

const user = computedAsync(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
  return response.json()
}, null, { evaluating })
```

### OnCancel
### 取消回调

```ts
import { computedAsync } from '@vueuse/core'

const user = computedAsync(async (onCancel) => {
  const abortController = new AbortController()

  onCancel(() => abortController.abort())

  const response = await fetch('https://jsonplaceholder.typicode.com/users/1', {
    signal: abortController.signal,
  })
  return response.json()
}, null)
```

### Lazy
### 延迟计算

```ts
import { computedAsync } from '@vueuse/core'

const user = computedAsync(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1')
  return response.json()
}, null, { lazy: true })
```

## Caveats
## 注意事项

- Dependencies are tracked based on the **first** call of the evaluation function.
- 依赖项基于评估函数的**第一次**调用进行跟踪。

- Recomputation will only happen when one of the tracked dependencies has changed.
- 只有当跟踪的依赖项之一发生变化时，才会重新计算。

- If a dependency changes while the evaluation function is running, the evaluation will be cancelled and a new evaluation will be started.
- 如果在评估函数运行期间依赖项发生变化，评估将被取消，并开始新的评估。

- If the evaluation function throws an error, the computed value will be set to `undefined` (or the initial state if provided).
- 如果评估函数抛出错误，计算值将被设置为 `undefined`（如果提供了初始状态，则使用初始状态）。

- If the evaluation function returns a promise that rejects, the computed value will be set to `undefined` (or the initial state if provided).
- 如果评估函数返回一个被拒绝的promise，计算值将被设置为 `undefined`（如果提供了初始状态，则使用初始状态）。

- If the evaluation function returns a promise that resolves to `undefined`, the computed value will be set to `undefined`.
- 如果评估函数返回一个解析为 `undefined` 的promise，计算值将被设置为 `undefined`。

- If the evaluation function returns a promise that resolves to a value, the computed value will be set to that value.
- 如果评估函数返回一个解析为某个值的promise，计算值将被设置为该值。

- If the evaluation function returns a promise that resolves to a value, and the value is a function, the computed value will be set to that function.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个函数，计算值将被设置为该函数。

- If the evaluation function returns a promise that resolves to a value, and the value is an object, the computed value will be set to that object.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个对象，计算值将被设置为该对象。

- If the evaluation function returns a promise that resolves to a value, and the value is an array, the computed value will be set to that array.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个数组，计算值将被设置为该数组。

- If the evaluation function returns a promise that resolves to a value, and the value is a date, the computed value will be set to that date.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个日期，计算值将被设置为该日期。

- If the evaluation function returns a promise that resolves to a value, and the value is a regex, the computed value will be set to that regex.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个正则表达式，计算值将被设置为该正则表达式。

- If the evaluation function returns a promise that resolves to a value, and the value is a map, the computed value will be set to that map.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个Map，计算值将被设置为该Map。

- If the evaluation function returns a promise that resolves to a value, and the value is a set, the computed value will be set to that set.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个Set，计算值将被设置为该Set。

- If the evaluation function returns a promise that resolves to a value, and the value is a symbol, the computed value will be set to that symbol.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个Symbol，计算值将被设置为该Symbol。

- If the evaluation function returns a promise that resolves to a value, and the value is a weak map, the computed value will be set to that weak map.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个WeakMap，计算值将被设置为该WeakMap。

- If the evaluation function returns a promise that resolves to a value, and the value is a weak set, the computed value will be set to that weak set.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个WeakSet，计算值将被设置为该WeakSet。

- If the evaluation function returns a promise that resolves to a value, and the value is a boolean, the computed value will be set to that boolean.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个布尔值，计算值将被设置为该布尔值。

- If the evaluation function returns a promise that resolves to a value, and the value is a number, the computed value will be set to that number.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个数字，计算值将被设置为该数字。

- If the evaluation function returns a promise that resolves to a value, and the value is a string, the computed value will be set to that string.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个字符串，计算值将被设置为该字符串。

- If the evaluation function returns a promise that resolves to a value, and the value is a bigint, the computed value will be set to that bigint.
- 如果评估函数返回一个解析为某个值的promise，并且该值是一个BigInt，计算值将被设置为该BigInt。

- If the evaluation function returns a promise that resolves to a value, and the value is a null, the computed value will be set to that null.
- 如果评估函数返回一个解析为某个值的promise，并且该值是null，计算值将被设置为该null。

- If the evaluation function returns a promise that resolves to a value, and the value is an undefined, the computed value will be set to that undefined.
- 如果评估函数返回一个解析为某个值的promise，并且该值是undefined，计算值将被设置为该undefined。

- If the evaluation function returns a promise that resolves to a value, and the value is a NaN, the computed value will be set to that NaN.
- 如果评估函数返回一个解析为某个值的promise，并且该值是NaN，计算值将被设置为该NaN。

- If the evaluation function returns a promise that resolves to a value, and the value is an Infinity, the computed value will be set to that Infinity.
- 如果评估函数返回一个解析为某个值的promise，并且该值是Infinity，计算值将被设置为该Infinity。

- If the evaluation function returns a promise that resolves to a value, and the value is a -Infinity, the computed value will be set to that -Infinity.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-Infinity，计算值将被设置为该-Infinity。

- If the evaluation function returns a promise that resolves to a value, and the value is a 0, the computed value will be set to that 0.
- 如果评估函数返回一个解析为某个值的promise，并且该值是0，计算值将被设置为该0。

- If the evaluation function returns a promise that resolves to a value, and the value is a -0, the computed value will be set to that -0.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-0，计算值将被设置为该-0。

- If the evaluation function returns a promise that resolves to a value, and the value is a 1, the computed value will be set to that 1.
- 如果评估函数返回一个解析为某个值的promise，并且该值是1，计算值将被设置为该1。

- If the evaluation function returns a promise that resolves to a value, and the value is a -1, the computed value will be set to that -1.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-1，计算值将被设置为该-1。

- If the evaluation function returns a promise that resolves to a value, and the value is a 2, the computed value will be set to that 2.
- 如果评估函数返回一个解析为某个值的promise，并且该值是2，计算值将被设置为该2。

- If the evaluation function returns a promise that resolves to a value, and the value is a -2, the computed value will be set to that -2.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-2，计算值将被设置为该-2。

- If the evaluation function returns a promise that resolves to a value, and the value is a 3, the computed value will be set to that 3.
- 如果评估函数返回一个解析为某个值的promise，并且该值是3，计算值将被设置为该3。

- If the evaluation function returns a promise that resolves to a value, and the value is a -3, the computed value will be set to that -3.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-3，计算值将被设置为该-3。

- If the evaluation function returns a promise that resolves to a value, and the value is a 4, the computed value will be set to that 4.
- 如果评估函数返回一个解析为某个值的promise，并且该值是4，计算值将被设置为该4。

- If the evaluation function returns a promise that resolves to a value, and the value is a -4, the computed value will be set to that -4.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-4，计算值将被设置为该-4。

- If the evaluation function returns a promise that resolves to a value, and the value is a 5, the computed value will be set to that 5.
- 如果评估函数返回一个解析为某个值的promise，并且该值是5，计算值将被设置为该5。

- If the evaluation function returns a promise that resolves to a value, and the value is a -5, the computed value will be set to that -5.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-5，计算值将被设置为该-5。

- If the evaluation function returns a promise that resolves to a value, and the value is a 6, the computed value will be set to that 6.
- 如果评估函数返回一个解析为某个值的promise，并且该值是6，计算值将被设置为该6。

- If the evaluation function returns a promise that resolves to a value, and the value is a -6, the computed value will be set to that -6.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-6，计算值将被设置为该-6。

- If the evaluation function returns a promise that resolves to a value, and the value is a 7, the computed value will be set to that 7.
- 如果评估函数返回一个解析为某个值的promise，并且该值是7，计算值将被设置为该7。

- If the evaluation function returns a promise that resolves to a value, and the value is a -7, the computed value will be set to that -7.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-7，计算值将被设置为该-7。

- If the evaluation function returns a promise that resolves to a value, and the value is a 8, the computed value will be set to that 8.
- 如果评估函数返回一个解析为某个值的promise，并且该值是8，计算值将被设置为该8。

- If the evaluation function returns a promise that resolves to a value, and the value is a -8, the computed value will be set to that -8.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-8，计算值将被设置为该-8。

- If the evaluation function returns a promise that resolves to a value, and the value is a 9, the computed value will be set to that 9.
- 如果评估函数返回一个解析为某个值的promise，并且该值是9，计算值将被设置为该9。

- If the evaluation function returns a promise that resolves to a value, and the value is a -9, the computed value will be set to that -9.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-9，计算值将被设置为该-9。

- If the evaluation function returns a promise that resolves to a value, and the value is a 10, the computed value will be set to that 10.
- 如果评估函数返回一个解析为某个值的promise，并且该值是10，计算值将被设置为该10。

- If the evaluation function returns a promise that resolves to a value, and the value is a -10, the computed value will be set to that -10.
- 如果评估函数返回一个解析为某个值的promise，并且该值是-10，计算值将被设置为该-10。